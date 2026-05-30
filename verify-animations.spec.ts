import { test, expect } from '@playwright/test';

test('landing page looks premium', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'landing-page.png', fullPage: true });
});

test('typography demo works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Cinematic Typography")');
  // Wait for the player to initialize and run a bit
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'typography-demo.png' });
});

test('webgl demo works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("WebGL & Shaders")');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'webgl-demo.png' });
});
