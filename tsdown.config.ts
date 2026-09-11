import { defineConfig } from 'tsdown';

const deps = { neverBundle: ['reselect'] };

// webpack 4 resolves the `module` field before `main` (default `mainFields`
// are `['module', 'main']`, or `['browser', 'module', 'main']` for the web
// target — and there is no `browser` field) and never reads the `exports` map.
// So the only published bundle it can reach is the legacy-ESM `module` entry,
// and it is the only one that has to stay parsable by webpack 4's ES2019-era
// acorn. `es2019` is the highest target that clears it: it downlevels only the
// ES2020 operators (`?.`, `??`), keeping classes, arrows and object spread, for
// +82 bytes gzip. (reselect pins its own legacy build to `es2017`, but that
// also downlevels object spread — which re-reselect uses and reselect does not
// — for +693 bytes with no extra compatibility.)
//
// The CJS (`main` / `require`) and modern ESM (`import` -> `.mjs`) builds are
// left at the toolchain default: only native `require()`, native Node ESM and
// modern bundlers reach them, and all parse the ES2020 operators fine. reselect
// likewise downlevels only its legacy-ESM build and ships CJS/`.mjs` as esnext.
const legacyTarget = 'es2019';

// The root `tsconfig.json` spans the whole repo (sources, tests, tooling
// configs) so `npm run type:check` covers everything. The bundler needs the
// narrower `src`-only view instead.
const tsconfig = './tsconfig.build.json';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    outDir: 'dist/es',
    // Emit `.mjs` so native Node ESM loads the bundle as ES modules regardless
    // of the package's (CommonJS) `type` — a `.js` file with `export` syntax
    // would be parsed as CJS and throw. `dts` follows to `.d.mts`.
    outExtensions: () => ({ js: '.mjs' }),
    sourcemap: true,
    deps,
    tsconfig,
    // No `target`: this is the modern ESM build, left at the toolchain default
    // so the `import`-condition consumers get untranspiled output.
    clean: true,
    unbundle: false,
  },
  {
    entry: ['src/index.ts'],
    format: 'cjs',
    outDir: 'dist/cjs',
    outExtensions: () => ({ js: '.js' }),
    sourcemap: true,
    deps,
    tsconfig,
    // No `target`: webpack 4 never resolves `main` (the `module` field wins),
    // so the CJS build is reached only by native `require()` and modern
    // bundlers, which parse the ES2020 operators fine — same as reselect's CJS.
    // Emit CJS declarations (`dist/cjs/index.d.ts`) so the `require` condition
    // of the `exports` map resolves CJS-shaped types.
    dts: true,
    clean: false,
    unbundle: false,
  },
  {
    // Old bundlers (webpack 4) resolve the `module` field and never look at
    // `exports`, so this entry exists only for them: Node always reaches the
    // `.mjs` build through `exports.import`.
    //
    // The `.js` extension is load-bearing. webpack 4 treats `.mjs` as strict
    // ESM and then refuses to re-export named bindings out of reselect's own
    // `.js` ESM build ("Can't reexport the named export 'createSelector' from
    // non EcmaScript module"). reselect ships `reselect.legacy-esm.js` for
    // exactly this reason; this mirrors it.
    entry: { 'index.legacy-esm': 'src/index.ts' },
    format: 'esm',
    outDir: 'dist/es',
    outExtensions: () => ({ js: '.js' }),
    sourcemap: true,
    deps,
    tsconfig,
    target: legacyTarget,
    dts: false,
    clean: false,
    unbundle: false,
  },
]);
