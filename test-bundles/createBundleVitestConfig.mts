import { fileURLToPath } from 'node:url';

import { defineConfig, mergeConfig } from 'vitest/config';

import config from '../vitest.config.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

/**
 * Runs the regular test suite against a built bundle instead of the sources.
 *
 * The `find` pattern must be a regex. A plain string is matched as a *prefix of
 * the import specifier*, and every specifier in the suite is relative
 * (`../src/index`, `../../src/index`, `../../../src/`), so the previous
 * `'/src/index'` string never matched: the aliases silently did nothing and all
 * three "bundle" runs simply re-ran the sources. They passed with `dist/`
 * deleted.
 */
export function createBundleVitestConfig(entry: string) {
  return mergeConfig(
    config,
    defineConfig({
      test: {
        coverage: { enabled: false },
        typecheck: { enabled: false },
      },
      resolve: {
        alias: [
          {
            // Redirect the package entry only: `../src`, `../src/` or
            // `../src/index`, at any `../` depth. The optional `/index` and
            // trailing slash are what keep internal submodules such as
            // `../src/typeUtils` pointing at source, since they have no
            // single-file bundle to resolve to.
            find: /^(?:\.\.\/)+src(?:\/index)?\/?$/,
            replacement: root + entry,
          },
        ],
      },
    }),
  );
}
