import { defineConfig } from 'tsup';

// Clean exactly once in the build script, before any parallel JS/DTS jobs.
// Never enable per-config cleaning: it can delete sibling declaration outputs.
const configs = [
 {entry: {trolic: "src/trolic.ts"},format:["esm","cjs"],dts:true,clean:false,noExternal:["mediabunny"],external:["react","react-dom","lottie-web"],esbuildOptions(options){options.jsx="automatic";}},
  // Main entry
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    noExternal: ["mediabunny"],
    clean: false,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'lottie-web'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Icons entry
  {
    entry: { 'icons/index': 'src/icons/index.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    noExternal: ["mediabunny"],
    clean: false,
    splitting: false,
    sourcemap: true,
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'lottie-web'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Player entry
  {
    entry: { 'player/Player': 'src/player/Player.tsx' },
    format: ['esm'],
    dts: true,
    noExternal: ["mediabunny"],
    clean: false,
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'lottie-web'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Renderer entry
  {
    entry: { 'renderer/index': 'src/renderer/index.ts' },
    format: ['esm'],
    dts: true,
    noExternal: ["mediabunny"],
    clean: false,
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'lottie-web'],
  },
];
export default defineConfig(process.env.MOTIONFORGE_BUILD_ENTRY === undefined ? configs : [configs[Number(process.env.MOTIONFORGE_BUILD_ENTRY)]]);
