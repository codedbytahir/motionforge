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
