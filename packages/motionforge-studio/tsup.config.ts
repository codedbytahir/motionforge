import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'motionforge'],
});
