import { renderMedia, type RenderMediaOptions, ensureFfmpeg } from '@motionforge/renderer';

export async function renderCommand(options: {
  entry: string;
  compositionId: string;
  output: string;
  codec: any;
  fps?: number;
  width?: number;
  height?: number;
  duration?: number;
  props?: string;
  concurrency?: number;
  frameRange?: string;
  crf?: number;
  quality?: 'low' | 'medium' | 'high';
}) {
  console.log(`[MotionForge] Rendering composition "${options.compositionId}"...`);

  // Ensure FFmpeg is available
  await ensureFfmpeg();

  // Parse input props
  const inputProps = options.props ? JSON.parse(options.props) : undefined;

  // Parse frame range
  const frameRange = options.frameRange
    ? options.frameRange.split('-').map(Number) as [number, number]
    : undefined;

  const result = await renderMedia({
    serveUrl: options.entry,
    compositionId: options.compositionId,
    outputLocation: options.output,
    codec: options.codec,
    fps: Number(options.fps) || 30,
    width: Number(options.width) || 1920,
    height: Number(options.height) || 1080,
    durationInFrames: Number(options.duration) || 300,
    inputProps,
    concurrency: Number(options.concurrency) || 4,
    frameRange,
    crf: options.crf ? Number(options.crf) : undefined,
    quality: options.quality,
    onProgress: (progress) => {
      process.stdout.write(`\r  Progress: ${(progress * 100).toFixed(1)}%`);
    },
  });

  if (result.success) {
    console.log(`\n  ✓ Rendered ${result.frameCount} frames in ${(result.durationMs / 1000).toFixed(1)}s`);
    console.log(`  Output: ${result.outputLocation}`);
  } else {
    console.error(`\n  ✗ Render failed: ${result.error}`);
    process.exit(1);
  }
}
