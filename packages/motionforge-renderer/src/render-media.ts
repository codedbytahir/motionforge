import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { Pool } from './pool.js';
import { ensureBrowser } from './open-browser.js';
import { screenshotTask } from './screenshot.js';
import { stitchFramesToVideo, type StitchOptions } from './stitch-frames.js';
import * as os from 'os';

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
  const concurrency = options.concurrency ?? Math.max(1, Math.floor(os.cpus().length / 2));

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
