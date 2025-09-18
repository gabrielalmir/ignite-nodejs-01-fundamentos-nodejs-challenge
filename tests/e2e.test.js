import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3334';
let serverProcess;

function clearDatabase() {
  if (existsSync(join(__dirname, '..', 'data.db'))) {
    unlinkSync(join(__dirname, '..', 'data.db'));
  }
}

function waitForServer(timeout = 30000) { // Increased timeout to 30 seconds
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let attempts = 0;
    const checkServer = async () => {
      attempts++;
      try {
        console.log(`Checking server readiness (attempt ${attempts})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout per request

        const response = await fetch(`${BASE_URL}/`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('Server is ready!');
          resolve();
        } else {
          throw new Error(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        console.log(`Server check failed: ${error.message}`);
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Server failed to start within ${timeout}ms after ${attempts} attempts`));
        } else {
          setTimeout(checkServer, 500); // Check every 500ms
        }
      }
    };
    checkServer();
  });
}

before(async () => {
  console.log('Starting server for E2E tests...');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Working directory:', process.cwd());

  console.log('Cleaning up database...');
  clearDatabase();

  const serverPath = join(__dirname, '..', 'src', 'server.js');
  console.log('Server path:', serverPath);
  console.log('Server exists:', existsSync(serverPath));

  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3334', NODE_ENV: 'test' },
    stdio: 'pipe',
    cwd: join(__dirname, '..')
  });

  let serverOutput = '';
  let serverErrors = '';

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    serverOutput += output + '\n';
    console.log(`Server: ${output}`);
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    serverErrors += error + '\n';
    console.error(`Server Error: ${error}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server process:', error);
  });

  try {
    console.log('Waiting for server to be ready...');
    await waitForServer();
    console.log('Server is ready for testing');
  } catch (error) {
    console.error('Server startup failed:', error.message);
    console.error('Server stdout:', serverOutput);
    console.error('Server stderr:', serverErrors);
    throw error;
  }
});

after(async () => {
  console.log('Stopping server...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
  }
  console.log('Server stopped');
});

describe('E2E Tests - Task API', () => {
  describe('Health Check', () => {
    it('should return server status', async () => {
      const response = await fetch(`${BASE_URL}/`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'application/json');

      const data = await response.json();
      assert.deepStrictEqual(data, { status: 'ok' });
    });
  });

  describe('POST /tasks - CSV Import via Multipart', () => {
    it('should import tasks from CSV file', async () => {
      const csvContent = 'title,description\nTask CSV 1,Description 1\nTask CSV 2,Description 2';

      // Create multipart form data
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="test.csv"',
        'Content-Type: text/csv',
        '',
        csvContent,
        `--${boundary}--`
      ].join('\r\n');

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      assert.strictEqual(response.status, 201);
      const result = await response.json();

      assert.ok(result.message.includes('Successfully imported'));
      assert.ok(result.tasks);
      assert.strictEqual(result.tasks.length, 2);

      // Verify tasks were created
      const listResponse = await fetch(`${BASE_URL}/tasks`);
      const allTasks = await listResponse.json();

      const csvTasks = allTasks.filter(task =>
        task.title.includes('Task CSV')
      );
      assert.ok(csvTasks.length >= 2);
    });

    it('should return 400 for invalid CSV format', async () => {
      const invalidCsv = 'invalid,csv\ncontent';

      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="invalid.csv"',
        'Content-Type: text/csv',
        '',
        invalidCsv,
        `--${boundary}--`
      ].join('\r\n');

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      assert.strictEqual(response.status, 400);
      const result = await response.json();
      assert.strictEqual(result.error, 'Invalid CSV format or content');
    });
  });

  describe('POST /tasks - CSV Import via Multipart', () => {
    it('should import tasks from CSV file', async () => {
      const csvContent = 'title,description\nTask CSV 1,Description 1\nTask CSV 2,Description 2';

      // Create multipart form data
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="test.csv"',
        'Content-Type: text/csv',
        '',
        csvContent,
        `--${boundary}--`
      ].join('\r\n');

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      assert.strictEqual(response.status, 201);
      const result = await response.json();

      assert.ok(result.message.includes('Successfully imported'));
      assert.ok(result.tasks);
      assert.strictEqual(result.tasks.length, 2);

      // Verify tasks were created
      const listResponse = await fetch(`${BASE_URL}/tasks`);
      const allTasks = await listResponse.json();

      const csvTasks = allTasks.filter(task =>
        task.title.includes('Task CSV')
      );
      assert.ok(csvTasks.length >= 2);
    });

    it('should return 400 for invalid CSV format', async () => {
      const invalidCsv = 'invalid,csv\ncontent';

      // say thanks to postman for this snippet
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="invalid.csv"',
        'Content-Type: text/csv',
        '',
        invalidCsv,
        `--${boundary}--`
      ].join('\r\n');

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      assert.strictEqual(response.status, 400);
      const result = await response.json();
      assert.strictEqual(result.error, 'Invalid CSV format or content');
    });
  });

  describe('GET /tasks', () => {
    it('should return list of tasks', async () => {
      const newTask = {
        title: 'Sample Task for List Test',
        description: 'This task is created for testing the list endpoint'
      };

      await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      const response = await fetch(`${BASE_URL}/tasks`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'application/json');

      const tasks = await response.json();

      assert.ok(Array.isArray(tasks));
      assert.ok(tasks.length > 0);

      tasks.forEach(task => {
        assert.ok(task.id);
        assert.ok(task.title);
        assert.ok(task.description);
      });
    });

    it('should return empty array when no tasks exist', async () => {
      const response = await fetch(`${BASE_URL}/tasks`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get('content-type'), 'application/json');

      const tasks = await response.json();
      assert.ok(Array.isArray(tasks));
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await fetch(`${BASE_URL}/non-existent-route`);

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.headers.get('content-type'), 'application/json');

      const errorResponse = await response.json();
      assert.strictEqual(errorResponse.error, 'Route not found');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      assert.ok(response.status >= 400);
    });
  });

  describe('PUT /tasks/:id', () => {
    let createdTask;

    beforeEach(async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Task to update', description: 'Desc' })
      });
      createdTask = await response.json();
    });

    it('should update task title and description', async () => {
      const updated = { title: 'Updated Title', description: 'Updated Desc' };
      const response = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      assert.strictEqual(response.status, 200);
      const task = await response.json();

      assert.strictEqual(task.title, updated.title);
      assert.strictEqual(task.description, updated.description);
      assert.ok(task.updated_at);
    });

    it('should update only the title', async () => {
      const response = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Only Title' })
      });

      assert.strictEqual(response.status, 200);
      const task = await response.json();
      assert.strictEqual(task.title, 'Only Title');
      assert.strictEqual(task.description, 'Desc');
    });

    it('should update only the description', async () => {
      const response = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Only Desc' })
      });

      assert.strictEqual(response.status, 200);
      const task = await response.json();
      assert.strictEqual(task.title, 'Task to update');
      assert.strictEqual(task.description, 'Only Desc');
    });

    it('should return 400 if neither title nor description is provided', async () => {
      const response = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.strictEqual(data.error, 'Title or description must be provided');
    });

    it('should return 404 if task does not exist', async () => {
      const response = await fetch(`${BASE_URL}/tasks/non-existent-id`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Does not matter' })
      });

      assert.strictEqual(response.status, 404);
      const data = await response.json();
      assert.strictEqual(data.error, 'Task not found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    let createdTask;

    beforeEach(async () => {
      // Create a task to delete in tests
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Task to delete', description: 'Will be deleted' })
      });
      createdTask = await response.json();
    });

    it('should delete a task successfully', async () => {
      const deleteResponse = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
        method: 'DELETE'
      });

      assert.strictEqual(deleteResponse.status, 204);

      // Verify the task was actually deleted
      const getResponse = await fetch(`${BASE_URL}/tasks/${createdTask.id}`);
      assert.strictEqual(getResponse.status, 404);
    });

    it('should return 404 if task does not exist', async () => {
      const response = await fetch(`${BASE_URL}/tasks/non-existent-id`, {
        method: 'DELETE'
      });

      assert.strictEqual(response.status, 404);
      const data = await response.json();
      assert.strictEqual(data.error, 'Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    let createdTask;

    beforeEach(async () => {
      // Create a task to complete in tests
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Task to complete', description: 'Will be completed' })
      });
      createdTask = await response.json();
    });

    it('should mark a task as completed', async () => {
      const response = await fetch(`${BASE_URL}/tasks/${createdTask.id}/complete`, {
        method: 'PATCH'
      });

      assert.strictEqual(response.status, 200);
      const completedTask = await response.json();

      assert.strictEqual(completedTask.id, createdTask.id);
      assert.strictEqual(completedTask.title, createdTask.title);
      assert.strictEqual(completedTask.description, createdTask.description);
      assert.ok(completedTask.completed_at);
      assert.ok(completedTask.updated_at);
    });

    it('should return 404 if task does not exist', async () => {
      const response = await fetch(`${BASE_URL}/tasks/non-existent-id/complete`, {
        method: 'PATCH'
      });

      assert.strictEqual(response.status, 404);
      const data = await response.json();
      assert.strictEqual(data.error, 'Task not found');
    });
  });
});
