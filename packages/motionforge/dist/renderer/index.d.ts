interface VideoConfig {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}
interface VideoRendererConfig {
    quality: 'low' | 'medium' | 'high';
    format: 'mp4' | 'webm' | 'gif';
    codec?: 'h264' | 'h265' | 'vp8' | 'vp9';
    crf?: number;
    pixelFormat?: string;
    bitrate?: number;
}

/**
 * Cache Statistics
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    entries: number;
    hitRate: number;
}
/**
 * LRU Cache with TTL support for frame caching
 */
declare class FrameCache<T = ImageData> {
    private cache;
    private maxSize;
    private maxAge;
    private stats;
    constructor(options?: {
        maxSize?: number;
        maxAge?: number;
    });
    /**
     * Generate cache key for a frame
     */
    static createKey(compositionId: string, frame: number, width: number, height: number): string;
    /**
     * Get a cached frame
     */
    get(key: string): T | null;
    /**
     * Set a cached frame
     */
    set(key: string, data: T, size?: number): void;
    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean;
    /**
     * Delete a cached frame
     */
    delete(key: string): boolean;
    /**
     * Clear all cached frames
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get current cache size in bytes
     */
    getSize(): number;
    /**
     * Evict entries until we have enough space
     */
    private evictIfNeeded;
    /**
     * Estimate size of data
     */
    private estimateSize;
}
/**
 * Singleton frame cache instance
 */
declare const frameCache: FrameCache<ImageData>;
/**
 * Memoization cache for computed values
 */
declare class MemoCache {
    private static instance;
    private cache;
    static getInstance(): MemoCache;
    /**
     * Get or compute a memoized value
     */
    getOrCompute<T>(key: string, compute: () => T, deps?: unknown[]): T;
    /**
     * Check if dependencies are equal
     */
    private depsEqual;
    /**
     * Clear all memoized values
     */
    clear(): void;
}
/**
 * Debounced function cache
 */
declare function createDebouncedCache<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T;
/**
 * Throttled function cache
 */
declare function createThrottledCache<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): T;

/**
 * Render progress information
 */
interface RenderProgress {
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
interface ExportOptions {
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
interface ExportResult {
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
declare class CanvasRenderer {
    private canvas;
    private ctx;
    private config;
    constructor(config: VideoConfig);
    /**
     * Capture a single frame from a DOM element
     */
    captureFrame(element: HTMLElement): Promise<ImageData>;
    /**
     * Convert ImageData to Blob
     */
    imageDataToBlob(imageData: ImageData, format?: string): Promise<Blob>;
    /**
     * Convert ImageData to data URL
     */
    imageDataToDataURL(imageData: ImageData, format?: string): string;
    /**
     * Get canvas element
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Get context
     */
    getContext(): CanvasRenderingContext2D;
    /**
     * Dispose renderer
     */
    dispose(): void;
}
/**
 * WebM Video Encoder using MediaRecorder
 */
declare class WebMEncoder {
    private mediaRecorder;
    private chunks;
    private canvas;
    private stream;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Start recording
     */
    start(fps: number, bitrate?: number): Promise<void>;
    /**
     * Stop recording and get result
     */
    stop(): Promise<Blob>;
    /**
     * Check if recording
     */
    isRecording(): boolean;
}
/**
 * Frame sequence encoder for GIF/WebP
 */
declare class FrameSequenceEncoder {
    private frames;
    private delays;
    /**
     * Add a frame
     */
    addFrame(imageData: ImageData, delay: number): void;
    /**
     * Get all frames
     */
    getFrames(): ImageData[];
    /**
     * Clear frames
     */
    clear(): void;
    /**
     * Get frame count
     */
    getFrameCount(): number;
}
/**
 * Video Export Manager - Main export functionality
 */
declare class VideoExportManager {
    private renderer;
    private encoder;
    private isRendering;
    private abortController;
    /**
     * Export video from frames
     */
    exportFromCanvas(canvas: HTMLCanvasElement, options: Omit<ExportOptions, 'compositionId'>): Promise<ExportResult>;
    /**
     * Export frame sequence as images
     */
    exportFrames(frames: ImageData[], format?: 'png' | 'jpeg' | 'webp'): Promise<Blob[]>;
    /**
     * Create downloadable zip of frames
     */
    createFrameZip(frames: ImageData[], compositionId: string): Promise<Blob>;
    /**
     * Abort current render
     */
    abort(): void;
    /**
     * Check if currently rendering
     */
    getIsRendering(): boolean;
    /**
     * Merge multiple abort signals
     */
    private mergeSignals;
}
/**
 * Calculate render progress
 */
declare function calculateProgress(frame: number, totalFrames: number, startTime: number): RenderProgress;
/**
 * Estimate video file size
 */
declare function estimateFileSize(config: VideoConfig, bitrate?: number): number;
/**
 * Check browser support for video encoding
 */
declare function checkEncodingSupport(): {
    webm: boolean;
    mp4: boolean;
    codecs: string[];
};
declare const videoExportManager: VideoExportManager;

interface RenderOptions {
    compositionId: string;
    config: VideoConfig;
    outputDir: string;
    onProgress?: (progress: number) => void;
    onFrame?: (frame: number, imageData: string) => void;
}
interface RenderResult {
    success: boolean;
    outputUrl?: string;
    frameCount: number;
    duration: number;
    error?: string;
}
declare const generateFrames: (component: React.ComponentType<Record<string, unknown>>, config: VideoConfig, options?: {
    startFrame?: number;
    endFrame?: number;
    onProgress?: (frame: number, total: number) => void;
}) => Promise<string[]>;
declare const renderVideo: (options: RenderOptions & VideoRendererConfig) => Promise<RenderResult>;
declare const buildFFmpegCommand: (inputPattern: string, outputPath: string, config: VideoConfig, rendererConfig: VideoRendererConfig) => string[];
declare const frameToDataURL: (canvas: HTMLCanvasElement) => string;
declare const calculateVideoSize: (width: number, height: number, fps: number, durationInSeconds: number, bitrate?: number) => number;
declare const estimateRenderTime: (durationInFrames: number, complexity?: "low" | "medium" | "high") => number;
declare const validateRenderConfig: (config: VideoConfig) => string[];
declare class RenderJobManager {
    private jobs;
    createJob(id: string, config: VideoConfig): void;
    startJob(id: string): void;
    updateProgress(id: string, progress: number): void;
    completeJob(id: string, outputUrl: string): void;
    failJob(id: string, error: string): void;
    getJob(id: string): RenderJobState | undefined;
    getActiveJobs(): RenderJobState[];
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
declare const renderJobManager: RenderJobManager;
declare function renderCompositionToVideo(canvas: HTMLCanvasElement, config: VideoConfig, options?: {
    onProgress?: (progress: number) => void;
    onComplete?: (blob: Blob) => void;
}): Promise<Blob | null>;
declare function downloadVideo(blob: Blob, filename?: string): void;
declare function downloadFrame(imageData: ImageData, filename?: string): void;

export { type CacheStats, CanvasRenderer, type ExportOptions, type ExportResult, FrameCache, FrameSequenceEncoder, MemoCache, RenderJobManager, type RenderOptions, type RenderProgress, type RenderResult, type VideoConfig, VideoExportManager, type VideoRendererConfig, WebMEncoder, buildFFmpegCommand, calculateProgress, calculateVideoSize, checkEncodingSupport, createDebouncedCache, createThrottledCache, downloadFrame, downloadVideo, estimateFileSize, estimateRenderTime, frameCache, frameToDataURL, generateFrames, renderCompositionToVideo, renderJobManager, renderVideo, validateRenderConfig, videoExportManager };
