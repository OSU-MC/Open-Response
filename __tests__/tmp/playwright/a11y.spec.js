import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('Accessibility checks', () => {
  test('Home page should have no accessibility violations', async ({ page }) => {
    // Navigate to the target page
    await page.goto('http://localhost:3000'); // Replace with your application's URL

    // Perform accessibility analysis
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Define the output directory and file path
    const outputDir = path.resolve(process.cwd(), 'a11y-results');
    const filePath = path.join(outputDir, 'home.json');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write the accessibility scan results to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(accessibilityScanResults, null, 2));
    console.log(`Accessibility scan results written to ${filePath}`);

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
