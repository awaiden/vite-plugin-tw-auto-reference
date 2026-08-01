import fs from "node:fs";
import path from "node:path";
import { createFilter, type Plugin } from "vite";

export interface Options {
  /**
   * The path to the global CSS file that contains Tailwind's base styles / theme.
   * This file will be automatically referenced in CSS files that use Tailwind's `@apply` directive.
   * If not specified, the plugin automatically looks for standard locations (e.g. `src/index.css`, `src/globals.css`, `src/app/global.css`).
   * @default 'src/index.css'
   */
  globalCssPath?: string;

  /**
   * Pattern(s) to include files for transformation.
   */
  include?: RegExp | string | (RegExp | string)[];

  /**
   * Pattern(s) to exclude files from transformation.
   */
  exclude?: RegExp | string | (RegExp | string)[];
}

function findGlobalCss(root: string): string {
  const candidates = [
    "src/index.css",
    "src/main.css",
    "src/globals.css",
    "src/global.css",
    "src/app/globals.css",
    "src/app/global.css",
    "src/styles/globals.css",
    "src/styles/global.css",
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.resolve(root, candidate))) {
      return candidate;
    }
  }
  return "src/index.css";
}

export function vitePluginTwAutoReference(options: Options = {}): Plugin {
  let root = process.cwd();

  return {
    name: "vite-plugin-tw-auto-reference",
    enforce: "pre",
    configResolved(config) {
      root = config.root || process.cwd();
    },
    transform(code, id) {
      if (id.startsWith("\0") || id.startsWith("virtual:")) {
        return null;
      }

      const cleanId = id.split("?")[0] ?? id;

      if (cleanId.includes("node_modules")) {
        return null;
      }

      const targetGlobalCss = options.globalCssPath || findGlobalCss(root);
      const resolvedGlobalCss = path.resolve(root, targetGlobalCss);

      if (path.normalize(cleanId) === path.normalize(resolvedGlobalCss)) {
        return null;
      }

      if (options.include || options.exclude) {
        const filter = createFilter(options.include, options.exclude);
        if (!filter(id)) {
          return null;
        }
      } else {
        const isCss = /\.(css|postcss|pcss|scss|sass|less|styl|stylus)($|\?)/.test(id);
        const isStyleQuery = /[?&]type=style/.test(id);
        const isSfc = /\.(vue|svelte|astro)($|\?)/.test(id);

        if (!isCss && !isStyleQuery && !isSfc) {
          return null;
        }
      }

      if (!/@apply[\s;}]/.test(code)) {
        return null;
      }

      if (/@reference\s/.test(code) || /@import\s+['"][^'"]*tailwindcss/.test(code)) {
        return null;
      }

      const fileDir = path.dirname(cleanId);
      let relPath = path.relative(fileDir, resolvedGlobalCss).replace(/\\/g, "/");

      if (!relPath.startsWith(".")) {
        relPath = `./${relPath}`;
      }

      let newCode: string;
      const charsetMatch = code.match(/^@charset\s+[^;]+;\s*/i);
      if (charsetMatch) {
        const charsetLen = charsetMatch[0].length;
        newCode = code.slice(0, charsetLen) + `@reference "${relPath}";\n` + code.slice(charsetLen);
      } else {
        newCode = `@reference "${relPath}";\n${code}`;
      }

      return {
        code: newCode,
        map: null,
      };
    },
  };
}

export const tailwindAutoReference = vitePluginTwAutoReference;
export default vitePluginTwAutoReference;
