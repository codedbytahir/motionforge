import { test, expect } from '@playwright/test';

test('webgl rendering stability', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // WebGL & Shaders is one of the demoCompositions
  await page.click('button:has-text("WebGL & Shaders")');

  // Wait for canvas to be present inside the player
  const canvas = page.locator('.aspect-video canvas');
  await expect(canvas).toBeVisible({ timeout: 10000 });

  // Take screenshots at different frames to ensure something is rendering
  await page.screenshot({ path: 'test-results/webgl-frame-1.png' });
});
