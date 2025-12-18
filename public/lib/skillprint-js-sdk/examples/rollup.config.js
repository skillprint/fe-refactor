const rollupConfig = `
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from '@rollup/plugin-terser';

export default [
  // ES Module build
  {
    input: 'src/skillprint-sdk.js',
    output: {
      file: 'dist/skillprint-sdk.esm.js',
      format: 'es'
    },
    plugins: [nodeResolve()]
  },
  // UMD build
  {
    input: 'src/skillprint-sdk.js',
    output: {
      file: 'dist/skillprint-sdk.umd.js',
      format: 'umd',
      name: 'SkillprintSDK'
    },
    plugins: [nodeResolve()]
  },
  // Minified UMD build
  {
    input: 'src/skillprint-sdk.js',
    output: {
      file: 'dist/skillprint-sdk.min.js',
      format: 'umd',
      name: 'SkillprintSDK'
    },
    plugins: [nodeResolve(), terser()]
  }
];
`;

export { GenericCanvasGame, packageJsonExample, rollupConfig };