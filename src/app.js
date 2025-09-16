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
    res.json({ status: 'ok' })
  });

  app.post("/tasks", async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Title and description are required' }));
      return;
    }

    const task = Task.create({ title, description });
    await taskService.create(task);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(task));
  });

  app.get("/tasks", async (req, res) => {
    const tasks = await taskService.findAll();
    res.json(tasks);
  });

  const server = http.createServer((req, res) => app.route(req, res));
  server.listen(port, host, cb);
}

process.on("beforeExit", async () => {
  console.log("Compacting database...");
  await db.compact();
});
