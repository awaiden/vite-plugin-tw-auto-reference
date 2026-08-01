import { describe, expect, test } from "bun:test";
import path from "node:path";
import { vitePluginTwAutoReference } from "../src/index.ts";

describe("vitePluginTwAutoReference", () => {
  const root = path.resolve(process.cwd());

  test("prepends @reference when @apply is used in CSS file", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });

    (plugin.configResolved as any)({ root });

    const code = `.btn { @apply bg-blue-500 text-white; }`;
    const id = path.resolve(root, "src/components/Button.css");

    const result = (plugin.transform as any)(code, id);
    expect(result).not.toBeNull();
    expect(result.code).toBe(`@reference "../index.css";\n.btn { @apply bg-blue-500 text-white; }`);
  });

  test("prepends @reference after @charset directive", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });
    (plugin.configResolved as any)({ root });

    const code = `@charset "UTF-8";\n.btn { @apply bg-blue-500; }`;
    const id = path.resolve(root, "src/components/Button.css");

    const result = (plugin.transform as any)(code, id);
    expect(result).not.toBeNull();
    expect(result.code).toBe(
      `@charset "UTF-8";\n@reference "../index.css";\n.btn { @apply bg-blue-500; }`,
    );
  });

  test("returns null if @apply is not present", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });
    (plugin.configResolved as any)({ root });

    const code = `.btn { color: red; }`;
    const id = path.resolve(root, "src/components/Button.css");

    const result = (plugin.transform as any)(code, id);
    expect(result).toBeNull();
  });

  test("returns null if @reference is already present", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });
    (plugin.configResolved as any)({ root });

    const code = `@reference "../index.css";\n.btn { @apply bg-blue-500; }`;
    const id = path.resolve(root, "src/components/Button.css");

    const result = (plugin.transform as any)(code, id);
    expect(result).toBeNull();
  });

  test("returns null if file is the global CSS file", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });
    (plugin.configResolved as any)({ root });

    const code = `@import "tailwindcss";\n.global { @apply bg-red-500; }`;
    const id = path.resolve(root, "src/index.css");

    const result = (plugin.transform as any)(code, id);
    expect(result).toBeNull();
  });

  test("handles Vue style query id", () => {
    const plugin = vitePluginTwAutoReference({
      globalCssPath: "src/index.css",
    });
    (plugin.configResolved as any)({ root });

    const code = `.card { @apply p-4; }`;
    const id = path.resolve(root, "src/components/Card.vue") + "?vue&type=style&index=0&lang.css";

    const result = (plugin.transform as any)(code, id);
    expect(result).not.toBeNull();
    expect(result.code).toBe(`@reference "../index.css";\n.card { @apply p-4; }`);
  });
});
