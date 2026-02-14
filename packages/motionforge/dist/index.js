import React3, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/renderer/export.ts
var export_exports = {};
__export(export_exports, {
  CanvasRenderer: () => CanvasRenderer,
  FrameSequenceEncoder: () => FrameSequenceEncoder,
  VideoExportManager: () => VideoExportManager,
  WebCodecsEncoder: () => WebCodecsEncoder,
  WebMEncoder: () => WebMEncoder,
  calculateProgress: () => calculateProgress,
  checkEncodingSupport: () => checkEncodingSupport,
  default: () => export_default,
  estimateFileSize: () => estimateFileSize,
  videoExportManager: () => videoExportManager
});
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
var CanvasRenderer, WebCodecsEncoder, WebMEncoder, FrameSequenceEncoder, VideoExportManager, videoExportManager, export_default;
var init_export = __esm({
  "src/renderer/export.ts"() {
    CanvasRenderer = class {
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
    WebCodecsEncoder = class {
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
    WebMEncoder = class {
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
    FrameSequenceEncoder = class {
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
    VideoExportManager = class {
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
    videoExportManager = new VideoExportManager();
    export_default = VideoExportManager;
  }
});
var FrameContext = createContext(null);
var useCurrentFrame = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error("useCurrentFrame must be used within a FrameContext.Provider");
  }
  return context.frame;
};
var useVideoConfig = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error("useVideoConfig must be used within a FrameContext.Provider");
  }
  return {
    fps: context.fps,
    durationInFrames: context.durationInFrames,
    width: context.width,
    height: context.height
  };
};
var useTimelineState = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error("useTimelineState must be used within a FrameContext.Provider");
  }
  return {
    frame: context.frame,
    playing: context.playing,
    playbackRate: context.playbackRate,
    setFrame: context.setFrame,
    setPlaying: context.setPlaying,
    setPlaybackRate: context.setPlaybackRate
  };
};
var CompositionManagerContext = createContext(null);
var PlayerContext = createContext(null);
var FrameProvider = ({
  fps = 30,
  durationInFrames,
  width,
  height,
  children,
  initialFrame = 0
}) => {
  const [frame, setFrameState] = useState(initialFrame);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameRef = useRef(initialFrame);
  const setFrame = useCallback((newFrame) => {
    const clampedFrame = Math.max(0, Math.min(newFrame, durationInFrames - 1));
    setFrameState(clampedFrame);
    frameRef.current = clampedFrame;
  }, [durationInFrames]);
  useEffect(() => {
    if (playing) {
      const frameDuration = 1e3 / (fps * playbackRate);
      const animate = (currentTime) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          frameRef.current += 1;
          if (frameRef.current >= durationInFrames) {
            frameRef.current = 0;
            setFrameState(0);
            lastTimeRef.current = currentTime;
          } else {
            setFrameState(frameRef.current);
            lastTimeRef.current = currentTime;
          }
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, fps, playbackRate, durationInFrames]);
  const value = {
    frame,
    fps,
    durationInFrames,
    width,
    height,
    playing,
    playbackRate,
    setFrame,
    setPlaying,
    setPlaybackRate
  };
  return /* @__PURE__ */ jsx(FrameContext.Provider, { value, children });
};
var CompositionManagerProvider = ({ children }) => {
  const [compositions] = useState(() => /* @__PURE__ */ new Map());
  const [currentCompositionId, setCurrentCompositionId] = useState(null);
  const registerComposition = useCallback((composition) => {
    compositions.set(composition.id, composition);
  }, [compositions]);
  const unregisterComposition = useCallback((id) => {
    compositions.delete(id);
  }, [compositions]);
  const setCurrentComposition = useCallback((id) => {
    if (compositions.has(id)) {
      setCurrentCompositionId(id);
    }
  }, [compositions]);
  const currentComposition = currentCompositionId ? compositions.get(currentCompositionId) || null : null;
  return /* @__PURE__ */ jsx(
    CompositionManagerContext.Provider,
    {
      value: {
        compositions,
        currentComposition,
        registerComposition,
        unregisterComposition,
        setCurrentComposition
      },
      children
    }
  );
};
var PlayerProvider = ({
  durationInFrames,
  fps = 30,
  children
}) => {
  const [frame, setFrameState] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameRef = useRef(0);
  const seek = useCallback((targetFrame) => {
    const clampedFrame = Math.max(0, Math.min(targetFrame, durationInFrames - 1));
    frameRef.current = clampedFrame;
    setFrameState(clampedFrame);
  }, [durationInFrames]);
  const play = useCallback(() => setPlayingState(true), []);
  const pause = useCallback(() => setPlayingState(false), []);
  const toggle = useCallback(() => setPlayingState((p) => !p), []);
  const restart = useCallback(() => {
    frameRef.current = 0;
    setFrameState(0);
  }, []);
  useEffect(() => {
    if (playing) {
      const frameDuration = 1e3 / (fps * playbackRate);
      const animate = (currentTime) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          frameRef.current += 1;
          if (frameRef.current >= durationInFrames) {
            frameRef.current = 0;
            setFrameState(0);
          } else {
            setFrameState(frameRef.current);
          }
          lastTimeRef.current = currentTime;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, fps, playbackRate, durationInFrames]);
  return /* @__PURE__ */ jsx(
    PlayerContext.Provider,
    {
      value: {
        frame,
        playing,
        playbackRate,
        durationInFrames,
        fps,
        seek,
        play,
        pause,
        toggle,
        restart,
        frameRef
      },
      children
    }
  );
};
var CompositionContext = createContext(null);
var useComposition = () => {
  const context = useContext(CompositionContext);
  if (!context) {
    throw new Error("useComposition must be used within a Composition");
  }
  return context;
};
var useVideoConfig2 = () => useVideoConfig();
var Composition = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames,
  defaultProps = {}
}) => {
  return /* @__PURE__ */ jsx(
    CompositionContext.Provider,
    {
      value: {
        id,
        config: { width, height, fps, durationInFrames }
      },
      children: /* @__PURE__ */ jsx(
        FrameProvider,
        {
          fps,
          durationInFrames,
          width,
          height,
          children: /* @__PURE__ */ jsx(Component, { ...defaultProps })
        }
      )
    }
  );
};
var PlayerComposition = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames,
  defaultProps = {},
  frame,
  playing = false,
  playbackRate = 1
}) => {
  return /* @__PURE__ */ jsx(
    CompositionContext.Provider,
    {
      value: {
        id,
        config: { width, height, fps, durationInFrames }
      },
      children: /* @__PURE__ */ jsx(
        StaticFrameProvider,
        {
          fps,
          durationInFrames,
          width,
          height,
          frame,
          playing,
          playbackRate,
          children: /* @__PURE__ */ jsx(Component, { ...defaultProps })
        }
      )
    }
  );
};
var StaticFrameProvider = ({
  fps,
  durationInFrames,
  width,
  height,
  frame,
  playing,
  playbackRate,
  children
}) => {
  const value = {
    frame,
    fps,
    durationInFrames,
    width,
    height,
    playing,
    playbackRate,
    setFrame: () => {
    },
    setPlaying: () => {
    },
    setPlaybackRate: () => {
    }
  };
  return /* @__PURE__ */ jsx(FrameContext.Provider, { value, children });
};
var SequenceContext = createContext({
  relativeFrom: 0,
  isActive: true,
  startFrame: 0,
  endFrame: Infinity
});
var useSequence = () => useContext(SequenceContext);
var Sequence = ({
  from,
  durationInFrames,
  offset = 0,
  name,
  children,
  layout = "absolute-fill"
}) => {
  const currentFrame = useCurrentFrame();
  const startFrame = from + offset;
  const endFrame = durationInFrames !== void 0 ? startFrame + durationInFrames : Infinity;
  const relativeFrame = currentFrame - startFrame;
  const isActive = currentFrame >= startFrame && currentFrame < endFrame;
  const contextValue = {
    relativeFrom: startFrame,
    durationInFrames,
    isActive,
    startFrame,
    endFrame
  };
  if (!isActive) {
    return null;
  }
  return /* @__PURE__ */ jsx(SequenceContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-sequence-name": name,
      "data-sequence-from": startFrame,
      "data-sequence-duration": durationInFrames,
      style: {
        position: layout === "absolute-fill" ? "absolute" : "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column"
      },
      children: /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame, children })
    }
  ) });
};
var SequenceFrameProvider = ({
  relativeFrame,
  children
}) => {
  return /* @__PURE__ */ jsx(RelativeFrameContext.Provider, { value: relativeFrame, children });
};
var RelativeFrameContext = createContext(0);
var useRelativeCurrentFrame = () => useContext(RelativeFrameContext);
var Loop = ({
  durationInFrames,
  times = Infinity,
  children,
  name
}) => {
  const currentFrame = useCurrentFrame();
  const totalFrames = times === Infinity ? durationInFrames : durationInFrames * times;
  const loopedFrame = currentFrame % durationInFrames;
  const currentLoop = Math.floor(currentFrame / durationInFrames);
  if (times !== Infinity && currentFrame >= totalFrames) {
    return null;
  }
  return /* @__PURE__ */ jsx(LoopContext.Provider, { value: { loopedFrame, currentLoop, durationInFrames }, children: /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame: loopedFrame, children }) });
};
var LoopContext = createContext({
  loopedFrame: 0,
  currentLoop: 0,
  durationInFrames: 0
});
var Freeze = ({
  frame: freezeFrame,
  durationInFrames,
  children
}) => {
  const currentFrame = useCurrentFrame();
  const displayFrame = currentFrame < durationInFrames ? freezeFrame : currentFrame - durationInFrames + freezeFrame;
  return /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame: displayFrame, children });
};
var Retiming = ({
  children,
  playbackRate,
  name
}) => {
  const currentFrame = useCurrentFrame();
  const rate = typeof playbackRate === "function" ? playbackRate(currentFrame) : playbackRate;
  const retimedFrame = Math.floor(currentFrame * rate);
  return /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame: retimedFrame, children });
};
var Reverse = ({
  children,
  durationInFrames
}) => {
  const currentFrame = useCurrentFrame();
  const reversedFrame = durationInFrames - 1 - currentFrame % durationInFrames;
  return /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame: reversedFrame, children });
};
var Series = ({ children }) => {
  const currentFrame = useCurrentFrame();
  let accumulatedFrames = 0;
  let activeChildIndex = -1;
  let relativeFrame = currentFrame;
  const childArray = React3.Children.toArray(children);
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (React3.isValidElement(child) && child.props.durationInFrames) {
      const childDuration = child.props.durationInFrames;
      if (currentFrame >= accumulatedFrames && currentFrame < accumulatedFrames + childDuration) {
        activeChildIndex = i;
        relativeFrame = currentFrame - accumulatedFrames;
        break;
      }
      accumulatedFrames += childDuration;
    }
  }
  if (activeChildIndex === -1) {
    return null;
  }
  const activeChild = childArray[activeChildIndex];
  return /* @__PURE__ */ jsx(SequenceFrameProvider, { relativeFrame, children: activeChild });
};
var AbsoluteFill = ({
  children,
  style,
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...style
      },
      children
    }
  );
};
var Video = ({
  src,
  startFrom = 0,
  endAt,
  volume = 1,
  playbackRate = 1,
  muted = true,
  style,
  pauseOnFrame = true,
  ...props
}) => {
  const videoRef = useRef(null);
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (videoRef.current && loaded) {
      const time = (startFrom + currentFrame) / fps;
      if (Math.abs(videoRef.current.currentTime - time) > 0.05) {
        videoRef.current.currentTime = time;
      }
    }
  }, [currentFrame, fps, startFrom, loaded]);
  useEffect(() => {
    if (videoRef.current) {
      const vol = typeof volume === "function" ? volume(currentFrame) : volume;
      videoRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, [currentFrame, volume]);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  const handleLoadedData = () => {
    setLoaded(true);
    if (props.onLoadedData) {
      props.onLoadedData({});
    }
  };
  return /* @__PURE__ */ jsx(
    "video",
    {
      ref: videoRef,
      src,
      muted,
      playsInline: true,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style
      },
      onLoadedData: handleLoadedData,
      ...props
    }
  );
};
var Audio = ({
  src,
  startFrom = 0,
  endAt,
  volume = 1,
  playbackRate = 1,
  muted = false,
  ...props
}) => {
  const audioRef = useRef(null);
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (audioRef.current && loaded) {
      const time = (startFrom + currentFrame) / fps;
      if (Math.abs(audioRef.current.currentTime - time) > 0.05) {
        audioRef.current.currentTime = time;
      }
    }
  }, [currentFrame, fps, startFrom, loaded]);
  useEffect(() => {
    if (audioRef.current) {
      const vol = typeof volume === "function" ? volume(currentFrame) : volume;
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, [currentFrame, volume]);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  const handleLoadedData = () => {
    setLoaded(true);
    if (props.onLoadedData) {
      props.onLoadedData({});
    }
  };
  return /* @__PURE__ */ jsx(
    "audio",
    {
      ref: audioRef,
      src,
      muted,
      onLoadedData: handleLoadedData,
      ...props
    }
  );
};
var Img = ({
  src,
  style,
  startFrom,
  endAt,
  ...props
}) => {
  const currentFrame = useCurrentFrame();
  if (startFrom !== void 0 && currentFrame < startFrom) {
    return null;
  }
  if (endAt !== void 0 && currentFrame > endAt) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style
      },
      ...props
    }
  );
};
var staticFile = (path) => {
  return `/static/${path}`;
};
var Text = ({
  children,
  style,
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className,
      style: {
        display: "inline-block",
        ...style
      },
      children
    }
  );
};
var SVG = ({
  width = "100%",
  height = "100%",
  viewBox = "0 0 100 100",
  children,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width,
      height,
      viewBox,
      style: {
        overflow: "visible",
        ...style
      },
      children
    }
  );
};
var Rect = ({
  width,
  height,
  x = 0,
  y = 0,
  rx = 0,
  ry = 0,
  fill = "black",
  stroke,
  strokeWidth,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "rect",
    {
      x,
      y,
      width,
      height,
      rx,
      ry,
      fill,
      stroke,
      strokeWidth,
      style
    }
  );
};
var Circle = ({
  r,
  cx = 0,
  cy = 0,
  fill = "black",
  stroke,
  strokeWidth,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "circle",
    {
      cx,
      cy,
      r,
      fill,
      stroke,
      strokeWidth,
      style
    }
  );
};
var Path = ({
  d,
  fill = "black",
  stroke,
  strokeWidth,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "path",
    {
      d,
      fill,
      stroke,
      strokeWidth,
      style
    }
  );
};
var G = ({
  children,
  transform,
  style
}) => {
  return /* @__PURE__ */ jsx("g", { transform, style, children });
};

// src/utils/animation.ts
var Easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - --t * t),
  easeInOutCirc: (t) => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t) => {
    const c4 = 2 * Math.PI / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    const c4 = 2 * Math.PI / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    const c5 = 2 * Math.PI / 4.5;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    return Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5) / 2 + 1;
  },
  easeInBounce: (t) => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t) => t < 0.5 ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2 : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
  // Bezier curve easing
  bezier: (x1, y1, x2, y2) => {
    const epsilon = 1e-6;
    const sampleCurveX = (t) => 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
    const sampleCurveY = (t) => 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
    const solveCurveX = (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const xEst = sampleCurveX(t) - x;
        if (Math.abs(xEst) < epsilon) return t;
        const d = 3 * x1 * (1 - t) * (1 - t) + 6 * x2 * t * (1 - t) + 3 * t * t;
        if (Math.abs(d) < epsilon) break;
        t -= xEst / d;
      }
      return t;
    };
    return (t) => sampleCurveY(solveCurveX(t));
  }
};
var spring = ({
  frame,
  fps,
  config = {},
  from = 0,
  to = 1,
  durationInFrames,
  durationRestThreshold = 5e-3
}) => {
  const {
    damping = 10,
    mass = 1,
    stiffness = 100,
    overshootClamping = false
  } = config;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const actualDuration = durationInFrames ?? Math.ceil(fps * 2);
  const t = Math.min(frame / actualDuration, 1);
  const time = t * actualDuration / fps;
  let value;
  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value = 1 - Math.exp(-zeta * omega * time) * (Math.cos(omegaD * time) + zeta * omega / omegaD * Math.sin(omegaD * time));
  } else if (zeta === 1) {
    value = 1 - (1 + omega * time) * Math.exp(-omega * time);
  } else {
    const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const c2 = (1 - r1 / (r1 - r2)) / (r1 - r2);
    const c1 = 1 / (r1 - r2) - c2;
    value = 1 - c1 * Math.exp(r1 * time) - c2 * Math.exp(r2 * time);
  }
  if (overshootClamping) {
    value = Math.max(0, Math.min(1, value));
  }
  return from + (to - from) * value;
};
var interpolate = (input, inputRange, outputRange, options = {}) => {
  const {
    extrapolateLeft = "clamp",
    extrapolateRight = "clamp",
    easing
  } = options;
  if (inputRange.length !== outputRange.length) {
    throw new Error("inputRange and outputRange must have the same length");
  }
  if (inputRange.length < 2) {
    throw new Error("inputRange must have at least 2 elements");
  }
  if (input < inputRange[0]) {
    if (extrapolateLeft === "clamp") {
      return outputRange[0];
    } else if (extrapolateLeft === "identity") {
      return input;
    }
  }
  if (input > inputRange[inputRange.length - 1]) {
    if (extrapolateRight === "clamp") {
      return outputRange[outputRange.length - 1];
    } else if (extrapolateRight === "identity") {
      return input;
    }
  }
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (input <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }
  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const outputStart = outputRange[segmentIndex];
  const outputEnd = outputRange[segmentIndex + 1];
  let progress = (input - inputStart) / (inputEnd - inputStart);
  if (easing) {
    progress = easing(progress);
  }
  return outputStart + progress * (outputEnd - outputStart);
};
var interpolateColors = (input, inputRange, outputRange) => {
  const parseColor = (color) => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
          255
        ];
      }
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255
      ];
    }
    if (color.startsWith("rgb")) {
      const match = color.match(/\d+/g);
      if (match) {
        return [
          parseInt(match[0]),
          parseInt(match[1]),
          parseInt(match[2]),
          match[3] ? parseInt(match[3]) : 255
        ];
      }
    }
    return [0, 0, 0, 255];
  };
  const rgbToHex = (r2, g2, b2) => {
    return "#" + [r2, g2, b2].map((x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (input <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }
  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const colorStart = parseColor(outputRange[segmentIndex]);
  const colorEnd = parseColor(outputRange[segmentIndex + 1]);
  const progress = (input - inputStart) / (inputEnd - inputStart);
  const r = colorStart[0] + progress * (colorEnd[0] - colorStart[0]);
  const g = colorStart[1] + progress * (colorEnd[1] - colorStart[1]);
  const b = colorStart[2] + progress * (colorEnd[2] - colorStart[2]);
  return rgbToHex(r, g, b);
};
var useKeyframes = (keyframes, frame) => {
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }
  if (frame <= prev.frame) return prev.value;
  if (frame >= next.frame) return next.value;
  let progress = (frame - prev.frame) / (next.frame - prev.frame);
  if (next.easing) {
    progress = next.easing(progress);
  } else if (prev.easing) {
    progress = prev.easing(progress);
  }
  if (typeof prev.value === "number" && typeof next.value === "number") {
    return prev.value + progress * (next.value - prev.value);
  }
  return progress < 0.5 ? prev.value : next.value;
};
var measureSpring = ({
  fps,
  config = {},
  threshold = 5e-3
}) => {
  const { damping = 10, mass = 1, stiffness = 100 } = config;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  let time = 0;
  const dt = 1 / fps;
  const maxTime = 10;
  while (time < maxTime) {
    let value;
    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      value = 1 - Math.exp(-zeta * omega * time) * (Math.cos(omegaD * time) + zeta * omega / omegaD * Math.sin(omegaD * time));
    } else if (zeta === 1) {
      value = 1 - (1 + omega * time) * Math.exp(-omega * time);
    } else {
      const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
      const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
      const c2 = (1 - r1 / (r1 - r2)) / (r1 - r2);
      const c1 = 1 / (r1 - r2) - c2;
      value = 1 - c1 * Math.exp(r1 * time) - c2 * Math.exp(r2 * time);
    }
    if (Math.abs(value - 1) < threshold) {
      return Math.ceil(time * fps);
    }
    time += dt;
  }
  return Math.ceil(maxTime * fps);
};
var getFramesFromSeconds = (seconds, fps) => {
  return Math.round(seconds * fps);
};
var getSecondsFromFrames = (frames, fps) => {
  return frames / fps;
};
var range = (start, end, step = 1) => {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};
var random = (seed, min = 0, max = 1) => {
  const str = typeof seed === "number" ? seed.toString() : seed;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const normalized = Math.abs(hash) % 1e4 / 1e4;
  return min + normalized * (max - min);
};
var noise2D = (x, y) => {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = x * x * (3 - 2 * x);
  const v = y * y * (3 - 2 * y);
  const A = (X + Y * 256) % 256;
  const B = (X + 1 + Y * 256) % 256;
  const C = (X + (Y + 1) * 256) % 256;
  const D = (X + 1 + (Y + 1) * 256) % 256;
  const a = Math.sin(A * 12.9898 + 78.233) * 43758.5453 % 1;
  const b = Math.sin(B * 12.9898 + 78.233) * 43758.5453 % 1;
  const c = Math.sin(C * 12.9898 + 78.233) * 43758.5453 % 1;
  const d = Math.sin(D * 12.9898 + 78.233) * 43758.5453 % 1;
  return a + u * (b - a + v * (d - b - (d - c))) + v * (c - a);
};
var Fade = ({
  children,
  durationInFrames = 30,
  startFrame = 0,
  style
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ jsx("div", { style: { opacity, ...style }, children });
};
var Scale = ({
  children,
  from = 0,
  to = 1,
  durationInFrames = 30,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }
  );
  const scale2 = from + (to - from) * progress;
  return /* @__PURE__ */ jsx("div", { style: { transform: `scale(${scale2})`, ...style }, children });
};
var Slide = ({
  children,
  direction,
  distance = 100,
  durationInFrames = 30,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }
  );
  let transform = "";
  const offset = distance * (1 - progress);
  switch (direction) {
    case "left":
      transform = `translateX(${-offset}px)`;
      break;
    case "right":
      transform = `translateX(${offset}px)`;
      break;
    case "up":
      transform = `translateY(${-offset}px)`;
      break;
    case "down":
      transform = `translateY(${offset}px)`;
      break;
  }
  return /* @__PURE__ */ jsx("div", { style: { transform, ...style }, children });
};
var Rotate = ({
  children,
  degrees = 360,
  durationInFrames = 60,
  startFrame = 0,
  easing = Easing.linear,
  style
}) => {
  const frame = useCurrentFrame();
  const rotation = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, degrees],
    { extrapolateLeft: "clamp", extrapolateRight: "extend", easing }
  );
  return /* @__PURE__ */ jsx("div", { style: { transform: `rotate(${rotation}deg)`, ...style }, children });
};
var Typewriter = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  style,
  cursor = true,
  cursorChar = "|"
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, text.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const displayText = text.slice(0, Math.floor(progress));
  const showCursor = cursor && frame % 30 < 15;
  return /* @__PURE__ */ jsxs("span", { style, children: [
    displayText,
    showCursor && cursorChar
  ] });
};
var Counter = ({
  from = 0,
  to,
  durationInFrames = 60,
  startFrame = 0,
  easing = Easing.easeOutCubic,
  style,
  format = (v) => Math.round(v).toLocaleString()
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }
  );
  return /* @__PURE__ */ jsx("span", { style, children: format(value) });
};
var ProgressBar = ({
  progress,
  width = 200,
  height = 10,
  backgroundColor = "#333",
  fillColor = "#3b82f6",
  borderRadius = 5,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        width,
        height,
        backgroundColor,
        borderRadius,
        overflow: "hidden",
        ...style
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: fillColor,
            transition: "width 0.1s ease"
          }
        }
      )
    }
  );
};
var Glitch = ({
  children,
  intensity = 10,
  style
}) => {
  const frame = useCurrentFrame();
  const shouldGlitch = frame % 10 < 3;
  const offset = shouldGlitch ? Math.random() * intensity : 0;
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", ...style }, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: offset,
          opacity: shouldGlitch ? 0.8 : 0,
          color: "red",
          mixBlendMode: "screen"
        },
        children
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: -offset,
          opacity: shouldGlitch ? 0.8 : 0,
          color: "cyan",
          mixBlendMode: "screen"
        },
        children
      }
    ),
    /* @__PURE__ */ jsx("div", { style: { position: "relative" }, children })
  ] });
};
var Trail = ({
  children,
  trailLength = 5,
  opacityDecay = 0.2,
  style
}) => {
  const frame = useCurrentFrame();
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", ...style }, children: [
    Array.from({ length: trailLength }, (_, i) => {
      const trailFrame = frame - i * 2;
      if (trailFrame < 0) return null;
      return /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 1 - i * opacityDecay,
            pointerEvents: "none"
          },
          children
        },
        i
      );
    }),
    /* @__PURE__ */ jsx("div", { style: { position: "relative" }, children })
  ] });
};
var ShakeEffect = ({
  children,
  intensity = 5,
  active = true,
  style
}) => {
  const frame = useCurrentFrame();
  if (!active) {
    return /* @__PURE__ */ jsx("div", { style, children });
  }
  const x = Math.sin(frame * 0.8) * intensity;
  const y = Math.cos(frame * 1.2) * intensity;
  return /* @__PURE__ */ jsx("div", { style: { transform: `translate(${x}px, ${y}px)`, ...style }, children });
};
var Highlight = ({
  children,
  color = "#ffeb3b",
  progress = 1,
  style
}) => {
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        background: `linear-gradient(90deg, ${color} ${progress * 100}%, transparent ${progress * 100}%)`,
        ...style
      },
      children
    }
  );
};
var MaskReveal = ({
  children,
  direction,
  progress,
  style
}) => {
  let clipPath = "";
  switch (direction) {
    case "left":
      clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
      break;
    case "right":
      clipPath = `inset(0 0 0 ${(1 - progress) * 100}%)`;
      break;
    case "up":
      clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
      break;
    case "down":
      clipPath = `inset(${(1 - progress) * 100}% 0 0 0)`;
      break;
  }
  return /* @__PURE__ */ jsx("div", { style: { clipPath, ...style }, children });
};
var NeonGlow = ({
  children,
  color = "#00ff00",
  intensity = 1,
  style
}) => {
  const frame = useCurrentFrame();
  const pulseIntensity = 0.8 + Math.sin(frame * 0.1) * 0.2;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        textShadow: `
          0 0 ${5 * intensity}px ${color},
          0 0 ${10 * intensity}px ${color},
          0 0 ${20 * intensity}px ${color},
          0 0 ${40 * intensity}px ${color}
        `,
        opacity: pulseIntensity,
        ...style
      },
      children
    }
  );
};
var Rotate3D = ({
  children,
  rotateX = 0,
  rotateY = 360,
  rotateZ = 0,
  durationInFrames = 60,
  startFrame = 0,
  perspective = 1e3,
  easing = Easing.easeInOutCubic,
  style
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }
  );
  const rx = rotateX * progress;
  const ry = rotateY * progress;
  const rz = rotateZ * progress;
  return /* @__PURE__ */ jsx("div", { style: { perspective, ...style }, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        transformStyle: "preserve-3d"
      },
      children
    }
  ) });
};
var Flip3D = ({
  children,
  front,
  back,
  durationInFrames = 60,
  startFrame = 0,
  direction = "horizontal",
  perspective = 1e3,
  style
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 180],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.easeInOutCubic }
  );
  const rotateAxis = direction === "horizontal" ? "rotateY" : "rotateX";
  return /* @__PURE__ */ jsx("div", { style: { perspective, ...style }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "relative",
        transformStyle: "preserve-3d",
        transform: `${rotateAxis}(${progress}deg)`,
        width: "100%",
        height: "100%"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden"
            },
            children: front
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              transform: `${rotateAxis}(180deg)`
            },
            children: back
          }
        )
      ]
    }
  ) });
};
var Perspective3D = ({
  children,
  rotateX = 20,
  rotateY = 20,
  perspective = 800,
  durationInFrames = 60,
  startFrame = 0,
  style
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.easeOutCubic }
  );
  return /* @__PURE__ */ jsx("div", { style: { perspective, ...style }, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        transform: `rotateX(${rotateX * progress}deg) rotateY(${rotateY * progress}deg)`,
        transformStyle: "preserve-3d"
      },
      children
    }
  ) });
};
var Cube3D = ({
  size = 100,
  durationInFrames = 120,
  colors = {
    front: "#10b981",
    back: "#059669",
    left: "#047857",
    right: "#065f46",
    top: "#34d399",
    bottom: "#6ee7b7"
  },
  style
}) => {
  const frame = useCurrentFrame();
  const rotateY = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "extend"
  });
  const rotateX = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "extend"
  });
  const halfSize = size / 2;
  const faceStyle = {
    position: "absolute",
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.3,
    fontWeight: "bold",
    color: "white",
    backfaceVisibility: "visible",
    border: "2px solid rgba(255,255,255,0.3)"
  };
  return /* @__PURE__ */ jsx("div", { style: { perspective: 600, ...style }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        width: size,
        height: size,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      },
      children: [
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.front, transform: `translateZ(${halfSize}px)` }, children: "Front" }),
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.back, transform: `rotateY(180deg) translateZ(${halfSize}px)` }, children: "Back" }),
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.left, transform: `rotateY(-90deg) translateZ(${halfSize}px)` }, children: "Left" }),
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.right, transform: `rotateY(90deg) translateZ(${halfSize}px)` }, children: "Right" }),
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.top, transform: `rotateX(90deg) translateZ(${halfSize}px)` }, children: "Top" }),
        /* @__PURE__ */ jsx("div", { style: { ...faceStyle, backgroundColor: colors.bottom, transform: `rotateX(-90deg) translateZ(${halfSize}px)` }, children: "Bottom" })
      ]
    }
  ) });
};
var ParticleSystem = ({
  count = 50,
  colors = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857"],
  minSize = 3,
  maxSize = 15,
  speed = 2,
  direction = "random",
  fadeOut = true,
  particleShape = "circle",
  style
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const particles = React3.useMemo(() => {
    const seed = (n) => {
      const x = Math.sin(n * 9999) * 1e4;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => {
      const rand = seed(i);
      const rand2 = seed(i + 1e3);
      const rand3 = seed(i + 2e3);
      const rand4 = seed(i + 3e3);
      const rand5 = seed(i + 4e3);
      let vx = 0;
      let vy = 0;
      switch (direction) {
        case "up":
          vx = (rand2 - 0.5) * speed;
          vy = -rand3 * speed * 2 - speed;
          break;
        case "down":
          vx = (rand2 - 0.5) * speed;
          vy = rand3 * speed * 2 + speed;
          break;
        case "left":
          vx = -rand2 * speed * 2 - speed;
          vy = (rand3 - 0.5) * speed;
          break;
        case "right":
          vx = rand2 * speed * 2 + speed;
          vy = (rand3 - 0.5) * speed;
          break;
        case "explode":
          const angle = rand2 * Math.PI * 2;
          const mag = rand3 * speed * 3 + speed;
          vx = Math.cos(angle) * mag;
          vy = Math.sin(angle) * mag;
          break;
        default:
          vx = (rand2 - 0.5) * speed * 2;
          vy = (rand3 - 0.5) * speed * 2;
      }
      return {
        x: rand * width,
        y: rand2 * height,
        size: minSize + rand3 * (maxSize - minSize),
        speedX: vx,
        speedY: vy,
        color: colors[Math.floor(rand4 * colors.length)],
        opacity: 0.5 + rand5 * 0.5,
        rotation: rand4 * 360,
        rotationSpeed: (rand5 - 0.5) * 10
      };
    });
  }, [count, colors, minSize, maxSize, speed, direction, width, height]);
  const renderParticle = (p, index) => {
    const x = (p.x + p.speedX * frame) % width;
    const y = (p.y + p.speedY * frame) % height;
    const adjustedX = x < 0 ? x + width : x;
    const adjustedY = y < 0 ? y + height : y;
    const opacity = fadeOut ? p.opacity * (1 - Math.abs(frame % 120 - 60) / 60) : p.opacity;
    const rotation = p.rotation + p.rotationSpeed * frame;
    const shapeStyle = {
      position: "absolute",
      left: adjustedX,
      top: adjustedY,
      width: p.size,
      height: p.size,
      backgroundColor: particleShape === "circle" ? p.color : void 0,
      borderRadius: particleShape === "circle" ? "50%" : particleShape === "triangle" ? 0 : 2,
      opacity: Math.max(0.1, Math.min(1, opacity)),
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      boxShadow: `0 0 ${p.size}px ${p.color}`
    };
    if (particleShape === "star") {
      return /* @__PURE__ */ jsx("div", { style: { ...shapeStyle, backgroundColor: "transparent" }, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", width: p.size, height: p.size, fill: p.color, children: /* @__PURE__ */ jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }) }, index);
    }
    if (particleShape === "triangle") {
      return /* @__PURE__ */ jsx("div", { style: { ...shapeStyle, backgroundColor: "transparent" }, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", width: p.size, height: p.size, fill: p.color, children: /* @__PURE__ */ jsx("path", { d: "M12 2L2 22h20L12 2z" }) }) }, index);
    }
    return /* @__PURE__ */ jsx("div", { style: shapeStyle }, index);
  };
  return /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, overflow: "hidden", ...style }, children: particles.map(renderParticle) });
};
var LetterByLetter = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  delayPerLetter = 2,
  animation = "fade",
  easing = Easing.easeOutCubic,
  style,
  letterStyle
}) => {
  const frame = useCurrentFrame();
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", ...style }, children: text.split("").map((char, index) => {
    const letterStart = startFrame + index * delayPerLetter;
    const progress = interpolate(
      frame,
      [letterStart, letterStart + durationInFrames / text.length],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing }
    );
    let transform = "";
    let opacity = progress;
    switch (animation) {
      case "scale":
        transform = `scale(${progress})`;
        break;
      case "slide":
        transform = `translateY(${(1 - progress) * 30}px)`;
        break;
      case "rotate":
        transform = `rotate(${(1 - progress) * 90}deg)`;
        break;
      case "bounce":
        const bounce2 = progress < 0.5 ? progress * 2 : 2 - progress * 2;
        transform = `scale(${0.5 + bounce2 * 0.5})`;
        break;
    }
    return /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          display: "inline-block",
          opacity,
          transform,
          ...letterStyle
        },
        children: char === " " ? "\xA0" : char
      },
      index
    );
  }) });
};
var WordByWord = ({
  text,
  durationInFrames = 60,
  startFrame = 0,
  delayPerWord = 10,
  animation = "fade",
  style,
  wordStyle
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.3em", ...style }, children: words.map((word, index) => {
    const wordStart = startFrame + index * delayPerWord;
    const progress = interpolate(
      frame,
      [wordStart, wordStart + 15],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.easeOutBack }
    );
    let transform = "";
    switch (animation) {
      case "scale":
        transform = `scale(${progress})`;
        break;
      case "slide":
        transform = `translateY(${(1 - progress) * 20}px)`;
        break;
      case "pop":
        const popScale = 1 + (1 - progress) * 0.3;
        transform = `scale(${progress < 0.5 ? progress * 2 * popScale : popScale - (progress - 0.5) * 2 * (popScale - 1)})`;
        break;
    }
    return /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          display: "inline-block",
          opacity: progress,
          transform,
          ...wordStyle
        },
        children: word
      },
      index
    );
  }) });
};
var WaveText = ({
  text,
  amplitude = 10,
  frequency = 0.3,
  speed = 0.15,
  style,
  letterStyle
}) => {
  const frame = useCurrentFrame();
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", alignItems: "center", ...style }, children: text.split("").map((char, index) => {
    const offset = Math.sin(frame * speed + index * frequency) * amplitude;
    return /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          display: "inline-block",
          transform: `translateY(${offset}px)`,
          ...letterStyle
        },
        children: char === " " ? "\xA0" : char
      },
      index
    );
  }) });
};
var RainbowText = ({
  text,
  speed = 5,
  saturation = 70,
  lightness = 60,
  style,
  letterStyle
}) => {
  const frame = useCurrentFrame();
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", ...style }, children: text.split("").map((char, index) => {
    const hue = (frame * speed + index * 20) % 360;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    return /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          display: "inline-block",
          color,
          ...letterStyle
        },
        children: char === " " ? "\xA0" : char
      },
      index
    );
  }) });
};
var GradientText = ({
  text,
  colors = ["#10b981", "#34d399", "#6ee7b7", "#14b8a6", "#10b981"],
  speed = 2,
  angle = 90,
  style
}) => {
  const frame = useCurrentFrame();
  const offset = frame * speed % 100;
  const gradientStops = colors.map((color, i) => {
    const position = (i * 100 / (colors.length - 1) + offset) % 100;
    return `${color} ${position}%`;
  }).join(", ");
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        background: `linear-gradient(${angle}deg, ${gradientStops})`,
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style
      },
      children: text
    }
  );
};
var Blur = ({
  children,
  from = 20,
  to = 0,
  durationInFrames = 30,
  startFrame = 0,
  style
}) => {
  const frame = useCurrentFrame();
  const blur2 = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ jsx("div", { style: { filter: `blur(${blur2}px)`, ...style }, children });
};
var Bounce = ({
  children,
  height = 50,
  durationInFrames = 60,
  startFrame = 0,
  times = 3,
  damping = 0.7,
  style
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const bounceCount = times;
  const t = progress * bounceCount * Math.PI;
  const amplitude = height * Math.pow(damping, progress * bounceCount);
  const y = Math.abs(Math.sin(t)) * amplitude * (1 - progress);
  return /* @__PURE__ */ jsx("div", { style: { transform: `translateY(${-y}px)`, ...style }, children });
};
var Pulse = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  speed = 0.1,
  style
}) => {
  const frame = useCurrentFrame();
  const scale2 = minScale + (maxScale - minScale) * (0.5 + Math.sin(frame * speed) * 0.5);
  return /* @__PURE__ */ jsx("div", { style: { transform: `scale(${scale2})`, ...style }, children });
};
var Swing = ({
  children,
  angle = 30,
  speed = 0.15,
  damping = 0.995,
  durationInFrames = 120,
  style
}) => {
  const frame = useCurrentFrame();
  const dampFactor = Math.pow(damping, frame);
  const rotation = Math.sin(frame * speed) * angle * dampFactor;
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top center",
        ...style
      },
      children
    }
  );
};
var Confetti = ({
  count = 100,
  colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"],
  style
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const confettiPieces = React3.useMemo(() => {
    const seed = (n) => {
      const x = Math.sin(n * 9999) * 1e4;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      x: seed(i) * width,
      startY: -50 - seed(i + 100) * 200,
      speed: 2 + seed(i + 200) * 4,
      rotation: seed(i + 300) * 360,
      rotationSpeed: (seed(i + 400) - 0.5) * 20,
      size: 8 + seed(i + 500) * 8,
      color: colors[Math.floor(seed(i + 600) * colors.length)],
      wobble: seed(i + 700) * Math.PI * 2,
      wobbleSpeed: 0.02 + seed(i + 800) * 0.05
    }));
  }, [count, colors, width]);
  return /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, overflow: "hidden", ...style }, children: confettiPieces.map((piece, i) => {
    const y = piece.startY + piece.speed * frame;
    const x = piece.x + Math.sin(frame * piece.wobbleSpeed + piece.wobble) * 30;
    const rotation = piece.rotation + piece.rotationSpeed * frame;
    if (y > height + 50) return null;
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          position: "absolute",
          left: x,
          top: y,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          transform: `rotate(${rotation}deg)`,
          borderRadius: 2
        }
      },
      i
    );
  }) });
};

// src/utils/transitions.ts
var fade = (progress) => {
  return progress;
};
var slide = (progress, direction = "right") => {
  const eased = progress;
  const offset = (1 - eased) * 100;
  switch (direction) {
    case "left":
      return { x: -offset, y: 0 };
    case "right":
      return { x: offset, y: 0 };
    case "up":
      return { x: 0, y: -offset };
    case "down":
      return { x: 0, y: offset };
  }
};
var scale = (progress, from = 0, to = 1) => {
  return from + (to - from) * progress;
};
var rotate = (progress, degrees = 360) => {
  return degrees * progress;
};
var zoom = (progress) => {
  return {
    scale: 0.5 + progress * 0.5,
    opacity: progress
  };
};
var wipe = (progress, direction = "right") => {
  const pct = progress * 100;
  switch (direction) {
    case "left":
      return { clipPath: `inset(0 ${100 - pct}% 0 0)` };
    case "right":
      return { clipPath: `inset(0 0 0 ${100 - pct}%)` };
    case "up":
      return { clipPath: `inset(0 0 ${100 - pct}% 0)` };
    case "down":
      return { clipPath: `inset(${100 - pct}% 0 0 0)` };
  }
};
var blur = (progress, maxBlur = 20) => {
  return {
    filter: `blur(${maxBlur * (1 - progress)}px)`,
    opacity: progress
  };
};
var glitch = (frame, intensity = 10) => {
  const offset = Math.sin(frame * 0.5) * intensity;
  return {
    transform: `translate(${offset}px, ${offset * 0.5}px)`
  };
};
var shake = (frame, intensity = 5) => {
  const x = Math.sin(frame * 0.8) * intensity;
  const y = Math.cos(frame * 1.2) * intensity;
  return {
    transform: `translate(${x}px, ${y}px)`
  };
};
var pulse = (frame, minScale = 0.95, maxScale = 1.05) => {
  const scale2 = minScale + (Math.sin(frame * 0.1) + 1) / 2 * (maxScale - minScale);
  return {
    transform: `scale(${scale2})`
  };
};
var bounce = (progress) => {
  const c4 = 2 * Math.PI / 3;
  return progress === 0 ? 0 : progress === 1 ? 1 : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
};
var flash = (progress, flashAt = 0.5) => {
  const flashProgress = progress < flashAt ? progress / flashAt : (1 - progress) / (1 - flashAt);
  return {
    opacity: progress < flashAt ? 1 - flashProgress * 0.5 : 1,
    backgroundColor: progress < flashAt ? `rgba(255,255,255,${flashProgress * 0.3})` : "transparent"
  };
};
var slideWithFade = (progress, direction = "right") => {
  const { x, y } = slide(progress, direction);
  return {
    transform: `translate(${x}%, ${y}%)`,
    opacity: progress
  };
};
var flip = (progress, direction = "horizontal") => {
  const rotateValue = (1 - progress) * 90;
  const opacity = progress < 0.5 ? 1 - progress : progress;
  return {
    transform: direction === "horizontal" ? `rotateY(${rotateValue}deg)` : `rotateX(${rotateValue}deg)`,
    opacity
  };
};
var combine = (progress, ...transitions2) => {
  return transitions2.reduce((acc, transition) => ({
    ...acc,
    ...transition(progress)
  }), {});
};
var transitions = {
  fade: {
    enter: (p) => ({ opacity: fade(p) }),
    exit: (p) => ({ opacity: fade(1 - p) })
  },
  slideRight: {
    enter: (p) => ({ transform: `translateX(${100 - p * 100}%)` }),
    exit: (p) => ({ transform: `translateX(${p * -100}%)` })
  },
  slideLeft: {
    enter: (p) => ({ transform: `translateX(${ -100 + p * 100}%)` }),
    exit: (p) => ({ transform: `translateX(${p * 100}%)` })
  },
  slideUp: {
    enter: (p) => ({ transform: `translateY(${100 - p * 100}%)` }),
    exit: (p) => ({ transform: `translateY(${p * -100}%)` })
  },
  slideDown: {
    enter: (p) => ({ transform: `translateY(${ -100 + p * 100}%)` }),
    exit: (p) => ({ transform: `translateY(${p * 100}%)` })
  },
  scale: {
    enter: (p) => ({ transform: `scale(${scale(p, 0, 1)})` }),
    exit: (p) => ({ transform: `scale(${scale(1 - p, 1, 0)})` })
  },
  zoom: {
    enter: (p) => {
      const { scale: s, opacity } = zoom(p);
      return { transform: `scale(${s})`, opacity };
    },
    exit: (p) => {
      const { scale: s, opacity } = zoom(1 - p);
      return { transform: `scale(${s})`, opacity };
    }
  },
  flipX: {
    enter: (p) => flip(p, "vertical"),
    exit: (p) => flip(1 - p, "vertical")
  },
  flipY: {
    enter: (p) => flip(p, "horizontal"),
    exit: (p) => flip(1 - p, "horizontal")
  }
};

// src/hooks/animation.ts
var useSpring = (options = {}) => {
  const currentFrame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();
  const {
    fps = videoFps,
    frame = currentFrame,
    config = {},
    from = 0,
    to = 1,
    durationInFrames
  } = options;
  return spring({
    frame,
    fps,
    config,
    from,
    to,
    durationInFrames
  });
};
var useInterpolate = (inputRange, outputRange, options) => {
  const frame = useCurrentFrame();
  return interpolate(frame, inputRange, outputRange, options);
};
var useCycle = (items, frame, durationPerItem) => {
  const index = Math.floor(frame / durationPerItem) % items.length;
  return items[index];
};
var useDurationInFrames = (seconds) => {
  const { fps } = useVideoConfig();
  return Math.round(seconds * fps);
};
var useDelay = (delayInFrames) => {
  const frame = useCurrentFrame();
  return frame >= delayInFrames;
};
var useProgress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return frame / (durationInFrames - 1);
};
var useLoop = (loopDuration) => {
  const frame = useCurrentFrame();
  return frame % loopDuration;
};
var useTimeline = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  return {
    frame,
    durationInFrames,
    fps,
    progress: frame / (durationInFrames - 1),
    timeInSeconds: frame / fps,
    durationInSeconds: durationInFrames / fps,
    remainingFrames: durationInFrames - frame - 1,
    remainingTimeInSeconds: (durationInFrames - frame - 1) / fps
  };
};
var useWindowedFrame = (startFrame, endFrame) => {
  const frame = useCurrentFrame();
  const isInWindow = frame >= startFrame && frame < endFrame;
  const relativeFrame = frame - startFrame;
  return { isInWindow, relativeFrame: isInWindow ? relativeFrame : 0 };
};
var useAnimation = (startFrame, endFrame) => {
  const frame = useCurrentFrame();
  const isAnimating = frame >= startFrame && frame < endFrame;
  const isComplete = frame >= endFrame;
  const progress = isAnimating ? (frame - startFrame) / (endFrame - startFrame) : isComplete ? 1 : 0;
  return {
    isAnimating,
    isComplete,
    progress,
    direction: frame < startFrame ? "forward" : frame >= endFrame ? "none" : "forward"
  };
};
var useKeyframeState = (keyframes) => {
  const frame = useCurrentFrame();
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }
  const progress = frame <= prev.frame ? 0 : frame >= next.frame ? 1 : (frame - prev.frame) / (next.frame - prev.frame);
  return {
    current: prev.value + progress * (next.value - prev.value),
    previous: prev !== sorted[0] ? prev.value : null,
    next: next !== sorted[sorted.length - 1] ? next.value : null,
    progress
  };
};
var useTransform = (options) => {
  const frame = useCurrentFrame();
  const transforms = [];
  if (options.translateX) {
    transforms.push(`translateX(${options.translateX(frame)}px)`);
  }
  if (options.translateY) {
    transforms.push(`translateY(${options.translateY(frame)}px)`);
  }
  if (options.scale) {
    transforms.push(`scale(${options.scale(frame)})`);
  }
  if (options.rotate) {
    transforms.push(`rotate(${options.rotate(frame)}deg)`);
  }
  const style = {};
  if (transforms.length > 0) {
    style.transform = transforms.join(" ");
  }
  if (options.opacity) {
    style.opacity = options.opacity(frame);
  }
  return style;
};
var useFade = (fadeInDuration, fadeOutDuration, options) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const startFrame = options?.startFrame ?? 0;
  const endFrame = options?.endFrame ?? durationInFrames;
  if (frame < startFrame + fadeInDuration) {
    return interpolate(
      frame,
      [startFrame, startFrame + fadeInDuration],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }
  if (frame > endFrame - fadeOutDuration) {
    return interpolate(
      frame,
      [endFrame - fadeOutDuration, endFrame],
      [1, 0],
      { extrapolateLeft: "clamp" }
    );
  }
  return 1;
};
var useSlide = (direction, distance, duration, startFrame = 0) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const easedProgress = Easing.easeOutCubic(progress);
  let transform = "";
  const offset = distance * (1 - easedProgress);
  switch (direction) {
    case "left":
      transform = `translateX(${-offset}px)`;
      break;
    case "right":
      transform = `translateX(${offset}px)`;
      break;
    case "up":
      transform = `translateY(${-offset}px)`;
      break;
    case "down":
      transform = `translateY(${offset}px)`;
      break;
  }
  return { transform };
};
var useShake = (intensity, duration, startFrame = 0) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const currentIntensity = intensity * (1 - progress);
  const shakeX = Math.sin(frame * 0.5) * currentIntensity;
  const shakeY = Math.cos(frame * 0.7) * currentIntensity;
  return { transform: `translate(${shakeX}px, ${shakeY}px)` };
};
var usePulse = (minScale, maxScale, frequency) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = (Math.sin(frame / fps * frequency * Math.PI * 2) + 1) / 2;
  const scale2 = interpolate(progress, [0, 1], [minScale, maxScale]);
  return { transform: `scale(${scale2})` };
};

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

// src/hooks/performance.ts
function useMemoizedFrame(compute, deps = []) {
  const frame = useCurrentFrame();
  const memoCache = useMemo(() => MemoCache.getInstance(), []);
  const key = useMemo(() => `frame:${frame}:${JSON.stringify(deps)}`, [frame, deps]);
  return useMemo(() => {
    return memoCache.getOrCompute(key, compute, [frame, ...deps]);
  }, [key, compute, memoCache, frame, deps]);
}
function useAnimationValue(compute, _frameDeps) {
  const frame = useCurrentFrame();
  return useMemo(() => compute(frame), [frame, compute]);
}
function useCachedFrame(compositionId, renderer) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return useMemo(() => {
    return renderer(frame);
  }, [compositionId, frame, width, height, renderer]);
}
function useThrottledFrame(_throttleMs) {
  return useCurrentFrame();
}
function useBatchFrameProcessor(processor, _batchSize) {
  return useCallback((items) => {
    return processor(items);
  }, [processor]);
}
function useFrameRange(startFrame, endFrame) {
  return useMemo(() => {
    const frames = [];
    for (let i = startFrame; i <= endFrame; i++) {
      frames.push(i);
    }
    return frames;
  }, [startFrame, endFrame]);
}
function usePrecomputeFrames(compute, lookahead = 10) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return useMemo(() => {
    const cache = /* @__PURE__ */ new Map();
    for (let i = frame; i < Math.min(frame + lookahead, durationInFrames); i++) {
      cache.set(i, compute(i));
    }
    return cache;
  }, [frame, lookahead, durationInFrames, compute]);
}
function useOptimizedSpring(config, from = 0, to = 1) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return useMemo(() => {
    return spring({ frame, fps, config, from, to });
  }, [frame, fps, config, from, to]);
}
function useOptimizedInterpolate(inputRange, outputRange, options) {
  return useCallback((frame) => {
    return interpolate(frame, inputRange, outputRange, options);
  }, [inputRange, outputRange, options]);
}
function usePerformanceMonitor() {
  return useMemo(() => ({
    fps: 60,
    frameTime: 16.67,
    renderTime: 0
  }), []);
}
function useRenderPriority() {
  return useMemo(() => "high", []);
}

// src/renderer/index.ts
init_export();
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
async function renderCompositionToVideo(setFrame, element, config, options) {
  const { VideoExportManager: VideoExportManager2 } = await Promise.resolve().then(() => (init_export(), export_exports));
  const manager = new VideoExportManager2();
  const result = await manager.exportVideo(setFrame, element, {
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
var PlayIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M8 5.14v14l11-7-11-7z",
        fill: color
      }
    )
  }
);
var PauseIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsxs(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: [
      /* @__PURE__ */ jsx("rect", { x: "6", y: "4", width: "4", height: "16", fill: color }),
      /* @__PURE__ */ jsx("rect", { x: "14", y: "4", width: "4", height: "16", fill: color })
    ]
  }
);
var StopIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("rect", { x: "6", y: "6", width: "12", height: "12", fill: color })
  }
);
var SkipBackIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z", fill: color })
  }
);
var SkipForwardIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M6 18l8.5-6L6 6v12zm8.5 0V6h2v12h-2z", fill: color })
  }
);
var RewindIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z", fill: color })
  }
);
var FastForwardIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z", fill: color })
  }
);
var ReplayIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
        fill: color
      }
    )
  }
);
var ShuffleIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z", fill: color })
  }
);
var RepeatIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z", fill: color })
  }
);
var VolumeHighIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z", fill: color })
  }
);
var VolumeMediumIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z", fill: color })
  }
);
var VolumeLowIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z", fill: color })
  }
);
var VolumeMuteIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z", fill: color })
  }
);
var ArrowLeftIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z", fill: color })
  }
);
var ArrowRightIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z", fill: color })
  }
);
var ArrowUpIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z", fill: color })
  }
);
var ArrowDownIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z", fill: color })
  }
);
var ChevronLeftIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z", fill: color })
  }
);
var ChevronRightIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z", fill: color })
  }
);
var ChevronUpIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z", fill: color })
  }
);
var ChevronDownIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z", fill: color })
  }
);
var CheckIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z", fill: color })
  }
);
var CloseIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z", fill: color })
  }
);
var PlusIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z", fill: color })
  }
);
var MinusIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19 13H5v-2h14v2z", fill: color })
  }
);
var EditIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z", fill: color })
  }
);
var DeleteIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z", fill: color })
  }
);
var SaveIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z", fill: color })
  }
);
var CopyIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z", fill: color })
  }
);
var DownloadIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z", fill: color })
  }
);
var UploadIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z", fill: color })
  }
);
var RefreshIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z", fill: color })
  }
);
var CameraIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z", fill: color })
  }
);
var VideoIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z", fill: color })
  }
);
var ImageIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z", fill: color })
  }
);
var MusicIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z", fill: color })
  }
);
var MicIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z", fill: color })
  }
);
var StarIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z", fill: color })
  }
);
var StarOutlineIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z", fill: color })
  }
);
var HeartIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", fill: color })
  }
);
var HeartOutlineIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z", fill: color })
  }
);
var ThumbUpIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z", fill: color })
  }
);
var ThumbDownIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M23 3h-4v12h4V3zm-2 10h-2V5h2v8zM15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z", fill: color })
  }
);
var ShareIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z", fill: color })
  }
);
var CommentIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z", fill: color })
  }
);
var SettingsIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z", fill: color })
  }
);
var FullscreenIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z", fill: color })
  }
);
var FullscreenExitIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z", fill: color })
  }
);
var SearchIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z", fill: color })
  }
);
var InfoIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z", fill: color })
  }
);
var WarningIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z", fill: color })
  }
);
var ErrorIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", fill: color })
  }
);
var SuccessIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", fill: color })
  }
);
var QuestionIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z", fill: color })
  }
);
var ClockIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", fill: color })
  }
);
var TimerIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z", fill: color })
  }
);
var CalendarIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z", fill: color })
  }
);
var FolderIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z", fill: color })
  }
);
var FileIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z", fill: color })
  }
);
var FilmIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z", fill: color })
  }
);
var SparkleIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z", fill: color })
  }
);
var MagicWandIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zM19.5 15.4L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zM14.37 7.29L12.56 5.5 2 16.06V18.88L5.12 22h2.82l10.55-10.56zM5.91 17.09L5 16.17l8.06-8.06.91.91-8.06 8.07z", fill: color })
  }
);
var LightningIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M7 2v11h3v9l7-12h-4l4-8z", fill: color })
  }
);
var LayersIcon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z", fill: color })
  }
);
var Loader2Icon = ({
  size = 24,
  color = "currentColor",
  className,
  style
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    xmlns: "http://www.w3.org/2000/svg",
    className: `animate-spin ${className || ""}`,
    style,
    children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
  }
);
var Icons = {
  // Playback
  Play: PlayIcon,
  Pause: PauseIcon,
  Stop: StopIcon,
  SkipBack: SkipBackIcon,
  SkipForward: SkipForwardIcon,
  Rewind: RewindIcon,
  FastForward: FastForwardIcon,
  Replay: ReplayIcon,
  Shuffle: ShuffleIcon,
  Repeat: RepeatIcon,
  // Volume
  VolumeHigh: VolumeHighIcon,
  VolumeMedium: VolumeMediumIcon,
  VolumeLow: VolumeLowIcon,
  VolumeMute: VolumeMuteIcon,
  // Navigation
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  ArrowUp: ArrowUpIcon,
  ArrowDown: ArrowDownIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronUp: ChevronUpIcon,
  ChevronDown: ChevronDownIcon,
  // Actions
  Check: CheckIcon,
  Close: CloseIcon,
  Plus: PlusIcon,
  Minus: MinusIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  Save: SaveIcon,
  Copy: CopyIcon,
  Download: DownloadIcon,
  Upload: UploadIcon,
  Refresh: RefreshIcon,
  // Media
  Camera: CameraIcon,
  Video: VideoIcon,
  Image: ImageIcon,
  Music: MusicIcon,
  Mic: MicIcon,
  // Social
  Star: StarIcon,
  StarOutline: StarOutlineIcon,
  Heart: HeartIcon,
  HeartOutline: HeartOutlineIcon,
  ThumbUp: ThumbUpIcon,
  ThumbDown: ThumbDownIcon,
  Share: ShareIcon,
  Comment: CommentIcon,
  // UI
  Settings: SettingsIcon,
  Fullscreen: FullscreenIcon,
  FullscreenExit: FullscreenExitIcon,
  Search: SearchIcon,
  Info: InfoIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Success: SuccessIcon,
  Question: QuestionIcon,
  // Time
  Clock: ClockIcon,
  Timer: TimerIcon,
  Calendar: CalendarIcon,
  // Files
  Folder: FolderIcon,
  File: FileIcon,
  Film: FilmIcon,
  // Animation
  Sparkle: SparkleIcon,
  MagicWand: MagicWandIcon,
  Lightning: LightningIcon,
  Layers: LayersIcon,
  Loader2: Loader2Icon
};
var icons_default = Icons;
var Timeline = ({ durationInFrames, frame, onSeek, marks = [], fps }) => {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleClick = useCallback((e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(Math.floor(percentage * durationInFrames));
  }, [durationInFrames, onSeek]);
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    handleClick(e);
  }, [handleClick]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      onSeek(Math.floor(percentage * durationInFrames));
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, durationInFrames, onSeek]);
  const progress = frame / (durationInFrames - 1) * 100;
  const timeInSeconds = frame / fps;
  const durationInSeconds = durationInFrames / fps;
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor(seconds % 1 * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: timelineRef,
        className: "relative h-2 bg-emerald-950 rounded-full cursor-pointer group border border-emerald-900/50",
        onMouseDown: handleMouseDown,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-75",
              style: { width: `${progress}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full shadow-lg shadow-emerald-500/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white",
              style: { left: `calc(${progress}% - 8px)` }
            }
          ),
          marks.map((mark, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 w-0.5 h-full bg-emerald-400",
              style: { left: `${mark / durationInFrames * 100}%` }
            },
            i
          ))
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2 text-xs text-emerald-500 font-mono", children: [
      /* @__PURE__ */ jsx("span", { children: formatTime(timeInSeconds) }),
      /* @__PURE__ */ jsx("span", { children: formatTime(durationInSeconds) })
    ] })
  ] });
};
var Controls = ({
  playing,
  onPlayPause,
  onRestart,
  onStepBack,
  onStepForward,
  playbackRate,
  onPlaybackRateChange,
  frame,
  totalFrames,
  onExport,
  isExporting
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speeds = [0.25, 0.5, 1, 1.5, 2];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onRestart,
        className: "p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110",
        title: "Restart",
        children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z", clipRule: "evenodd" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onStepBack,
        className: "p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110",
        title: "Previous frame (\u2190)",
        children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onPlayPause,
        className: "p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg shadow-emerald-500/30",
        title: playing ? "Pause (Space)" : "Play (Space)",
        children: playing ? /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onStepForward,
        className: "p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 hover:scale-110",
        title: "Next frame (\u2192)",
        children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowSpeedMenu(!showSpeedMenu),
          className: "px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950 rounded-lg transition-all duration-200 min-w-[55px] font-mono border border-emerald-900/50",
          title: "Playback speed",
          children: [
            playbackRate,
            "x"
          ]
        }
      ),
      showSpeedMenu && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 mb-2 bg-[#0a0a0a] rounded-lg shadow-xl border border-emerald-900/50 py-1 min-w-[65px] overflow-hidden", children: speeds.map((speed) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            onPlaybackRateChange(speed);
            setShowSpeedMenu(false);
          },
          className: `w-full px-3 py-2 text-sm text-left transition-colors ${playbackRate === speed ? "text-emerald-400 bg-emerald-950/50" : "text-emerald-500 hover:text-emerald-300 hover:bg-emerald-950/30"}`,
          children: [
            speed,
            "x"
          ]
        },
        speed
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "ml-2 px-3 py-1 bg-emerald-950/50 rounded-lg border border-emerald-900/50", children: /* @__PURE__ */ jsxs("span", { className: "text-sm text-emerald-400 font-mono", children: [
      /* @__PURE__ */ jsx("span", { className: "text-emerald-300", children: frame + 1 }),
      /* @__PURE__ */ jsx("span", { className: "text-emerald-600 mx-1", children: "/" }),
      /* @__PURE__ */ jsx("span", { className: "text-emerald-500", children: totalFrames })
    ] }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onExport,
        disabled: isExporting,
        className: `ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium ${isExporting ? "cursor-not-allowed" : "hover:scale-105 active:scale-95"}`,
        title: "Export Video",
        children: isExporting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2Icon, { size: 18 }),
          /* @__PURE__ */ jsx("span", { children: "Exporting..." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(DownloadIcon, { size: 18 }),
          /* @__PURE__ */ jsx("span", { children: "Export" })
        ] })
      }
    )
  ] });
};
var Canvas = ({
  canvasRef,
  component: Component,
  width,
  height,
  frame,
  fps,
  durationInFrames,
  playing,
  playbackRate,
  defaultProps = {}
}) => {
  const scale2 = Math.min(1, 800 / width);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: canvasRef,
      className: "relative rounded-xl overflow-hidden shadow-2xl shadow-emerald-900/30 border border-emerald-900/30",
      style: {
        width: width * scale2,
        height: height * scale2,
        backgroundColor: "#0a0a0a"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute -inset-px rounded-xl",
            style: {
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), transparent, rgba(20, 184, 166, 0.2))",
              zIndex: -1
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              transform: `scale(${scale2})`,
              transformOrigin: "top left"
            },
            children: /* @__PURE__ */ jsx(
              FrameContext.Provider,
              {
                value: {
                  frame,
                  fps,
                  durationInFrames,
                  width,
                  height,
                  playing,
                  playbackRate,
                  setFrame: () => {
                  },
                  setPlaying: () => {
                  },
                  setPlaybackRate: () => {
                  }
                },
                children: /* @__PURE__ */ jsx(Component, { ...defaultProps })
              }
            )
          }
        )
      ]
    }
  );
};
var Player = ({
  component,
  durationInFrames,
  fps = 30,
  width = 1920,
  height = 1080,
  defaultProps = {},
  controls = true,
  loop = true,
  autoPlay = false,
  style,
  className
}) => {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const canvasRef = useRef(null);
  useEffect(() => {
    if (playing) {
      const frameDuration = 1e3 / (fps * playbackRate);
      const animate = (currentTime) => {
        if (currentTime - lastTimeRef.current >= frameDuration) {
          setFrame((prevFrame) => {
            const nextFrame = prevFrame + 1;
            if (nextFrame >= durationInFrames) {
              if (loop) {
                return 0;
              }
              setPlaying(false);
              return prevFrame;
            }
            return nextFrame;
          });
          lastTimeRef.current = currentTime;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [playing, fps, playbackRate, durationInFrames, loop]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFrame((f) => Math.max(0, f - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFrame((f) => Math.min(durationInFrames - 1, f + 1));
          break;
        case "Home":
          setFrame(0);
          break;
        case "End":
          setFrame(durationInFrames - 1);
          break;
        case "j":
        case "J":
          setFrame((f) => Math.max(0, f - 10));
          break;
        case "l":
        case "L":
          setFrame((f) => Math.min(durationInFrames - 1, f + 10));
          break;
        case "k":
        case "K":
          setPlaying((p) => !p);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [durationInFrames]);
  const handleSeek = useCallback((targetFrame) => {
    setFrame(Math.max(0, Math.min(targetFrame, durationInFrames - 1)));
  }, [durationInFrames]);
  const handlePlayPause = useCallback(() => {
    setPlaying((p) => !p);
  }, []);
  const handleRestart = useCallback(() => {
    setFrame(0);
    setPlaying(true);
  }, []);
  const handleStepBack = useCallback(() => {
    setFrame((f) => Math.max(0, f - 1));
  }, []);
  const handleStepForward = useCallback(() => {
    setFrame((f) => Math.min(durationInFrames - 1, f + 1));
  }, [durationInFrames]);
  const handleExport = async () => {
    if (isExporting || !canvasRef.current) return;
    setIsExporting(true);
    setExportProgress(0);
    setPlaying(false);
    try {
      const elementToCapture = canvasRef.current.querySelector("div");
      const blob = await renderCompositionToVideo(
        (f) => setFrame(f),
        elementToCapture,
        { width, height, fps, durationInFrames },
        {
          onProgress: (progress) => setExportProgress(progress)
        }
      );
      if (blob) {
        downloadVideo(blob, `motionforge-export-${Date.now()}.webm`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Check console for details.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex flex-col bg-[#0a0a0a] rounded-2xl p-5 border border-emerald-900/30 ${className || ""}`,
      style,
      children: [
        isExporting && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0f0f0f] border border-emerald-900/50 rounded-2xl p-8 max-w-md w-full shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(VideoIcon, { size: 24, className: "text-emerald-500" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-emerald-400", children: "Exporting Video" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700", children: "High Quality Render" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Loader2Icon, { size: 24, className: "text-emerald-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-4 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900/30", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300",
                style: { width: `${exportProgress}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm font-mono", children: [
              /* @__PURE__ */ jsx("span", { className: "text-emerald-500", children: "Progress" }),
              /* @__PURE__ */ jsxs("span", { className: "text-emerald-400", children: [
                Math.round(exportProgress),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-emerald-900/20 grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/10 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-700 uppercase mb-1", children: "Resolution" }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-emerald-400", children: [
                  width,
                  "x",
                  height
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/10 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-700 uppercase mb-1", children: "Frames" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-emerald-400", children: durationInFrames })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-center text-emerald-800 italic pt-2", children: "Please keep this tab active for faster rendering." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-5", children: /* @__PURE__ */ jsx(
          Canvas,
          {
            canvasRef,
            component,
            width,
            height,
            frame,
            fps,
            durationInFrames,
            playing,
            playbackRate,
            defaultProps
          }
        ) }),
        controls && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(
            Controls,
            {
              playing,
              onPlayPause: handlePlayPause,
              onRestart: handleRestart,
              onStepBack: handleStepBack,
              onStepForward: handleStepForward,
              playbackRate,
              onPlaybackRateChange: setPlaybackRate,
              frame,
              totalFrames: durationInFrames,
              onExport: handleExport,
              isExporting
            }
          ),
          /* @__PURE__ */ jsx(
            Timeline,
            {
              durationInFrames,
              frame,
              onSeek: handleSeek,
              fps
            }
          )
        ] })
      ]
    }
  );
};
/**
 * MotionForge - A React-based framework for creating videos programmatically
 *
 * Build stunning videos with React components, spring animations,
 * and frame-perfect control. Perfect for data visualization,
 * marketing videos, and automated video generation.
 *
 * @package MotionForge
 * @version 1.2.0
 * @license MIT
 */

export { AbsoluteFill, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, Audio, Blur, Bounce, CalendarIcon, CameraIcon, CanvasRenderer, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, Circle, ClockIcon, CloseIcon, CommentIcon, Composition, CompositionManagerProvider, Confetti, CopyIcon, Counter, Cube3D, DeleteIcon, AbsoluteFill as Div, DownloadIcon, Easing, EditIcon, ErrorIcon, Fade, FastForwardIcon, FileIcon, FilmIcon, Flip3D, FolderIcon, FrameCache, FrameProvider, FrameSequenceEncoder, Freeze, FullscreenExitIcon, FullscreenIcon, G, Glitch, GradientText, HeartIcon, HeartOutlineIcon, Highlight, icons_default as Icons, ImageIcon, Img, InfoIcon, LayersIcon, LetterByLetter, LightningIcon, Loader2Icon, Loop, MagicWandIcon, MaskReveal, MemoCache, MicIcon, MinusIcon, MusicIcon, NeonGlow, ParticleSystem, Path, PauseIcon, Perspective3D, PlayIcon, Player, PlayerComposition, PlayerProvider, PlusIcon, ProgressBar, Pulse, QuestionIcon, RainbowText, Rect, RefreshIcon, RenderJobManager, RepeatIcon, ReplayIcon, Retiming, Reverse, RewindIcon, Rotate, Rotate3D, SVG, SaveIcon, Scale, SearchIcon, Sequence, Series, SettingsIcon, ShakeEffect, ShareIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, Slide, SparkleIcon, StarIcon, StarOutlineIcon, StopIcon, SuccessIcon, Swing, Text, ThumbDownIcon, ThumbUpIcon, TimerIcon, Trail, Typewriter, UploadIcon, Video, VideoExportManager, VideoIcon, VolumeHighIcon, VolumeLowIcon, VolumeMediumIcon, VolumeMuteIcon, WarningIcon, WaveText, WebMEncoder, WordByWord, blur, bounce, buildFFmpegCommand, calculateProgress, calculateVideoSize, checkEncodingSupport, combine, createDebouncedCache, createThrottledCache, downloadFrame, downloadVideo, Easing as easing, estimateFileSize, estimateRenderTime, fade, flash, flip, frameCache, frameToDataURL, generateFrames, getFramesFromSeconds, getSecondsFromFrames, glitch, interpolate, interpolateColors, measureSpring, noise2D, pulse as pulseTransition, random, range, renderCompositionToVideo, renderJobManager, renderVideo, rotate as rotateTransition, scale as scaleTransition, shake as shakeTransition, slide, slideWithFade, spring, staticFile, transitions, useAnimation, useAnimationValue, useBatchFrameProcessor, useCachedFrame, useComposition, useVideoConfig2 as useConfig, useCurrentFrame, useCycle, useDelay, useDurationInFrames, useFade, useFrameRange, useInterpolate, useKeyframeState, useKeyframes, useLoop, useMemoizedFrame, useOptimizedInterpolate, useOptimizedSpring, usePerformanceMonitor, usePrecomputeFrames, useProgress, usePulse, useRelativeCurrentFrame, useRenderPriority, useSequence, useShake, useSlide, useSpring, useThrottledFrame, useTimeline, useTimelineState, useTransform, useVideoConfig, useWindowedFrame, validateRenderConfig, videoExportManager, wipe, zoom };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map