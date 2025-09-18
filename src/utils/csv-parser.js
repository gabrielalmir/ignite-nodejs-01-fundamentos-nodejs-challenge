export function parseCSVFromContent(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Check if required headers exist
  const titleIndex = headers.indexOf('title');
  const descriptionIndex = headers.indexOf('description');

  if (titleIndex === -1 || descriptionIndex === -1) {
    throw new Error('CSV must have "title" and "description" columns');
  }

  const tasks = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= headers.length) {
      tasks.push({
        title: values[titleIndex],
        description: values[descriptionIndex]
      });
    }
  }

  if (tasks.length === 0) {
    throw new Error('No valid tasks found in CSV');
  }

  return tasks;
}
