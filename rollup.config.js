// https://github.com/rollup/rollup-starter-project
import babel from 'rollup-plugin-babel';

let pkg = require('./package.json');
let external = Object.keys(pkg.peerDependencies);

let plugins = [
  babel(),
];

const config = {
  entry: 'src/index.js',
  external: external,
  plugins: plugins,
  exports: 'named',
  targets: [
    {
      dest: pkg.main,
      format: 'cjs',
      sourceMap: true,
    },
    {
      dest: pkg.module,
      format: 'es',
      sourceMap: true,
    },
    {
      dest: 'dist/index.js',
      format: 'umd',
      sourceMap: true,
      moduleName: 'Re-reselect',
      globals: {
        reselect: 'Reselect',
      },
    },
  ],
};

export default config
