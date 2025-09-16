import { TaskService } from "./application/task.service.js";
import { LunaDB } from "./infrastructure/db/luna.js";
import { Router } from "./infrastructure/http/router.js";

import http from "node:http";
import { Task } from "./domain/task.js";
import { TaskRepository } from "./infrastructure/task.repository.js";

const db = new LunaDB();

const taskRepository = new TaskRepository(db);
const taskService = new TaskService(taskRepository);

export async function main({ host, port }, cb) {
  const app = new Router();
  await db.load();

  app.get("/", (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post("/tasks", async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const task = Task.create({ title, description });
    await taskService.create(task);

    res.status(201).json(task);
  });

  app.get("/tasks", async (req, res) => {
    const tasks = await taskService.findAll();
    res.json(tasks);
  });

  app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const task = await taskService.findById(id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (!title && !description) {
      res.status(400).json({ error: 'Title or description must be provided' });
      return;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    task.updated_at = new Date();

    await taskService.update(task);
    res.json(task);
  });

  const server = http.createServer((req, res) => app.route(req, res));
  server.listen(port, host, cb);
}

process.on("beforeExit", async () => {
  console.log("Compacting database...");
  await db.compact();
});
