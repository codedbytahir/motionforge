// src/renderer/export.ts
var CanvasRenderer = class {
  constructor(config) {
    this.config = config;
    this.canvas = document.createElement("canvas");
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    const ctx = this.canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true
    });
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = ctx;
  }
  /**
   * Capture a single frame from a DOM element
   */
  async captureFrame(element) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (element instanceof HTMLCanvasElement) {
      this.ctx.drawImage(element, 0, 0, this.canvas.width, this.canvas.height);
    } else if (element instanceof HTMLImageElement) {
      this.ctx.drawImage(element, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      try {
        const data = await this.domToDataUrl(element);
        const img = await this.loadImage(data);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      } catch (e) {
        console.error("Failed to capture frame:", e);
        this.ctx.fillStyle = "#0a0a0a";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  async domToDataUrl(element) {
    const width = this.config.width;
    const height = this.config.height;
    const clone = element.cloneNode(true);
    this.inlineStyles(element, clone);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${new XMLSerializer().serializeToString(clone)}
          </div>
        </foreignObject>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  inlineStyles(source, target) {
    const computed = window.getComputedStyle(source);
    for (const key of Array.from(computed)) {
      target.style.setProperty(key, computed.getPropertyValue(key), computed.getPropertyPriority(key));
    }
    for (let i = 0; i < source.children.length; i++) {
      this.inlineStyles(source.children[i], target.children[i]);
    }
  }
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  /**
   * Convert ImageData to Blob
   */
  async imageDataToBlob(imageData, format = "image/png") {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert to blob"));
        }
      }, format);
    });
  }
  /**
   * Convert ImageData to data URL
   */
  imageDataToDataURL(imageData, format = "image/png") {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas.toDataURL(format);
  }
  /**
   * Get canvas element
   */
  getCanvas() {
    return this.canvas;
  }
  /**
   * Get context
   */
  getContext() {
    return this.ctx;
  }
  /**
   * Dispose renderer
   */
  dispose() {
    this.canvas.remove();
  }
};
var WebCodecsEncoder = class {
  constructor(config) {
    this.encoder = null;
    this.chunks = [];
    this.frameCount = 0;
    this.config = config;
  }
  async start(fps, bitrate = 5e6) {
    if (typeof VideoEncoder === "undefined") {
      throw new Error("WebCodecs is not supported in this browser");
    }
    this.chunks = [];
    this.frameCount = 0;
    const init = {
      output: (chunk) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        this.chunks.push(new Blob([data], { type: "video/webm" }));
      },
      error: (e) => console.error(e)
    };
    this.encoder = new VideoEncoder(init);
    const config = {
      codec: "vp09.00.10.08",
      width: this.config.width,
      height: this.config.height,
      bitrate,
      framerate: fps
    };
    this.encoder.configure(config);
  }
  async addFrame(canvas) {
    if (!this.encoder) return;
    const frame = new VideoFrame(canvas, {
      timestamp: this.frameCount * 1e6 / this.config.fps
    });
    this.encoder.encode(frame, { keyFrame: this.frameCount % 60 === 0 });
    frame.close();
    this.frameCount++;
  }
  async stop() {
    if (!this.encoder) return new Blob();
    await this.encoder.flush();
    this.encoder.close();
    this.encoder = null;
    return new Blob(this.chunks, { type: "video/webm" });
  }
};
var WebMEncoder = class {
  constructor(canvas) {
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.canvas = canvas;
  }
  /**
   * Start recording
   */
  async start(fps, bitrate = 5e6) {
    this.chunks = [];
    this.stream = this.canvas.captureStream(fps);
    const mimeTypes = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    let mimeType = "";
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    if (!mimeType) {
      throw new Error("No supported WebM codec found");
    }
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: bitrate
    });
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("Failed to create MediaRecorder"));
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
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not started"));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "video/webm" });
        resolve(blob);
      };
      this.mediaRecorder.stop();
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
    });
  }
  /**
   * Check if recording
   */
  isRecording() {
    return this.mediaRecorder?.state === "recording";
  }
};
var FrameSequenceEncoder = class {
  constructor() {
    this.frames = [];
    this.delays = [];
  }
  /**
   * Add a frame
   */
  addFrame(imageData, delay) {
    this.frames.push(imageData);
    this.delays.push(delay);
  }
  /**
   * Get all frames
   */
  getFrames() {
    return this.frames;
  }
  /**
   * Clear frames
   */
  clear() {
    this.frames = [];
    this.delays = [];
  }
  /**
   * Get frame count
   */
  getFrameCount() {
    return this.frames.length;
  }
};
var VideoExportManager = class {
  constructor() {
    this.renderer = null;
    this.encoder = null;
    this.isRendering = false;
    this.abortController = null;
  }
  /**
   * Export video by driving frames manually (frame-by-frame)
   * This is much more robust than real-time recording
   */
  async exportVideo(setFrame, element, options) {
    const startTime = Date.now();
    const { config, onProgress, signal } = options;
    const useWebCodecs = typeof VideoEncoder !== "undefined";
    try {
      this.isRendering = true;
      this.abortController = new AbortController();
      const mergedSignal = this.mergeSignals(signal, this.abortController.signal);
      this.renderer = new CanvasRenderer(config);
      const canvas = this.renderer.getCanvas();
      const bitrate = options.rendererConfig?.bitrate ?? 5e6;
      let webCodecsEncoder = null;
      if (useWebCodecs) {
        webCodecsEncoder = new WebCodecsEncoder(config);
        await webCodecsEncoder.start(config.fps, bitrate);
      } else {
        this.encoder = new WebMEncoder(canvas);
        await this.encoder.start(config.fps, bitrate);
      }
      for (let frame = 0; frame < config.durationInFrames; frame++) {
        if (mergedSignal.aborted) throw new Error("Render aborted");
        setFrame(frame);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 20));
        await this.renderer.captureFrame(element);
        if (useWebCodecs && webCodecsEncoder) {
          await webCodecsEncoder.addFrame(canvas);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1e3 / config.fps));
        }
        if (onProgress) {
          onProgress(calculateProgress(frame, config.durationInFrames, startTime));
        }
      }
      const blob = useWebCodecs && webCodecsEncoder ? await webCodecsEncoder.stop() : await this.encoder.stop();
      const url = URL.createObjectURL(blob);
      return {
        success: true,
        blob,
        url,
        frameCount: config.durationInFrames,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        frameCount: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      this.isRendering = false;
      this.encoder = null;
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
    }
  }
  /**
   * Export video from frames (LEGACY/REAL-TIME)
   */
  async exportFromCanvas(canvas, options) {
    const startTime = Date.now();
    const { config, signal } = options;
    try {
      this.isRendering = true;
      this.abortController = new AbortController();
      const mergedSignal = this.mergeSignals(signal, this.abortController.signal);
      this.encoder = new WebMEncoder(canvas);
      const bitrate = options.rendererConfig?.bitrate ?? 5e6;
      await this.encoder.start(config.fps, bitrate);
      const durationMs = config.durationInFrames / config.fps * 1e3;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, durationMs + 500);
        const checkAbort = () => {
          if (mergedSignal.aborted) {
            clearTimeout(timeout);
            reject(new Error("Render aborted"));
          } else if (this.isRendering) {
            requestAnimationFrame(checkAbort);
          }
        };
        checkAbort();
      });
      const blob = await this.encoder.stop();
      const url = URL.createObjectURL(blob);
      return {
        success: true,
        blob,
        url,
        frameCount: config.durationInFrames,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        frameCount: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      this.isRendering = false;
      this.encoder = null;
    }
  }
  /**
   * Export frame sequence as images
   */
  async exportFrames(frames, format = "png") {
    const canvasRenderer = new CanvasRenderer({
      width: frames[0]?.width ?? 1920,
      height: frames[0]?.height ?? 1080,
      fps: 30,
      durationInFrames: frames.length
    });
    const blobs = [];
    const mimeType = `image/${format === "jpeg" ? "jpeg" : format}`;
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
  async createFrameZip(frames, compositionId) {
    if (frames.length === 0) {
      throw new Error("No frames to zip");
    }
    const canvasRenderer = new CanvasRenderer({
      width: frames[0].width,
      height: frames[0].height,
      fps: 30,
      durationInFrames: frames.length
    });
    const blobs = await this.exportFrames(frames, "png");
    canvasRenderer.dispose();
    return blobs[0];
  }
  /**
   * Abort current render
   */
  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isRendering = false;
    this.encoder = null;
  }
  /**
   * Check if currently rendering
   */
  getIsRendering() {
    return this.isRendering;
  }
  /**
   * Merge multiple abort signals
   */
  mergeSignals(...signals) {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal) {
        if (signal.aborted) {
          controller.abort();
          break;
        }
        signal.addEventListener("abort", () => controller.abort());
      }
    }
    return controller.signal;
  }
};
function calculateProgress(frame, totalFrames, startTime) {
  const elapsedMs = Date.now() - startTime;
  const percentage = frame / totalFrames * 100;
  const framesPerSecond = frame > 0 ? frame / elapsedMs * 1e3 : 0;
  const estimatedRemainingMs = framesPerSecond > 0 ? (totalFrames - frame) / framesPerSecond * 1e3 : 0;
  return {
    frame,
    totalFrames,
    percentage,
    elapsedMs,
    estimatedRemainingMs,
    framesPerSecond
  };
}
function estimateFileSize(config, bitrate = 5e6) {
  const durationSeconds = config.durationInFrames / config.fps;
  return Math.ceil(bitrate * durationSeconds / 8);
}
function checkEncodingSupport() {
  const webm = MediaRecorder.isTypeSupported("video/webm");
  const mp4 = MediaRecorder.isTypeSupported("video/mp4");
  const codecs = [];
  const testCodecs = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/mp4;codecs=h264",
    "video/mp4;codecs=avc1"
  ];
  for (const codec of testCodecs) {
    if (MediaRecorder.isTypeSupported(codec)) {
      codecs.push(codec);
    }
  }
  return { webm, mp4, codecs };
}
var videoExportManager = new VideoExportManager();
var export_default = VideoExportManager;

export {
  CanvasRenderer,
  WebCodecsEncoder,
  WebMEncoder,
  FrameSequenceEncoder,
  VideoExportManager,
  calculateProgress,
  estimateFileSize,
  checkEncodingSupport,
  videoExportManager,
  export_default
};
