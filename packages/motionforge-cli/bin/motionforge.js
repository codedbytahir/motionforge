#!/usr/bin/env node
import { program } from 'commander';
import { renderCommand } from '../dist/commands/render.js';

program
  .name('motionforge')
  .description('MotionForge CLI — Programmatic video rendering')
  .version('1.0.0');

program
  .command('render <entry> <compositionId>')
  .description('Render a video composition')
  .option('-o, --output <path>', 'Output file path', 'output.mp4')
  .option('--codec <codec>', 'Video codec (h264, h265, vp8, vp9, prores, gif)', 'h264')
  .option('--fps <fps>', 'Frame rate', '30')
  .option('--width <width>', 'Width', '1920')
  .option('--height <height>', 'Height', '1080')
  .option('--duration <frames>', 'Duration in frames', '300')
  .option('--props <json>', 'Input props as JSON string')
  .option('--concurrency <n>', 'Number of concurrent pages', '4')
  .option('--frame-range <range>', 'Frame range (e.g., "0-29")')
  .option('--crf <n>', 'CRF quality value')
  .option('--quality <quality>', 'Quality preset (low, medium, high)', 'medium')
  .action(async (entry, compositionId, opts) => {
    await renderCommand({ entry, compositionId, ...opts });
  });

program
  .command('studio <entry>')
  .description('Start MotionForge Studio development environment')
  .option('-p, --port <port>', 'Port number', '3123')
  .action(async (entry, opts) => {
    const { studioCommand } = await import('../dist/commands/studio.cjs');
    await studioCommand({ entry, ...opts });
  });

program
  .command('compositions <entry>')
  .description('List available compositions')
  .action(async (entry) => {
    const { compositionsCommand } = await import('../dist/commands/compositions.cjs');
    await compositionsCommand({ entry });
  });

program.parse();
