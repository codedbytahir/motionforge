import { test, expect } from '@playwright/test';

test('minimal - page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('domcontentloaded');
  await page.screenshot({ path: 'test-results/screenshots/quick-test.png' });
  console.log('Screenshot saved!');
});
