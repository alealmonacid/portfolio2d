import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\aleja\\.gemini\\antigravity-cli\\brain\\da727364-5962-43c7-b1ef-00606b50c35c';
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function runQA() {
  console.log('Starting Playwright Visual QA...');
  const browser = await chromium.launch({ headless: true });
  
  // Viewports to test
  const devices = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 }
  ];

  for (const device of devices) {
    console.log(`Auditing device: ${device.name} (${device.width}x${device.height})...`);
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    
    // Listen to console and errors
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR] ${err.stack || err.message}`));
    
    // Go to local dev server
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(1000);
    
    // Calculate scrolling heights
    const scrollInfo = await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const maxScroll = scrollHeight - innerHeight;
      return { scrollHeight, innerHeight, maxScroll };
    });

    console.log(`Scroll details: maxScroll = ${scrollInfo.maxScroll}px`);

    // Capture each of the 5 worlds
    for (let level = 0; level < 5; level++) {
      const targetScrollY = (level / 4) * scrollInfo.maxScroll;
      
      // Scroll to target
      await page.evaluate((targetY) => {
        window.scrollTo(0, targetY);
      }, targetScrollY);
      
      // Wait for rendering to settle
      await page.waitForTimeout(1500);
      
      const screenshotPath = path.join(artifactsDir, `qa_${device.name}_level_${level}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotPath}`);
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('Playwright Visual QA Completed!');
}

runQA().catch((err) => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
