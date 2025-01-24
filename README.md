# react-router-hono

https://react-router-hono-cloudflare-plugin.mofon001.workers.dev/

## wrangler.toml

```toml
workers_dev = true
name = "react-router-hono"
compatibility_date = "2024-11-18"
compatibility_flags = ["nodejs_compat"]
main = "./build/server/index.js"
assets = { directory = "./build/client/" }

[vars]
TEST="Cloudflare Test"
REACT_ROUTER_PUBLIC_TEST1 = "React Router Public Test1"
REACT_ROUTER_PUBLIC_TEST2 = "React Router Public Test2"

[observability]
enabled = true
```

## wrangler.dev.toml

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
import autoprefixer from "autoprefixer";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

const entry = "./workers/app.ts";

export default defineConfig(({ isSsrBuild, mode }) => ({
  build: {
    rollupOptions: {
      input: isSsrBuild ? entry : undefined,
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
      externalConditions: ["workerd", "worker"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  plugins: [
    mode === "development"
      ? cloudflare({
          configPath: "./wrangler.dev.toml",
        })
      : undefined,
    tailwindcss(),
    reactRouter().map((plugin) =>
      plugin.name === "react-router"
        ? {
            ...plugin,
            configureServer(server) {
              if (plugin.configureServer instanceof Function)
                plugin?.configureServer(server);
            },
          }
        : plugin
    ),
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
import { contextStorage } from "hono/context-storage";
import { createRequestHandler } from "react-router";

const app = new Hono();
app.use(contextStorage());

app.use(async (c) => {
  // @ts-expect-error - virtual module provided by React Router at build time
  const build = await import("virtual:react-router/server-build");
  const handler = createRequestHandler(build, import.meta.env.MODE);
  const result = await handler(c.req.raw);
  return result;
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
