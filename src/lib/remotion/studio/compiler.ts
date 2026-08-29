'use client';

/**
 * Forge Studio - In-Browser Code Compiler
 *
 * Takes a TSX string and evaluates it client-side for live preview.
 * Uses dynamic imports to avoid bloating the initial bundle.
 */

import React from 'react';

export interface CompileResult {
  success: boolean;
  component?: React.ComponentType<Record<string, unknown>>;
  error?: string;
}

export interface CompileOptions {
  /** External dependencies to inject into the evaluation scope */
  dependencies?: Record<string, unknown>;
}

// Cache compiled modules
const compiledCache = new Map<string, CompileResult>();

/**
 * Compile a TSX string into a renderable React component.
 * Uses Babel standalone for transpilation and new Function for evaluation.
 */
export async function compileCode(
  code: string,
  options: CompileOptions = {}
): Promise<CompileResult> {
  const cacheKey = code;
  if (compiledCache.has(cacheKey)) {
    return compiledCache.get(cacheKey)!;
  }

  try {
    // Dynamically load Babel standalone (only on client)
    const Babel = await loadBabel();

    // Transform JSX/TSX to JavaScript
    const transformed = Babel.transform(code, {
      presets: ['react', 'typescript'],
      filename: 'composition.tsx',
    }).code;

    if (!transformed) {
      return { success: false, error: 'Compilation produced no output' };
    }

    // Create evaluation scope with MotionForge imports
    const scope = {
      React,
      ...React,
      useState: React.useState,
      useEffect: React.useEffect,
      useRef: React.useRef,
      useMemo: React.useMemo,
      useCallback: React.useCallback,
      memo: React.memo,
      Fragment: React.Fragment,
      // MotionForge runtime (loaded dynamically)
      ...(await getMotionForgeRuntime()),
      // User-provided dependencies
      ...options.dependencies,
    };

    // Create a module factory
    const moduleExports: Record<string, unknown> = {};
    const moduleObj = { exports: moduleExports };

    const fnCode = `
      "use strict";
      ${Object.keys(scope)
        .map(
          (key) =>
            `var ${key} = arguments[0]["${key.replace(/"/g, '\\"')}"];`
        )
        .join('\n')}
      var exports = arguments[1];
      var module = arguments[2];
      
      ${transformed}
      
      // Support both default export and named exports
      if (module.exports && module.exports !== exports) {
        Object.assign(exports, module.exports);
      }
    `;

    const fn = new Function(fnCode);
    fn(scope, moduleExports, moduleObj);

    // Get the component (prefer default export, fall back to named)
    const result = moduleObj.exports;
    const Component =
      (result as any).default ||
      (result as any).MyComposition ||
      (result as any).Composition ||
      Object.values(result).find((v) => typeof v === 'function') as
        | React.ComponentType<Record<string, unknown>>
        | undefined;

    if (!Component) {
      return { success: false, error: 'No component found in the code' };
    }

    const compileResult: CompileResult = { success: true, component: Component };
    compiledCache.set(cacheKey, compileResult);
    return compileResult;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const result: CompileResult = { success: false, error: errorMsg };
    compiledCache.set(cacheKey, result);
    return result;
  }
}

/**
 * Clear the compilation cache
 */
export function clearCompileCache(): void {
  compiledCache.clear();
}

/**
 * Validate code without actually compiling it
 */
export function validateCode(code: string): { valid: boolean; error?: string } {
  try {
    // Check for basic JSX/TSX patterns
    if (code.includes('export default function') || code.includes('export default const')) {
      return { valid: true };
    }
    if (code.includes('export function') || code.includes('export const')) {
      return { valid: true };
    }
    return { valid: false, error: 'No default export found. Add "export default function MyComposition()" to your code.' };
  } catch {
    return { valid: false, error: 'Invalid code structure' };
  }
}

// Lazy-loaded Babel instance
let babelInstance: any = null;

async function loadBabel(): Promise<any> {
  if (babelInstance) return babelInstance;

  if (typeof window === 'undefined') {
    throw new Error('Babel can only be loaded in the browser');
  }

  // @ts-ignore - dynamic import
  const module = await import('https://unpkg.com/@babel/standalone@7/babel.min.js');
  babelInstance = (window as any).Babel || module.default;
  return babelInstance;
}

// Lazy-loaded MotionForge runtime
let motionforgeRuntime: Record<string, unknown> | null = null;

async function getMotionForgeRuntime(): Promise<Record<string, unknown>> {
  if (motionforgeRuntime) return motionforgeRuntime;

  // Import motionforge components and utilities
  try {
    const mod = await import('../index');
    motionforgeRuntime = {
      // Core
      useCurrentFrame: mod.useCurrentFrame,
      useVideoConfig: mod.useVideoConfig,
      AbsoluteFill: mod.AbsoluteFill,
      Sequence: mod.Sequence,
      Composition: mod.Composition,
      Player: mod.Player,

      // Effects
      Fade: mod.Fade,
      Scale: mod.Scale,
      Slide: mod.Slide,
      Rotate: mod.Rotate,
      Typewriter: mod.Typewriter,
      Glitch: mod.Glitch,
      Confetti: mod.Confetti,

      // Animation
      spring: mod.spring,
      interpolate: mod.interpolate,
      interpolateColors: mod.interpolateColors,
      Easing: mod.Easing,
      easing: mod.easing,

      // Transitions
      fade: mod.fade,
      slide: mod.slide,

      // Kinetic Text
      KineticTypography: mod.KineticTypography,
      LiquidText: mod.LiquidText,

      // Particle System
      ParticleSystem: mod.ParticleSystem,
    };
  } catch {
    // Fallback: empty runtime
    motionforgeRuntime = {};
  }

  return motionforgeRuntime!;
}

export default compileCode;
