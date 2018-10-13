const test = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: test ? 'cjs' : false,
        loose: true,
      },
    ],
  ],
};
