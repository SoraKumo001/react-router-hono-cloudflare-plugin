import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { createRequestHandler } from "react-router";

const app = new Hono();
app.use(contextStorage());

app.use(async (c) => {
  // @ts-ignore
  const build = await import("../build/server/index.js");
  // @ts-ignore
  const handler = createRequestHandler(build, import.meta.env?.MODE);
  return handler(c.req.raw);
});

export default app;
