import { parseRequestBody } from "./body-parser.js";
import { Path } from "./path.js";

export class Router {
  #routes;

  constructor() {
    this.#routes = new Map();
  }

  add(method, endpoint, handler) {
    const routeIdentifier = `${method}:${endpoint}`;

    if (this.#routes.has(routeIdentifier)) {
      throw new Error(`Route ${routeIdentifier} already exists`);
    }

    this.#routes.set(routeIdentifier, { method, endpoint, handler });
  }

  async route(request, response) {
    const { method, url } = request;

    const protocol = request.connection.encrypted ? 'https' : 'http';
    const requestUrl = new URL(url, `${protocol}://${request.headers.host}`);
    const routeIdentifier = `${method}:${requestUrl.pathname}`;
    const route = this.#routes.get(routeIdentifier);

    response.status = (status) => this.status(response, status);
    response.json = (data) => this.json(response, data);

    if (!route) {
      response.status(404).json({ error: 'Route not found' });
      return;
    }

    const params = new Path().params(route.endpoint, url);
    const query = new Path().queryParams(url);
    const body = await parseRequestBody(request);

    try {
      await route.handler({ params, query, body }, response);
    } catch (error) {
      console.error('Error handling request:', error);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  status(response, status) {
    response.statusCode = status;
    return response;
  }

  json(response, data) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(data));
  }

  get(endpoint, handler) {
    this.add("GET", endpoint, handler);
  }

  post(endpoint, handler) {
    this.add("POST", endpoint, handler);
  }

  put(endpoint, handler) {
    this.add("PUT", endpoint, handler);
  }

  delete(endpoint, handler) {
    this.add("DELETE", endpoint, handler);
  }
}
