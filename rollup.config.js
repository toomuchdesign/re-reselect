// https://github.com/rollup/rollup-starter-project
import babel from 'rollup-plugin-babel';

let pkg = require('./package.json');
let external = Object.keys(pkg.peerDependencies);

let plugins = [
  babel({
    exclude: 'node_modules/**',
  }),
];

const config = {
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
      file: 'dist/index.js',
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

export default config;
