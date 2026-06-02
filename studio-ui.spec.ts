import { test, expect } from '@playwright/test';

test('studio library tests placeholder', async ({ page }) => {
  // studio-ui.spec.ts was intended for motionforge-studio which is a package
  // currently we are testing the main landing page which has the Player.
  // We can keep this as a placeholder or test if we can navigate to a studio route if it exists.
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/MotionForge/);
});
