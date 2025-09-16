export class TaskRepository {
  #db = null;

  constructor(db) {
    this.#db = db;
  }

  async create(task) {
    await this.#db.put(task.id, JSON.stringify(task));
    return task;
  }

  async findAll() {
    const allData = this.#db.listAll();
    return allData.map((data) => JSON.parse(data));
  }

  async findById(id) {
    const data = this.#db.get(id);
    return data ? JSON.parse(data) : null;
  }

  async update(task) {
    await this.#db.put(task.id, JSON.stringify(task));
    return task;
  }

  async delete(id) {
    await this.#db.del(id);
    return true;
  }
}
