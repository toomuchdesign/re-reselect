import {defineConfig, mergeConfig} from 'vitest/config';
import config from '../vitest.config.mjs';

export default mergeConfig(
  config,
  defineConfig({
    test: {
      coverage: {
        enabled: false,
      },
      typecheck: {
        enabled: false,
      },
    },
    resolve: {
      alias: [
        {
          find: '/src/index',
          replacement: '/dist/cjs/index',
        },
        {
          find: '/src/reselectWrapper',
          replacement: '/dist/cjs/reselectWrapper',
        },
      ],
    },
  })
);
