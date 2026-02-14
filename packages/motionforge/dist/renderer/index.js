import {
  CanvasRenderer,
  FrameSequenceEncoder,
  VideoExportManager,
  WebMEncoder,
  calculateProgress,
  checkEncodingSupport,
  estimateFileSize,
  videoExportManager
} from "../chunk-KFPIOAIT.js";

// src/renderer/cache.ts
var FrameCache = class {
  constructor(options = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.stats = { hits: 0, misses: 0 };
    this.maxSize = options.maxSize ?? 100 * 1024 * 1024;
    this.maxAge = options.maxAge ?? 5 * 60 * 1e3;
  }
  /**
   * Generate cache key for a frame
   */
  static createKey(compositionId, frame, width, height) {
    return `${compositionId}:${frame}:${width}x${height}`;
  }
  /**
   * Get a cached frame
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    entry.accessCount++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;
    return entry.data;
  }
  /**
   * Set a cached frame
   */
  set(key, data, size) {
    const entrySize = size ?? this.estimateSize(data);
    this.evictIfNeeded(entrySize);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      size: entrySize
    });
  }
  /**
   * Check if key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Delete a cached frame
   */
  delete(key) {
    return this.cache.delete(key);
  }
  /**
   * Clear all cached frames
   */
  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }
  /**
   * Get cache statistics
   */
  getStats() {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: totalSize,
      entries: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0
    };
  }
  /**
   * Get current cache size in bytes
   */
  getSize() {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += entry.size;
    }
    return size;
  }
  /**
   * Evict entries until we have enough space
   */
  evictIfNeeded(neededSize) {
    while (this.getSize() + neededSize > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }
  }
  /**
   * Estimate size of data
   */
  estimateSize(data) {
    if (data instanceof ImageData) {
      return data.data.length;
    }
    if (typeof data === "string") {
      return data.length * 2;
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    return 1024;
  }
};
var frameCache = new FrameCache({
  maxSize: 200 * 1024 * 1024,
  // 200MB
  maxAge: 10 * 60 * 1e3
  // 10 minutes
});
var MemoCache = class _MemoCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!_MemoCache.instance) {
      _MemoCache.instance = new _MemoCache();
    }
    return _MemoCache.instance;
  }
  /**
   * Get or compute a memoized value
   */
  getOrCompute(key, compute, deps = []) {
    const cached = this.cache.get(key);
    if (cached && this.depsEqual(cached.deps, deps)) {
      return cached.value;
    }
    const value = compute();
    this.cache.set(key, { value, deps });
    return value;
  }
  /**
   * Check if dependencies are equal
   */
  depsEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => Object.is(val, b[i]));
  }
  /**
   * Clear all memoized values
   */
  clear() {
    this.cache.clear();
  }
};
function createDebouncedCache(fn, delay) {
  let timeoutId = null;
  let lastArgs = [];
  return ((...args) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...lastArgs);
      timeoutId = null;
    }, delay);
  });
}
function createThrottledCache(fn, limit) {
  let inThrottle = false;
  return ((...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  });
}

// src/renderer/index.ts
var generateFrames = async (component, config, options) => {
  const frames = [];
  const startFrame = options?.startFrame ?? 0;
  const endFrame = options?.endFrame ?? config.durationInFrames;
  for (let frame = startFrame; frame < endFrame; frame++) {
    if (options?.onProgress) {
      options.onProgress(frame - startFrame, endFrame - startFrame);
    }
    frames.push(`frame-${frame}`);
  }
  return frames;
};
var renderVideo = async (options) => {
  const startTime = Date.now();
  try {
    const frames = await generateFrames(
      () => null,
      options.config,
      {
        onProgress: (frame, total) => {
          if (options.onProgress) {
            options.onProgress(frame / total);
          }
        }
      }
    );
    const duration = Date.now() - startTime;
    return {
      success: true,
      frameCount: frames.length,
      duration,
      outputUrl: `${options.outputDir}/output.mp4`
    };
  } catch (error) {
    return {
      success: false,
      frameCount: 0,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
var buildFFmpegCommand = (inputPattern, outputPath, config, rendererConfig) => {
  const args = [];
  args.push("-framerate", config.fps.toString());
  args.push("-i", inputPattern);
  switch (rendererConfig.format) {
    case "mp4":
      args.push("-c:v", rendererConfig.codec === "h265" ? "libx265" : "libx264");
      if (rendererConfig.crf) {
        args.push("-crf", rendererConfig.crf.toString());
      }
      args.push("-pix_fmt", rendererConfig.pixelFormat ?? "yuv420p");
      break;
    case "webm":
      args.push("-c:v", rendererConfig.codec === "vp9" ? "libvpx-vp9" : "libvpx");
      args.push("-crf", (rendererConfig.crf ?? 30).toString());
      args.push("-b:v", "0");
      break;
    case "gif":
      args.push("-filter_complex", `[0:v] fps=${Math.min(config.fps, 15)},split [a][b];[a] palettegen [p];[b][p] paletteuse`);
      break;
  }
  switch (rendererConfig.quality) {
    case "low":
      args.push("-preset", "ultrafast");
      break;
    case "medium":
      args.push("-preset", "medium");
      break;
    case "high":
      args.push("-preset", "slow");
      break;
  }
  args.push("-y", outputPath);
  return args;
};
var frameToDataURL = (canvas) => {
  return canvas.toDataURL("image/png");
};
var calculateVideoSize = (width, height, fps, durationInSeconds, bitrate = 5e6) => {
  return Math.ceil(bitrate * durationInSeconds / 8);
};
var estimateRenderTime = (durationInFrames, complexity = "medium") => {
  const baseTimePerFrame = {
    low: 10,
    medium: 50,
    high: 200
  };
  return durationInFrames * baseTimePerFrame[complexity];
};
var validateRenderConfig = (config) => {
  const errors = [];
  if (config.width < 1 || config.width > 8192) {
    errors.push("Width must be between 1 and 8192 pixels");
  }
  if (config.height < 1 || config.height > 8192) {
    errors.push("Height must be between 1 and 8192 pixels");
  }
  if (config.fps < 1 || config.fps > 120) {
    errors.push("FPS must be between 1 and 120");
  }
  if (config.durationInFrames < 1) {
    errors.push("Duration must be at least 1 frame");
  }
  return errors;
};
var RenderJobManager = class {
  constructor() {
    this.jobs = /* @__PURE__ */ new Map();
  }
  createJob(id, config) {
    this.jobs.set(id, {
      id,
      config,
      status: "pending",
      progress: 0,
      startTime: null,
      endTime: null
    });
  }
  startJob(id) {
    const job = this.jobs.get(id);
    if (job) {
      job.status = "processing";
      job.startTime = Date.now();
    }
  }
  updateProgress(id, progress) {
    const job = this.jobs.get(id);
    if (job) {
      job.progress = progress;
    }
  }
  completeJob(id, outputUrl) {
    const job = this.jobs.get(id);
    if (job) {
      job.status = "completed";
      job.progress = 100;
      job.endTime = Date.now();
      job.outputUrl = outputUrl;
    }
  }
  failJob(id, error) {
    const job = this.jobs.get(id);
    if (job) {
      job.status = "failed";
      job.error = error;
      job.endTime = Date.now();
    }
  }
  getJob(id) {
    return this.jobs.get(id);
  }
  getActiveJobs() {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === "processing"
    );
  }
};
var renderJobManager = new RenderJobManager();
async function renderCompositionToVideo(canvas, config, options) {
  const { VideoExportManager: VideoExportManager2 } = await import("../export-7P6CMM42.js");
  const manager = new VideoExportManager2();
  const result = await manager.exportFromCanvas(canvas, {
    config,
    onProgress: options?.onProgress ? (p) => options.onProgress(p.percentage) : void 0
  });
  if (result.success && result.blob) {
    options?.onComplete?.(result.blob);
    return result.blob;
  }
  return null;
}
function downloadVideo(blob, filename = "video.webm") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function downloadFrame(imageData, filename = "frame.png") {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        downloadVideo(blob, filename);
      }
    }, "image/png");
  }
}
export {
  CanvasRenderer,
  FrameCache,
  FrameSequenceEncoder,
  MemoCache,
  RenderJobManager,
  VideoExportManager,
  WebMEncoder,
  buildFFmpegCommand,
  calculateProgress,
  calculateVideoSize,
  checkEncodingSupport,
  createDebouncedCache,
  createThrottledCache,
  downloadFrame,
  downloadVideo,
  estimateFileSize,
  estimateRenderTime,
  frameCache,
  frameToDataURL,
  generateFrames,
  renderCompositionToVideo,
  renderJobManager,
  renderVideo,
  validateRenderConfig,
  videoExportManager
};
