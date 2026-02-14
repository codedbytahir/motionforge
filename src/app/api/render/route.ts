import { NextRequest, NextResponse } from 'next/server';
import {
  validateRenderConfig,
  VideoConfig,
  VideoRendererConfig,
  RenderJobManager,
  estimateRenderTime,
} from '@/lib/remotion/renderer';

// Global render job manager
const renderJobManager = new RenderJobManager();

// In-memory job storage with enhanced tracking
interface EnhancedJobState {
  id: string;
  config: VideoConfig;
  rendererConfig?: VideoRendererConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  frameProgress: { current: number; total: number };
  startTime: number | null;
  endTime: number | null;
  outputUrl?: string;
  error?: string;
  metadata: {
    estimatedDuration: number;
    resolution: string;
    format: string;
    fps: number;
  };
}

const renderJobs = new Map<string, EnhancedJobState>();

// POST: Start a new render job
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
    const estimatedDuration = estimateRenderTime(config.durationInFrames, 'medium');

    const job: EnhancedJobState = {
      id: jobId,
      config,
      rendererConfig,
      status: 'pending',
      progress: 0,
      frameProgress: { current: 0, total: config.durationInFrames },
      startTime: null,
      endTime: null,
      metadata: {
        estimatedDuration,
        resolution: `${config.width}x${config.height}`,
        format: rendererConfig?.format ?? 'webm',
        fps: config.fps,
      },
    };

    renderJobs.set(jobId, job);
    renderJobManager.createJob(jobId, config);

    // Start async rendering
    startRenderJob(jobId, config, rendererConfig);

    return NextResponse.json({
      success: true,
      jobId,
      metadata: job.metadata,
      message: 'Render job started',
    });
  } catch (error) {
    console.error('Render job error:', error);
    return NextResponse.json(
      { error: 'Failed to start render job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Get render job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const action = searchParams.get('action');

  // Handle different actions
  if (action === 'list') {
    // Return all jobs
    return NextResponse.json({
      jobs: Array.from(renderJobs.values()).map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        metadata: job.metadata,
      })),
      total: renderJobs.size,
    });
  }

  if (action === 'stats') {
    // Return rendering statistics
    const stats = calculateStats();
    return NextResponse.json(stats);
  }

  if (!jobId) {
    return NextResponse.json({
      error: 'Missing jobId parameter',
      usage: 'GET /api/render?jobId=xxx or ?action=list or ?action=stats',
    }, { status: 400 });
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
    frameProgress: job.frameProgress,
    outputUrl: job.outputUrl,
    error: job.error,
    startTime: job.startTime,
    endTime: job.endTime,
    metadata: job.metadata,
  });
}

// DELETE: Cancel a render job
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    );
  }

  const job = renderJobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  if (job.status === 'processing') {
    job.status = 'cancelled';
    job.endTime = Date.now();
    return NextResponse.json({
      success: true,
      message: 'Job cancelled',
    });
  }

  return NextResponse.json({
    error: 'Cannot cancel job that is not processing',
    status: job.status,
  }, { status: 400 });
}

// Calculate rendering statistics
function calculateStats() {
  const jobs = Array.from(renderJobs.values());
  
  return {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
    averageRenderTime: calculateAverageRenderTime(jobs),
  };
}

function calculateAverageRenderTime(jobs: EnhancedJobState[]): number {
  const completedJobs = jobs.filter(j => j.status === 'completed' && j.startTime && j.endTime);
  if (completedJobs.length === 0) return 0;
  
  const totalTime = completedJobs.reduce((sum, job) => {
    return sum + ((job.endTime ?? 0) - (job.startTime ?? 0));
  }, 0);
  
  return totalTime / completedJobs.length;
}

// Start render job
async function startRenderJob(
  jobId: string,
  config: VideoConfig,
  rendererConfig?: VideoRendererConfig
) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startTime = Date.now();
  renderJobManager.startJob(jobId);

  try {
    // Simulate frame-by-frame rendering
    const totalFrames = config.durationInFrames;
    const frameDelay = rendererConfig?.quality === 'high' ? 50 : 
                       rendererConfig?.quality === 'low' ? 10 : 25;

    for (let frame = 0; frame < totalFrames; frame++) {
      // Check if job was cancelled
      if (job.status === 'cancelled') {
        return;
      }

      // Update progress
      const progress = ((frame + 1) / totalFrames) * 100;
      job.progress = Math.round(progress * 100) / 100;
      job.frameProgress = { current: frame + 1, total: totalFrames };
      renderJobManager.updateProgress(jobId, progress);

      // Simulate frame processing time
      await new Promise(resolve => setTimeout(resolve, frameDelay));
    }

    // Complete job
    job.progress = 100;
    job.status = 'completed';
    job.endTime = Date.now();
    job.outputUrl = `/api/render/download?jobId=${jobId}`;
    renderJobManager.completeJob(jobId, job.outputUrl);

  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.endTime = Date.now();
    renderJobManager.failJob(jobId, job.error);
  }

  // Schedule cleanup
  setTimeout(() => {
    renderJobs.delete(jobId);
  }, 60 * 60 * 1000); // 1 hour
}

// Export types for external use
export type { EnhancedJobState };
