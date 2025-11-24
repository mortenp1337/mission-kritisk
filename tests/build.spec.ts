import { test, expect } from '@playwright/test';

test.describe('Build Verification', () => {
  test('production build loads correctly', async ({ page }) => {
    // This test will be used to verify the production build
    await page.goto('/');
    
    // Check basic page structure
    await expect(page).toHaveTitle(/Mission Kritisk/);
    
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

test.describe('Build Metadata', () => {
  test('build-info.json is deployed at production root', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    expect(response.status()).toBe(200);
    
    const buildInfo = await response.json();
    expect(buildInfo).toBeDefined();
  });

  test('build-info.json contains valid schema for production', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    const buildInfo = await response.json();
    
    // Verify required fields exist
    expect(buildInfo).toHaveProperty('schema_version');
    expect(buildInfo).toHaveProperty('version');
    expect(buildInfo).toHaveProperty('commit_sha');
    expect(buildInfo).toHaveProperty('commit_short');
    expect(buildInfo).toHaveProperty('build_timestamp');
    expect(buildInfo).toHaveProperty('deployment_type');
    
    // Verify field types
    expect(typeof buildInfo.version).toBe('string');
    expect(typeof buildInfo.commit_sha).toBe('string');
    expect(typeof buildInfo.commit_short).toBe('string');
    expect(typeof buildInfo.build_timestamp).toBe('string');
    expect(buildInfo.deployment_type).toBe('production');
    
    // Verify no PR metadata for production
    expect(buildInfo.pr_metadata).toBeUndefined();
  });

  test('version string follows semantic versioning format', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    const buildInfo = await response.json();
    
    // Verify semver format: X.Y.Z or 0.0.0
    const semverPattern = /^\d+\.\d+\.\d+$/;
    expect(buildInfo.version).toMatch(semverPattern);
  });

  test('commit SHA is valid git format', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    const buildInfo = await response.json();
    
    // Full SHA should be 40 hex characters
    expect(buildInfo.commit_sha).toMatch(/^[0-9a-f]{40}$/);
    
    // Short SHA should be 7 hex characters
    expect(buildInfo.commit_short).toMatch(/^[0-9a-f]{7}$/);
    
    // Short should be prefix of full
    expect(buildInfo.commit_sha).toMatch(new RegExp(`^${buildInfo.commit_short}`));
  });

  test('build timestamp is valid ISO 8601 format', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    const buildInfo = await response.json();
    
    const timestamp = new Date(buildInfo.build_timestamp);
    expect(timestamp).not.toBeNull();
    expect(timestamp.toString()).not.toBe('Invalid Date');
    
    // Verify ISO format (ends with Z for UTC)
    expect(buildInfo.build_timestamp).toMatch(/Z$/);
  });

  test('schema_version is present for future compatibility', async ({ page }) => {
    const response = await page.request.get('/.meta/build-info.json');
    const buildInfo = await response.json();
    
    expect(buildInfo.schema_version).toBeDefined();
    // Should follow semver or compatible format
    expect(typeof buildInfo.schema_version).toBe('string');
  });
});