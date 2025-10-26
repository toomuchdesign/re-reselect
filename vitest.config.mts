import { defaultInclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    restoreMocks: true,
    dir: 'test',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**.{ts,js}'],
      enabled: true,
      reporter: [['lcov', { projectRoot: './' }], ['text']],
    },
    // Typecheck seems to have issues
    typecheck: {
      enabled: true,
      include: defaultInclude,
    },
  },
});
