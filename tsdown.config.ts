import { defineConfig } from 'tsdown';

const deps = { neverBundle: ['reselect'] };

// Old bundlers (webpack 4) resolve only the `main`, `module` and `browser`
// fields, never the `exports` map, so just the bundles those fields point at
// have to stay parsable by webpack 4's ES2019-era acorn. `es2019` is the
// highest target that clears it: it downlevels only the ES2020 operators
// (`?.`, `??`), keeping classes, arrows and object spread, for +82 bytes gzip.
// (reselect pins its own legacy build to `es2017`, but that also downlevels
// object spread — which re-reselect uses and reselect does not — for +693
// bytes with no extra compatibility.)
//
// This is NOT applied to the modern `dist/es/index.mjs` (the `import`
// condition): only modern toolchains (native Node ESM, webpack 5+, Vite) ever
// reach it, and they parse the ES2020 operators fine. reselect leaves its own
// `.mjs`/browser builds un-downleveled for the same reason.
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
    target: legacyTarget,
    // Emit CJS declarations (`dist/cjs/index.d.ts`) so the `require` condition
    // of the `exports` map resolves CJS-shaped types.
    dts: true,
    clean: false,
    unbundle: false,
  },
  {
    entry: ['src/index.ts'],
    format: 'umd',
    outDir: 'dist/umd',
    sourcemap: true,
    deps,
    tsconfig,
    target: legacyTarget,
    globalName: 'Re-reselect',
    dts: false,
    clean: false,
    // The package sets `"sideEffects": false`. Under that flag rolldown drops
    // the external `reselect` from the UMD wrapper signature while still
    // emitting `reselect.createSelector` in the body — producing a wrapper of
    // `factory(exports)` that throws `ReferenceError: reselect is not defined`
    // on first use. (The drop happens whenever the local graph is treated as
    // side-effect-free, even if the external itself is marked side-effectful.)
    // Forcing every module side-effectful for this single-file UMD bundle keeps
    // the dependency wired (`factory(exports, require('reselect'))` /
    // `define(['exports','reselect'])` / `global.Reselect`); nothing in the
    // bundle is dead code, so there is no size cost.
    // NB: use the function form — the boolean `moduleSideEffects: true` does not
    // survive tsdown's option normalization and reproduces the broken wrapper.
    treeshake: {
      moduleSideEffects: () => true,
    },
    // Map the external to its UMD global name for the browser-global branch.
    outputOptions: {
      globals: {
        reselect: 'Reselect',
      },
    },
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
