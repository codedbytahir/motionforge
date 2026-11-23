// Transition effects for Remotion-like framework

import { EasingFunction } from '../core/types';
import { Easing } from './animation';

export interface TransitionConfig {
  durationInFrames: number;
  easing?: EasingFunction;
  startFrame?: number;
}

// Fade transition
export const fade = (progress: number): number => {
  return progress;
};

// Slide transition
export const slide = (
  progress: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
): { x: number; y: number } => {
  const eased = progress;
  const offset = (1 - eased) * 100;

  switch (direction) {
    case 'left':
      return { x: -offset, y: 0 };
    case 'right':
      return { x: offset, y: 0 };
    case 'up':
      return { x: 0, y: -offset };
    case 'down':
      return { x: 0, y: offset };
  }
};

// Scale transition
export const scale = (progress: number, from: number = 0, to: number = 1): number => {
  return from + (to - from) * progress;
};

// Rotate transition
export const rotate = (progress: number, degrees: number = 360): number => {
  return degrees * progress;
};

// Zoom transition (scale + fade)
export const zoom = (progress: number): { scale: number; opacity: number } => {
  return {
    scale: 0.5 + progress * 0.5,
    opacity: progress,
  };
};

// Wipe transition
export const wipe = (
  progress: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
): { clipPath: string } => {
  const pct = progress * 100;

  switch (direction) {
    case 'left':
      return { clipPath: `inset(0 ${100 - pct}% 0 0)` };
    case 'right':
      return { clipPath: `inset(0 0 0 ${100 - pct}%)` };
    case 'up':
      return { clipPath: `inset(0 0 ${100 - pct}% 0)` };
    case 'down':
      return { clipPath: `inset(${100 - pct}% 0 0 0)` };
  }
};

// Blur transition
export const blur = (progress: number, maxBlur: number = 20): { filter: string; opacity: number } => {
  return {
    filter: `blur(${maxBlur * (1 - progress)}px)`,
    opacity: progress,
  };
};

// Glitch effect
export const glitch = (frame: number, intensity: number = 10): { transform: string } => {
  const offset = Math.sin(frame * 0.5) * intensity;
  return {
    transform: `translate(${offset}px, ${offset * 0.5}px)`,
  };
};

// Shake effect
export const shake = (frame: number, intensity: number = 5): { transform: string } => {
  const x = Math.sin(frame * 0.8) * intensity;
  const y = Math.cos(frame * 1.2) * intensity;
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
};

// Pulse effect
export const pulse = (frame: number, minScale: number = 0.95, maxScale: number = 1.05): { transform: string } => {
  const scale = minScale + (Math.sin(frame * 0.1) + 1) / 2 * (maxScale - minScale);
  return {
    transform: `scale(${scale})`,
  };
};

// Bounce effect
export const bounce = (progress: number): number => {
  // Elastic bounce easing
  const c4 = (2 * Math.PI) / 3;
  return progress === 0
    ? 0
    : progress === 1
    ? 1
    : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
};

// Flash effect
export const flash = (
  progress: number,
  flashAt: number = 0.5
): { opacity: number; backgroundColor: string } => {
  const flashProgress = progress < flashAt
    ? progress / flashAt
    : (1 - progress) / (1 - flashAt);

  return {
    opacity: progress < flashAt ? 1 - flashProgress * 0.5 : 1,
    backgroundColor: progress < flashAt ? `rgba(255,255,255,${flashProgress * 0.3})` : 'transparent',
  };
};

// Slide with fade
export const slideWithFade = (
  progress: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
): { transform: string; opacity: number } => {
  const { x, y } = slide(progress, direction);
  return {
    transform: `translate(${x}%, ${y}%)`,
    opacity: progress,
  };
};

// Flip transition
export const flip = (
  progress: number,
  direction: 'horizontal' | 'vertical' = 'horizontal'
): { transform: string; opacity: number } => {
  const rotateValue = (1 - progress) * 90;
  const opacity = progress < 0.5 ? 1 - progress : progress;

  return {
    transform: direction === 'horizontal'
      ? `rotateY(${rotateValue}deg)`
      : `rotateX(${rotateValue}deg)`,
    opacity,
  };
};

// Combine multiple transitions
export const combine = (
  progress: number,
  ...transitions: ((p: number) => Record<string, unknown>)[]
): Record<string, unknown> => {
  return transitions.reduce((acc, transition) => ({
    ...acc,
    ...transition(progress),
  }), {});
};

// Preset transitions
export const transitions = {
  fade: {
    enter: (p: number) => ({ opacity: fade(p) }),
    exit: (p: number) => ({ opacity: fade(1 - p) }),
  },
  slideRight: {
    enter: (p: number) => ({ transform: `translateX(${100 - p * 100}%)` }),
    exit: (p: number) => ({ transform: `translateX(${p * -100}%)` }),
  },
  slideLeft: {
    enter: (p: number) => ({ transform: `translateX(${-100 + p * 100}%)` }),
    exit: (p: number) => ({ transform: `translateX(${p * 100}%)` }),
  },
  slideUp: {
    enter: (p: number) => ({ transform: `translateY(${100 - p * 100}%)` }),
    exit: (p: number) => ({ transform: `translateY(${p * -100}%)` }),
  },
  slideDown: {
    enter: (p: number) => ({ transform: `translateY(${-100 + p * 100}%)` }),
    exit: (p: number) => ({ transform: `translateY(${p * 100}%)` }),
  },
  scale: {
    enter: (p: number) => ({ transform: `scale(${scale(p, 0, 1)})` }),
    exit: (p: number) => ({ transform: `scale(${scale(1 - p, 1, 0)})` }),
  },
  zoom: {
    enter: (p: number) => {
      const { scale: s, opacity } = zoom(p);
      return { transform: `scale(${s})`, opacity };
    },
    exit: (p: number) => {
      const { scale: s, opacity } = zoom(1 - p);
      return { transform: `scale(${s})`, opacity };
    },
  },
  flipX: {
    enter: (p: number) => flip(p, 'vertical'),
    exit: (p: number) => flip(1 - p, 'vertical'),
  },
  flipY: {
    enter: (p: number) => flip(p, 'horizontal'),
    exit: (p: number) => flip(1 - p, 'horizontal'),
  },
};

export type TransitionName = keyof typeof transitions;
