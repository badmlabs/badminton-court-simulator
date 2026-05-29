import { chromium, devices } from 'playwright';
import { mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = '/opt/cursor/artifacts';
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'drill-demo-videos');
const OUTPUT_MP4 = path.join(ARTIFACT_DIR, 'badminton-drill-steps-demo.mp4');
const WORKSPACE_MP4 = '/workspace/demo/badminton-drill-steps-demo.mp4';

await mkdir(VIDEO_DIR, { recursive: true });
await mkdir(path.dirname(WORKSPACE_MP4), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...devices['Pixel 5'],
  viewport: { width: 430, height: 932 },
  recordVideo: { dir: VIDEO_DIR, size: { width: 430, height: 932 } },
});
const page = await context.newPage();

await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(3000);

const openSteps = async () => {
  const stepsLabel = page.getByText('Steps', { exact: true });
  await stepsLabel.locator('..').locator('..').locator('button').first().click();
  await page.waitForTimeout(2000);
};

await openSteps();
const nameField = page.getByLabel('Drill name (optional)');
if (await nameField.isVisible().catch(() => false)) {
  await nameField.fill('Smash drill');
}
await page.waitForTimeout(1500);

// Tap overlay to close modal
await page.locator('body').click({ position: { x: 20, y: 20 }, force: true }).catch(() => {});
await page.keyboard.press('Escape');
await page.waitForTimeout(1000);

const vp = page.viewportSize();
await page.mouse.move(vp.width / 2, vp.height * 0.42);
await page.mouse.down();
await page.mouse.move(vp.width / 2 + 90, vp.height * 0.36, { steps: 20 });
await page.mouse.up();
await page.waitForTimeout(1200);

await openSteps();
await page.getByText('Share link').waitFor({ state: 'visible', timeout: 10000 });
await page.waitForTimeout(3000);

await page.close();
await context.close();
await browser.close();
await new Promise((r) => setTimeout(r, 1000));

const files = await readdir(VIDEO_DIR);
let best = '';
let bestSize = 0;
for (const f of files) {
  if (!f.endsWith('.webm')) continue;
  const s = (await stat(path.join(VIDEO_DIR, f))).size;
  if (s > bestSize) {
    bestSize = s;
    best = f;
  }
}
if (!best) throw new Error('No video captured');
execSync(
  `ffmpeg -y -i "${path.join(VIDEO_DIR, best)}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${OUTPUT_MP4}"`,
  { stdio: 'inherit' }
);
execSync(`cp "${OUTPUT_MP4}" "${WORKSPACE_MP4}"`);
console.log('Saved', OUTPUT_MP4, `(${bestSize} bytes source)`);
