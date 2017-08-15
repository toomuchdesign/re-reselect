// https://github.com/rollup/rollup-starter-project
import babelrc from 'babelrc-rollup';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const minify = process.env.MINIFY;

let pkg = require('./package.json');
let external = Object.keys(pkg.peerDependencies);

let plugins = [
  babel(babelrc()),
];

const config = {
  entry: 'src/index.js',
  external: external,
  plugins: plugins,
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
      moduleId: 'Re-reselect',
      moduleName: 'Re-reselect',
      globals: {
        reselect: 'Reselect',
      }
    },
  ],
};

// Mutate config object to only export minified UMD
if (minify) {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );

  config.targets = [
    {
      dest: 'dist/index.min.js',
      format: 'umd',
      moduleId: 'Re-reselect',
      moduleName: 'Re-reselect',
      globals: {
        reselect: 'Reselect',
      }
    },
  ];
}

export default config
