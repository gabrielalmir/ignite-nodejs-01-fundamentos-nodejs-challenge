import { Task } from "../domain/task.js";

export class TaskRepository {
  #db = null;

  constructor(db) {
    this.#db = db;
  }

  async create(task) {
    if (!(task instanceof Task)) {
      throw new Error('Task must be an instance of Task class');
    }
    await this.#db.put(task.id, task.json());
    return task;
  }

  async findAll() {
    const allData = this.#db.listAll();
    return allData.map((data) => new Task(JSON.parse(data)));
  }

  async findById(id) {
    const data = this.#db.get(id);
    return data ? new Task(JSON.parse(data)) : null;
  }

  async update(task) {
    if (!(task instanceof Task)) {
      throw new Error('Task must be an instance of Task class');
    }
    await this.#db.put(task.id, task.json());
    return task;
  }

  async delete(id) {
    await this.#db.del(id);
    return true;
  }
}
