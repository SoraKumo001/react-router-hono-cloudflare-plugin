import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { createRequestHandler } from "react-router";

const app = new Hono();
app.use(contextStorage());

app.use(async (c) => {
  const build = await import(
    import.meta.hot
      ? "virtual:react-router/server-build"
      : "../build/server/index.js"
  ).catch();
  const handler = createRequestHandler(build, import.meta.env?.MODE);
  const result = await handler(c.req.raw);
  return result;
});

export default app;
