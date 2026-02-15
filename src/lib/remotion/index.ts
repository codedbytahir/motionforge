/**
 * MotionForge - A React-based framework for creating videos programmatically
 *
 * Build stunning videos with React components, spring animations,
 * and frame-perfect control. Perfect for data visualization,
 * marketing videos, and automated video generation.
 *
 * @package MotionForge
 * @version 1.3.0
 * @license MIT
 */

// Core exports
export * from './core/types';
export {
  useCurrentFrame,
  useVideoConfig,
  useTimelineState,
  FrameProvider,
  CompositionManagerProvider,
  PlayerProvider,
} from './core/context';

// Components
export { Composition, PlayerComposition, useVideoConfig as useConfig, useComposition } from './components/Composition';
export {
  Sequence,
  Loop,
  Freeze,
  Retiming,
  Reverse,
  Series,
  useSequence,
  useRelativeCurrentFrame,
} from './components/Sequence';
export {
  AbsoluteFill,
  Div,
  Video,
  Audio,
  Img,
  Text,
  SVG,
  Rect,
  Circle,
  Path,
  G,
  staticFile,
} from './components/Media';
export { LottieAnimation } from './components/Lottie';

// Effect components
export {
  Fade,
  Scale,
  Slide,
  Rotate,
  Typewriter,
  Counter,
  ProgressBar,
  Glitch,
  Trail,
  ShakeEffect,
  Highlight,
  MaskReveal,
  NeonGlow,
  // 3D Transform Effects
  Rotate3D,
  Flip3D,
  Perspective3D,
  Cube3D,
  // Particle System
  ParticleSystem,
  // Text Animation Effects
  LetterByLetter,
  WordByWord,
  WaveText,
  RainbowText,
  GradientText,
  // Additional Effects
  Blur,
  Bounce,
  Pulse,
  Swing,
  Confetti,
} from './components/Effects';

// Animation utilities
export {
  spring,
  interpolate,
  interpolateColors,
  useKeyframes,
  measureSpring,
  getFramesFromSeconds,
  getSecondsFromFrames,
  range,
  random,
  noise2D,
  Easing,
  easing,
} from './utils/animation';

// Transitions
export {
  fade,
  slide,
  scale as scaleTransition,
  rotate as rotateTransition,
  zoom,
  wipe,
  blur,
  glitch,
  shake as shakeTransition,
  pulse as pulseTransition,
  bounce,
  flash,
  slideWithFade,
  flip,
  combine,
  transitions,
} from './utils/transitions';
export type { TransitionConfig, TransitionName } from './utils/transitions';

// Animation hooks
export {
  useSpring,
  useInterpolate,
  useCycle,
  useDurationInFrames,
  useDelay,
  useProgress,
  useLoop,
  useTimeline,
  useWindowedFrame,
  useAnimation,
  useKeyframeState,
  useTransform,
  useFade,
  useSlide,
  useShake,
  usePulse,
} from './hooks/animation';

// Performance hooks
export {
  useMemoizedFrame,
  useAnimationValue,
  useCachedFrame,
  useThrottledFrame,
  useBatchFrameProcessor,
  useFrameRange,
  usePrecomputeFrames,
  useOptimizedSpring,
  useOptimizedInterpolate,
  usePerformanceMonitor,
  useRenderPriority,
} from './hooks/performance';

// Player
export { Player } from './player/Player';
export type { PlayerProps } from './player/Player';

// Renderer
export {
  renderVideo,
  generateFrames,
  buildFFmpegCommand,
  frameToDataURL,
  calculateVideoSize,
  estimateRenderTime,
  validateRenderConfig,
  renderJobManager,
  RenderJobManager,
  // Cache system
  FrameCache,
  MemoCache,
  frameCache,
  createDebouncedCache,
  createThrottledCache,
  // Export system
  CanvasRenderer,
  WebMEncoder,
  FrameSequenceEncoder,
  VideoExportManager,
  videoExportManager,
  calculateProgress,
  estimateFileSize,
  checkEncodingSupport,
  // High-level API
  renderCompositionToVideo,
  downloadVideo,
  downloadFrame,
} from './renderer';

// Renderer types
export type {
  RenderProgress,
  ExportOptions,
  ExportResult,
  CacheStats,
} from './renderer';

// Icons
export * from './icons';
export { default as Icons } from './icons';

// Types
export type {
  VideoConfig,
  CompositionProps,
  SequenceProps,
  LayerProps,
  VideoProps,
  AudioProps,
  ImageProps,
  TextProps,
  LottieAnimationProps,
  SpringConfig,
  InterpolateOptions,
  EasingFunction,
  Keyframe,
  AnimationTrack,
  TimelineState,
  RenderJob,
  FrameContextValue,
  VideoRendererConfig,
  CompositionManager,
} from './core/types';
