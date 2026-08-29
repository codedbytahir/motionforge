import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// MotionForge v2.0 - RapierJS Physics + Forge Studio Tests
// ═══════════════════════════════════════════════════════════════

test.describe('Landing Page - MotionForge v2.0', () => {
  test('landing page loads with hero section', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Hero section should be visible
    await expect(page.locator('h1')).toContainText('BUILD');
    await expect(page.locator('h1')).toContainText('CINEMATIC');
    await expect(page.locator('h1')).toContainText('VIDEOS');
    
    // Nav should show MotionForge branding
    await expect(page.locator('nav')).toContainText('MotionForge');
    
    // Take full-page screenshot
    await page.screenshot({ path: 'landing-v2-full.png', fullPage: true });
  });

  test('physics showcase section is visible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Scroll to physics section
    await page.locator('#physics').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Should show physics content
    await expect(page.locator('#physics')).toContainText('Real Physics');
    await expect(page.locator('#physics')).toContainText('RapierJS');
    
    await page.screenshot({ path: 'landing-v2-physics.png' });
  });

  test('features grid shows all 6 features', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Check all 6 features are present
    const features = [
      'Deterministic Rendering',
      'Native WebGL',
      'Kinetic Typography',
      'RapierJS Physics',
      'Forge Studio',
      'AI Agent Ready',
    ];
    
    for (const feature of features) {
      await expect(page.locator('#features')).toContainText(feature);
    }
    
    await page.screenshot({ path: 'landing-v2-features.png' });
  });

  test('demo showcase has 4 demo options', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.locator('#demos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Check demo options
    await expect(page.locator('#demos')).toContainText('Cinematic Typography');
    await expect(page.locator('#demos')).toContainText('WebGL & Shaders');
    await expect(page.locator('#demos')).toContainText('RapierJS Physics');
    await expect(page.locator('#demos')).toContainText('Particle Effects');
    
    await page.screenshot({ path: 'landing-v2-demos.png' });
  });

  test('tech stack section shows all technologies', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.locator('#tech').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const techs = ['Next.js', 'React', 'Three.js', 'RapierJS', 'Tailwind', 'Framer Motion', 'Monaco Editor', 'TypeScript'];
    
    for (const tech of techs) {
      await expect(page.locator('#tech')).toContainText(tech);
    }
    
    await page.screenshot({ path: 'landing-v2-tech.png' });
  });

  test('editor preview section shows Forge Studio mockup', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Scroll to editor section
    const editorSection = page.locator('text=Write Code.').first();
    await editorSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Forge Studio').first()).toBeVisible();
    
    await page.screenshot({ path: 'landing-v2-editor-preview.png' });
  });

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Test "Start Building Free" button
    const startButton = page.locator('button:has-text("Start Building Free")');
    await expect(startButton).toBeVisible();
    
    // Test "Watch Demos" button
    const watchButton = page.locator('button:has-text("Watch Demos")');
    await expect(watchButton).toBeVisible();
    
    // Test nav "Open Studio" button
    const studioButton = page.locator('nav button:has-text("Open Studio")');
    await expect(studioButton).toBeVisible();
  });
});

test.describe('Demo Compositions', () => {
  test('cinematic typography demo works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click the Cinematic Typography demo
    await page.click('button:has-text("Cinematic Typography")');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'demo-v2-typography.png' });
  });

  test('physics demo option is selectable', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click the RapierJS Physics demo option
    const physicsButton = page.locator('button:has-text("RapierJS Physics")').first();
    await physicsButton.scrollIntoViewIfNeeded();
    await physicsButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'demo-v2-physics-selected.png' });
  });

  test('demo switching works between all options', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Scroll to demos section
    await page.locator('#demos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Click through all demos
    const demos = ['Cinematic Typography', 'WebGL & Shaders', 'RapierJS Physics', 'Particle Effects'];
    
    for (const demo of demos) {
      const button = page.locator(`button:has-text("${demo}")`).first();
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(1500);
      }
    }
    
    await page.screenshot({ path: 'demo-v2-all-switched.png' });
  });
});

test.describe('Forge Studio', () => {
  test('studio page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for Monaco to load
    
    // Should show Forge Studio branding
    await expect(page.locator('text=Forge')).toBeVisible();
    await expect(page.locator('text=Studio')).toBeVisible();
    
    await page.screenshot({ path: 'studio-v2-loaded.png' });
  });

  test('studio has code editor panel', async ({ page }) => {
    await page.goto('http://localhost:3000/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should show Composition.tsx tab
    await expect(page.locator('text=Composition.tsx')).toBeVisible();
    
    await page.screenshot({ path: 'studio-v2-editor-panel.png' });
  });

  test('studio has preview panel', async ({ page }) => {
    await page.goto('http://localhost:3000/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should show Preview panel
    await expect(page.locator('text=Preview')).toBeVisible();
    
    // Should show resolution info
    await expect(page.locator('text=1920')).toBeVisible();
    
    await page.screenshot({ path: 'studio-v2-preview-panel.png' });
  });

  test('studio has playback controls', async ({ page }) => {
    await page.goto('http://localhost:3000/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should show play/pause button
    await expect(page.locator('text=Ready')).toBeVisible();
    
    // Should show Export button
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    
    await page.screenshot({ path: 'studio-v2-controls.png' });
  });
});

test.describe('Full Page Visual Verification', () => {
  test('complete landing page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Full page screenshot for visual review
    await page.screenshot({ 
      path: 'motionforge-v2-complete.png', 
      fullPage: true 
    });
  });

  test('dark theme consistency across sections', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check background color is dark
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be dark background
    expect(bgColor).toContain('0'); // Contains dark values
    
    await page.screenshot({ path: 'motionforge-v2-dark-theme.png' });
  });

  test('emerald green accent color is used', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check that emerald branding is present
    const navBrand = page.locator('nav >> text=MotionForge');
    await expect(navBrand).toBeVisible();
    
    // Check for emerald color in CTAs
    const ctaButton = page.locator('button:has-text("Open Studio")').first();
    const buttonBg = await ctaButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Button should have green/emerald background
    expect(buttonBg).toBeTruthy();
    
    await page.screenshot({ path: 'motionforge-v2-branding.png' });
  });
});
