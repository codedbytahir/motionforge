import React$1, { ReactNode, AudioHTMLAttributes, ImgHTMLAttributes, VideoHTMLAttributes } from 'react';

interface VideoConfig {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}
interface CompositionProps$1 {
    id: string;
    component: React.ComponentType<Record<string, unknown>>;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    defaultProps?: Record<string, unknown>;
}
interface SequenceProps$1 {
    from: number;
    durationInFrames?: number;
    offset?: number;
    name?: string;
    children: React.ReactNode;
}
interface LayerProps {
    index?: number;
    children: React.ReactNode;
}
interface VideoProps$1 {
    src: string;
    startFrom?: number;
    endAt?: number;
    volume?: number | ((frame: number) => number);
    playbackRate?: number;
    muted?: boolean;
    style?: React.CSSProperties;
}
interface AudioProps$1 {
    src: string;
    startFrom?: number;
    endAt?: number;
    volume?: number | ((frame: number) => number);
    playbackRate?: number;
    muted?: boolean;
}
interface ImageProps {
    src: string;
    style?: React.CSSProperties;
}
interface TextProps$1 {
    style?: React.CSSProperties;
    children: React.ReactNode;
}
interface SpringConfig {
    frame: number;
    fps: number;
    config?: {
        damping?: number;
        mass?: number;
        stiffness?: number;
        overshootClamping?: boolean;
    };
    from?: number;
    to?: number;
    durationInFrames?: number;
    durationRestThreshold?: number;
}
interface InterpolateOptions {
    extrapolateLeft?: 'clamp' | 'extend' | 'identity';
    extrapolateRight?: 'clamp' | 'extend' | 'identity';
    easing?: (t: number) => number;
}
type EasingFunction = (t: number) => number;
interface Keyframe {
    frame: number;
    value: number | string;
    easing?: EasingFunction;
}
interface AnimationTrack {
    property: string;
    keyframes: Keyframe[];
}
interface TimelineState {
    frame: number;
    playing: boolean;
    playbackRate: number;
}
interface RenderJob {
    id: string;
    compositionId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    outputUrl?: string;
    error?: string;
    createdAt: Date;
}
interface FrameContextValue {
    frame: number;
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
    playing: boolean;
    playbackRate: number;
    setFrame: (frame: number) => void;
    setPlaying: (playing: boolean) => void;
    setPlaybackRate: (rate: number) => void;
}
interface VideoRendererConfig {
    quality: 'low' | 'medium' | 'high';
    format: 'mp4' | 'webm' | 'gif';
    codec?: 'h264' | 'h265' | 'vp8' | 'vp9';
    crf?: number;
    pixelFormat?: string;
    bitrate?: number;
}
interface CompositionManager {
    compositions: Map<string, CompositionProps$1>;
    currentComposition: string | null;
    registerComposition: (composition: CompositionProps$1) => void;
    unregisterComposition: (id: string) => void;
    setCurrentComposition: (id: string) => void;
    getComposition: (id: string) => CompositionProps$1 | undefined;
}

declare const useCurrentFrame: () => number;
declare const useVideoConfig$1: () => {
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
};
declare const useTimelineState: () => {
    frame: number;
    playing: boolean;
    playbackRate: number;
    setFrame: (frame: number) => void;
    setPlaying: (playing: boolean) => void;
    setPlaybackRate: (rate: number) => void;
};
interface FrameProviderProps {
    fps?: number;
    durationInFrames: number;
    width: number;
    height: number;
    children: React$1.ReactNode;
    initialFrame?: number;
}
declare const FrameProvider: React$1.FC<FrameProviderProps>;
interface CompositionManagerProviderProps {
    children: React$1.ReactNode;
}
declare const CompositionManagerProvider: React$1.FC<CompositionManagerProviderProps>;
interface PlayerProviderProps {
    durationInFrames: number;
    fps?: number;
    children: React$1.ReactNode;
}
declare const PlayerProvider: React$1.FC<PlayerProviderProps>;

declare const useComposition: () => {
    id: string;
    config: VideoConfig;
};
declare const useVideoConfig: () => {
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
};
interface CompositionProps {
    id: string;
    component: React$1.ComponentType<Record<string, unknown>>;
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames: number;
    defaultProps?: Record<string, unknown>;
    children?: ReactNode;
}
declare const Composition: React$1.FC<CompositionProps>;
interface PlayerCompositionProps {
    id: string;
    component: React$1.ComponentType<Record<string, unknown>>;
    width?: number;
    height?: number;
    fps?: number;
    durationInFrames: number;
    defaultProps?: Record<string, unknown>;
    frame: number;
    playing?: boolean;
    playbackRate?: number;
}
declare const PlayerComposition: React$1.FC<PlayerCompositionProps>;

interface SequenceContextValue {
    relativeFrom: number;
    durationInFrames?: number;
    isActive: boolean;
    startFrame: number;
    endFrame: number;
}
declare const useSequence: () => SequenceContextValue;
interface SequenceProps {
    from: number;
    durationInFrames?: number;
    offset?: number;
    name?: string;
    children: ReactNode;
    showInTimeline?: boolean;
    layout?: 'absolute-fill' | 'none';
}
declare const Sequence: React$1.FC<SequenceProps>;
declare const useRelativeCurrentFrame: () => number;
interface LoopProps {
    durationInFrames: number;
    times?: number;
    children: ReactNode;
    name?: string;
}
declare const Loop: React$1.FC<LoopProps>;
interface FreezeProps {
    frame: number;
    durationInFrames: number;
    children: ReactNode;
    name?: string;
}
declare const Freeze: React$1.FC<FreezeProps>;
interface RetimingProps {
    children: ReactNode;
    playbackRate: number | ((frame: number) => number);
    name?: string;
}
declare const Retiming: React$1.FC<RetimingProps>;
interface ReverseProps {
    children: ReactNode;
    durationInFrames: number;
}
declare const Reverse: React$1.FC<ReverseProps>;
interface SeriesProps {
    children: ReactNode;
}
declare const Series: React$1.FC<SeriesProps>;

interface AbsoluteFillProps {
    children: React$1.ReactNode;
    style?: React$1.CSSProperties;
    className?: string;
}
declare const AbsoluteFill: React$1.FC<AbsoluteFillProps>;
interface VideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
    src: string;
    startFrom?: number;
    endAt?: number;
    volume?: number | ((frame: number) => number);
    playbackRate?: number;
    muted?: boolean;
    style?: React$1.CSSProperties;
    pauseOnFrame?: boolean;
}
declare const Video: React$1.FC<VideoProps>;
interface AudioProps extends Omit<AudioHTMLAttributes<HTMLAudioElement>, 'src'> {
    src: string;
    startFrom?: number;
    endAt?: number;
    volume?: number | ((frame: number) => number);
    playbackRate?: number;
    muted?: boolean;
}
declare const Audio: React$1.FC<AudioProps>;
interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    style?: React$1.CSSProperties;
    startFrom?: number;
    endAt?: number;
}
declare const Img: React$1.FC<ImgProps>;
declare const staticFile: (path: string) => string;
interface TextProps {
    children: React$1.ReactNode;
    style?: React$1.CSSProperties;
    className?: string;
}
declare const Text: React$1.FC<TextProps>;
interface SVGProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    children: React$1.ReactNode;
    style?: React$1.CSSProperties;
}
declare const SVG: React$1.FC<SVGProps>;
interface RectProps {
    width: number | string;
    height: number | string;
    x?: number;
    y?: number;
    rx?: number;
    ry?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: React$1.CSSProperties;
}
declare const Rect: React$1.FC<RectProps>;
interface CircleProps {
    r: number;
    cx?: number;
    cy?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: React$1.CSSProperties;
}
declare const Circle: React$1.FC<CircleProps>;
interface PathProps {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: React$1.CSSProperties;
}
declare const Path: React$1.FC<PathProps>;
interface GroupProps {
    children: React$1.ReactNode;
    transform?: string;
    style?: React$1.CSSProperties;
}
declare const G: React$1.FC<GroupProps>;

interface FadeProps {
    children: React$1.ReactNode;
    durationInFrames?: number;
    startFrame?: number;
    style?: React$1.CSSProperties;
}
declare const Fade: React$1.FC<FadeProps>;
interface ScaleProps {
    children: React$1.ReactNode;
    from?: number;
    to?: number;
    durationInFrames?: number;
    startFrame?: number;
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
}
declare const Scale: React$1.FC<ScaleProps>;
interface SlideProps {
    children: React$1.ReactNode;
    direction: 'left' | 'right' | 'up' | 'down';
    distance?: number;
    durationInFrames?: number;
    startFrame?: number;
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
}
declare const Slide: React$1.FC<SlideProps>;
interface RotateProps {
    children: React$1.ReactNode;
    degrees?: number;
    durationInFrames?: number;
    startFrame?: number;
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
}
declare const Rotate: React$1.FC<RotateProps>;
interface TypewriterProps {
    text: string;
    durationInFrames?: number;
    startFrame?: number;
    style?: React$1.CSSProperties;
    cursor?: boolean;
    cursorChar?: string;
}
declare const Typewriter: React$1.FC<TypewriterProps>;
interface CounterProps {
    from?: number;
    to: number;
    durationInFrames?: number;
    startFrame?: number;
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
    format?: (value: number) => string;
}
declare const Counter: React$1.FC<CounterProps>;
interface ProgressBarProps {
    progress: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    fillColor?: string;
    borderRadius?: number;
    style?: React$1.CSSProperties;
}
declare const ProgressBar: React$1.FC<ProgressBarProps>;
interface GlitchProps {
    children: React$1.ReactNode;
    intensity?: number;
    style?: React$1.CSSProperties;
}
declare const Glitch: React$1.FC<GlitchProps>;
interface TrailProps {
    children: React$1.ReactNode;
    trailLength?: number;
    opacityDecay?: number;
    style?: React$1.CSSProperties;
}
declare const Trail: React$1.FC<TrailProps>;
interface ShakeEffectProps {
    children: React$1.ReactNode;
    intensity?: number;
    active?: boolean;
    style?: React$1.CSSProperties;
}
declare const ShakeEffect: React$1.FC<ShakeEffectProps>;
interface HighlightProps {
    children: React$1.ReactNode;
    color?: string;
    progress?: number;
    style?: React$1.CSSProperties;
}
declare const Highlight: React$1.FC<HighlightProps>;
interface MaskRevealProps {
    children: React$1.ReactNode;
    direction: 'left' | 'right' | 'up' | 'down';
    progress: number;
    style?: React$1.CSSProperties;
}
declare const MaskReveal: React$1.FC<MaskRevealProps>;
interface NeonGlowProps {
    children: React$1.ReactNode;
    color?: string;
    intensity?: number;
    style?: React$1.CSSProperties;
}
declare const NeonGlow: React$1.FC<NeonGlowProps>;
interface Rotate3DProps {
    children: React$1.ReactNode;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    durationInFrames?: number;
    startFrame?: number;
    perspective?: number;
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
}
declare const Rotate3D: React$1.FC<Rotate3DProps>;
interface Flip3DProps {
    children: React$1.ReactNode;
    front: React$1.ReactNode;
    back: React$1.ReactNode;
    durationInFrames?: number;
    startFrame?: number;
    direction?: 'horizontal' | 'vertical';
    perspective?: number;
    style?: React$1.CSSProperties;
}
declare const Flip3D: React$1.FC<Flip3DProps>;
interface Perspective3DProps {
    children: React$1.ReactNode;
    rotateX?: number;
    rotateY?: number;
    perspective?: number;
    durationInFrames?: number;
    startFrame?: number;
    style?: React$1.CSSProperties;
}
declare const Perspective3D: React$1.FC<Perspective3DProps>;
interface Cube3DProps {
    size?: number;
    durationInFrames?: number;
    colors?: {
        front?: string;
        back?: string;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
    };
    style?: React$1.CSSProperties;
}
declare const Cube3D: React$1.FC<Cube3DProps>;
interface ParticleSystemProps {
    count?: number;
    colors?: string[];
    minSize?: number;
    maxSize?: number;
    speed?: number;
    direction?: 'random' | 'up' | 'down' | 'left' | 'right' | 'explode';
    fadeOut?: boolean;
    style?: React$1.CSSProperties;
    particleShape?: 'circle' | 'square' | 'star' | 'triangle';
}
declare const ParticleSystem: React$1.FC<ParticleSystemProps>;
interface LetterByLetterProps {
    text: string;
    durationInFrames?: number;
    startFrame?: number;
    delayPerLetter?: number;
    animation?: 'fade' | 'scale' | 'slide' | 'rotate' | 'bounce';
    easing?: (t: number) => number;
    style?: React$1.CSSProperties;
    letterStyle?: React$1.CSSProperties;
}
declare const LetterByLetter: React$1.FC<LetterByLetterProps>;
interface WordByWordProps {
    text: string;
    durationInFrames?: number;
    startFrame?: number;
    delayPerWord?: number;
    animation?: 'fade' | 'scale' | 'slide' | 'pop';
    style?: React$1.CSSProperties;
    wordStyle?: React$1.CSSProperties;
}
declare const WordByWord: React$1.FC<WordByWordProps>;
interface WaveTextProps {
    text: string;
    amplitude?: number;
    frequency?: number;
    speed?: number;
    style?: React$1.CSSProperties;
    letterStyle?: React$1.CSSProperties;
}
declare const WaveText: React$1.FC<WaveTextProps>;
interface RainbowTextProps {
    text: string;
    speed?: number;
    saturation?: number;
    lightness?: number;
    style?: React$1.CSSProperties;
    letterStyle?: React$1.CSSProperties;
}
declare const RainbowText: React$1.FC<RainbowTextProps>;
interface GradientTextProps {
    text: string;
    colors?: string[];
    speed?: number;
    angle?: number;
    style?: React$1.CSSProperties;
}
declare const GradientText: React$1.FC<GradientTextProps>;
interface BlurProps {
    children: React$1.ReactNode;
    from?: number;
    to?: number;
    durationInFrames?: number;
    startFrame?: number;
    style?: React$1.CSSProperties;
}
declare const Blur: React$1.FC<BlurProps>;
interface BounceProps {
    children: React$1.ReactNode;
    height?: number;
    durationInFrames?: number;
    startFrame?: number;
    times?: number;
    damping?: number;
    style?: React$1.CSSProperties;
}
declare const Bounce: React$1.FC<BounceProps>;
interface PulseProps {
    children: React$1.ReactNode;
    minScale?: number;
    maxScale?: number;
    speed?: number;
    style?: React$1.CSSProperties;
}
declare const Pulse: React$1.FC<PulseProps>;
interface SwingProps {
    children: React$1.ReactNode;
    angle?: number;
    speed?: number;
    damping?: number;
    durationInFrames?: number;
    style?: React$1.CSSProperties;
}
declare const Swing: React$1.FC<SwingProps>;
interface ConfettiProps {
    count?: number;
    colors?: string[];
    style?: React$1.CSSProperties;
}
declare const Confetti: React$1.FC<ConfettiProps>;

declare const Easing: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInQuart: (t: number) => number;
    easeOutQuart: (t: number) => number;
    easeInOutQuart: (t: number) => number;
    easeInQuint: (t: number) => number;
    easeOutQuint: (t: number) => number;
    easeInOutQuint: (t: number) => number;
    easeInSine: (t: number) => number;
    easeOutSine: (t: number) => number;
    easeInOutSine: (t: number) => number;
    easeInExpo: (t: number) => number;
    easeOutExpo: (t: number) => number;
    easeInOutExpo: (t: number) => number;
    easeInCirc: (t: number) => number;
    easeOutCirc: (t: number) => number;
    easeInOutCirc: (t: number) => number;
    easeInBack: (t: number) => number;
    easeOutBack: (t: number) => number;
    easeInOutBack: (t: number) => number;
    easeInElastic: (t: number) => number;
    easeOutElastic: (t: number) => number;
    easeInOutElastic: (t: number) => number;
    easeInBounce: (t: number) => number;
    easeOutBounce: (t: number) => number;
    easeInOutBounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => EasingFunction;
};
declare const spring: ({ frame, fps, config, from, to, durationInFrames, durationRestThreshold, }: SpringConfig) => number;
declare const interpolate: (input: number, inputRange: number[], outputRange: number[], options?: InterpolateOptions) => number;
declare const interpolateColors: (input: number, inputRange: number[], outputRange: string[]) => string;
declare const useKeyframes: (keyframes: Keyframe[], frame: number) => number | string;
declare const measureSpring: ({ fps, config, threshold, }: {
    fps: number;
    config?: SpringConfig["config"];
    threshold?: number;
}) => number;
declare const getFramesFromSeconds: (seconds: number, fps: number) => number;
declare const getSecondsFromFrames: (frames: number, fps: number) => number;
declare const range: (start: number, end: number, step?: number) => number[];
declare const random: (seed: string | number, min?: number, max?: number) => number;
declare const noise2D: (x: number, y: number) => number;

interface TransitionConfig {
    durationInFrames: number;
    easing?: EasingFunction;
    startFrame?: number;
}
declare const fade: (progress: number) => number;
declare const slide: (progress: number, direction?: "left" | "right" | "up" | "down") => {
    x: number;
    y: number;
};
declare const scale: (progress: number, from?: number, to?: number) => number;
declare const rotate: (progress: number, degrees?: number) => number;
declare const zoom: (progress: number) => {
    scale: number;
    opacity: number;
};
declare const wipe: (progress: number, direction?: "left" | "right" | "up" | "down") => {
    clipPath: string;
};
declare const blur: (progress: number, maxBlur?: number) => {
    filter: string;
    opacity: number;
};
declare const glitch: (frame: number, intensity?: number) => {
    transform: string;
};
declare const shake: (frame: number, intensity?: number) => {
    transform: string;
};
declare const pulse: (frame: number, minScale?: number, maxScale?: number) => {
    transform: string;
};
declare const bounce: (progress: number) => number;
declare const flash: (progress: number, flashAt?: number) => {
    opacity: number;
    backgroundColor: string;
};
declare const slideWithFade: (progress: number, direction?: "left" | "right" | "up" | "down") => {
    transform: string;
    opacity: number;
};
declare const flip: (progress: number, direction?: "horizontal" | "vertical") => {
    transform: string;
    opacity: number;
};
declare const combine: (progress: number, ...transitions: ((p: number) => Record<string, unknown>)[]) => Record<string, unknown>;
declare const transitions: {
    fade: {
        enter: (p: number) => {
            opacity: number;
        };
        exit: (p: number) => {
            opacity: number;
        };
    };
    slideRight: {
        enter: (p: number) => {
            transform: string;
        };
        exit: (p: number) => {
            transform: string;
        };
    };
    slideLeft: {
        enter: (p: number) => {
            transform: string;
        };
        exit: (p: number) => {
            transform: string;
        };
    };
    slideUp: {
        enter: (p: number) => {
            transform: string;
        };
        exit: (p: number) => {
            transform: string;
        };
    };
    slideDown: {
        enter: (p: number) => {
            transform: string;
        };
        exit: (p: number) => {
            transform: string;
        };
    };
    scale: {
        enter: (p: number) => {
            transform: string;
        };
        exit: (p: number) => {
            transform: string;
        };
    };
    zoom: {
        enter: (p: number) => {
            transform: string;
            opacity: number;
        };
        exit: (p: number) => {
            transform: string;
            opacity: number;
        };
    };
    flipX: {
        enter: (p: number) => {
            transform: string;
            opacity: number;
        };
        exit: (p: number) => {
            transform: string;
            opacity: number;
        };
    };
    flipY: {
        enter: (p: number) => {
            transform: string;
            opacity: number;
        };
        exit: (p: number) => {
            transform: string;
            opacity: number;
        };
    };
};
type TransitionName = keyof typeof transitions;

interface UseSpringOptions {
    fps?: number;
    frame?: number;
    config?: {
        damping?: number;
        mass?: number;
        stiffness?: number;
        overshootClamping?: boolean;
    };
    from?: number;
    to?: number;
    durationInFrames?: number;
}
declare const useSpring: (options?: UseSpringOptions) => number;
declare const useInterpolate: (inputRange: number[], outputRange: number[], options?: {
    extrapolateLeft?: "clamp" | "extend" | "identity";
    extrapolateRight?: "clamp" | "extend" | "identity";
    easing?: (t: number) => number;
}) => number;
declare const useCycle: <T>(items: T[], frame: number, durationPerItem: number) => T;
declare const useDurationInFrames: (seconds: number) => number;
declare const useDelay: (delayInFrames: number) => boolean;
declare const useProgress: () => number;
declare const useLoop: (loopDuration: number) => number;
declare const useTimeline: () => {
    frame: number;
    durationInFrames: number;
    fps: number;
    progress: number;
    timeInSeconds: number;
    durationInSeconds: number;
    remainingFrames: number;
    remainingTimeInSeconds: number;
};
declare const useWindowedFrame: (startFrame: number, endFrame: number) => {
    isInWindow: boolean;
    relativeFrame: number;
};
interface AnimationState {
    isAnimating: boolean;
    isComplete: boolean;
    progress: number;
    direction: 'forward' | 'backward' | 'none';
}
declare const useAnimation: (startFrame: number, endFrame: number) => AnimationState;
interface KeyframeState<T> {
    current: T;
    previous: T | null;
    next: T | null;
    progress: number;
}
declare const useKeyframeState: <T extends number>(keyframes: {
    frame: number;
    value: T;
}[]) => KeyframeState<T>;
interface TransformOptions {
    translateX?: (frame: number) => number;
    translateY?: (frame: number) => number;
    scale?: (frame: number) => number;
    rotate?: (frame: number) => number;
    opacity?: (frame: number) => number;
}
declare const useTransform: (options: TransformOptions) => React.CSSProperties;
declare const useFade: (fadeInDuration: number, fadeOutDuration: number, options?: {
    startFrame?: number;
    endFrame?: number;
}) => number;
declare const useSlide: (direction: "left" | "right" | "up" | "down", distance: number, duration: number, startFrame?: number) => {
    transform: string;
};
declare const useShake: (intensity: number, duration: number, startFrame?: number) => {
    transform: string;
};
declare const usePulse: (minScale: number, maxScale: number, frequency: number) => {
    transform: string;
};

/**
 * Memoized frame value hook
 * Caches computed values based on frame and dependencies
 */
declare function useMemoizedFrame<T>(compute: () => T, deps?: unknown[]): T;
/**
 * Memoized animation value hook
 * Only recomputes when frame changes
 */
declare function useAnimationValue<T>(compute: (frame: number) => T, _frameDeps?: number[]): T;
/**
 * Cached frame hook - simplified version
 */
declare function useCachedFrame<T>(compositionId: string, renderer: (frame: number) => T): T;
/**
 * Throttled frame update hook - returns frame directly
 * Throttling is handled by the player
 */
declare function useThrottledFrame(_throttleMs?: number): number;
/**
 * Batch frame processing hook - simplified
 */
declare function useBatchFrameProcessor<T, R>(processor: (items: T[]) => R[], _batchSize?: number): (items: T[]) => R[];
/**
 * Frame range hook for efficient range queries
 */
declare function useFrameRange(startFrame: number, endFrame: number): number[];
/**
 * Pre-compute frames hook - returns pre-computed values
 */
declare function usePrecomputeFrames<T>(compute: (frame: number) => T, lookahead?: number): Map<number, T>;
/**
 * Optimized spring hook with caching
 */
declare function useOptimizedSpring(config: {
    damping?: number;
    stiffness?: number;
    mass?: number;
}, from?: number, to?: number): number;
/**
 * Optimized interpolate hook with caching
 */
declare function useOptimizedInterpolate(inputRange: number[], outputRange: number[], options?: {
    easing?: (t: number) => number;
    extrapolateLeft?: 'clamp' | 'extend' | 'identity';
    extrapolateRight?: 'clamp' | 'extend' | 'identity';
}): (frame: number) => number;
/**
 * Performance monitoring hook
 * Returns static metrics - actual monitoring should use external tools
 */
declare function usePerformanceMonitor(): {
    fps: number;
    frameTime: number;
    renderTime: number;
};
/**
 * Render priority hook
 * Returns render priority based on configuration
 */
declare function useRenderPriority(): 'high' | 'medium' | 'low';

interface PlayerProps {
    component: React$1.ComponentType<Record<string, unknown>>;
    durationInFrames: number;
    fps?: number;
    width?: number;
    height?: number;
    defaultProps?: Record<string, unknown>;
    controls?: boolean;
    loop?: boolean;
    autoPlay?: boolean;
    style?: React$1.CSSProperties;
    className?: string;
}
declare const Player: React$1.FC<PlayerProps>;

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

/**
 * MotionForge Icon Library
 *
 * A comprehensive collection of SVG icons for video creation.
 * Use these icons instead of emojis for professional results.
 *
 * Usage:
 * import { PlayIcon, PauseIcon } from 'motionforge/icons';
 * <PlayIcon size={24} color="#10b981" />
 */

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React$1.CSSProperties;
}
declare const PlayIcon: React$1.FC<IconProps>;
declare const PauseIcon: React$1.FC<IconProps>;
declare const StopIcon: React$1.FC<IconProps>;
declare const SkipBackIcon: React$1.FC<IconProps>;
declare const SkipForwardIcon: React$1.FC<IconProps>;
declare const RewindIcon: React$1.FC<IconProps>;
declare const FastForwardIcon: React$1.FC<IconProps>;
declare const ReplayIcon: React$1.FC<IconProps>;
declare const ShuffleIcon: React$1.FC<IconProps>;
declare const RepeatIcon: React$1.FC<IconProps>;
declare const VolumeHighIcon: React$1.FC<IconProps>;
declare const VolumeMediumIcon: React$1.FC<IconProps>;
declare const VolumeLowIcon: React$1.FC<IconProps>;
declare const VolumeMuteIcon: React$1.FC<IconProps>;
declare const ArrowLeftIcon: React$1.FC<IconProps>;
declare const ArrowRightIcon: React$1.FC<IconProps>;
declare const ArrowUpIcon: React$1.FC<IconProps>;
declare const ArrowDownIcon: React$1.FC<IconProps>;
declare const ChevronLeftIcon: React$1.FC<IconProps>;
declare const ChevronRightIcon: React$1.FC<IconProps>;
declare const ChevronUpIcon: React$1.FC<IconProps>;
declare const ChevronDownIcon: React$1.FC<IconProps>;
declare const CheckIcon: React$1.FC<IconProps>;
declare const CloseIcon: React$1.FC<IconProps>;
declare const PlusIcon: React$1.FC<IconProps>;
declare const MinusIcon: React$1.FC<IconProps>;
declare const EditIcon: React$1.FC<IconProps>;
declare const DeleteIcon: React$1.FC<IconProps>;
declare const SaveIcon: React$1.FC<IconProps>;
declare const CopyIcon: React$1.FC<IconProps>;
declare const DownloadIcon: React$1.FC<IconProps>;
declare const UploadIcon: React$1.FC<IconProps>;
declare const RefreshIcon: React$1.FC<IconProps>;
declare const CameraIcon: React$1.FC<IconProps>;
declare const VideoIcon: React$1.FC<IconProps>;
declare const ImageIcon: React$1.FC<IconProps>;
declare const MusicIcon: React$1.FC<IconProps>;
declare const MicIcon: React$1.FC<IconProps>;
declare const StarIcon: React$1.FC<IconProps>;
declare const StarOutlineIcon: React$1.FC<IconProps>;
declare const HeartIcon: React$1.FC<IconProps>;
declare const HeartOutlineIcon: React$1.FC<IconProps>;
declare const ThumbUpIcon: React$1.FC<IconProps>;
declare const ThumbDownIcon: React$1.FC<IconProps>;
declare const ShareIcon: React$1.FC<IconProps>;
declare const CommentIcon: React$1.FC<IconProps>;
declare const SettingsIcon: React$1.FC<IconProps>;
declare const FullscreenIcon: React$1.FC<IconProps>;
declare const FullscreenExitIcon: React$1.FC<IconProps>;
declare const SearchIcon: React$1.FC<IconProps>;
declare const InfoIcon: React$1.FC<IconProps>;
declare const WarningIcon: React$1.FC<IconProps>;
declare const ErrorIcon: React$1.FC<IconProps>;
declare const SuccessIcon: React$1.FC<IconProps>;
declare const QuestionIcon: React$1.FC<IconProps>;
declare const ClockIcon: React$1.FC<IconProps>;
declare const TimerIcon: React$1.FC<IconProps>;
declare const CalendarIcon: React$1.FC<IconProps>;
declare const FolderIcon: React$1.FC<IconProps>;
declare const FileIcon: React$1.FC<IconProps>;
declare const FilmIcon: React$1.FC<IconProps>;
declare const SparkleIcon: React$1.FC<IconProps>;
declare const MagicWandIcon: React$1.FC<IconProps>;
declare const LightningIcon: React$1.FC<IconProps>;
declare const LayersIcon: React$1.FC<IconProps>;
declare const Icons: {
    Play: React$1.FC<IconProps>;
    Pause: React$1.FC<IconProps>;
    Stop: React$1.FC<IconProps>;
    SkipBack: React$1.FC<IconProps>;
    SkipForward: React$1.FC<IconProps>;
    Rewind: React$1.FC<IconProps>;
    FastForward: React$1.FC<IconProps>;
    Replay: React$1.FC<IconProps>;
    Shuffle: React$1.FC<IconProps>;
    Repeat: React$1.FC<IconProps>;
    VolumeHigh: React$1.FC<IconProps>;
    VolumeMedium: React$1.FC<IconProps>;
    VolumeLow: React$1.FC<IconProps>;
    VolumeMute: React$1.FC<IconProps>;
    ArrowLeft: React$1.FC<IconProps>;
    ArrowRight: React$1.FC<IconProps>;
    ArrowUp: React$1.FC<IconProps>;
    ArrowDown: React$1.FC<IconProps>;
    ChevronLeft: React$1.FC<IconProps>;
    ChevronRight: React$1.FC<IconProps>;
    ChevronUp: React$1.FC<IconProps>;
    ChevronDown: React$1.FC<IconProps>;
    Check: React$1.FC<IconProps>;
    Close: React$1.FC<IconProps>;
    Plus: React$1.FC<IconProps>;
    Minus: React$1.FC<IconProps>;
    Edit: React$1.FC<IconProps>;
    Delete: React$1.FC<IconProps>;
    Save: React$1.FC<IconProps>;
    Copy: React$1.FC<IconProps>;
    Download: React$1.FC<IconProps>;
    Upload: React$1.FC<IconProps>;
    Refresh: React$1.FC<IconProps>;
    Camera: React$1.FC<IconProps>;
    Video: React$1.FC<IconProps>;
    Image: React$1.FC<IconProps>;
    Music: React$1.FC<IconProps>;
    Mic: React$1.FC<IconProps>;
    Star: React$1.FC<IconProps>;
    StarOutline: React$1.FC<IconProps>;
    Heart: React$1.FC<IconProps>;
    HeartOutline: React$1.FC<IconProps>;
    ThumbUp: React$1.FC<IconProps>;
    ThumbDown: React$1.FC<IconProps>;
    Share: React$1.FC<IconProps>;
    Comment: React$1.FC<IconProps>;
    Settings: React$1.FC<IconProps>;
    Fullscreen: React$1.FC<IconProps>;
    FullscreenExit: React$1.FC<IconProps>;
    Search: React$1.FC<IconProps>;
    Info: React$1.FC<IconProps>;
    Warning: React$1.FC<IconProps>;
    Error: React$1.FC<IconProps>;
    Success: React$1.FC<IconProps>;
    Question: React$1.FC<IconProps>;
    Clock: React$1.FC<IconProps>;
    Timer: React$1.FC<IconProps>;
    Calendar: React$1.FC<IconProps>;
    Folder: React$1.FC<IconProps>;
    File: React$1.FC<IconProps>;
    Film: React$1.FC<IconProps>;
    Sparkle: React$1.FC<IconProps>;
    MagicWand: React$1.FC<IconProps>;
    Lightning: React$1.FC<IconProps>;
    Layers: React$1.FC<IconProps>;
};

export { AbsoluteFill, type AnimationTrack, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, Audio, type AudioProps$1 as AudioProps, Blur, Bounce, type CacheStats, CalendarIcon, CameraIcon, CanvasRenderer, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, Circle, ClockIcon, CloseIcon, CommentIcon, Composition, type CompositionManager, CompositionManagerProvider, type CompositionProps$1 as CompositionProps, Confetti, CopyIcon, Counter, Cube3D, DeleteIcon, AbsoluteFill as Div, DownloadIcon, Easing, type EasingFunction, EditIcon, ErrorIcon, type ExportOptions, type ExportResult, Fade, FastForwardIcon, FileIcon, FilmIcon, Flip3D, FolderIcon, FrameCache, type FrameContextValue, FrameProvider, FrameSequenceEncoder, Freeze, FullscreenExitIcon, FullscreenIcon, G, Glitch, GradientText, HeartIcon, HeartOutlineIcon, Highlight, Icons, ImageIcon, type ImageProps, Img, InfoIcon, type InterpolateOptions, type Keyframe, type LayerProps, LayersIcon, LetterByLetter, LightningIcon, Loop, MagicWandIcon, MaskReveal, MemoCache, MicIcon, MinusIcon, MusicIcon, NeonGlow, ParticleSystem, Path, PauseIcon, Perspective3D, PlayIcon, Player, PlayerComposition, type PlayerProps, PlayerProvider, PlusIcon, ProgressBar, Pulse, QuestionIcon, RainbowText, Rect, RefreshIcon, type RenderJob, RenderJobManager, type RenderProgress, RepeatIcon, ReplayIcon, Retiming, Reverse, RewindIcon, Rotate, Rotate3D, SVG, SaveIcon, Scale, SearchIcon, Sequence, type SequenceProps$1 as SequenceProps, Series, SettingsIcon, ShakeEffect, ShareIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, Slide, SparkleIcon, type SpringConfig, StarIcon, StarOutlineIcon, StopIcon, SuccessIcon, Swing, Text, type TextProps$1 as TextProps, ThumbDownIcon, ThumbUpIcon, type TimelineState, TimerIcon, Trail, type TransitionConfig, type TransitionName, Typewriter, UploadIcon, Video, type VideoConfig, VideoExportManager, VideoIcon, type VideoProps$1 as VideoProps, type VideoRendererConfig, VolumeHighIcon, VolumeLowIcon, VolumeMediumIcon, VolumeMuteIcon, WarningIcon, WaveText, WebMEncoder, WordByWord, blur, bounce, buildFFmpegCommand, calculateProgress, calculateVideoSize, checkEncodingSupport, combine, createDebouncedCache, createThrottledCache, downloadFrame, downloadVideo, Easing as easing, estimateFileSize, estimateRenderTime, fade, flash, flip, frameCache, frameToDataURL, generateFrames, getFramesFromSeconds, getSecondsFromFrames, glitch, interpolate, interpolateColors, measureSpring, noise2D, pulse as pulseTransition, random, range, renderCompositionToVideo, renderJobManager, renderVideo, rotate as rotateTransition, scale as scaleTransition, shake as shakeTransition, slide, slideWithFade, spring, staticFile, transitions, useAnimation, useAnimationValue, useBatchFrameProcessor, useCachedFrame, useComposition, useVideoConfig as useConfig, useCurrentFrame, useCycle, useDelay, useDurationInFrames, useFade, useFrameRange, useInterpolate, useKeyframeState, useKeyframes, useLoop, useMemoizedFrame, useOptimizedInterpolate, useOptimizedSpring, usePerformanceMonitor, usePrecomputeFrames, useProgress, usePulse, useRelativeCurrentFrame, useRenderPriority, useSequence, useShake, useSlide, useSpring, useThrottledFrame, useTimeline, useTimelineState, useTransform, useVideoConfig$1 as useVideoConfig, useWindowedFrame, validateRenderConfig, videoExportManager, wipe, zoom };
