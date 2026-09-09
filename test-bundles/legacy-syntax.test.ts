import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

/**
 * webpack 4 ships an acorn build that cannot parse the ES2020 operators
 * `?.` and `??`. Every published entry point has to stay below that line:
 *
 *  - `browser` -> `dist/umd/index.umd.js` is what webpack 4 picks by default
 *    (its `mainFields` for the web target are `browser, module, main`),
 *  - `module`  -> `dist/es/index.legacy-esm.js` is what it picks when the
 *    consumer sets `mainFields: ['module', 'main']` (the default for
 *    `target: 'node'`, i.e. any webpack 4 SSR build),
 *  - `main`    -> `dist/cjs/index.js` for plain `require`.
 *
 * `dist/es/index.mjs` is only ever reached through `exports.import`, so it is
 * covered here for consistency rather than necessity.
 *
 * Guarding on the emitted text keeps this honest even if the `target` in
 * `tsdown.config.ts` is loosened by accident.
 */
describe('published bundles stay parsable by webpack 4', () => {
  it.each([
    'dist/umd/index.umd.js',
    'dist/es/index.legacy-esm.js',
    'dist/cjs/index.js',
    'dist/es/index.mjs',
  ])('%s contains no ES2020 operators', (artifactPath) => {
    const source = readFileSync(join(__dirname, '..', artifactPath), 'utf8');

    // Strip the sourcemap comment: it embeds the original TS, operators included.
    const code = source.replace(/\/\/# sourceMappingURL=.*$/m, '');

    expect(code).not.toContain('??');
    expect(code).not.toContain('?.');
  });
});
