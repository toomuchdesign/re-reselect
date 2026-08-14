import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createContext, runInContext } from 'vm';

import * as Reselect from 'reselect';
import { describe, expect, it } from 'vitest';

const umdPath = join(__dirname, '..', 'dist/umd/index.umd.js');

/**
 * A1 regression guard.
 *
 * The published `browser` entry (package.json `"browser"`) is this exact file.
 * A real UMD consumer loads it either as a CommonJS module (`require`) or as a
 * plain browser `<script>` global — in BOTH cases the wrapper itself is
 * responsible for pulling in the external `reselect`. If the wrapper doesn't
 * wire the dependency, the free `reselect` identifier in the body throws
 * `ReferenceError: reselect is not defined` on first selector use.
 *
 * We must NOT go through vitest's module transform here (it would auto-resolve
 * the bare `reselect` reference and mask the bug). So we exercise the built file
 * exactly as shipped:
 *   1. CJS branch  -> a real `node` subprocess that `require`s the exact file.
 *   2. Global branch -> evaluate the source in a fresh VM context whose only
 *      handle to reselect is `global.Reselect`, as a `<script>` include would.
 */
describe('UMD bundle runs as shipped', () => {
  it('works when required as a CommonJS module (real node, no bundler)', () => {
    // Non-identity result function so reselect's dev-mode
    // identity-function check stays quiet (keeps the console clean).
    const script = `
      const u = require(${JSON.stringify(umdPath)});
      const sel = u.createCachedSelector((s) => s.a, (a) => a * 2)((s) => 'k');
      const out = sel({ a: 5 });
      if (out !== 10) throw new Error('wrong result: ' + out);
      u.createStructuredCachedSelector({ a: (s) => s.a });
      process.stdout.write('OK:' + out);
    `;
    const stdout = execFileSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
    });
    expect(stdout).toBe('OK:10');
  });

  it('works as a browser <script> global (reselect on the global as Reselect)', () => {
    const source = readFileSync(umdPath, 'utf8');
    // Simulate a browser: no CommonJS, only a global object carrying Reselect.
    const sandbox: Record<string, unknown> = { Reselect };
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;
    const context = createContext(sandbox);
    runInContext(source, context);

    const globalExport = (sandbox as any)['Re-reselect'];
    expect(globalExport).toBeTypeOf('object');
    // Non-identity result function to avoid reselect's dev-mode warning.
    const sel = globalExport.createCachedSelector(
      (s: { a: number }) => s.a,
      (a: number) => a * 2,
    )(() => 'k');
    expect(sel({ a: 5 })).toBe(10);
  });
});
