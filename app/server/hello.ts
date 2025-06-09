import { Hono } from "hono";

export const hello = new Hono().basePath("/hello");

hello.get("/", (c) => {
  return c.json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    endpoint: "/hello",
  });
});

hello.get("/greet/:name", (c) => {
  const name = c.req.param("name");
  return c.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    endpoint: `/hello/greet/${name}`,
  });
});