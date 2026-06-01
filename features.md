# MotionForge Feature Roadmap & Implementation Guide

> **Version**: 1.4.0 → 2.0.0 Upgrade Path
> **Purpose**: Technical specification for AI coding agents to implement each feature in MotionForge
> **Convention**: Every feature includes exact file paths, function signatures, code snippets, test criteria, and integration points

---

## Table of Contents

1. [Feature Priority Matrix](#1-feature-priority-matrix)
2. [Feature F1: delayRender / continueRender Protocol](#2-feature-f1-delayrender--continuerender-protocol)
3. [Feature F2: Dynamic inputProps Injection](#3-feature-f2-dynamic-inputprops-injection)
4. [Feature F3: calculateMetadata — Async Composition Resolution](#4-feature-f3-calculatemetadata--async-composition-resolution)
5. [Feature F4: Server-Side Rendering with Puppeteer](#5-feature-f4-server-side-rendering-with-puppeteer)
6. [Feature F5: Concurrent Frame Rendering — Page Pool](#6-feature-f5-concurrent-frame-rendering--page-pool)
7. [Feature F6: FFmpeg Integration for Production Encoding](#7-feature-f6-ffmpeg-integration-for-production-encoding)
8. [Feature F7: Audio Export Pipeline](#8-feature-f7-audio-export-pipeline)
9. [Feature F8: Enhanced Interpolation System](#9-feature-f8-enhanced-interpolation-system)
10. [Feature F9: Spring Animation Upgrades](#10-feature-f9-spring-animation-upgrades)
11. [Feature F10: Tailwind-Compatible AbsoluteFill](#11-feature-f10-tailwind-compatible-absolutefill)
12. [Feature F11: Series with Offset Support](#12-feature-f11-series-with-offset-support)
13. [Feature F12: Still Component](#13-feature-f12-still-component)
14. [Feature F13: Freeze with Active Prop](#14-feature-f13-freeze-with-active-prop)
15. [Feature F14: Zod Schema Validation for Props](#15-feature-f14-zod-schema-validation-for-props)
16. [Feature F15: Player Event Emitter System](#16-feature-f15-player-event-emitter-system)
17. [Feature F16: Thumbnail Component](#17-feature-f16-thumbnail-component)
18. [Feature F17: Player Internals API](#18-feature-f17-player-internals-api)
19. [Feature F18: Responsive Player with ResizeObserver](#19-feature-f18-responsive-player-with-resizeobserver)
20. [Feature F19: HMR State Preservation](#20-feature-f19-hmr-state-preservation)
21. [Feature F20: Developer Studio UI](#21-feature-f20-developer-studio-ui)
22. [Feature F21: CLI — render, still, studio, compositions](#22-feature-f21-cli--render-still-studio-compositions)
23. [Feature F22: Project Bundler (Webpack + Rspack)](#23-feature-f22-project-bundler-webpack--rspack)
24. [Feature F23: Sequence Premounting](#23-feature-f23-sequence-premounting)
25. [Feature F24: Frame Persistence Across Reloads](#24-feature-f24-frame-persistence-across-reloads)
26. [Feature F25: Asset Preloading System](#25-feature-f25-asset-preloading-system)
27. [Documentation Plan](#documentation-plan)

---

## 1. Feature Priority Matrix

### Phase 1 — Quick Wins (1–2 weeks, modify existing files only)

| ID | Feature | Effort | Files Modified | Impact |
|----|---------|--------|----------------|--------|
| F1 | delayRender / continueRender | 1 day | New `core/delay-render.ts`, modify `renderer/export.ts` | Critical — fixes frame capture reliability |
| F2 | Dynamic inputProps injection | 1 day | New `core/input-props.ts`, modify `components/Composition.tsx` | High — enables parametrized rendering |
| F8 | Enhanced interpolation (wrap, per-segment easing, posterize) | 1 day | Modify `utils/animation.ts` | Medium — feature parity |
| F9 | Spring delay + reverse | 0.5 day | Modify `utils/animation.ts` | Medium — enables exit animations |
| F10 | Tailwind-compatible AbsoluteFill | 0.5 day | Modify `components/Media.tsx` | Medium — removes friction |
| F11 | Series with offset | 0.5 day | Modify `components/Sequence.tsx` | Medium — enables gaps/overlaps |
| F12 | Still component | 0.5 day | Modify `components/Composition.tsx` | Low — convenience |
| F13 | Freeze with active prop | 0.5 day | Modify `components/Sequence.tsx` | Low — conditional freeze |
| F19 | HMR state preservation | 0.5 day | Modify `core/context.tsx` | Medium — dev experience |

### Phase 2 — Core Upgrades (3–6 weeks, new packages and deep changes)

| ID | Feature | Effort | New Package | Impact |
|----|---------|--------|-------------|--------|
| F3 | calculateMetadata | 1 week | No | High — data-driven compositions |
| F4 | Server-side rendering (Puppeteer) | 2–3 weeks | `motionforge-renderer` | Critical — production rendering |
| F5 | Concurrent frame rendering | 1–2 weeks | Part of `motionforge-renderer` | High — 4–8x speedup |
| F6 | FFmpeg integration | 1–2 weeks | Part of `motionforge-renderer` | Critical — MP4/ProRes/GIF output |
| F7 | Audio export pipeline | 2–3 weeks | Part of `motionforge-renderer` | Critical — silent videos are unusable |
| F14 | Zod schema validation | 1 day | No | Medium — prop safety |
| F15 | Player event emitter | 2 days | No | Medium — observability |
| F16 | Thumbnail component | 1 day | No | Low — still previews |
| F17 | Player Internals API | 2 days | No | Medium — custom player UIs |
| F18 | Responsive Player (ResizeObserver) | 1 day | No | Medium — adaptive layout |
| F20 | Developer Studio UI | 3–4 weeks | `motionforge-studio` | High — dev experience |
| F21 | CLI | 1–2 weeks | `motionforge-cli` | High — command-line rendering |
| F22 | Project bundler | 2 weeks | `motionforge-bundler` | Medium — proper HMR + bundling |
| F23 | Sequence premounting | 1 week | No | Medium — audio preloading |
| F24 | Frame persistence (localStorage) | 0.5 day | No | Low — state across reloads |
| F25 | Asset preloading | 1 week | No | Medium — smooth playback |

---

## 2. Feature F1: delayRender / continueRender Protocol

### What It Does
Provides a synchronization mechanism between async operations (data fetching, image loading, font loading) and the frame capture process. Without this, the renderer captures frames using a fragile `setTimeout(20ms)` heuristic that breaks when async operations take longer.

### Current Code (BROKEN)
In `packages/motionforge/src/renderer/export.ts`, line ~410:
```typescript
// 2. Wait for React render and any effects
await new Promise(resolve => requestAnimationFrame(resolve));
await new Promise(resolve => setTimeout(resolve, 20));
```
This 20ms wait is a guess. If a component fetches data that takes 500ms, the frame is captured before the data arrives.

### Implementation

#### Step 1: Create `packages/motionforge/src/core/delay-render.ts`

```typescript
/**
 * delayRender / continueRender — Synchronization protocol for async operations
 * during video rendering.
 *
 * When delayRender() is called, the renderer waits before capturing the frame.
 * When continueRender() is called with the returned handle, the delay is lifted.
 * When ALL delays are cleared, the frame is considered ready for capture.
 */

const delayHandles: Set<number> = new Set();
let renderReady: boolean = true;

/**
 * Signal that an async operation is in progress and the renderer should wait
 * before capturing this frame.
 *
 * @param timeoutMessage - Message shown if continueRender is never called
 * @returns A handle that must be passed to continueRender()
 */
export function delayRender(timeoutMessage?: string): number {
  const handle = Math.random();
  delayHandles.add(handle);
  renderReady = false;

  if (typeof window !== 'undefined') {
    (window as any).__MOTIONFORGE_RENDER_READY = false;
  }

  // Safety timeout: if continueRender is never called within 30 seconds,
  // log an error so the render doesn't hang forever
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      if (delayHandles.has(handle)) {
        console.error(
          `[MotionForge] delayRender() was called but continueRender() was never called.` +
          (timeoutMessage ? `\n  Context: ${timeoutMessage}` : '') +
          `\n  Handle: ${handle}`
        );
      }
    }, 30000);
  }

  return handle;
}

/**
 * Signal that an async operation has completed and the renderer may proceed.
 *
 * @param handle - The handle returned by the corresponding delayRender() call
 */
export function continueRender(handle: number): void {
  delayHandles.delete(handle);
  if (delayHandles.size === 0) {
    renderReady = true;
    if (typeof window !== 'undefined') {
      (window as any).__MOTIONFORGE_RENDER_READY = true;
    }
  }
}

/**
 * Check if all delays have been cleared and the frame is ready for capture.
 * Used by the renderer to determine when to capture.
 */
export function isRenderReady(): boolean {
  return delayHandles.size === 0;
}

/**
 * Reset the render ready state. Called by the renderer at the start of each frame.
 */
export function resetRenderReady(): void {
  // Do NOT clear existing handles — they represent genuine in-flight operations.
  // Only reset the flag so the next frame's delayRender calls take effect.
  if (delayHandles.size > 0) {
    renderReady = false;
    if (typeof window !== 'undefined') {
      (window as any).__MOTIONFORGE_RENDER_READY = false;
    }
  }
}

/**
 * Get the number of pending delay handles (for debugging).
 */
export function getPendingDelayCount(): number {
  return delayHandles.size;
}

/**
 * Cancel all pending delays (used for cleanup on unmount).
 */
export function cancelAllDelays(): void {
  delayHandles.clear();
  renderReady = true;
  if (typeof window !== 'undefined') {
    (window as any).__MOTIONFORGE_RENDER_READY = true;
  }
}
```

#### Step 2: Modify `packages/motionforge/src/renderer/export.ts`

Replace the `exportVideo` method's frame capture logic. Find this block in `VideoExportManager.exportVideo()`:

```typescript
// 2. Wait for React render and any effects
await new Promise(resolve => requestAnimationFrame(resolve));
await new Promise(resolve => setTimeout(resolve, 20));
```

Replace with:

```typescript
// 2. Wait for React render and async operations to complete
await new Promise(resolve => requestAnimationFrame(resolve));
await waitForRenderReady(30000); // 30-second timeout
```

Add the `waitForRenderReady` function inside the file (before the class):

```typescript
/**
 * Wait for the delayRender/continueRender protocol to signal readiness.
 * Polls window.__MOTIONFORGE_RENDER_READY via requestAnimationFrame.
 * Falls back to a 20ms minimum wait if the protocol is not used.
 */
function waitForRenderReady(timeoutMs: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const minimumWait = 16; // At least one frame tick for React to call delayRender

    setTimeout(() => {
      const check = () => {
        // If no delayRender was called, consider the frame ready
        if (typeof window !== 'undefined' && (window as any).__MOTIONFORGE_RENDER_READY !== false) {
          resolve();
          return;
        }
        if (Date.now() - start > timeoutMs) {
          reject(new Error(
            `[MotionForge] Frame render timed out after ${timeoutMs}ms. ` +
            `A delayRender() was called but continueRender() was never called.`
          ));
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    }, minimumWait);
  });
}
```

#### Step 3: Export from `packages/motionforge/src/index.ts`

Add to the `// Core exports` section:

```typescript
export {
  delayRender,
  continueRender,
  isRenderReady,
  cancelAllDelays,
} from './core/delay-render';
```

#### Step 4: Export from `packages/motionforge/src/core/context.tsx`

No changes needed — `delayRender`/`continueRender` are standalone functions, not context-dependent.

### Usage Example (for documentation)

```tsx
import { delayRender, continueRender, useCurrentFrame, AbsoluteFill } from 'motionforge';

function DataDrivenComposition({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const handle = delayRender('Fetching data from API');
    fetch(apiUrl)
      .then(res => res.json())
      .then(json => {
        setData(json);
        continueRender(handle);
      })
      .catch(err => {
        console.error(err);
        continueRender(handle); // Must always call continueRender to avoid hanging
      });
  }, [apiUrl]);

  if (!data) return null;

  return (
    <AbsoluteFill>
      <h1>{data.title}</h1>
    </AbsoluteFill>
  );
}
```

### Test Criteria
1. A component that calls `delayRender()` followed by `continueRender()` after 200ms should render correctly (data visible in captured frame).
2. A component that calls `delayRender()` without `continueRender()` should cause the render to timeout after 30 seconds with a descriptive error.
3. Multiple concurrent `delayRender()` calls should all be resolved before the frame is captured.
4. A component that does NOT call `delayRender()` should render as fast as before (no regression).

---

## 3. Feature F2: Dynamic inputProps Injection

### What It Does
Allows different prop values at render time vs. preview time. Currently, `Composition` only accepts static `defaultProps`. With `inputProps`, a CLI command can pass `--props '{"name": "Alice"}'` and the composition receives those props at render time, overriding defaults.

### Current Code
In `packages/motionforge/src/components/Composition.tsx`, line ~83:
```typescript
<CompositionContext.Provider value={{ id, config: { width, height, fps, durationInFrames } }}>
  <FrameProvider fps={fps} durationInFrames={durationInFrames} width={width} height={height}>
    <Component {...defaultProps} />
  </FrameProvider>
</CompositionContext.Provider>
```

### Implementation

#### Step 1: Create `packages/motionforge/src/core/input-props.ts`

```typescript
/**
 * Input Props — Dynamic prop injection for MotionForge compositions.
 *
 * Input props are injected at render time (via CLI --props flag or API)
 * and override defaultProps. This enables parametrized video rendering
 * (e.g., rendering 100 personalized videos with different names).
 */

/**
 * Get the input props injected at render time.
 * In the browser, these are set via window.__MOTIONFORGE_INPUT_PROPS
 * before the composition renders.
 *
 * In server-side rendering, the Puppeteer page injects these via
 * page.evaluate() before navigating to each frame.
 */
export function getInputProps(): Record<string, unknown> {
  if (typeof window !== 'undefined' && (window as any).__MOTIONFORGE_INPUT_PROPS) {
    return (window as any).__MOTIONFORGE_INPUT_PROPS;
  }
  return {};
}

/**
 * Serialize input props for injection into the page.
 * Handles special types like Date, undefined, etc.
 */
export function serializeInputProps(props: Record<string, unknown>): string {
  return JSON.stringify(props, (_, value) => {
    if (value instanceof Date) {
      return { __mf_type: 'Date', value: value.toISOString() };
    }
    if (value === undefined) {
      return { __mf_type: 'undefined' };
    }
    return value;
  });
}

/**
 * Deserialize input props that were injected into the page.
 * Restores special types from their serialized form.
 */
export function deserializeInputProps(serialized: string): Record<string, unknown> {
  return JSON.parse(serialized, (_, value) => {
    if (value && typeof value === 'object' && value.__mf_type === 'Date') {
      return new Date(value.value);
    }
    if (value && typeof value === 'object' && value.__mf_type === 'undefined') {
      return undefined;
    }
    return value;
  });
}

/**
 * Merge defaultProps with inputProps.
 * inputProps take precedence over defaultProps.
 * Nested objects are shallow-merged (not deep-merged).
 */
export function resolveProps(
  defaultProps: Record<string, unknown>,
  inputProps: Record<string, unknown>
): Record<string, unknown> {
  return { ...defaultProps, ...inputProps };
}
```

#### Step 2: Modify `packages/motionforge/src/components/Composition.tsx`

Add `inputProps` prop to `CompositionProps` interface and merge with defaultProps:

```typescript
// In CompositionProps interface, add:
interface CompositionProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;  // NEW
  children?: ReactNode;
}
```

In the `Composition` component body, resolve props:

```typescript
export const Composition: React.FC<CompositionProps> = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames,
  defaultProps = {},
  inputProps,  // NEW
}) => {
  // Merge inputProps with defaultProps (inputProps takes precedence)
  const resolvedProps = inputProps
    ? { ...defaultProps, ...inputProps }
    : { ...defaultProps, ...getInputProps() }; // Fall back to window-injected props

  return (
    <CompositionContext.Provider value={{ id, config: { width, height, fps, durationInFrames } }}>
      <FrameProvider fps={fps} durationInFrames={durationInFrames} width={width} height={height}>
        <Component {...resolvedProps} />
      </FrameProvider>
    </CompositionContext.Provider>
  );
};
```

Add the import at the top:

```typescript
import { getInputProps, resolveProps } from '../core/input-props';
```

Apply the same change to `PlayerComposition`.

#### Step 3: Export from `packages/motionforge/src/index.ts`

```typescript
export {
  getInputProps,
  serializeInputProps,
  deserializeInputProps,
  resolveProps,
} from './core/input-props';
```

### Test Criteria
1. `Composition` with `defaultProps={{ name: 'World' }}` and `inputProps={{ name: 'Alice' }}` should pass `{ name: 'Alice' }` to the component.
2. `Composition` without explicit `inputProps` should fall back to `window.__MOTIONFORGE_INPUT_PROPS`.
3. `Composition` with neither should use only `defaultProps`.
4. Serialization round-trip: `deserializeInputProps(serializeInputProps({ date: new Date('2024-01-01') }))` should produce the same Date object.

---

## 4. Feature F3: calculateMetadata — Async Composition Resolution

### What It Does
Allows a `Composition` to dynamically determine its fps, dimensions, duration, and resolved props based on async operations (e.g., fetching the duration of an audio file from an API and setting `durationInFrames` accordingly).

### Implementation

#### Step 1: Modify `packages/motionforge/src/components/Composition.tsx`

Add `calculateMetadata` prop and async resolution logic:

```typescript
// Add to CompositionProps interface:
interface CalculateMetadataResult {
  fps?: number;
  width?: number;
  height?: number;
  durationInFrames?: number;
  props?: Record<string, unknown>;
}

interface CalculateMetadataOptions {
  defaultProps: Record<string, unknown>;
  abortSignal: AbortSignal;
}

interface CompositionProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;
  calculateMetadata?: (options: CalculateMetadataOptions) => Promise<CalculateMetadataResult>;  // NEW
  children?: ReactNode;
}
```

Rewrite the `Composition` component:

```typescript
export const Composition: React.FC<CompositionProps> = ({
  id,
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames: defaultDurationInFrames,
  defaultProps = {},
  inputProps,
  calculateMetadata,
}) => {
  const [resolvedConfig, setResolvedConfig] = useState({
    width,
    height,
    fps,
    durationInFrames: defaultDurationInFrames,
    props: inputProps ? { ...defaultProps, ...inputProps } : { ...defaultProps, ...getInputProps() },
  });
  const [isResolving, setIsResolving] = useState(!!calculateMetadata);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!calculateMetadata) return;

    const abortController = new AbortController();
    setIsResolving(true);
    setError(null);

    calculateMetadata({
      defaultProps: inputProps ? { ...defaultProps, ...inputProps } : defaultProps,
      abortSignal: abortController.signal,
    })
      .then(result => {
        if (abortController.signal.aborted) return;
        setResolvedConfig(prev => ({
          width: result.width ?? prev.width,
          height: result.height ?? prev.height,
          fps: result.fps ?? prev.fps,
          durationInFrames: result.durationInFrames ?? prev.durationInFrames,
          props: result.props ?? prev.props,
        }));
        setIsResolving(false);
      })
      .catch(err => {
        if (abortController.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsResolving(false);
      });

    return () => abortController.abort();
  }, [calculateMetadata, JSON.stringify(defaultProps), JSON.stringify(inputProps)]);

  if (isResolving) {
    return null; // Or a loading placeholder
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
        calculateMetadata error: {error.message}
      </div>
    );
  }

  const ResolvedComponent = Component;

  return (
    <CompositionContext.Provider
      value={{ id, config: { width: resolvedConfig.width, height: resolvedConfig.height, fps: resolvedConfig.fps, durationInFrames: resolvedConfig.durationInFrames } }}
    >
      <FrameProvider
        fps={resolvedConfig.fps}
        durationInFrames={resolvedConfig.durationInFrames}
        width={resolvedConfig.width}
        height={resolvedConfig.height}
      >
        <ResolvedComponent {...resolvedConfig.props} />
      </FrameProvider>
    </CompositionContext.Provider>
  );
};
```

### Test Criteria
1. `Composition` with `calculateMetadata` that returns `{ durationInFrames: 150 }` should render 150 frames.
2. If `calculateMetadata` throws, an error message should be displayed.
3. If `calculateMetadata` is undefined, the composition should use static props (no regression).
4. Aborting the `abortSignal` should cancel the metadata resolution without errors.

---

## 5. Feature F4: Server-Side Rendering with Puppeteer

### What It Does
Enables production video rendering on a server/CI without a browser UI. Launches headless Chrome, navigates to each frame URL, waits for the `delayRender`/`continueRender` handshake, captures a screenshot via Chrome DevTools Protocol, and feeds frames to FFmpeg.

### Implementation

#### Step 1: Create new package `packages/motionforge-renderer/`

```
packages/motionforge-renderer/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── render-media.ts       # Main render orchestration
    ├── render-frames.ts      # Frame capture loop with page pool
    ├── open-browser.ts       # Chrome launch with flags
    ├── screenshot.ts         # CDP screenshot capture
    ├── pool.ts               # Concurrent page pool
    ├── stitch-frames.ts      # FFmpeg video stitching
    ├── audio.ts              # Audio pipeline
    ├── ensure-ffmpeg.ts      # FFmpeg binary management
    └── types.ts              # Renderer-specific types
```

#### Step 2: `packages/motionforge-renderer/package.json`

```json
{
  "name": "@motionforge/renderer",
  "version": "1.0.0",
  "description": "Server-side rendering engine for MotionForge",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "puppeteer-core": "^24.0.0",
    "execa": "^9.0.0",
    "ws": "^8.20.0",
    "source-map": "^0.8.0-beta.0"
  },
  "peerDependencies": {
    "motionforge": ">=1.4.0"
  },
  "devDependencies": {
    "@types/ws": "^8.5.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### Step 3: `packages/motionforge-renderer/src/render-media.ts`

```typescript
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { Pool } from './pool.js';
import { ensureBrowser } from './open-browser.js';
import { screenshotTask } from './screenshot.js';
import { stitchFramesToVideo, type StitchOptions } from './stitch-frames.js';

export interface RenderMediaOptions {
  /** Path to the bundled composition entry point (index.html) */
  serveUrl: string;
  /** Composition ID to render */
  compositionId: string;
  /** Output file path */
  outputLocation: string;
  /** Video codec */
  codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores' | 'gif';
  /** Frame rate */
  fps: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Total number of frames */
  durationInFrames: number;
  /** Input props to inject */
  inputProps?: Record<string, unknown>;
  /** Number of concurrent browser pages (default: half CPU cores) */
  concurrency?: number;
  /** Frame range to render [start, end] */
  frameRange?: [number, number];
  /** CRF quality value */
  crf?: number;
  /** Pixel format */
  pixelFormat?: 'yuv420p' | 'yuv422p' | 'rgb24';
  /** Quality preset */
  quality?: 'low' | 'medium' | 'high';
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Abort signal */
  signal?: AbortSignal;
}

export interface RenderMediaResult {
  success: boolean;
  outputLocation: string;
  frameCount: number;
  durationMs: number;
  error?: string;
}

export async function renderMedia(options: RenderMediaOptions): Promise<RenderMediaResult> {
  const startTime = Date.now();
  const startFrame = options.frameRange?.[0] ?? 0;
  const endFrame = options.frameRange?.[1] ?? options.durationInFrames - 1;
  const totalFrames = endFrame - startFrame + 1;
  const concurrency = options.concurrency ?? Math.max(1, Math.floor(require('os').cpus().length / 2));

  let browser: Browser | null = null;

  try {
    // 1. Launch headless Chrome
    browser = await ensureBrowser();

    // 2. Create page pool
    const pages: Page[] = [];
    for (let i = 0; i < concurrency; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor: 1 });
      pages.push(page);
    }
    const pool = new Pool(pages);

    // 3. Render frames
    const frameBuffers: Buffer[] = new Array(totalFrames);
    let renderedCount = 0;

    const renderPromises = [];
    for (let frame = startFrame; frame <= endFrame; frame++) {
      renderPromises.push((async () => {
        const page = await pool.acquire();
        try {
          const url = `${options.serveUrl}?composition=${options.compositionId}&frame=${frame}`;

          await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

          // Inject input props
          if (options.inputProps) {
            await page.evaluate((props) => {
              (window as any).__MOTIONFORGE_INPUT_PROPS = props;
            }, options.inputProps);
          }

          // Wait for delayRender/continueRender protocol
          await page.waitForFunction(
            'window.__MOTIONFORGE_RENDER_READY !== false',
            { timeout: 30000 }
          );

          // Wait for fonts to load
          await page.evaluate(() => document.fonts.ready);

          // Capture screenshot via CDP
          const buffer = await screenshotTask(page, options.width, options.height);

          const index = frame - startFrame;
          frameBuffers[index] = buffer;
          renderedCount++;

          if (options.onProgress) {
            options.onProgress(renderedCount / totalFrames);
          }
        } finally {
          pool.release(page);
        }
      })());
    }

    await Promise.all(renderPromises);

    // 4. Stitch frames to video
    await stitchFramesToVideo({
      frameBuffers,
      outputPath: options.outputLocation,
      fps: options.fps,
      width: options.width,
      height: options.height,
      codec: options.codec,
      crf: options.crf,
      pixelFormat: options.pixelFormat,
      quality: options.quality,
    });

    // 5. Close pages and browser
    for (const page of pages) {
      await page.close();
    }

    return {
      success: true,
      outputLocation: options.outputLocation,
      frameCount: totalFrames,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      outputLocation: options.outputLocation,
      frameCount: 0,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

#### Step 4: `packages/motionforge-renderer/src/pool.ts`

```typescript
import type { Page } from 'puppeteer-core';

/**
 * Resource pool for concurrent frame rendering.
 * Manages a fixed set of browser pages and distributes them to render tasks.
 */
export class Pool {
  private resources: Page[];
  private waiters: Array<{ resolve: (page: Page) => void }> = [];

  constructor(pages: Page[]) {
    this.resources = [...pages];
  }

  /** Acquire a page from the pool. Waits if none are available. */
  async acquire(): Promise<Page> {
    if (this.resources.length > 0) {
      return this.resources.pop()!;
    }
    return new Promise<Page>((resolve) => {
      this.waiters.push({ resolve });
    });
  }

  /** Release a page back to the pool. */
  release(page: Page): void {
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;
      waiter.resolve(page);
    } else {
      this.resources.push(page);
    }
  }
}
```

#### Step 5: `packages/motionforge-renderer/src/screenshot.ts`

```typescript
import type { Page } from 'puppeteer-core';

/**
 * Capture a screenshot of the page using Chrome DevTools Protocol.
 * Uses CDP directly for maximum control and performance.
 */
export async function screenshotTask(
  page: Page,
  width: number,
  height: number
): Promise<Buffer> {
  const client = await page.createCDPSession();

  // Activate the page target
  await client.send('Target.activateTarget', {
    targetId: (page as any)._targetId,
  });

  // Capture screenshot
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width, height, scale: 1 },
    captureBeyondViewport: true,
    optimizeForSpeed: true,
  });

  await client.detach();

  return Buffer.from(result.data, 'base64');
}
```

#### Step 6: `packages/motionforge-renderer/src/open-browser.ts`

```typescript
import puppeteer, { type Browser } from 'puppeteer-core';
import { execa } from 'execa';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

let cachedBrowserPath: string | null = null;

/**
 * Ensure a Chrome binary is available and return its path.
 * Downloads a known-good version if not found.
 */
export async function ensureBrowserPath(): Promise<string> {
  if (cachedBrowserPath) return cachedBrowserPath;

  // Try to find an existing Chrome installation
  const candidates: string[] = [];

  if (os.platform() === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else if (os.platform() === 'linux') {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    );
  } else if (os.platform() === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    );
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cachedBrowserPath = candidate;
      return candidate;
    }
  }

  // Fall back to puppeteer's bundled browser download
  try {
    const { executablePath } = await import('puppeteer');
    cachedBrowserPath = executablePath();
    return cachedBrowserPath;
  } catch {
    throw new Error(
      'No Chrome/Chromium installation found. Install Chrome or set PUPPETEER_EXECUTABLE_PATH.'
    );
  }
}

/**
 * Launch a headless Chrome browser with optimized flags for video rendering.
 */
export async function ensureBrowser(): Promise<Browser> {
  const executablePath = await ensureBrowserPath();

  return puppeteer.launch({
    headless: 'new' as any,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu-shm-usage',
      '--mute-audio',
      '--disable-extensions',
      '--no-zygote',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
    ],
    userDataDir: path.join(os.tmpdir(), `motionforge-chrome-${Date.now()}`),
  });
}
```

#### Step 7: `packages/motionforge-renderer/src/index.ts`

```typescript
export { renderMedia, type RenderMediaOptions, type RenderMediaResult } from './render-media.js';
export { Pool } from './pool.js';
export { ensureBrowser, ensureBrowserPath } from './open-browser.js';
export { screenshotTask } from './screenshot.js';
export { stitchFramesToVideo, type StitchOptions } from './stitch-frames.js';
```

### Test Criteria
1. `renderMedia()` with a simple composition should produce a valid MP4 file.
2. The render should respect `concurrency` — opening N browser pages.
3. `delayRender`/`continueRender` protocol should be respected (frame not captured until ready).
4. If the browser crashes, a descriptive error should be returned.
5. Frame range `[10, 20]` should only render frames 10 through 20.

---

## 6. Feature F5: Concurrent Frame Rendering — Page Pool

### What It Does
Already implemented as part of Feature F4. The `Pool` class in `packages/motionforge-renderer/src/pool.ts` manages a fixed set of browser pages and distributes them to concurrent render tasks.

### Browser-Side Concurrency (Optional Enhancement)

For browser-client-side rendering, add a Web Worker pool:

#### Create `packages/motionforge/src/renderer/worker-pool.ts`

```typescript
/**
 * Web Worker pool for concurrent browser-side frame rendering.
 * Uses OffscreenCanvas to render frames in parallel.
 */

interface WorkerTask {
  frame: number;
  resolve: (data: ImageData) => void;
  reject: (error: Error) => void;
}

interface WorkerWrapper {
  worker: Worker;
  busy: boolean;
}

export class RenderWorkerPool {
  private workers: WorkerWrapper[] = [];
  private queue: WorkerTask[] = [];

  constructor(workerCount: number = Math.min(navigator.hardwareConcurrency ?? 4, 8)) {
    for (let i = 0; i < workerCount; i++) {
      this.workers.push({
        worker: new Worker(
          URL.createObjectURL(new Blob([`
            self.onmessage = function(e) {
              const { frame, width, height } = e.data;
              // Create OffscreenCanvas and render frame
              const canvas = new OffscreenCanvas(width, height);
              const ctx = canvas.getContext('2d');
              // ... frame rendering logic ...
              const imageData = ctx.getImageData(0, 0, width, height);
              self.postMessage({ frame, imageData }, [imageData.data.buffer]);
            };
          `], { type: 'application/javascript' }))
        ),
        busy: false,
      });
    }
  }

  async renderFrame(frame: number, width: number, height: number): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const available = this.workers.find(w => !w.busy);
      if (available) {
        this.dispatchToWorker(available, frame, width, height, resolve, reject);
      } else {
        this.queue.push({ frame, resolve, reject });
      }
    });
  }

  private dispatchToWorker(
    wrapper: WorkerWrapper,
    frame: number,
    width: number,
    height: number,
    resolve: (data: ImageData) => void,
    reject: (error: Error) => void
  ): void {
    wrapper.busy = true;
    wrapper.worker.onmessage = (e) => {
      wrapper.busy = false;
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        this.dispatchToWorker(wrapper, next.frame, width, height, next.resolve, next.reject);
      }
      resolve(e.data.imageData);
    };
    wrapper.worker.onerror = (e) => {
      wrapper.busy = false;
      reject(new Error(e.message));
    };
    wrapper.worker.postMessage({ frame, width, height });
  }

  terminate(): void {
    for (const wrapper of this.workers) {
      wrapper.worker.terminate();
    }
  }
}
```

### Test Criteria
1. Server-side: Rendering 90 frames with concurrency=4 should use 4 browser pages simultaneously.
2. Browser-side: `RenderWorkerPool` with 4 workers should process frames 4x faster than sequential.
3. Frame ordering must be preserved in the output regardless of completion order.

---

## 7. Feature F6: FFmpeg Integration for Production Encoding

### What It Does
Executes FFmpeg as a child process to encode video from frame images. Supports H.264, H.265, VP8, VP9, ProRes, GIF output. Can pipe frames directly to FFmpeg stdin for parallel encoding (eliminating disk I/O).

### Implementation

#### Step 1: `packages/motionforge-renderer/src/stitch-frames.ts`

```typescript
import { execa, type ResultPromise } from 'execa';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface StitchOptions {
  /** Array of PNG frame buffers (in order) */
  frameBuffers?: Buffer[];
  /** Path pattern for frame images on disk (alternative to frameBuffers) */
  inputPattern?: string;
  /** Output file path */
  outputPath: string;
  /** Frames per second */
  fps: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Video codec */
  codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores' | 'gif';
  /** CRF quality value (default: codec-specific) */
  crf?: number;
  /** Pixel format */
  pixelFormat?: 'yuv420p' | 'yuv422p' | 'rgb24';
  /** Quality preset */
  quality?: 'low' | 'medium' | 'high';
  /** Path to audio file to include */
  audioPath?: string;
  /** Progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * Stitch frame images into a video file using FFmpeg.
 */
export async function stitchFramesToVideo(options: StitchOptions): Promise<string> {
  const args: string[] = ['-y'];

  // Input source
  if (options.frameBuffers) {
    // Pipe frames directly via stdin (parallel encoding)
    args.push(
      '-f', 'image2pipe',
      '-s', `${options.width}x${options.height}`,
      '-pix_fmt', 'rgba',
      '-r', String(options.fps),
      '-i', 'pipe:0'
    );
  } else if (options.inputPattern) {
    // Read frame images from disk
    args.push(
      '-framerate', String(options.fps),
      '-i', options.inputPattern
    );
  } else {
    throw new Error('Must provide either frameBuffers or inputPattern');
  }

  // Audio input
  if (options.audioPath && fs.existsSync(options.audioPath)) {
    args.push('-i', options.audioPath, '-c:a', 'aac', '-b:a', '192k');
  }

  // Codec-specific arguments
  switch (options.codec) {
    case 'h264':
      args.push('-c:v', 'libx264');
      args.push('-crf', String(options.crf ?? 18));
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      args.push('-preset', options.quality === 'high' ? 'slow' : options.quality === 'low' ? 'ultrafast' : 'medium');
      args.push('-movflags', 'faststart');
      break;
    case 'h265':
      args.push('-c:v', 'libx265');
      args.push('-crf', String(options.crf ?? 22));
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      args.push('-preset', options.quality === 'high' ? 'slow' : options.quality === 'low' ? 'ultrafast' : 'medium');
      args.push('-movflags', 'faststart');
      break;
    case 'vp8':
      args.push('-c:v', 'libvpx');
      args.push('-crf', String(options.crf ?? 10));
      args.push('-b:v', '0');
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      break;
    case 'vp9':
      args.push('-c:v', 'libvpx-vp9');
      args.push('-crf', String(options.crf ?? 30));
      args.push('-b:v', '0');
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv420p');
      break;
    case 'prores':
      args.push('-c:v', 'prores_ks');
      args.push('-profile:v', '3'); // ProRes 4444
      args.push('-pix_fmt', options.pixelFormat ?? 'yuv422p');
      break;
    case 'gif':
      args.push(
        '-filter_complex',
        `[0:v] fps=${Math.min(options.fps, 15)},split [a][b];[a] palettegen [p];[b][p] paletteuse`
      );
      break;
  }

  // Color space metadata
  if (options.codec !== 'gif') {
    args.push('-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709');
  }

  args.push(options.outputPath);

  // Execute FFmpeg
  if (options.frameBuffers) {
    // Pipe mode — write frames to stdin
    const ffmpegProcess = execa('ffmpeg', args, { stdin: 'pipe', reject: false });

    for (const buffer of options.frameBuffers) {
      ffmpegProcess.stdin!.write(buffer);
    }
    ffmpegProcess.stdin!.end();

    const result = await ffmpegProcess;
    if (result.exitCode !== 0) {
      throw new Error(`FFmpeg failed (exit ${result.exitCode}): ${result.stderr}`);
    }
  } else {
    // File mode — just execute
    const result = await execa('ffmpeg', args, { reject: false });
    if (result.exitCode !== 0) {
      throw new Error(`FFmpeg failed (exit ${result.exitCode}): ${result.stderr}`);
    }
  }

  return options.outputPath;
}
```

#### Step 2: `packages/motionforge-renderer/src/ensure-ffmpeg.ts`

```typescript
import { execa } from 'execa';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

let cachedFfmpegPath: string | null = null;

/**
 * Ensure FFmpeg is available. Returns the path to the FFmpeg binary.
 * Checks PATH first, then common install locations.
 */
export async function ensureFfmpeg(): Promise<string> {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  // Try PATH
  try {
    await execa('ffmpeg', ['-version'], { reject: true });
    cachedFfmpegPath = 'ffmpeg';
    return 'ffmpeg';
  } catch {
    // Not in PATH
  }

  // Check common locations
  const candidates: string[] = [];
  if (os.platform() === 'darwin') {
    candidates.push('/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg');
  } else if (os.platform() === 'linux') {
    candidates.push('/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg');
  } else if (os.platform() === 'win32') {
    candidates.push('C:\\ffmpeg\\bin\\ffmpeg.exe');
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cachedFfmpegPath = candidate;
      return candidate;
    }
  }

  throw new Error(
    'FFmpeg not found. Install FFmpeg and add it to your PATH.\n' +
    '  macOS:   brew install ffmpeg\n' +
    '  Ubuntu:  sudo apt install ffmpeg\n' +
    '  Windows: Download from https://ffmpeg.org/download.html'
  );
}
```

### Test Criteria
1. `stitchFramesToVideo()` with `codec: 'h264'` should produce a valid MP4 file playable in VLC.
2. `codec: 'gif'` should produce an animated GIF.
3. Pipe mode (`frameBuffers`) should produce the same quality output as file mode (`inputPattern`).
4. Missing FFmpeg should produce a clear installation instruction error.

---

## 8. Feature F7: Audio Export Pipeline

### What It Does
Captures audio from `<audio>` and `<video>` elements during rendering, processes each track (trimming, volume envelope, playback rate), mixes all tracks together, and encodes to the target format. This makes exported videos audible.

### Implementation

#### Step 1: Create `packages/motionforge-renderer/src/audio.ts`

```typescript
import { execa } from 'execa';
import * as path from 'path';
import * as fs from 'fs';

export interface AudioAsset {
  id: string;
  src: string;
  startInVideo: number;     // Frame where audio starts
  duration: number;          // Number of frames
  volume: number[];          // Per-frame volume values (0-1)
  playbackRate: number;
  trimLeft: number;          // Starting position in audio (in frames)
}

/**
 * Create an audio track from all assets found during frame rendering.
 * Returns the path to the final mixed audio file.
 */
export async function createAudio(
  assets: AudioAsset[],
  fps: number,
  outputDir: string,
  targetCodec: 'aac' | 'mp3' | 'flac' | 'wav' = 'aac'
): Promise<string | null> {
  if (assets.length === 0) return null;

  // Step 1: Preprocess each track
  const processedTracks: string[] = [];
  for (const asset of assets) {
    const trackPath = await preprocessAudioTrack(asset, fps, outputDir);
    processedTracks.push(trackPath);
  }

  // Step 2: Mix all tracks into a single WAV
  const mixedPath = path.join(outputDir, 'audio-mixed.wav');
  await mergeAudioTracks(processedTracks, mixedPath);

  // Step 3: Compress to target codec
  const outputPath = path.join(outputDir, `audio-final.${getExtension(targetCodec)}`);
  await compressAudio(mixedPath, outputPath, targetCodec);

  // Cleanup intermediate files
  for (const track of processedTracks) {
    if (fs.existsSync(track)) fs.unlinkSync(track);
  }
  if (fs.existsSync(mixedPath)) fs.unlinkSync(mixedPath);

  return outputPath;
}

async function preprocessAudioTrack(
  asset: AudioAsset,
  fps: number,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, `track-${asset.id}.wav`);

  // Build FFmpeg volume filter with per-frame volume values
  // Optimization: downsample volume curves to keyframes
  const volumeKeyframes = downsampleVolumeCurve(asset.volume, fps);
  const volumeFilter = volumeKeyframes
    .map(({ time, volume }) => `volume=${volume.toFixed(4)}:t=${time.toFixed(4)}`)
    .join(',');

  const trimStartSeconds = asset.trimLeft / fps;
  const durationSeconds = asset.duration / fps;

  const args: string[] = [
    '-i', asset.src,
    '-ss', String(trimStartSeconds),
    '-t', String(durationSeconds),
    '-af', volumeFilter + (asset.playbackRate !== 1 ? `,atempo=${asset.playbackRate}` : ''),
    '-ar', '48000',
    '-ac', '2',
    outputPath,
    '-y',
  ];

  await execa('ffmpeg', args);
  return outputPath;
}

/**
 * Downsample per-frame volume array to keyframes.
 * Reduces FFmpeg filter complexity from O(frames) to O(changes).
 */
function downsampleVolumeCurve(
  volume: number[],
  fps: number,
  threshold: number = 0.01
): Array<{ time: number; volume: number }> {
  if (volume.length === 0) return [];

  const keyframes: Array<{ time: number; volume: number }> = [];
  keyframes.push({ time: 0, volume: volume[0] });

  for (let i = 1; i < volume.length; i++) {
    if (Math.abs(volume[i] - volume[i - 1]) > threshold) {
      keyframes.push({ time: i / fps, volume: volume[i] });
    }
  }

  return keyframes;
}

async function mergeAudioTracks(trackPaths: string[], outputPath: string): Promise<void> {
  if (trackPaths.length === 1) {
    fs.copyFileSync(trackPaths[0], outputPath);
    return;
  }

  const args: string[] = [];
  for (const track of trackPaths) {
    args.push('-i', track);
  }

  // Use amerge filter to mix all tracks
  const filterParts = trackPaths.map((_, i) => `[${i}:a]`).join('');
  args.push('-filter_complex', `${filterParts}amix=inputs=${trackPaths.length}:duration=longest[out]`);
  args.push('-map', '[out]');
  args.push('-ar', '48000');
  args.push('-ac', '2');
  args.push(outputPath, '-y');

  await execa('ffmpeg', args);
}

async function compressAudio(
  inputPath: string,
  outputPath: string,
  codec: string
): Promise<void> {
  const codecArgs: Record<string, string[]> = {
    aac: ['-c:a', 'aac', '-b:a', '192k'],
    mp3: ['-c:a', 'libmp3lame', '-b:a', '192k'],
    flac: ['-c:a', 'flac'],
    wav: ['-c:a', 'pcm_s16le'],
  };

  const args = ['-i', inputPath, ...(codecArgs[codec] ?? codecArgs.aac), outputPath, '-y'];
  await execa('ffmpeg', args);
}

function getExtension(codec: string): string {
  const map: Record<string, string> = { aac: 'm4a', mp3: 'mp3', flac: 'flac', wav: 'wav' };
  return map[codec] ?? 'm4a';
}
```

#### Step 2: Add Asset Tracker for Browser-Side Rendering

Create `packages/motionforge/src/renderer/asset-tracker.ts`:

```typescript
/**
 * Tracks audio/video assets active during each frame of browser-side rendering.
 * Used to generate audio for the exported video.
 */

export interface TrackedAudioAsset {
  id: string;
  src: string;
  startInVideo: number;
  duration: number;
  volume: number[];
  playbackRate: number;
  trimLeft: number;
}

export class AssetTracker {
  private prevFrameAssets: Map<string, { volume: number; time: number; playbackRate: number }> = new Map();
  private currentFrameAssets: Map<string, { volume: number; time: number; playbackRate: number }> = new Map();
  private completedAssets: TrackedAudioAsset[] = [];
  private frameIndex: number = 0;

  /**
   * Process a frame — identify active audio/video elements and track their state.
   */
  processFrame(containerElement: HTMLElement, currentFrame: number, fps: number): void {
    this.frameIndex = currentFrame;
    this.prevFrameAssets = new Map(this.currentFrameAssets);
    this.currentFrameAssets.clear();

    // Find all audio and video elements in the composition
    const mediaElements = containerElement.querySelectorAll('audio, video');

    for (const el of mediaElements) {
      const mediaEl = el as HTMLAudioElement | HTMLVideoElement;
      const src = mediaEl.src || (mediaEl.querySelector('source') as HTMLSourceElement)?.src || '';
      if (!src) continue;

      const id = this.getElementId(mediaEl);
      const volume = typeof (mediaEl as any).volume === 'number' ? mediaEl.volume : 1;
      const currentTime = mediaEl.currentTime;
      const playbackRate = mediaEl.playbackRate;

      this.currentFrameAssets.set(id, { volume, time: currentTime, playbackRate });

      // If this asset was not in the previous frame, it just started
      if (!this.prevFrameAssets.has(id)) {
        // Asset appeared — start tracking
        this.completedAssets.push({
          id,
          src,
          startInVideo: currentFrame,
          duration: 0, // Will be updated
          volume: [volume],
          playbackRate,
          trimLeft: Math.round(currentTime * fps),
        });
      } else {
        // Asset continues — update volume tracking
        const existing = this.findAsset(id);
        if (existing) {
          existing.volume.push(volume);
        }
      }
    }

    // Check for assets that disappeared
    for (const [id, prevAsset] of this.prevFrameAssets) {
      if (!this.currentFrameAssets.has(id)) {
        const existing = this.findAsset(id);
        if (existing && existing.duration === 0) {
          existing.duration = currentFrame - existing.startInVideo;
        }
      }
    }
  }

  /**
   * Finalize tracking — close any still-active assets.
   */
  finalize(totalFrames: number): void {
    for (const asset of this.completedAssets) {
      if (asset.duration === 0) {
        asset.duration = totalFrames - asset.startInVideo;
      }
    }
  }

  /**
   * Get all tracked audio assets.
   */
  getAudioAssets(): TrackedAudioAsset[] {
    return this.completedAssets;
  }

  private getElementId(el: Element): string {
    return el.id || el.getAttribute('src') || Math.random().toString(36).slice(2);
  }

  private findAsset(id: string): TrackedAudioAsset | undefined {
    return this.completedAssets.find(a => a.id === id);
  }
}
```

#### Step 3: Integrate Asset Tracker into `VideoExportManager`

In `packages/motionforge/src/renderer/export.ts`, modify `exportVideo()`:

```typescript
import { AssetTracker, type TrackedAudioAsset } from './asset-tracker';

// Inside exportVideo(), before the frame loop:
const assetTracker = new AssetTracker();

// Inside the frame loop, after setFrame(frame):
assetTracker.processFrame(element, frame, config.fps);

// After the frame loop, before encoding:
assetTracker.finalize(config.durationInFrames);
const audioAssets = assetTracker.getAudioAssets();
// Return audioAssets as part of ExportResult for server-side audio processing
```

### Test Criteria
1. A composition with a single `<Audio>` element should produce a video with audible audio.
2. Volume function `(frame) => frame < 30 ? 0 : 1` should produce silence for the first second, then full volume.
3. Multiple overlapping audio tracks should be mixed correctly.
4. Audio sync should be within ±1 frame of the video.

---

## 9. Feature F8: Enhanced Interpolation System

### What It Does
Adds three missing interpolation features: `wrap` extrapolation mode (cyclic interpolation), per-segment easing (different easing per keyframe segment), and `posterize` option (stepped/staircase animation).

### Current Code
In `packages/motionforge/src/utils/animation.ts`, the `interpolate` function supports `clamp`, `extend`, `identity` extrapolation but NOT `wrap`. It accepts a single `easing` function, not an array.

### Implementation

#### Modify `packages/motionforge/src/utils/animation.ts`

Find the `interpolate` function (starts around line 220) and replace it entirely:

```typescript
export interface InterpolateOptions {
  extrapolateLeft?: 'clamp' | 'extend' | 'identity' | 'wrap';
  extrapolateRight?: 'clamp' | 'extend' | 'identity' | 'wrap';
  easing?: EasingFunction | EasingFunction[];  // NEW: support array
  posterize?: number;  // NEW: step size for quantization
}

export const interpolate = (
  input: number,
  inputRange: number[],
  outputRange: number[],
  options: InterpolateOptions = {}
): number => {
  const {
    extrapolateLeft = 'clamp',
    extrapolateRight = 'clamp',
    easing,
    posterize,
  } = options;

  if (inputRange.length !== outputRange.length) {
    throw new Error('inputRange and outputRange must have the same length');
  }

  if (inputRange.length < 2) {
    throw new Error('inputRange must have at least 2 elements');
  }

  // Apply posterization (quantize input)
  let posterizedInput = input;
  if (posterize !== undefined && posterize > 0) {
    posterizedInput = Math.floor(input / posterize) * posterize;
  }

  // Handle extrapolation left
  if (posterizedInput < inputRange[0]) {
    if (extrapolateLeft === 'clamp') {
      return outputRange[0];
    } else if (extrapolateLeft === 'identity') {
      return posterizedInput;
    } else if (extrapolateLeft === 'wrap') {
      const rangeWidth = inputRange[inputRange.length - 1] - inputRange[0];
      const offset = ((posterizedInput - inputRange[0]) % rangeWidth + rangeWidth) % rangeWidth;
      return interpolate(inputRange[0] + offset, inputRange, outputRange, {
        ...options,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
    // 'extend' — fall through to segment calculation
  }

  // Handle extrapolation right
  if (posterizedInput > inputRange[inputRange.length - 1]) {
    if (extrapolateRight === 'clamp') {
      return outputRange[outputRange.length - 1];
    } else if (extrapolateRight === 'identity') {
      return posterizedInput;
    } else if (extrapolateRight === 'wrap') {
      const rangeWidth = inputRange[inputRange.length - 1] - inputRange[0];
      const offset = ((posterizedInput - inputRange[0]) % rangeWidth + rangeWidth) % rangeWidth;
      return interpolate(inputRange[0] + offset, inputRange, outputRange, {
        ...options,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
    // 'extend' — fall through to segment calculation
  }

  // Find the segment
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (posterizedInput <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const outputStart = outputRange[segmentIndex];
  const outputEnd = outputRange[segmentIndex + 1];

  // Calculate progress
  let progress = (posterizedInput - inputStart) / (inputEnd - inputStart);

  // Apply per-segment easing
  if (easing) {
    if (Array.isArray(easing)) {
      // Per-segment easing: use the easing function for this segment
      const segmentEasing = segmentIndex < easing.length ? easing[segmentIndex] : easing[easing.length - 1];
      if (segmentEasing) {
        progress = segmentEasing(progress);
      }
    } else {
      // Single easing function applied to all segments
      progress = easing(progress);
    }
  }

  return outputStart + progress * (outputEnd - outputStart);
};
```

Also update the `InterpolateOptions` type in `packages/motionforge/src/core/types.ts` to match.

### Test Criteria
1. `interpolate(45, [0, 30, 60], [0, 100, 200], { extrapolateRight: 'wrap' })` should cycle back into the range.
2. `interpolate(15, [0, 30], [0, 100], { easing: [Easing.easeInQuad, Easing.easeOutQuad] })` should apply `easeInQuad` to the first segment.
3. `interpolate(15, [0, 30], [0, 100], { posterize: 10 })` should quantize the input to `10`, producing a stepped value.

---

## 10. Feature F9: Spring Animation Upgrades

### What It Does
Adds `delay` and `reverse` parameters to the `spring()` function, enabling spring-based exit animations and delayed spring starts.

### Current Code
In `packages/motionforge/src/utils/animation.ts`, the `spring` function signature:
```typescript
export const spring = ({
  frame, fps, config = {}, from = 0, to = 1, durationInFrames, durationRestThreshold = 0.005,
}: SpringConfig): number => {
```

### Implementation

#### Modify `packages/motionforge/src/utils/animation.ts`

Find the `spring` function and update the `SpringConfig` type and function body:

First, update the type in `packages/motionforge/src/core/types.ts`:

```typescript
export interface SpringConfig {
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
  delay?: number;    // NEW: frames to wait before starting the spring
  reverse?: boolean; // NEW: play the spring animation in reverse
}
```

Then update the `spring` function:

```typescript
export const spring = ({
  frame,
  fps,
  config = {},
  from = 0,
  to = 1,
  durationInFrames,
  durationRestThreshold = 0.005,
  delay = 0,       // NEW
  reverse = false,  // NEW
}: SpringConfig): number => {
  const {
    damping = 10,
    mass = 1,
    stiffness = 100,
    overshootClamping = false,
  } = config;

  // Apply delay: return `from` value during delay frames
  if (frame < delay) {
    return reverse ? to : from;
  }

  // Calculate effective frame (after delay)
  const effectiveFrame = frame - delay;

  // Calculate natural frequency and damping ratio
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  // Calculate duration if not provided
  const actualDuration = durationInFrames ?? Math.ceil(fps * 2);

  // Normalize time
  const t = Math.min(effectiveFrame / actualDuration, 1);
  const time = t * actualDuration / fps;

  let value: number;

  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value = 1 - Math.exp(-zeta * omega * time) * (
      Math.cos(omegaD * time) + (zeta * omega / omegaD) * Math.sin(omegaD * time)
    );
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

  // Apply reverse: swap from/to and invert the value
  if (reverse) {
    return to + (from - to) * value;
  }

  return from + (to - from) * value;
};
```

### Test Criteria
1. `spring({ frame: 5, fps: 30, delay: 10 })` should return `0` (the `from` value) for frames 0–9.
2. `spring({ frame: 15, fps: 30, delay: 10 })` should start the spring animation from frame 10.
3. `spring({ frame: 15, fps: 30, reverse: true })` should animate from `to` to `from` (exit animation).

---

## 11. Feature F10: Tailwind-Compatible AbsoluteFill

### What It Does
Detects Tailwind CSS utility classes in the `className` prop and conditionally omits the corresponding inline CSS property to avoid conflicts. This allows `className="w-1/2"` to work without `!important` hacks.

### Current Code
In `packages/motionforge/src/components/Media.tsx`, line ~20:
```typescript
export const AbsoluteFill: React.FC<AbsoluteFillProps> = ({ children, style, className }) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
```

### Implementation

Replace the `AbsoluteFill` component in `packages/motionforge/src/components/Media.tsx`:

```typescript
/**
 * Mapping of Tailwind CSS class prefixes to the inline CSS properties they control.
 * If a className contains a prefix from this map, the corresponding inline style is omitted.
 */
const TAILWIND_CLASS_CONFLICTS: Record<string, string[]> = {
  // Position properties
  'top-': ['top'],
  'left-': ['left'],
  'right-': ['right'],
  'bottom-': ['bottom'],
  'inset-': ['top', 'left', 'right', 'bottom'],
  // Size properties
  'w-': ['width'],
  'h-': ['height'],
  'size-': ['width', 'height'],
  // Display properties
  'flex': ['display'],
  'grid': ['display'],
  'block': ['display'],
  'inline': ['display'],
  'hidden': ['display'],
  // Flex direction
  'flex-col': ['flexDirection'],
  'flex-row': ['flexDirection'],
  'flex-wrap': ['flexWrap'],
  // Alignment
  'items-': ['alignItems'],
  'justify-': ['justifyContent'],
  'self-': ['alignSelf'],
  'place-': ['placeItems', 'placeContent'],
};

/**
 * Check if a className token conflicts with a specific CSS property.
 * Parses the className into individual tokens and checks against the prefix map.
 */
function shouldOmitStyleProperty(classNameTokens: string[], cssProperty: string): boolean {
  for (const token of classNameTokens) {
    for (const [prefix, properties] of Object.entries(TAILWIND_CLASS_CONFLICTS)) {
      if (token.startsWith(prefix) && properties.includes(cssProperty)) {
        return true;
      }
    }
  }
  return false;
}

export const AbsoluteFill: React.FC<AbsoluteFillProps> = ({
  children,
  style,
  className,
}) => {
  // Parse className into individual tokens for prefix matching
  const classNameTokens = className ? className.split(/\s+/) : [];

  const computedStyle: React.CSSProperties = {};

  // Only set inline styles that don't conflict with Tailwind classes
  if (!shouldOmitStyleProperty(classNameTokens, 'position')) computedStyle.position = 'absolute';
  if (!shouldOmitStyleProperty(classNameTokens, 'top')) computedStyle.top = 0;
  if (!shouldOmitStyleProperty(classNameTokens, 'left')) computedStyle.left = 0;
  if (!shouldOmitStyleProperty(classNameTokens, 'right')) computedStyle.right = 0;
  if (!shouldOmitStyleProperty(classNameTokens, 'bottom')) computedStyle.bottom = 0;
  if (!shouldOmitStyleProperty(classNameTokens, 'width')) computedStyle.width = '100%';
  if (!shouldOmitStyleProperty(classNameTokens, 'height')) computedStyle.height = '100%';
  if (!shouldOmitStyleProperty(classNameTokens, 'display')) computedStyle.display = 'flex';
  if (!shouldOmitStyleProperty(classNameTokens, 'flexDirection')) computedStyle.flexDirection = 'column';

  return (
    <div
      className={className}
      style={{ ...computedStyle, ...style }}
    >
      {children}
    </div>
  );
};
```

### Test Criteria
1. `<AbsoluteFill className="w-1/2">` should NOT have `width: 100%` in inline styles.
2. `<AbsoluteFill className="h-screen">` should NOT have `height: 100%` in inline styles.
3. `<AbsoluteFill className="grid">` should NOT have `display: flex` in inline styles.
4. `<AbsoluteFill>` (no className) should have all default inline styles.
5. `<AbsoluteFill className="p-4">` should NOT omit any layout properties (padding doesn't conflict).

---

## 12. Feature F11: Series with Offset Support

### What It Does
Adds an `offset` prop to `Series.Sequence` children, enabling gaps (positive offset) and overlaps (negative offset) between series segments.

### Current Code
In `packages/motionforge/src/components/Sequence.tsx`, the `Series` component:
```typescript
export const Series: React.FC<SeriesProps> = ({ children }) => {
  const currentFrame = useCurrentFrame();
  let accumulatedFrames = 0;
  // ...no offset handling...
  accumulatedFrames += childDuration;
```

### Implementation

Modify the `Series` component in `packages/motionforge/src/components/Sequence.tsx`:

```typescript
// Series Component - plays sequences in series with optional gaps/overlaps
interface SeriesProps {
  children: ReactNode;
}

// Add Series.Sequence sub-component for typed children
interface SeriesSequenceProps {
  durationInFrames: number;
  offset?: number;  // NEW: positive = gap, negative = overlap
  children: ReactNode;
}

export const SeriesSequence: React.FC<SeriesSequenceProps> = ({ children }) => {
  // This component is just a container — the Series parent reads its props
  return <>{children}</>;
};

export const Series: React.FC<SeriesProps> = ({ children }) => {
  const currentFrame = useCurrentFrame();

  // Calculate cumulative frames for each child
  let accumulatedFrames = 0;
  let activeChildIndex = -1;
  let relativeFrame = currentFrame;

  const childArray = React.Children.toArray(children);

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i];
    if (React.isValidElement(child)) {
      const childDuration = (child.props as any).durationInFrames ?? 0;
      const childOffset = (child.props as any).offset ?? 0;  // NEW

      if (childDuration > 0 && currentFrame >= accumulatedFrames && currentFrame < accumulatedFrames + childDuration) {
        activeChildIndex = i;
        relativeFrame = currentFrame - accumulatedFrames;
        break;
      }

      accumulatedFrames += childDuration + childOffset;  // NEW: add offset
    }
  }

  if (activeChildIndex === -1) {
    return null;
  }

  const activeChild = childArray[activeChildIndex];

  return (
    <SequenceFrameProvider relativeFrame={relativeFrame}>
      {activeChild}
    </SequenceFrameProvider>
  );
};

// Attach SeriesSequence as a sub-component
export const SeriesWithSequence = Object.assign(Series, { Sequence: SeriesSequence });
```

Update exports in `Sequence.tsx` and `index.ts`:
```typescript
// In Sequence.tsx exports:
export { SeriesWithSequence as Series, SeriesSequence };

// In index.ts, update the import:
export { Series, SeriesSequence } from './components/Sequence';
```

### Test Criteria
1. `Series.Sequence` with `offset={5}` should create a 5-frame gap between segments.
2. `Series.Sequence` with `offset={-3}` should create a 3-frame overlap.
3. `Series.Sequence` without `offset` should behave exactly as before (zero gap).

---

## 13. Feature F12: Still Component

### What It Does
A convenience wrapper for rendering a single frame (like a thumbnail or poster image). Equivalent to `Composition` with `durationInFrames={1}` and `fps={1}`.

### Implementation

Add to `packages/motionforge/src/components/Composition.tsx`:

```typescript
interface StillProps {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  defaultProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;
  schema?: any; // Zod schema — for future F14 integration
}

export const Still: React.FC<StillProps> = ({
  id,
  component,
  width = 1920,
  height = 1080,
  defaultProps = {},
  inputProps,
}) => {
  return (
    <Composition
      id={id}
      component={component}
      width={width}
      height={height}
      fps={1}
      durationInFrames={1}
      defaultProps={defaultProps}
      inputProps={inputProps}
    />
  );
};
```

Add export in `index.ts`:
```typescript
export { Still } from './components/Composition';
```

### Test Criteria
1. `<Still component={MyComponent} />` should render exactly 1 frame at 1 fps.
2. `useCurrentFrame()` inside a `Still` should always return `0`.

---

## 14. Feature F13: Freeze with Active Prop

### What It Does
Adds an `active` prop to the `Freeze` component that determines whether the freeze is in effect. Can be a boolean or a function `(frame) => boolean`, enabling conditional freeze behavior.

### Current Code
In `packages/motionforge/src/components/Sequence.tsx`:
```typescript
export const Freeze: React.FC<FreezeProps> = ({ frame: freezeFrame, durationInFrames, children }) => {
  const currentFrame = useCurrentFrame();
  const displayFrame = currentFrame < durationInFrames ? freezeFrame : currentFrame - durationInFrames + freezeFrame;
  // ... always freezes for durationInFrames
```

### Implementation

Modify `FreezeProps` and `Freeze` component:

```typescript
interface FreezeProps {
  frame: number;
  durationInFrames?: number;
  active?: boolean | ((frame: number) => boolean);  // NEW
  children: ReactNode;
  name?: string;
}

export const Freeze: React.FC<FreezeProps> = ({
  frame: freezeFrame,
  durationInFrames,
  active = true,  // NEW: default to always active
  children,
}) => {
  const currentFrame = useCurrentFrame();

  // Evaluate active state
  const isActive = typeof active === 'function' ? active(currentFrame) : active;

  // If not active, pass through the current frame unchanged
  if (!isActive) {
    return <>{children}</>;
  }

  // Calculate which frame to show when frozen
  const displayFrame = durationInFrames !== undefined
    ? (currentFrame < durationInFrames ? freezeFrame : currentFrame - durationInFrames + freezeFrame)
    : freezeFrame;

  return (
    <SequenceFrameProvider relativeFrame={displayFrame}>
      {children}
    </SequenceFrameProvider>
  );
};
```

### Test Criteria
1. `<Freeze frame={10} active={false}>` should not freeze — children see the actual frame.
2. `<Freeze frame={10} active={(f) => f < 30}>` should freeze at frame 10 for the first 30 frames, then resume.
3. `<Freeze frame={10} durationInFrames={60}>` (no active prop) should behave as before.

---

## 15. Feature F14: Zod Schema Validation for Props

### What It Does
Adds optional Zod schema validation to `Composition` props. If a `schema` prop is provided, `defaultProps` and `inputProps` are validated against it at render time.

### Implementation

#### Step 1: Add `zod` as optional peer dependency

In `packages/motionforge/package.json`:
```json
"peerDependenciesMeta": {
  "zod": { "optional": true }
}
```

#### Step 2: Modify `packages/motionforge/src/components/Composition.tsx`

```typescript
interface CompositionProps {
  // ... existing props ...
  schema?: any; // Zod schema — validated at render time if zod is installed
}

// Inside the Composition component, before rendering:
if (schema) {
  try {
    // Dynamic import to avoid hard dependency
    const { z } = await import('zod');
    // Validate props
    schema.parse(resolvedProps);
  } catch (validationError) {
    console.error('[MotionForge] Props validation failed:', validationError);
  }
}
```

Since `Composition` is not async, use a `useEffect` for validation:

```typescript
useEffect(() => {
  if (schema && resolvedProps) {
    try {
      // Check if zod is available
      import('zod').then(({ z }) => {
        // If schema is a Zod schema, parse the props
        if (schema && typeof schema.parse === 'function') {
          schema.parse(resolvedProps);
        }
      }).catch(() => {
        // zod not installed — skip validation
      });
    } catch {
      // Ignore — zod not installed
    }
  }
}, [schema, resolvedProps]);
```

### Test Criteria
1. `<Composition schema={z.object({ name: z.string() })} defaultProps={{ name: 'Alice' }}>` should pass validation.
2. `<Composition schema={z.object({ name: z.string() })} defaultProps={{ name: 123 }}>` should log a validation error.
3. Without `zod` installed, `schema` prop should be silently ignored.

---

## 16. Feature F15: Player Event Emitter System

### What It Does
Adds a formal event emitter to the `Player` component, enabling consumers to listen for playback events: `play`, `pause`, `seek`, `ended`, `error`, `ratechange`, `volumechange`, `timeupdate`, `seeked`.

### Implementation

#### Step 1: Create `packages/motionforge/src/player/player-emitter.ts`

```typescript
type EventMap = {
  play: undefined;
  pause: undefined;
  seek: { frame: number };
  seeked: { frame: number };
  ended: undefined;
  error: { error: Error };
  ratechange: { playbackRate: number };
  volumechange: { volume: number };
  timeupdate: { frame: number; timeInSeconds: number };
  progress: { progress: number };
  exportstart: undefined;
  exportcomplete: { blob: Blob };
  exportprogress: { progress: number };
  exporterror: { error: Error };
};

type EventKey = keyof EventMap;

export class PlayerEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on<K extends EventKey>(event: K, listener: (data: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  once<K extends EventKey>(event: K, listener: (data: EventMap[K]) => void): () => void {
    const unsubscribe = this.on(event, (data) => {
      listener(data as any);
      unsubscribe();
    });
    return unsubscribe;
  }

  emit<K extends EventKey>(event: K, data?: EventMap[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  removeAllListeners(event?: EventKey): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
```

#### Step 2: Add `emitter` prop to Player and emit events

In `packages/motionforge/src/player/Player.tsx`:

```typescript
import { PlayerEmitter } from './player-emitter';

export interface PlayerProps {
  // ... existing props ...
  emitter?: PlayerEmitter;  // NEW
}

// Inside the Player component:
const emitterRef = useRef(props.emitter ?? new PlayerEmitter());

// Emit events at the appropriate locations:
// When play starts:
emitterRef.current.emit('play');

// When pause:
emitterRef.current.emit('pause');

// When seek:
emitterRef.current.emit('seek', { frame: targetFrame });

// When video ends (loop=false and frame reaches end):
emitterRef.current.emit('ended');

// During export:
emitterRef.current.emit('exportstart');
emitterRef.current.emit('exportprogress', { progress });
emitterRef.current.emit('exportcomplete', { blob });
```

#### Step 3: Export the emitter

In `packages/motionforge/src/index.ts`:
```typescript
export { PlayerEmitter } from './player/player-emitter';
```

### Test Criteria
1. `player.on('play', callback)` should fire when playback starts.
2. `player.on('seek', callback)` should fire with `{ frame: N }` when seeking.
3. `player.once('ended', callback)` should fire exactly once when the video ends.
4. Unsubscribe function returned by `on()` should stop future callbacks.

---

## 17. Feature F16: Thumbnail Component

### What It Does
Renders a single frame of a composition efficiently, without animation controls. Useful for video thumbnails in galleries.

### Implementation

Create in `packages/motionforge/src/player/Thumbnail.tsx`:

```typescript
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FrameContext } from '../core/context';

export interface ThumbnailProps {
  component: React.ComponentType<Record<string, unknown>>;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames?: number;
  frameToDisplay?: number;
  defaultProps?: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  component: Component,
  width = 1920,
  height = 1080,
  fps = 30,
  durationInFrames = 1,
  frameToDisplay = 0,
  defaultProps = {},
  style,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        setContainerWidth(entries[0].contentRect.width);
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const scale = containerWidth / width;
  const displayHeight = height * scale;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <FrameContext.Provider
          value={{
            frame: frameToDisplay,
            fps,
            durationInFrames,
            width,
            height,
            playing: false,
            playbackRate: 1,
            setFrame: () => {},
            setPlaying: () => {},
            setPlaybackRate: () => {},
          }}
        >
          <Component {...defaultProps} />
        </FrameContext.Provider>
      </div>
    </div>
  );
};
```

Export from `packages/motionforge/src/index.ts`:
```typescript
export { Thumbnail } from './player/Thumbnail';
export type { ThumbnailProps } from './player/Thumbnail';
```

### Test Criteria
1. `<Thumbnail component={MyComp} frameToDisplay={30} />` should render frame 30 as a static image.
2. Thumbnail should resize responsively when the container width changes.
3. No animation loop should run (no requestAnimationFrame).

---

## 18. Feature F17: Player Internals API

### What It Does
Exports internal Player utilities so consumers can build custom player UIs. Includes `usePlayback`, `usePlayer`, `calculateCanvasTransformation`, `useElementSize`.

### Implementation

#### Create `packages/motionforge/src/player/internals.ts`

```typescript
/**
 * Player Internals — Low-level APIs for building custom player UIs.
 */

export { PlayerEmitter } from './player-emitter';

export interface PlaybackOptions {
  fps: number;
  durationInFrames: number;
  playing: boolean;
  playbackRate: number;
  loop: boolean;
  onFrame: (frame: number) => void;
  onEnded: () => void;
}

/**
 * Hook for managing playback animation loop.
 */
export function usePlayback(options: PlaybackOptions) {
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!options.playing) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const frameDuration = 1000 / (options.fps * options.playbackRate);

    const animate = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= frameDuration) {
        options.onFrame; // caller increments frame
        lastTimeRef.current = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [options.playing, options.fps, options.playbackRate]);
}

/**
 * Calculate the scale and positioning for a video canvas within a container.
 */
export function calculateCanvasTransformation(
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number
): { scale: number; x: number; y: number; width: number; height: number } {
  const scale = Math.min(
    containerWidth / videoWidth,
    containerHeight / videoHeight
  );

  const width = videoWidth * scale;
  const height = videoHeight * scale;
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;

  return { scale, x, y, width, height };
}

/**
 * Hook for observing container element size changes.
 */
export function useElementSize(
  ref: React.RefObject<HTMLElement | null>
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
```

Export from index:
```typescript
export * as PlayerInternals from './player/internals';
```

### Test Criteria
1. `calculateCanvasTransformation(1920, 1080, 800, 450)` should return scale < 1 with centered positioning.
2. `useElementSize` should update when the container is resized.
3. `usePlayback` should drive frame advancement at the correct rate.

---

## 19. Feature F18: Responsive Player with ResizeObserver

### What It Does
Replaces the fixed `scale = Math.min(1, 800/width)` with a `ResizeObserver`-based responsive scaling that adapts when the container is resized.

### Current Code
In `packages/motionforge/src/player/Player.tsx`, the `Canvas` component:
```typescript
const scale = Math.min(1, 800 / width);
```

### Implementation

Replace the `Canvas` component's scaling logic:

```typescript
const Canvas: React.FC<{ ... }> = ({ canvasRef, component: Component, width, height, ... }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width: containerWidth, height: containerHeight } = entries[0].contentRect;
      setContainerSize({ width: containerWidth, height: containerHeight });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(
    containerSize.width / width,
    containerSize.height / height,
    1 // Never upscale beyond 1x
  );

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center"
      style={{ width: '100%', minHeight: 200 }}
    >
      <div
        ref={canvasRef as any}
        className="relative rounded-xl overflow-hidden"
        style={{
          width: width * scale,
          height: height * scale,
          backgroundColor: '#0a0a0a',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <FrameContext.Provider value={{ frame, fps, durationInFrames, width, height, playing, playbackRate, setFrame: () => {}, setPlaying: () => {}, setPlaybackRate: () => {} }}>
            <Component {...defaultProps} />
          </FrameContext.Provider>
        </div>
      </div>
    </div>
  );
};
```

### Test Criteria
1. Player should resize smoothly when the container width changes.
2. Aspect ratio should be preserved at all container sizes.
3. Scale should never exceed 1x (no upscaling).

---

## 20. Feature F19: HMR State Preservation

### What It Does
Preserves the Player's frame position and playback state across hot module reloads, so developers don't lose their place when editing code.

### Implementation

#### Modify `packages/motionforge/src/core/context.tsx`

In the `FrameProvider` component, add `sessionStorage` persistence:

```typescript
export const FrameProvider: React.FC<FrameProviderProps> = ({
  fps = 30,
  durationInFrames,
  width,
  height,
  children,
  initialFrame = 0,
}) => {
  // Restore frame from sessionStorage (survives HMR)
  const [frame, setFrameState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('__mf_frame');
        const savedFps = sessionStorage.getItem('__mf_fps');
        const savedDuration = sessionStorage.getItem('__mf_duration');
        if (saved && savedFps === String(fps) && savedDuration === String(durationInFrames)) {
          const restoredFrame = parseInt(saved, 10);
          if (!isNaN(restoredFrame) && restoredFrame >= 0 && restoredFrame < durationInFrames) {
            return restoredFrame;
          }
        }
      } catch {
        // sessionStorage not available
      }
    }
    return initialFrame;
  });

  const [playing, setPlaying] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('__mf_playing') === 'true';
      } catch { return false; }
    }
    return false;
  });

  const [playbackRate, setPlaybackRate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('__mf_playbackRate');
        return saved ? parseFloat(saved) : 1;
      } catch { return 1; }
    }
    return 1;
  });

  // Persist state on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('__mf_frame', String(frame));
        sessionStorage.setItem('__mf_fps', String(fps));
        sessionStorage.setItem('__mf_duration', String(durationInFrames));
        sessionStorage.setItem('__mf_playing', String(playing));
        sessionStorage.setItem('__mf_playbackRate', String(playbackRate));
      } catch { /* ignore */ }
    }
  }, [frame, fps, durationInFrames, playing, playbackRate]);

  // ... rest of FrameProvider remains the same
};
```

### Test Criteria
1. Edit a component while Player is at frame 45 → after HMR, Player should still be at frame 45.
2. Player was playing before edit → after HMR, Player should still be playing.
3. Different composition (different fps/duration) → frame should reset to 0.

---

## 21. Feature F20: Developer Studio UI

### What It Does
A full-featured development environment with live preview, interactive timeline with sequence visualization, composition picker, and props editor.

### Implementation

Create new package `packages/motionforge-studio/`:

```
packages/motionforge-studio/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── Studio.tsx              # Main studio component
    ├── TimelineView.tsx        # Interactive timeline with tracks
    ├── CompositionPicker.tsx   # Composition selector
    ├── PropsEditor.tsx         # JSON props editor
    ├── RenderQueue.tsx         # Render queue manager
    └── types.ts
```

This is the most complex feature. Here is the key component — `TimelineView.tsx`:

```typescript
import React, { useCallback, useRef, useState } from 'react';

export interface SequenceTrack {
  id: string;
  label: string;
  startFrame: number;
  durationInFrames: number;
  color: string;
  type: 'video' | 'audio' | 'image' | 'container';
  depth: number;
  parentId?: string;
}

interface TimelineViewProps {
  sequences: SequenceTrack[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
  onSeek: (frame: number) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  sequences,
  currentFrame,
  totalFrames,
  fps,
  onSeek,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const formatTime = (frame: number): string => {
    const seconds = frame / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const timelineWidth = rect.width * zoom;
    const frame = Math.round((x / timelineWidth) * totalFrames);
    onSeek(Math.max(0, Math.min(frame, totalFrames - 1)));
  }, [totalFrames, fps, zoom, onSeek]);

  return (
    <div className="timeline-view bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      {/* Time ruler */}
      <div className="h-6 bg-gray-900 border-b border-gray-800 relative flex items-end">
        {Array.from({ length: Math.ceil(totalFrames / fps) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute text-[10px] text-gray-500"
            style={{ left: `${(i * fps / totalFrames) * 100}%` }}
          >
            {formatTime(i * fps)}
          </div>
        ))}
      </div>

      {/* Sequence tracks */}
      <div ref={timelineRef} className="relative min-h-[100px]">
        {sequences.map(seq => (
          <div
            key={seq.id}
            className={`absolute h-6 rounded-sm flex items-center px-2 text-[11px] text-white truncate cursor-pointer hover:brightness-110`}
            style={{
              left: `${(seq.startFrame / totalFrames) * 100}%`,
              width: `${(seq.durationInFrames / totalFrames) * 100}%`,
              top: `${seq.depth * 28 + 4}px`,
              backgroundColor: seq.color,
              opacity: currentFrame >= seq.startFrame && currentFrame < seq.startFrame + seq.durationInFrames ? 1 : 0.5,
            }}
          >
            {seq.label}
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
        />
      </div>

      {/* Click overlay */}
      <div
        className="absolute inset-0 cursor-crosshair"
        onClick={handleClick}
        style={{ top: 24 }} // Below time ruler
      />
    </div>
  );
};
```

### Test Criteria
1. Studio should display an interactive timeline with colored sequence tracks.
2. Clicking on the timeline should seek to the corresponding frame.
3. The playhead should follow the current frame during playback.
4. The props editor should update the composition in real time.

---

## 22. Feature F21: CLI — render, still, studio, compositions

### What It Does
Command-line interface for rendering videos, stills, starting the dev studio, and listing compositions.

### Implementation

Create `packages/motionforge-cli/`:

```
packages/motionforge-cli/
├── package.json
├── bin/
│   └── motionforge.js     # CLI entry point
└── src/
    ├── index.ts
    ├── commands/
    │   ├── render.ts      # motionforge render <entry> <compositionId>
    │   ├── still.ts       # motionforge still <entry> <compositionId>
    │   ├── studio.ts      # motionforge studio <entry>
    │   └── compositions.ts # motionforge compositions <entry>
    └── utils.ts
```

Key command — `render.ts`:

```typescript
import { renderMedia, type RenderMediaOptions } from '@motionforge/renderer';
import { ensureFfmpeg } from '@motionforge/renderer/ensure-ffmpeg';

export async function renderCommand(options: {
  entry: string;
  compositionId: string;
  output: string;
  codec: RenderMediaOptions['codec'];
  fps?: number;
  width?: number;
  height?: number;
  durationInFrames?: number;
  props?: string;
  concurrency?: number;
  frameRange?: string;
  crf?: number;
  quality?: 'low' | 'medium' | 'high';
}) {
  console.log(`[MotionForge] Rendering composition "${options.compositionId}"...`);

  // Ensure FFmpeg is available
  await ensureFfmpeg();

  // Parse input props
  const inputProps = options.props ? JSON.parse(options.props) : undefined;

  // Parse frame range
  const frameRange = options.frameRange
    ? options.frameRange.split('-').map(Number) as [number, number]
    : undefined;

  const result = await renderMedia({
    serveUrl: options.entry,
    compositionId: options.compositionId,
    outputLocation: options.output,
    codec: options.codec,
    fps: options.fps ?? 30,
    width: options.width ?? 1920,
    height: options.height ?? 1080,
    durationInFrames: options.durationInFrames ?? 300,
    inputProps,
    concurrency: options.concurrency,
    frameRange,
    crf: options.crf,
    quality: options.quality,
    onProgress: (progress) => {
      process.stdout.write(`\r  Progress: ${(progress * 100).toFixed(1)}%`);
    },
  });

  if (result.success) {
    console.log(`\n  ✓ Rendered ${result.frameCount} frames in ${(result.durationMs / 1000).toFixed(1)}s`);
    console.log(`  Output: ${result.outputLocation}`);
  } else {
    console.error(`\n  ✗ Render failed: ${result.error}`);
    process.exit(1);
  }
}
```

CLI entry point — `bin/motionforge.js`:

```javascript
#!/usr/bin/env node
const { program } = require('commander');

program
  .name('motionforge')
  .description('MotionForge CLI — Programmatic video rendering')
  .version('1.0.0');

program
  .command('render <entry> <compositionId>')
  .description('Render a video composition')
  .option('-o, --output <path>', 'Output file path', 'output.mp4')
  .option('--codec <codec>', 'Video codec (h264, h265, vp8, vp9, prores, gif)', 'h264')
  .option('--fps <fps>', 'Frame rate', '30')
  .option('--width <width>', 'Width', '1920')
  .option('--height <height>', 'Height', '1080')
  .option('--duration <frames>', 'Duration in frames', '300')
  .option('--props <json>', 'Input props as JSON string')
  .option('--concurrency <n>', 'Number of concurrent pages', '4')
  .option('--frame-range <range>', 'Frame range (e.g., "0-29")')
  .option('--crf <n>', 'CRF quality value')
  .option('--quality <quality>', 'Quality preset (low, medium, high)', 'medium')
  .action(async (entry, compositionId, opts) => {
    const { renderCommand } = await import('../dist/commands/render.js');
    await renderCommand({ entry, compositionId, ...opts });
  });

program
  .command('still <entry> <compositionId>')
  .description('Render a single frame')
  .option('-o, --output <path>', 'Output file path', 'output.png')
  .option('--frame <n>', 'Frame number to render', '0')
  .action(async (entry, compositionId, opts) => {
    const { stillCommand } = await import('../dist/commands/still.js');
    await stillCommand({ entry, compositionId, ...opts });
  });

program
  .command('studio <entry>')
  .description('Start MotionForge Studio development environment')
  .option('-p, --port <port>', 'Port number', '3123')
  .action(async (entry, opts) => {
    const { studioCommand } = await import('../dist/commands/studio.js');
    await studioCommand({ entry, ...opts });
  });

program
  .command('compositions <entry>')
  .description('List available compositions')
  .action(async (entry) => {
    const { compositionsCommand } = await import('../dist/commands/compositions.js');
    await compositionsCommand({ entry });
  });

program.parse();
```

### Test Criteria
1. `motionforge render ./dist/index.html MyComp --codec h264 -o output.mp4` should produce a valid MP4.
2. `motionforge still ./dist/index.html MyComp --frame 30 -o frame.png` should produce a PNG.
3. `motionforge compositions ./dist/index.html` should list registered compositions.
4. `motionforge studio ./dist/index.html` should start a dev server.

---

## 23. Feature F22: Project Bundler (Webpack + Rspack)

### What It Does
Bundles a MotionForge project for server-side rendering. Supports Webpack 5 (primary) and Rspack (alternative). Includes React Fast Refresh for HMR with state preservation.

### Implementation

Create `packages/motionforge-bundler/`:

```
packages/motionforge-bundler/
├── package.json
└── src/
    ├── index.ts
    ├── bundle.ts           # Main bundle function
    ├── webpack-config.ts   # Webpack 5 configuration
    └── rspack-config.ts    # Rspack configuration (optional)
```

Key file — `webpack-config.ts`:

```typescript
import webpack, { type Configuration } from 'webpack';
import path from 'path';

export interface WebpackConfigOptions {
  entry: string;
  outDir: string;
  dev: boolean;
  enableReactRefresh?: boolean;
}

export function webpackConfig(options: WebpackConfigOptions): Configuration {
  const isDev = options.dev;
  const enableReactRefresh = options.enableReactRefresh ?? isDev;

  return {
    mode: isDev ? 'development' : 'production',
    entry: isDev ? [
      'webpack-hot-middleware/client',
      options.entry,
    ] : [options.entry],

    output: {
      path: options.outDir,
      filename: 'bundle.js',
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'esbuild-loader',
            options: { jsx: 'automatic', target: 'es2020' },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/,
          type: 'asset/resource',
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    plugins: [
      ...(isDev ? [
        new webpack.HotModuleReplacementPlugin(),
      ] : []),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      }),
    ],

    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',

    optimization: {
      minimize: !isDev,
    },
  };
}
```

### Test Criteria
1. `bundle({ entry: './src/index.ts', outDir: './dist' })` should produce a working bundle.
2. Dev mode should include HMR and source maps.
3. Production mode should produce a minimized bundle.

---

## 24. Feature F23: Sequence Premounting

### What It Does
Allows a `Sequence` to render its children before the sequence's start frame (with `opacity: 0` and `pointerEvents: none`). This enables audio preloading — the browser can buffer audio before the sequence becomes visible.

### Implementation

Modify `packages/motionforge/src/components/Sequence.tsx`:

```typescript
interface SequenceProps {
  from: number;
  durationInFrames?: number;
  offset?: number;
  name?: string;
  children: ReactNode;
  showInTimeline?: boolean;
  layout?: 'absolute-fill' | 'none';
  premountFor?: number;  // NEW: number of frames to premount before `from`
}

export const Sequence: React.FC<SequenceProps> = ({
  from,
  durationInFrames,
  offset = 0,
  name,
  children,
  layout = 'absolute-fill',
  premountFor = 0,  // NEW
}) => {
  const currentFrame = useCurrentFrame();
  const startFrame = from + offset;
  const endFrame = durationInFrames !== undefined ? startFrame + durationInFrames : Infinity;

  const isActive = currentFrame >= startFrame && currentFrame < endFrame;

  // Premounting: render children before the sequence starts, but invisible
  const premountStart = startFrame - premountFor;
  const isPremounted = premountFor > 0 && currentFrame >= premountStart && currentFrame < startFrame;
  const shouldRender = isActive || isPremounted;

  if (!shouldRender) {
    return null;
  }

  const relativeFrame = isActive ? currentFrame - startFrame : 0;

  return (
    <SequenceContext.Provider value={{
      relativeFrom: startFrame,
      durationInFrames,
      isActive,
      startFrame,
      endFrame,
    }}>
      <div
        data-sequence-name={name}
        data-sequence-from={startFrame}
        data-sequence-duration={durationInFrames}
        style={{
          position: layout === 'absolute-fill' ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          // Premounted: invisible but rendered for audio preloading
          opacity: isPremounted ? 0 : 1,
          pointerEvents: isPremounted ? 'none' : 'auto',
        }}
      >
        <SequenceFrameProvider relativeFrame={relativeFrame}>
          {children}
        </SequenceFrameProvider>
      </div>
    </SequenceContext.Provider>
  );
};
```

### Test Criteria
1. `<Sequence from={30} premountFor={15}>` should render children (invisible) from frame 15.
2. At frame 30, the sequence should become visible (`opacity: 1`).
3. `<Audio>` inside a premounted sequence should start buffering at frame 15.

---

## 25. Feature F24: Frame Persistence Across Reloads

### What It Does
Persists frame position to `localStorage` so it survives full page reloads (not just HMR). This is already partially implemented in F19 via `sessionStorage`. This feature upgrades to `localStorage` for persistence across new sessions.

### Implementation

Already covered in Feature F19. The only change is replacing `sessionStorage` with `localStorage`:

```typescript
// In FrameProvider, change:
sessionStorage.getItem('__mf_frame')
// To:
localStorage.getItem(`__mf_frame_${compositionId}`)

// And:
sessionStorage.setItem('__mf_frame', String(frame))
// To:
localStorage.setItem(`__mf_frame_${compositionId}`, String(frame))
```

The key should include the composition ID to avoid conflicts between different compositions.

### Test Criteria
1. Navigate to a composition at frame 45, close the tab, reopen → should restore to frame 45.
2. Switch to a different composition → frame should reset to 0 (different localStorage key).

---

## 26. Feature F25: Asset Preloading System

### What It Does
Provides a `preload()` API to preload images, videos, and audio files before they're needed, preventing visual glitches from late-loading assets.

### Implementation

Create `packages/motionforge/src/core/preload.ts`:

```typescript
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
```

Export from `index.ts`:
```typescript
export {
  preloadImage,
  preloadVideo,
  preloadAudio,
  preloadFont,
  preloadAssets,
  usePreloadAssets,
} from './core/preload';
```

### Test Criteria
1. `preloadImage('https://example.com/photo.jpg')` should resolve when the image loads.
2. `usePreloadAssets([...])` should return `{ loaded: true }` after all assets load.
3. Preloading should integrate with `delayRender` — the frame should not be captured until all preloaded assets are ready.

---

## Documentation Plan

MotionForge requires comprehensive documentation to be written alongside feature implementation. The documentation should be structured as follows:

### Documentation Structure

```
docs/
├── getting-started/
│   ├── installation.md          # npm install motionforge, peer deps
│   ├── quick-start.md           # First composition in 5 minutes
│   └── project-setup.md         # create-motionforge, Next.js integration
├── core-concepts/
│   ├── compositions.md          # Composition, PlayerComposition, Still
│   ├── sequences.md             # Sequence, Loop, Freeze, Retiming, Reverse, Series
│   ├── frame-model.md           # useCurrentFrame, useVideoConfig, frame determinism
│   ├── positioning.md           # AbsoluteFill, Div, layout prop
│   └── media.md                 # Video, Audio, Img, staticFile, Lottie, HyperFrame
├── animation/
│   ├── interpolate.md           # interpolate, interpolateColors, extrapolation modes
│   ├── spring.md                # spring, measureSpring, SpringConfig
│   ├── easing.md                # Easing object, bezier curves
│   ├── keyframes.md             # useKeyframes, Keyframe type
│   ├── hooks.md                 # useSpring, useInterpolate, useFade, useSlide, etc.
│   └── transitions.md           # Transition utility functions
├── rendering/
│   ├── browser-rendering.md     # Browser-side export (MediaRecorder, WebCodecs)
│   ├── server-rendering.md      # @motionforge/renderer (Puppeteer, FFmpeg)
│   ├── ffmpeg.md                # FFmpeg integration, codec options, quality settings
│   ├── audio-pipeline.md        # Audio tracking, mixing, export
│   ├── concurrency.md           # Page pool, parallel encoding
│   └── render-api.md            # renderMedia, renderCompositionToVideo, downloadVideo
├── data-and-async/
│   ├── delay-render.md          # delayRender, continueRender protocol
│   ├── input-props.md           # getInputProps, inputProps prop, CLI --props
│   ├── calculate-metadata.md    # calculateMetadata, dynamic duration
│   └── data-fetching.md         # Patterns for API-driven compositions
├── player/
│   ├── player.md                # Player component, props, keyboard shortcuts
│   ├── thumbnail.md             # Thumbnail component
│   ├── player-internals.md      # PlayerEmitter, usePlayback, useElementSize
│   └── custom-player.md         # Building custom player UIs with PlayerInternals
├── studio/
│   ├── studio-overview.md       # MotionForge Studio features
│   ├── timeline.md              # Timeline view, sequence tracks
│   ├── props-editor.md          # Props editor, Zod validation
│   └── render-queue.md          # Render queue management
├── cli/
│   ├── cli-overview.md          # motionforge CLI commands
│   ├── render-command.md        # motionforge render
│   ├── still-command.md         # motionforge still
│   ├── studio-command.md        # motionforge studio
│   └── compositions-command.md  # motionforge compositions
├── api-reference/
│   ├── components.md            # All component API signatures
│   ├── hooks.md                 # All hook API signatures
│   ├── utilities.md             # All utility function signatures
│   └── types.md                 # All TypeScript type definitions
├── guides/
│   ├── tailwind-integration.md  # Using Tailwind CSS with MotionForge
│   ├── three-js.md              # @react-three/fiber integration
│   ├── lottie.md                # Lottie animation integration
│   ├── zod-validation.md        # Schema-based prop validation
│   └── performance.md           # Performance optimization tips
└── migration/
    └── remotion-migration.md    # Guide for migrating from Remotion
```

### Documentation Requirements

1. **Every exported function, component, and hook must have a JSDoc comment** in the source code with `@param`, `@returns`, and `@example` tags.
2. **Every documentation page must include at least 3 runnable code examples** — not pseudocode, but complete TypeScript/TSX that can be copy-pasted into a project.
3. **The API reference must be auto-generated from source code JSDoc comments** using TypeDoc or a similar tool.
4. **The Remotion migration guide must include a side-by-side comparison table** showing the equivalent MotionForge API for every Remotion API.
5. **All documentation must be versioned** alongside the package version.

### Implementation Priority for Documentation

| Phase | Documentation | Priority |
|-------|---------------|----------|
| Phase 1 | getting-started/, core-concepts/, animation/, data-and-async/ | High |
| Phase 2 | rendering/, player/ | High |
| Phase 3 | studio/, cli/, api-reference/ | Medium |
| Phase 4 | guides/, migration/ | Medium |

---

*End of Feature Roadmap. Each feature is designed to be implementable by an AI coding agent following the exact file paths, function signatures, and code snippets provided above.*
