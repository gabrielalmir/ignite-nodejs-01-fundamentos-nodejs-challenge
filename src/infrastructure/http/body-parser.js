export async function parseRequestBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch {
        resolve({});
      }
    });
  });
}
