import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const analyzePage = async (page, testInfo) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  const outputDir = testInfo.outputDir;
  const sanitizedTitle = testInfo.title.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = path.join(outputDir, `${sanitizedTitle}_a11y.json`);

  // Ensure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(accessibilityScanResults, null, 2));
  console.log(`Accessibility results written to ${filePath}`);
  return accessibilityScanResults;
};

export { analyzePage };
