import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands/render.ts', 'src/commands/still.ts', 'src/commands/studio.ts', 'src/commands/compositions.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  minify: true,
});
