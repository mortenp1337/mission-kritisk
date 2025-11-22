import { test, expect } from '@playwright/test';

test.describe('Build Verification', () => {
  test('production build loads correctly', async ({ page }) => {
    // This test will be used to verify the production build
    await page.goto('/');
    
    // Check basic page structure
    await expect(page).toHaveTitle(/Phaser - Template/);
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for game initialization
    await page.waitForSelector('canvas');
    await page.waitForTimeout(3000);
    
    // Check that we don't have critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('DevTools') // Ignore DevTools warnings
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('assets load successfully', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.waitForTimeout(3000);
    
    // Filter out common acceptable failures
    const significantFailures = failedRequests.filter(url => 
      !url.includes('favicon') &&
      !url.includes('analytics') &&
      !url.includes('tracking')
    );
    
    expect(significantFailures).toHaveLength(0);
  });
});