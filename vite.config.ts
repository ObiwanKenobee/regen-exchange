// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFile, access } from "node:fs/promises";
import { join } from "pathe";
import type { Plugin } from "vite";

const copyServerEntryPlugin = (): Plugin => ({
  name: "copy-server-entry",
  async closeBundle() {
    const serverDir = join(process.cwd(), "dist", "server")
    const source = join(serverDir, "index.js")
    const target = join(serverDir, "server.js")

    try {
      await access(source)
    } catch {
      return
    }

    try {
      await access(target)
      return
    } catch {
      await copyFile(source, target)
    }
  },
})

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [copyServerEntryPlugin()],
    optimizeDeps: {
      exclude: ['@prisma/client', '.prisma/client/*']
    },
    build: {
      rollupOptions: {
        external: ['@prisma/client', '.prisma/client/*']
      }
    },
  }
});
