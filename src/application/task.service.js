export class TaskService {
  #repository = null;

  constructor(repository) {
    this.#repository = repository;
  }

  async create(task) {
    return this.#repository.create(task);
  }

  async findAll() {
    return this.#repository.findAll();
  }

  async findById(id) {
    return this.#repository.findById(id);
  }

  async update(id, task) {
    return this.#repository.update(id, task);
  }

  async delete(id) {
    return this.#repository.delete(id);
  }
}
