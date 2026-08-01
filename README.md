# vite-plugin-tw-auto-reference

A Vite plugin that automatically adds the Tailwind CSS v4 `@reference` directive to CSS files and style blocks using `@apply`.

## Installation

```bash
# npm
npm install -D vite-plugin-tw-auto-reference

# pnpm
pnpm add -D vite-plugin-tw-auto-reference

# bun
bun add -d vite-plugin-tw-auto-reference
```

## Usage

Add `vite-plugin-tw-auto-reference` to your Vite configuration (`vite.config.js` or `vite.config.ts`):

```ts
import { defineConfig } from "vite";
import tailwindAutoReference from "vite-plugin-tw-auto-reference";

export default defineConfig({
  plugins: [
    tailwindAutoReference({
      // Path to your global CSS file containing Tailwind's base styles / theme
      // Default: automatically searches for `src/index.css`, `src/globals.css`, `src/app/global.css`, etc.
      globalCssPath: "src/index.css",
    }),
  ],
});
```

## Options

| Option          | Type                                       | Default                                                         | Description                                                                             |
| --------------- | ------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `globalCssPath` | `string`                                   | Auto-detected (`src/index.css`, `src/globals.css`, etc.)        | Relative path (from Vite root) to the global CSS file with Tailwind imports/directives. |
| `include`       | `RegExp \| string \| (RegExp \| string)[]` | CSS files, SFC style blocks (`.vue`, `.svelte`, `.astro`, etc.) | Filter patterns for files to include in transformation.                                 |
| `exclude`       | `RegExp \| string \| (RegExp \| string)[]` | `node_modules`                                                  | Filter patterns for files to exclude from transformation.                               |

## Author

- **Halil Aydın** ([@awaiden](https://github.com/awaiden))

## License

[MIT](./LICENSE)
