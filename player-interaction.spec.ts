import { test, expect } from '@playwright/test';

test('player play/pause works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Click on a demo to load the player
  await page.click('button:has-text("Classic Effects")');

  // Play/Pause button has a title like 'Play (Space)' or 'Pause (Space)'
  const playButton = page.locator('button[title*="Play"], button[title*="Pause"]').first();
  await expect(playButton).toBeVisible();

  const initialTitle = await playButton.getAttribute('title');
  await playButton.click();
  const newTitle = await playButton.getAttribute('title');

  expect(initialTitle).not.toBe(newTitle);
});

test('player seeking works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Classic Effects")');

  // The timeline is a div that handles mousedown
  const timeline = page.locator('.relative.h-2.bg-emerald-950');
  await expect(timeline).toBeVisible();

  // Click on the middle of the timeline
  await timeline.click({ position: { x: 100, y: 5 } });

  // Check if frame counter updates
  const frameCounter = page.locator('.font-mono').filter({ hasText: '/' });
  await expect(frameCounter).toBeVisible();

  // Wait for state update
  await expect(async () => {
    const text = await frameCounter.textContent();
    const currentFrameValue = parseInt(text?.split('/')[0] || '1');
    expect(currentFrameValue).toBeGreaterThan(1);
  }).toPass();
});
