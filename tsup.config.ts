import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Icons entry
  {
    entry: { 'icons/index': 'src/icons/index.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Player entry
  {
    entry: { 'player/Player': 'src/player/Player.tsx' },
    format: ['esm'],
    dts: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Renderer entry
  {
    entry: { 'renderer/index': 'src/renderer/index.ts' },
    format: ['esm'],
    dts: true,
    external: ['react', 'react-dom'],
  },
]);
