import { renderMedia, ensureFfmpeg } from '@motionforge/renderer';

export async function stillCommand(options: {
  entry: string;
  compositionId: string;
  output: string;
  frame?: number;
  width?: number;
  height?: number;
  props?: string;
}) {
  console.log(`[MotionForge] Rendering still from "${options.compositionId}" at frame ${options.frame ?? 0}...`);

  await ensureFfmpeg();

  const inputProps = options.props ? JSON.parse(options.props) : undefined;

  const result = await renderMedia({
    serveUrl: options.entry,
    compositionId: options.compositionId,
    outputLocation: options.output,
    codec: 'gif', // GIF mode in stitch-frames can handle single frame too, or we can just use a simple screenshot
    fps: 1,
    width: Number(options.width) || 1920,
    height: Number(options.height) || 1080,
    durationInFrames: 1,
    inputProps,
    frameRange: [Number(options.frame) || 0, Number(options.frame) || 0],
  });

  if (result.success) {
    console.log(`\n  ✓ Rendered frame ${options.frame ?? 0}`);
    console.log(`  Output: ${result.outputLocation}`);
  } else {
    console.error(`\n  ✗ Still render failed: ${result.error}`);
    process.exit(1);
  }
}
