import { defineConfig } from 'tsdown';

const deps = { neverBundle: ['reselect'] };

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/reselectWrapper.ts'],
    format: 'esm',
    outDir: 'dist/es',
    outExtensions: () => ({ js: '.js' }),
    sourcemap: true,
    deps,
    clean: true,
    unbundle: false,
  },
  {
    entry: ['src/index.ts', 'src/reselectWrapper.ts'],
    format: 'cjs',
    outDir: 'dist/cjs',
    outExtensions: () => ({ js: '.js' }),
    sourcemap: true,
    deps,
    dts: false,
    clean: false,
    unbundle: false,
  },
  {
    entry: ['src/index.ts'],
    format: 'umd',
    outDir: 'dist/umd',
    sourcemap: true,
    deps,
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
]);
