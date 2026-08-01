import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const storyUrl =
  'http://localhost:6006/iframe.html?id=components-filterpopover--default&viewMode=story';

await page.goto(storyUrl, { waitUntil: 'networkidle' });
await page.waitForSelector('button:has-text("Filter")', { timeout: 15000 });
await page.click('button:has-text("Filter")');
await page.waitForTimeout(400);

await page.screenshot({
  path: '/tmp/claude-1000/-workspaces-connecthr-admin/ec2bef05-788e-4f75-b091-59bf6eee0289/scratchpad/filter-popover-open.png',
});

await browser.close();
console.log('done');
