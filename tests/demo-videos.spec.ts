import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const OUT = 'test-results/screenshots';

test.setTimeout(30000);
test.describe.configure({ mode: 'serial' });

test('01 - Landing hero', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/01-hero.png`, fullPage: false });
  // Verify the page loaded — nav shows MotionForge branding
  await expect(page.locator('text=MotionForge').first()).toBeVisible();
});

test('02 - Landing features', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector('#features')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/02-features.png`, fullPage: false });
});

test('03 - Landing tech stack', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector('#tech')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/03-tech.png`, fullPage: false });
});

test('04 - Landing CTA', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/04-cta.png`, fullPage: true });
});

test('05 - Typography demo', async ({ page }) => {
  await page.goto(`${BASE}/demo/typography`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/05-typography.png`, fullPage: false });
});

test('06 - Particles demo', async ({ page }) => {
  await page.goto(`${BASE}/demo/particles`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/06-particles.png`, fullPage: false });
});

test('07 - Physics demo', async ({ page }) => {
  await page.goto(`${BASE}/demo/physics`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/07-physics.png`, fullPage: false });
});

test('08 - Forge Studio', async ({ page }) => {
  await page.goto(`${BASE}/editor`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/08-studio.png`, fullPage: false });
});
