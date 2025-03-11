# react-router-hono

https://react-router-hono-cloudflare-plugin.mofon001.workers.dev/

## important point

When launched in Vite's development mode, the first SSR is an error, which is a specification.

## wrangler.toml

```toml
workers_dev = true
name = "react-router-hono-cloudflare-plugin"
compatibility_date = "2024-12-30"
compatibility_flags = ["nodejs_compat"]
main = "workers/app.ts"
assets = { directory = "./build/client/" }

[vars]
TEST="Cloudflare Test"
REACT_ROUTER_PUBLIC_TEST1 = "React Router Public Test1"
REACT_ROUTER_PUBLIC_TEST2 = "React Router Public Test2"

[observability]
enabled = true

```

## vite.config.ts

```ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: [
      {
        find: "../build/server/index.js",
        replacement: "virtual:react-router/server-build",
      },
    ],
  },
  plugins: [
    mode === "development" && cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
```

## app/routes.ts

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

## workers/app.ts

```ts
import { Hono } from "hono";
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
```

## app/routes/\_index.tsx

```tsx
import { getContext } from "hono/context-storage";
import { useLoaderData } from "react-router";
import { useRootContext } from "remix-provider";

export default function Index() {
  const server = useLoaderData<string>();
  const client = useRootContext();
  return (
    <div>
      <div>Client:</div>
      <pre>{JSON.stringify(client, null, 2)}</pre>
      <hr />
      <div>Server:</div>
      <pre>{server}</pre>
    </div>
  );
}

// At the point of module execution, process.env is available.

export const loader = () => {
  const value = JSON.stringify(getContext().env, null, 2);
  return value;
};
```
