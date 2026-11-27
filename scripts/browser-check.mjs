import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from '@playwright/test';

const PORT = 4173;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = 'browser-check';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

async function check(browserType, browserName, viewport) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response?.status()}`);

    await page.waitForSelector('h1', { timeout: 10000 });

    const audit = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const h1 = document.querySelector('h1');
      return {
        title: document.title,
        heading: h1?.textContent?.trim() || '',
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        canvasCount: canvases.length,
        canvasesSized: canvases.every((c) => c.width > 0 && c.height > 0),
        lang: document.documentElement.lang,
        loadMs: Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd ?? 0),
        domReadyMs: Math.round(
          performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? 0
        ),
      };
    });

    await page.screenshot({
      path: `${OUTPUT_DIR}/${browserName}-${viewport.name}.png`,
      fullPage: false,
    });

    // End-to-end behaviour: hero CTA -> routines -> receipt dialog -> dismissal.
    const e2e = { adoptedNavigation: false, receiptDialog: false, dismissed: false };
    await page.getByRole('button', { name: /adopt low-emission daily routines/i }).first().click();
    const routinesHeading = page.getByRole('heading', { name: /daily routine optimizer/i });
    e2e.adoptedNavigation = await routinesHeading
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    await page.getByRole('button', { name: /^Adopt .* routine$/i }).first().click();
    const dialog = page.getByRole('dialog');
    e2e.receiptDialog = await dialog
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    await page.keyboard.press('Escape');
    e2e.dismissed = await dialog
      .waitFor({ state: 'hidden', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    // Reset to a clean page before exercising the tabbed views.
    await page.reload({ waitUntil: 'networkidle' });

    // Exercise the tabbed views that hold the extracted components.
    for (const tab of ['Daily Routines', 'Indoor Hacks', 'Air Forecast', 'AI Assistant']) {
      const button = page.getByRole('button', { name: tab, exact: false }).first();
      if (await button.count()) {
        await button.click();
        await page.waitForTimeout(120);
      }
    }
    await page.screenshot({
      path: `${OUTPUT_DIR}/${browserName}-${viewport.name}-tabs.png`,
      fullPage: false,
    });

    return { browser: browserName, viewport: viewport.name, ...audit, e2e, consoleErrors, pageErrors };
  } finally {
    await browser.close();
  }
}

let server;
try {
  if (!process.env.BASE_URL) {
    server = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
      stdio: 'ignore',
      detached: false,
    });
  }
  await waitForServer(BASE_URL);
  await mkdir(OUTPUT_DIR, { recursive: true });

  const results = [];
  for (const [name, type] of [
    ['chromium', chromium],
    ['webkit', webkit],
  ]) {
    for (const viewport of VIEWPORTS) {
      results.push(await check(type, name, viewport));
    }
  }

  let failed = false;
  for (const r of results) {
    const ok =
      r.heading.length > 0 &&
      !r.horizontalOverflow &&
      r.canvasesSized &&
      r.lang.length > 0 &&
      r.e2e.adoptedNavigation &&
      r.e2e.receiptDialog &&
      r.e2e.dismissed &&
      r.consoleErrors.length === 0 &&
      r.pageErrors.length === 0;
    if (!ok) failed = true;
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${r.browser}/${r.viewport} | load=${r.loadMs}ms | domReady=${r.domReadyMs}ms | e2e=${JSON.stringify(r.e2e)} | canvases=${r.canvasCount} | overflow=${r.horizontalOverflow} | consoleErrors=${r.consoleErrors.length} | pageErrors=${r.pageErrors.length}`
    );
    for (const err of [...r.consoleErrors, ...r.pageErrors]) console.log(`   ${err}`);
  }
  console.log(`Screenshots written to ${OUTPUT_DIR}/`);
  if (failed) process.exitCode = 1;
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  if (server) server.kill('SIGTERM');
}
