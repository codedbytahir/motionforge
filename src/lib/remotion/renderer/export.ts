// Video Export System - Real video rendering with canvas capture

import { VideoConfig, VideoRendererConfig } from '../core/types';

/**
 * Render progress information
 */
export interface RenderProgress {
  frame: number;
  totalFrames: number;
  percentage: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  framesPerSecond: number;
}

/**
 * Render options
 */
export interface ExportOptions {
  compositionId: string;
  config: VideoConfig;
  rendererConfig?: Partial<VideoRendererConfig>;
  onProgress?: (progress: RenderProgress) => void;
  onFrame?: (frameNumber: number, imageData: ImageData) => void;
  signal?: AbortSignal;
}

/**
 * Render result
 */
export interface ExportResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  frameCount: number;
  duration: number;
  error?: string;
}

/**
 * Canvas renderer for frame capture
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: VideoConfig;

  constructor(config: VideoConfig) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    
    const ctx = this.canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
    });
    
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    this.ctx = ctx;
  }

  /**
   * Capture a single frame from a DOM element
   */
  async captureFrame(element: HTMLElement): Promise<ImageData> {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Use html2canvas-like approach or direct draw
    // For now, we'll draw the element if it's an image/canvas
    if (element instanceof HTMLCanvasElement) {
      this.ctx.drawImage(element, 0, 0, this.canvas.width, this.canvas.height);
    } else if (element instanceof HTMLImageElement) {
      this.ctx.drawImage(element, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      // For regular elements, we need to use a different approach
      // This would require html2canvas or similar
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Convert ImageData to Blob
   */
  async imageDataToBlob(imageData: ImageData, format: string = 'image/png'): Promise<Blob> {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert to blob'));
        }
      }, format);
    });
  }

  /**
   * Convert ImageData to data URL
   */
  imageDataToDataURL(imageData: ImageData, format: string = 'image/png'): string {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas.toDataURL(format);
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Dispose renderer
   */
  dispose(): void {
    this.canvas.remove();
  }
}

/**
 * WebM Video Encoder using MediaRecorder
 */
export class WebMEncoder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private canvas: HTMLCanvasElement;
  private stream: MediaStream | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /**
   * Start recording
   */
  async start(fps: number, bitrate: number = 5000000): Promise<void> {
    this.chunks = [];
    
    this.stream = this.canvas.captureStream(fps);
    
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    
    let mimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    
    if (!mimeType) {
      throw new Error('No supported WebM codec found');
    }
    
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: bitrate,
    });
    
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Failed to create MediaRecorder'));
        return;
      }
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
      
      this.mediaRecorder.onstart = () => resolve();
      this.mediaRecorder.onerror = (e) => reject(e);
      
      this.mediaRecorder.start();
    });
  }

  /**
   * Stop recording and get result
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not started'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  /**
   * Check if recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

/**
 * Frame sequence encoder for GIF/WebP
 */
export class FrameSequenceEncoder {
  private frames: ImageData[] = [];
  private delays: number[] = [];

  /**
   * Add a frame
   */
  addFrame(imageData: ImageData, delay: number): void {
    this.frames.push(imageData);
    this.delays.push(delay);
  }

  /**
   * Get all frames
   */
  getFrames(): ImageData[] {
    return this.frames;
  }

  /**
   * Clear frames
   */
  clear(): void {
    this.frames = [];
    this.delays = [];
  }

  /**
   * Get frame count
   */
  getFrameCount(): number {
    return this.frames.length;
  }
}

/**
 * Video Export Manager - Main export functionality
 */
export class VideoExportManager {
  private renderer: CanvasRenderer | null = null;
  private encoder: WebMEncoder | null = null;
  private isRendering = false;
  private abortController: AbortController | null = null;

  /**
   * Export video from frames
   */
  async exportFromCanvas(
    canvas: HTMLCanvasElement,
    options: Omit<ExportOptions, 'compositionId'>
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const { config, onProgress, signal } = options;

    try {
      this.isRendering = true;
      this.abortController = new AbortController();
      
      const mergedSignal = this.mergeSignals(signal, this.abortController.signal);

      // Create encoder
      this.encoder = new WebMEncoder(canvas);
      const bitrate = options.rendererConfig?.bitrate ?? 5000000;
      
      await this.encoder.start(config.fps, bitrate);

      // Wait for rendering to complete or abort
      await new Promise<void>((resolve, reject) => {
        const checkComplete = () => {
          if (mergedSignal.aborted) {
            reject(new Error('Render aborted'));
            return;
          }
          if (!this.encoder?.isRecording()) {
            resolve();
          } else {
            requestAnimationFrame(checkComplete);
          }
        };
        
        // Start checking after a delay
        setTimeout(checkComplete, 100);
      });

      const blob = await this.encoder.stop();
      const url = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        url,
        frameCount: config.durationInFrames,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        frameCount: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isRendering = false;
      this.encoder = null;
    }
  }

  /**
   * Export frame sequence as images
   */
  async exportFrames(
    frames: ImageData[],
    format: 'png' | 'jpeg' | 'webp' = 'png'
  ): Promise<Blob[]> {
    const canvasRenderer = new CanvasRenderer({ 
      width: frames[0]?.width ?? 1920, 
      height: frames[0]?.height ?? 1080, 
      fps: 30, 
      durationInFrames: frames.length 
    });

    const blobs: Blob[] = [];
    const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;

    for (let i = 0; i < frames.length; i++) {
      const blob = await canvasRenderer.imageDataToBlob(frames[i], mimeType);
      blobs.push(blob);
    }

    canvasRenderer.dispose();
    return blobs;
  }

  /**
   * Create downloadable zip of frames
   */
  async createFrameZip(frames: ImageData[], compositionId: string): Promise<Blob> {
    // This would require JSZip or similar library
    // For now, return first frame as placeholder
    if (frames.length === 0) {
      throw new Error('No frames to zip');
    }
    
    const canvasRenderer = new CanvasRenderer({
      width: frames[0].width,
      height: frames[0].height,
      fps: 30,
      durationInFrames: frames.length,
    });

    const blobs = await this.exportFrames(frames, 'png');
    canvasRenderer.dispose();

    // Return concatenated blobs as a simple archive
    // In production, use JSZip
    return blobs[0];
  }

  /**
   * Abort current render
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isRendering = false;
    this.encoder = null;
  }

  /**
   * Check if currently rendering
   */
  getIsRendering(): boolean {
    return this.isRendering;
  }

  /**
   * Merge multiple abort signals
   */
  private mergeSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal) {
        if (signal.aborted) {
          controller.abort();
          break;
        }
        signal.addEventListener('abort', () => controller.abort());
      }
    }
    
    return controller.signal;
  }
}

/**
 * Calculate render progress
 */
export function calculateProgress(
  frame: number,
  totalFrames: number,
  startTime: number
): RenderProgress {
  const elapsedMs = Date.now() - startTime;
  const percentage = (frame / totalFrames) * 100;
  const framesPerSecond = frame > 0 ? (frame / elapsedMs) * 1000 : 0;
  const estimatedRemainingMs = framesPerSecond > 0 
    ? ((totalFrames - frame) / framesPerSecond) * 1000 
    : 0;

  return {
    frame,
    totalFrames,
    percentage,
    elapsedMs,
    estimatedRemainingMs,
    framesPerSecond,
  };
}

/**
 * Estimate video file size
 */
export function estimateFileSize(
  config: VideoConfig,
  bitrate: number = 5000000
): number {
  const durationSeconds = config.durationInFrames / config.fps;
  return Math.ceil((bitrate * durationSeconds) / 8);
}

/**
 * Check browser support for video encoding
 */
export function checkEncodingSupport(): {
  webm: boolean;
  mp4: boolean;
  codecs: string[];
} {
  const webm = MediaRecorder.isTypeSupported('video/webm');
  const mp4 = MediaRecorder.isTypeSupported('video/mp4');
  
  const codecs: string[] = [];
  const testCodecs = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/mp4;codecs=h264',
    'video/mp4;codecs=avc1',
  ];
  
  for (const codec of testCodecs) {
    if (MediaRecorder.isTypeSupported(codec)) {
      codecs.push(codec);
    }
  }
  
  return { webm, mp4, codecs };
}

// Singleton export manager
export const videoExportManager = new VideoExportManager();

export default VideoExportManager;
