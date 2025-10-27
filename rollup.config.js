import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';

let pkg = require('./package.json');
let external = Object.keys(pkg.peerDependencies);

let plugins = [
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    extensions: ['.js', '.ts'],
  }),
  copy({
    targets: [{ src: 'src/index.d.ts', dest: 'dist/types' }],
  }),
];

export default {
  input: 'src/index.js',
  external: external,
  plugins: plugins,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'Re-reselect',
      globals: {
        reselect: 'Reselect',
      },
    },
  ],
};
