import { LunaDB } from "./infrastructure/db/luna.js";
import { Router } from "./infrastructure/http/router.js";

import http from "node:http";

const db = new LunaDB();

export async function main({ host, port }, cb) {
  const app = new Router();
  await db.load();

  app.get("/", (req, res) => {
    res.json({ message: "Hello, World!"})
  });

  const server = http.createServer((req, res) => app.route(req, res));
  server.listen(port, host, cb);
}

process.on("beforeExit", async () => {
  console.log("Compacting database...");
  await db.compact();
});
