import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ["vite", "node:path", "path", "node:fs", "fs"],
  },
});
