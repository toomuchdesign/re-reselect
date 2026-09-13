import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

// Snapshot the published ESM bundles and their auto-generated declarations
// (the public type surface has no other guard) to catch unintended drift from a
// tsdown or reselect upgrade. Regenerate intentionally with `vitest -u`.
describe('published artifacts', () => {
  it.each([
    'dist/es/index.mjs',
    'dist/es/index.legacy-esm.js',
    'dist/es/index.d.mts',
  ])('%s is unchanged', (artifactPath) => {
    const contents = readFileSync(join(__dirname, '..', artifactPath), 'utf8');
    expect(contents).toMatchSnapshot();
  });
});
