import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

/**
 * webpack 4 ships an acorn build that cannot parse the ES2020 operators
 * `?.` and `??`. It resolves the `module` field before `main` (`mainFields`
 * default to `['module', 'main']`, or `['browser', 'module', 'main']` for the
 * web target, and there is no `browser` field), and never reads `exports`, so
 * the only published bundle it reaches is the legacy-ESM entry:
 *
 *  - `module` -> `dist/es/index.legacy-esm.js`.
 *
 * The CJS (`main` -> `dist/cjs/index.js`) and modern ESM (`exports.import` ->
 * `dist/es/index.mjs`) bundles are deliberately NOT listed: webpack 4 never
 * resolves them, and the toolchains that do parse the ES2020 operators fine,
 * so both keep them on purpose — matching reselect, which downlevels only its
 * own legacy-ESM build.
 *
 * Guarding on the emitted text keeps this honest even if the `target` in
 * `tsdown.config.ts` is loosened by accident.
 */
describe('published bundles stay parsable by webpack 4', () => {
  it.each(['dist/es/index.legacy-esm.js'])(
    '%s contains no ES2020 operators',
    (artifactPath) => {
      const source = readFileSync(join(__dirname, '..', artifactPath), 'utf8');

      // Strip the sourcemap comment: it embeds the original TS, operators included.
      const code = source.replace(/\/\/# sourceMappingURL=.*$/m, '');

      expect(code).not.toContain('??');
      expect(code).not.toContain('?.');
    },
  );
});
