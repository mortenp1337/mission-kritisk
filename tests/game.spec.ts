import { test, expect } from '@playwright/test';

test.describe('Phaser Game', () => {
  test('should load the game successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Phaser - Template/);
    
    // Check if the game canvas is present
    await expect(page.locator('canvas')).toBeVisible();
    
    // Wait for the game to initialize
    await page.waitForTimeout(2000);
    
    // Take a screenshot for visual validation
    await page.screenshot({ path: 'test-results/game-loaded.png' });
  });

  test('should handle game interactions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to load
    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000);
    
    // Click on the canvas to interact with the game
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // Wait a moment after interaction
    await page.waitForTimeout(1000);
    
    // Take screenshot after interaction
    await page.screenshot({ path: 'test-results/game-interaction.png' });
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.screenshot({ path: 'test-results/desktop-view.png' });
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/tablet-view.png' });
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should have working scene transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.waitForTimeout(3000); // Wait for game to fully load
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/initial-scene.png' });
    
    // Click to trigger scene transitions
    const canvas = page.locator('canvas');
    await canvas.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after first click
    await page.screenshot({ path: 'test-results/after-first-click.png' });
    
    // Click again to continue through scenes
    await canvas.click();
    await page.waitForTimeout(1000);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/after-second-click.png' });
  });
});