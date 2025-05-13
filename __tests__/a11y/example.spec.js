import { test, expect } from '@playwright/test';
import { analyzePage } from './axeHelper.js';

test.describe('Accessibility checks', () => {
  test('Home page should have no accessibility violations', async ({ page }, testInfo) => {
    // Navigate to the target page
    await page.goto('http://localhost:3000'); // Replace with your application's URL

    // Perform accessibility analysis
    const accessibilityScanResults = await analyzePage(page, testInfo);

    console.log('Accessibility scan results:\n\n', accessibilityScanResults);
    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
