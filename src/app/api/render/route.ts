import { NextRequest, NextResponse } from 'next/server';
import {
  validateRenderConfig,
  VideoConfig,
  VideoRendererConfig,
} from '@/lib/remotion/renderer';

// In-memory job storage (in production, use a database)
const renderJobs = new Map<string, {
  id: string;
  config: VideoConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: number | null;
  endTime: number | null;
  outputUrl?: string;
  error?: string;
}>();

// Start a render job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      compositionId,
      config,
      rendererConfig,
    }: {
      compositionId: string;
      config: VideoConfig;
      rendererConfig?: VideoRendererConfig;
    } = body;

    // Validate config
    const errors = validateRenderConfig(config);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: errors },
        { status: 400 }
      );
    }

    // Create render job
    const jobId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    renderJobs.set(jobId, {
      id: jobId,
      config,
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
    });

    // Start async rendering (simulated)
    startRenderJob(jobId, config, rendererConfig);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Render job started',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start render job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get render job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    // Return all jobs if no jobId provided
    return NextResponse.json({
      jobs: Array.from(renderJobs.values()),
    });
  }

  const job = renderJobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    outputUrl: job.outputUrl,
    error: job.error,
    startTime: job.startTime,
    endTime: job.endTime,
  });
}

// Simulate render job (in production, use proper video encoding with FFmpeg)
async function startRenderJob(
  jobId: string,
  config: VideoConfig,
  rendererConfig?: VideoRendererConfig
) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startTime = Date.now();

  // Simulate rendering progress
  const totalFrames = config.durationInFrames;
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 5 + 1;

    if (progress >= 100) {
      clearInterval(interval);
      job.progress = 100;
      job.status = 'completed';
      job.endTime = Date.now();
      job.outputUrl = `/output/${jobId}/video.mp4`;
    } else {
      job.progress = Math.min(progress, 99);
    }
  }, 100);

  // Clean up old jobs after 1 hour
  setTimeout(() => {
    renderJobs.delete(jobId);
  }, 60 * 60 * 1000);
}
