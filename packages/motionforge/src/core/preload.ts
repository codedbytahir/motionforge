import { useState, useEffect } from 'react';

/**
 * Asset Preloading — Preload images, videos, and fonts before rendering.
 */

interface PreloadOptions {
  /** Preload N frames ahead of current frame */
  prefetchFrames?: number;
}

/**
 * Preload an image file. Returns a promise that resolves when the image is loaded.
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload a video file. Returns a promise that resolves when enough data is buffered.
 */
export function preloadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.oncanplaythrough = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to preload video: ${src}`));
    video.src = src;
  });
}

/**
 * Preload an audio file.
 */
export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = () => reject(new Error(`Failed to preload audio: ${src}`));
    audio.src = src;
  });
}

/**
 * Preload a font by family name. Uses the Font Loading API.
 */
export function preloadFont(fontFamily: string, options?: { weight?: string; style?: string }): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  return document.fonts.load(
    `${options?.weight ?? '400'} ${options?.style ?? 'normal'} 16px "${fontFamily}"`
  ).then(() => {});
}

/**
 * Preload multiple assets in parallel.
 */
export async function preloadAssets(assets: Array<{ type: 'image' | 'video' | 'audio' | 'font'; src: string; options?: Record<string, unknown> }>): Promise<void> {
  const promises = assets.map(asset => {
    switch (asset.type) {
      case 'image': return preloadImage(asset.src);
      case 'video': return preloadVideo(asset.src);
      case 'audio': return preloadAudio(asset.src);
      case 'font': return preloadFont(asset.src, asset.options as any);
      default: return Promise.resolve();
    }
  });
  await Promise.all(promises);
}

/**
 * Hook to preload assets when a composition mounts.
 */
export function usePreloadAssets(assets: Array<{ type: 'image' | 'video' | 'audio' | 'font'; src: string }>): { loaded: boolean } {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    preloadAssets(assets).then(() => setLoaded(true)).catch(console.error);
  }, [JSON.stringify(assets)]);

  return { loaded };
}
