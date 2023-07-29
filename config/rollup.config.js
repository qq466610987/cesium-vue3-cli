import typescript from '@rollup/plugin-typescript'
export default {
  input: 'cli.ts',
  output: {
    file: 'bundle.js',
    format: 'esm',
    banner: '#! /usr/bin/env node'
  },
  plugins: [
    typescript({
      tsconfig:'./tsconfig.json'
    })
  ]
};