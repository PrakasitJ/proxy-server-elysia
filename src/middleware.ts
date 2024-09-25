import { Elysia } from "elysia";
const middleware = new Elysia().onRequest(async ({ set }) => {
  set.headers["access-control-allow-origin"] = "*";
  set.headers["access-control-allow-methods"] =
    "GET, POST, PUT, DELETE, OPTIONS";
  set.headers["access-control-allow-headers"] = "Content-Type, Authorization";
  set.status = 200;
});
export default middleware;