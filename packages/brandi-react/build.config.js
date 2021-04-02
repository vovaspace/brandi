/* eslint-disable import/no-extraneous-dependencies */

const esbuild = require('esbuild');

const pkg = require('./package.json');

const commons = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  sourcemap: true,
};

esbuild.build({
  ...commons,
  outfile: pkg.main,
  format: 'cjs',
  target: 'es2018',
});

esbuild.build({
  ...commons,
  outfile: pkg.module,
  format: 'esm',
  target: 'es2018',
});

esbuild.build({
  ...commons,
  outfile: pkg.esnext,
  format: 'esm',
  target: 'esnext',
});
