// Video Renderer - Server-side rendering capabilities

import { VideoConfig, VideoRendererConfig } from '../core/types';

// Re-export types for convenience
export type { VideoConfig, VideoRendererConfig } from '../core/types';

export interface RenderOptions {
  compositionId: string;
  config: VideoConfig;
  outputDir: string;
  onProgress?: (progress: number) => void;
  onFrame?: (frame: number, imageData: string) => void;
}

export interface RenderResult {
  success: boolean;
  outputUrl?: string;
  frameCount: number;
  duration: number;
  error?: string;
}

// Generate frames for video
export const generateFrames = async (
  component: React.ComponentType<Record<string, unknown>>,
  config: VideoConfig,
  options?: {
    startFrame?: number;
    endFrame?: number;
    onProgress?: (frame: number, total: number) => void;
  }
): Promise<string[]> => {
  const frames: string[] = [];
  const startFrame = options?.startFrame ?? 0;
  const endFrame = options?.endFrame ?? config.durationInFrames;
  
  // In a real implementation, this would render each frame
  // For now, we return placeholder frame data
  for (let frame = startFrame; frame < endFrame; frame++) {
    if (options?.onProgress) {
      options.onProgress(frame - startFrame, endFrame - startFrame);
    }
    
    // Placeholder - in production, use puppeteer/playwright to render
    frames.push(`frame-${frame}`);
  }
  
  return frames;
};

// Render video configuration
export const renderVideo = async (
  options: RenderOptions & VideoRendererConfig
): Promise<RenderResult> => {
  const startTime = Date.now();
  
  try {
    // Generate frames
    const frames = await generateFrames(
      () => null, // placeholder
      options.config,
      {
        onProgress: (frame, total) => {
          if (options.onProgress) {
            options.onProgress(frame / total);
          }
        },
      }
    );
    
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      frameCount: frames.length,
      duration,
      outputUrl: `${options.outputDir}/output.mp4`,
    };
  } catch (error) {
    return {
      success: false,
      frameCount: 0,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// FFmpeg command builder
export const buildFFmpegCommand = (
  inputPattern: string,
  outputPath: string,
  config: VideoConfig,
  rendererConfig: VideoRendererConfig
): string[] => {
  const args: string[] = [];
  
  // Input
  args.push('-framerate', config.fps.toString());
  args.push('-i', inputPattern);
  
  // Codec settings
  switch (rendererConfig.format) {
    case 'mp4':
      args.push('-c:v', rendererConfig.codec === 'h265' ? 'libx265' : 'libx264');
      if (rendererConfig.crf) {
        args.push('-crf', rendererConfig.crf.toString());
      }
      if (rendererConfig.pixelFormat) {
        args.push('-pix_fmt', rendererConfig.pixelFormat);
      } else {
        args.push('-pix_fmt', 'yuv420p');
      }
      break;
    case 'webm':
      args.push('-c:v', rendererConfig.codec === 'vp9' ? 'libvpx-vp9' : 'libvpx');
      args.push('-crf', (rendererConfig.crf ?? 30).toString());
      args.push('-b:v', '0');
      break;
    case 'gif':
      args.push('-filter_complex', `[0:v] fps=${Math.min(config.fps, 15)},split [a][b];[a] palettegen [p];[b][p] paletteuse`);
      break;
  }
  
  // Quality presets
  switch (rendererConfig.quality) {
    case 'low':
      args.push('-preset', 'ultrafast');
      break;
    case 'medium':
      args.push('-preset', 'medium');
      break;
    case 'high':
      args.push('-preset', 'slow');
      break;
  }
  
  // Output
  args.push('-y', outputPath);
  
  return args;
};

// Frame to image data URL
export const frameToDataURL = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

// Calculate video size
export const calculateVideoSize = (
  width: number,
  height: number,
  fps: number,
  durationInSeconds: number,
  bitrate: number = 5000000
): number => {
  return Math.ceil((bitrate * durationInSeconds) / 8);
};

// Estimate render time
export const estimateRenderTime = (
  durationInFrames: number,
  complexity: 'low' | 'medium' | 'high' = 'medium'
): number => {
  const baseTimePerFrame = {
    low: 10,
    medium: 50,
    high: 200,
  };
  
  return durationInFrames * baseTimePerFrame[complexity];
};

// Validate render config
export const validateRenderConfig = (config: VideoConfig): string[] => {
  const errors: string[] = [];
  
  if (config.width < 1 || config.width > 8192) {
    errors.push('Width must be between 1 and 8192 pixels');
  }
  
  if (config.height < 1 || config.height > 8192) {
    errors.push('Height must be between 1 and 8192 pixels');
  }
  
  if (config.fps < 1 || config.fps > 120) {
    errors.push('FPS must be between 1 and 120');
  }
  
  if (config.durationInFrames < 1) {
    errors.push('Duration must be at least 1 frame');
  }
  
  return errors;
};

// Render job manager
export class RenderJobManager {
  private jobs: Map<string, RenderJobState> = new Map();
  
  createJob(id: string, config: VideoConfig): void {
    this.jobs.set(id, {
      id,
      config,
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
    });
  }
  
  startJob(id: string): void {
    const job = this.jobs.get(id);
    if (job) {
      job.status = 'processing';
      job.startTime = Date.now();
    }
  }
  
  updateProgress(id: string, progress: number): void {
    const job = this.jobs.get(id);
    if (job) {
      job.progress = progress;
    }
  }
  
  completeJob(id: string, outputUrl: string): void {
    const job = this.jobs.get(id);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.endTime = Date.now();
      job.outputUrl = outputUrl;
    }
  }
  
  failJob(id: string, error: string): void {
    const job = this.jobs.get(id);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.endTime = Date.now();
    }
  }
  
  getJob(id: string): RenderJobState | undefined {
    return this.jobs.get(id);
  }
  
  getActiveJobs(): RenderJobState[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === 'processing'
    );
  }
}

interface RenderJobState {
  id: string;
  config: VideoConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: number | null;
  endTime: number | null;
  outputUrl?: string;
  error?: string;
}

// Export singleton manager
export const renderJobManager = new RenderJobManager();
