import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ ...devices['Pixel 5'] });
await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: '/opt/cursor/artifacts/web-debug.png', fullPage: true });
const text = await page.locator('body').innerText();
console.log('Body text sample:', text.slice(0, 800));
await browser.close();
