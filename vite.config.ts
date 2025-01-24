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
