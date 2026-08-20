import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/shots';
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const log = [];

async function newPage(browser, size, extra = {}) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2, ...extra });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      errors.push(`[${m.type()}] ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (!u.includes('basemaps.cartocdn.com')) errors.push(`[requestfailed] ${u} :: ${r.failure()?.errorText}`);
  });
  return { ctx, page };
}

const browser = await chromium.launch();

// ---------------------------------------------------------------- desktop
{
  const { ctx, page } = await newPage(browser, { width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/desktop-01-default.png` });
  log.push(`markers: ${await page.locator('.battle-marker').count()}, clusters: ${await page.locator('.battle-cluster').count()}`);

  // open a popup on a decisive battle
  await page.fill('.search-input', 'Austerlitz');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/desktop-02-search.png` });
  const match = page.locator('.match-row').first();
  if (await match.count()) {
    await match.click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/desktop-03-popup.png` });
  }

  // filtered view: sixth coalition only
  await page.fill('.search-input', '');
  await page.click('.mini-btn:has-text("None")');
  await page.waitForTimeout(300);
  await page.click('.coalition-row:has-text("Sixth Coalition")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/desktop-04-filtered.png` });
  log.push(`url after filter: ${page.url()}`);

  // reload to prove URL round-trip
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/desktop-05-reloaded.png` });
  log.push(`visible count after reload: ${await page.locator('.live-count strong').textContent()}`);

  await ctx.close();
}

// ----------------------------------------------------------------- mobile
{
  const { ctx, page } = await newPage(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/mobile-01-map.png` });
  await page.click('.tab:has-text("Filters")');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/mobile-02-filters.png` });
  await page.click('.tab:has-text("Statistics")');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/mobile-03-stats.png` });
  await page.click('.sheet-close');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/mobile-04-closed.png` });
  await ctx.close();
}

await browser.close();

console.log('--- log ---');
for (const l of log) console.log(l);
console.log(`--- console issues (${errors.length}) ---`);
for (const e of [...new Set(errors)].slice(0, 40)) console.log(e);
