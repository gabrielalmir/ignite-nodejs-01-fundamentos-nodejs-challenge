export class TaskService {
  #repository = null;

  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * Create a new task.
   * @param {Task} task - The task to create.
   * @return {Promise<Task>} The created task.
   */
  async create(task) {
    return this.#repository.create(task);
  }

  /**
   * Retrieve all tasks.
   * @return {Promise<Task[]>} A list of all tasks.
  */
  async findAll() {
    return this.#repository.findAll();
  }

  /**
   * Find a task by its ID.
   * @param {string} id - The ID of the task to find.
   * @return {Promise<Task|null>} The found task or null if not found.
   * */
  async findById(id) {
    return this.#repository.findById(id);
  }

  /**
   * Update an existing task.
   * @param {Task} task - The task with updated information.
   * @return {Promise<Task>} The updated task.
   * */
  async update(task) {
    return this.#repository.update(task);
  }

  /**
   * Delete a task by its ID.
   * @param {string} id - The ID of the task to delete.
   * @return {Promise<boolean>} True if deletion was successful.
   * */
  async delete(id) {
    return this.#repository.delete(id);
  }
}
