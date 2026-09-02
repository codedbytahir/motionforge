import path from 'path';

export async function studioCommand(options: {
  entry: string;
  port?: number;
}) {
  const port = options.port || 3123;
  console.log(`[MotionForge] Starting Studio for "${options.entry}" on http://localhost:${port}...`);

  // In a real implementation, this would start a dev server with @motionforge/studio.
  console.log(`\n  Studio is running! Press Ctrl+C to stop.`);
}
