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

function waitForServer(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkServer = async () => {
      try {
        const response = await fetch(`${BASE_URL}/`);
        if (response.ok) {
          resolve();
        } else {
          throw new Error('Server not ready');
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Server failed to start within timeout'));
        } else {
          setTimeout(checkServer, 100);
        }
      }
    };
    checkServer();
  });
}

before(async () => {
  console.log('Starting server for E2E tests...');

  console.log('Cleaning up database...');
  clearDatabase();

  const serverPath = join(__dirname, '..', 'src', 'server.js');
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3334' },
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data.toString().trim()}`);
  });

  await waitForServer();
  console.log('Server is ready for testing');
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

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task'
      };

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.headers.get('content-type'), 'application/json');

      const createdTask = await response.json();

      assert.ok(createdTask.id);
      assert.strictEqual(createdTask.title, newTask.title);
      assert.strictEqual(createdTask.description, newTask.description);
    });

    it('should return 400 when title is missing', async () => {
      const invalidTask = {
        description: 'Task without title'
      };

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidTask)
      });

      assert.strictEqual(response.status, 400);

      const errorResponse = await response.json();
      assert.strictEqual(errorResponse.error, 'Title and description are required');
    });

    it('should return 400 when description is missing', async () => {
      const invalidTask = {
        title: 'Task without description'
      };

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidTask)
      });

      assert.strictEqual(response.status, 400);

      const errorResponse = await response.json();
      assert.strictEqual(errorResponse.error, 'Title and description are required');
    });

    it('should return 400 when both title and description are missing', async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      assert.strictEqual(response.status, 400);

      const errorResponse = await response.json();
      assert.strictEqual(errorResponse.error, 'Title and description are required');
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
});
