import { main } from "./app.js";

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3333;

main({ host, port }, () => {
  console.log(`Server running at http://${host}:${port}`);
});
