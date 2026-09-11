import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

/**
 * webpack 4 ships an acorn build that cannot parse the ES2020 operators
 * `?.` and `??`. The published entry points it resolves have to stay below
 * that line:
 *
 *  - `module` -> `dist/es/index.legacy-esm.js` is what webpack 4 picks by
 *    default (`mainFields: ['module', 'main']` for `target: 'node'`, and
 *    `['browser', 'module', 'main']` for the web target now that there is no
 *    `browser` field),
 *  - `main`   -> `dist/cjs/index.js` for plain `require`.
 *
 * `dist/es/index.mjs` (the `exports.import` entry) is deliberately NOT listed:
 * only modern toolchains reach it, so it keeps the ES2020 operators on purpose.
 *
 * Guarding on the emitted text keeps this honest even if the `target` in
 * `tsdown.config.ts` is loosened by accident.
 */
describe('published bundles stay parsable by webpack 4', () => {
  it.each(['dist/es/index.legacy-esm.js', 'dist/cjs/index.js'])(
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
