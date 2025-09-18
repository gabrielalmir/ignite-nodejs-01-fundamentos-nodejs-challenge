import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3333';

async function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    records.push(record);
  }

  return records;
}

async function createTask(task) {
  try {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Task created: ${result.title}`);
    return result;
  } catch (error) {
    console.error(`Failed to create task "${task.title}":`, error.message);
    throw error;
  }
}

async function importTasksFromCSV(csvFilePath) {
  try {
    console.log('Reading CSV file...');
    const csvContent = readFileSync(csvFilePath, 'utf-8');

    console.log('Parsing CSV content...');
    const tasks = await parseCSV(csvContent);

    console.log(`Found ${tasks.length} tasks to import`);

    const results = [];
    for (const task of tasks) {
      try {
        const result = await createTask(task);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to process task: ${task.title}`);
      }
    }

    console.log(`\nImport completed! ${results.length} tasks imported successfully.`);
    return results;
  } catch (error) {
    console.error('Import failed:', error.message);
    throw error;
  }
}

const csvFilePath = process.argv[2] || join(__dirname, 'tasks.csv');

console.log('Starting CSV import...');
console.log(`CSV file: ${csvFilePath}`);

importTasksFromCSV(csvFilePath)
  .then(() => {
    console.log('Import process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error.message);
    process.exit(1);
  });
