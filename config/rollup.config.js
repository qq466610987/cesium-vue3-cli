import typescript from '@rollup/plugin-typescript'
export default {
  input: 'cli.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
    banner: '#! /usr/bin/env node'
  },
  plugins: [
    typescript({
      tsconfig:'./tsconfig.json'
    })
  ]
};