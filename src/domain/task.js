export class Task {
  id = '';
  title = '';
  description = '';
  completed_at = null;
  created_at = null;
  updated_at = null;

  constructor({ id, title, description, completed_at, created_at, updated_at }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed_at = completed_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create({ title, description }) {
    const now = new Date();
    return new Task({
      id: crypto.randomUUID(),
      title,
      description,
      completed_at: null,
      created_at: now,
      updated_at: now,
    });
  }

  complete() {
    this.completed_at = new Date();
    this.updated_at = new Date();
  }
}
