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
export { Lottie } from './components/Lottie';
export type { LottieProps } from './components/Lottie';

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

// New Cinematic Animations
export { KineticTypography } from './components/animations/KineticTypography';
export { LiquidText } from './components/animations/LiquidText';
export { TextStack3D } from './components/animations/TextStack3D';
export { StickyGridScroll } from './components/animations/StickyGridScroll';
export { FlipImageReveal } from './components/animations/FlipImageReveal';
export { CardExpansionMask } from './components/animations/CardExpansionMask';
export { DepthGallery3D } from './components/animations/DepthGallery3D';
export { ShaderImageReveal } from './components/animations/ShaderImageReveal';
export { DitheringEffect } from './components/animations/DitheringEffect';

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
  PhysicsConfig,
  PhysicsBodyProps,
  StudioConfig,
  StudioTemplate,
} from './core/types';

// Physics Components (lazy-loaded from ./components/physics)
// Import from 'motionforge/physics' for physics features:
//   import { RapierWorld, RigidBody, PhysicsScene } from 'motionforge/physics';

// Studio Templates
export { templates, getTemplate } from './studio/templates';
export type { StudioTemplate as StudioTemplateItem } from './studio/templates';
