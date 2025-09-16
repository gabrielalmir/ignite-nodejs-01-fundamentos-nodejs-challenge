import { LunaDB } from "./infrastructure/db/luna.js";

const db = new LunaDB();
await db.load();

process.on("beforeExit", async () => {
  console.log("Compacting database...");
  await db.compact();
});
