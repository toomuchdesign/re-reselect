---
're-reselect': patch
---

Keep the published bundles parsable by webpack 4.

The move from Rollup + Babel to `tsdown` dropped the transpilation step, so the
bundles were emitted at the toolchain's default target and shipped the ES2020
operators `?.` and `??`. webpack 4's parser rejects both, which broke the build
outright for consumers still on it:

```
ERROR in ./node_modules/re-reselect/dist/umd/index.umd.js 66:38
Module parse failed: Unexpected token (66:38)
>  const cache = options.cacheObject ?? new FlatObjectCache();
```

Two independent fixes, mirroring how reselect packages the same problem:

- **`target: 'es2019'` for every bundle.** This downlevels only the ES2020
  operators; classes and arrow functions stay, exactly as in every reselect
  build. Cost: +82 bytes gzip on the UMD bundle.
- **A dedicated `dist/es/index.legacy-esm.js` for the `module` field.** webpack 4
  treats `.mjs` as strict ESM and then refuses to re-export named bindings out
  of reselect's `.js` ESM build (`Can't reexport the named export
'createSelector' from non EcmaScript module`), so the previous
  `"module": "dist/es/index.mjs"` failed even with the syntax fixed. `module` is
  only ever read by bundlers — Node resolves `exports.import` — so an ESM file
  with a `.js` extension is safe there. This mirrors reselect's own
  `reselect.legacy-esm.js`.

`exports`, `main` and `browser` are unchanged, and native Node ESM still loads
`dist/es/index.mjs`.
