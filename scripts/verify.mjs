import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/shots';
fs.mkdirSync(OUT, { recursive: true });
const issues = [];
const notes = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') issues.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => issues.push(`[pageerror] ${e.stack ?? e.message}`));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const count = () => page.locator('.live-count strong').textContent();

// --- filters compose -------------------------------------------------------
notes.push(`default: ${await count()}`);

await page.click('.mini-btn:has-text("None")');
notes.push(`after None: ${await count()} (expect 0)`);
await page.click('.mini-btn:has-text("All")');
notes.push(`after All: ${await count()} (expect 71)`);

// result toggle
await page.click('.result-chip.is-victory');
notes.push(`victory off: ${await count()} (expect 14)`);
await page.click('.result-chip.is-victory');

// year slider via keyboard
await page.focus('.yr-from');
for (let i = 0; i < 19; i++) await page.keyboard.press('ArrowRight');
notes.push(`year from=${await page.locator('.year-readout').textContent()} count=${await count()}`);
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/desktop-06-yearslider.png` });
notes.push(`url: ${page.url()}`);
for (let i = 0; i < 19; i++) await page.keyboard.press('ArrowLeft');

// campaign select
await page.selectOption('.campaign-select', 'Six Days Campaign');
await page.waitForTimeout(1000);
notes.push(`six days: ${await count()} (expect 4) url=${page.url()}`);
await page.screenshot({ path: `${OUT}/desktop-07-sixdays.png` });

// compose with result filter
await page.click('.result-chip.is-defeat');
await page.click('.result-chip.is-inconclusive');
notes.push(`six days victories only: ${await count()} (expect 4)`);

// clear all
await page.click('.clear-all');
await page.waitForTimeout(300);
notes.push(`after clear: ${await count()} url=${page.url()}`);
notes.push(`clear button present after clear: ${await page.locator('.clear-all').count()} (expect 0)`);

// --- deep link -------------------------------------------------------------
await page.goto(`${BASE}/?c=1&r=d&y=1796-1797&q=bassano`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
notes.push(`deep link count: ${await count()} (expect 1 - Second Bassano)`);
notes.push(`deep link search box: "${await page.inputValue('.search-input')}"`);

// --- marker interaction ----------------------------------------------------
await page.goto(`${BASE}/?q=marengo`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.click('.match-row');
await page.waitForTimeout(2800);
const marker = page.locator('.leaflet-marker-icon.battle-marker-wrap').first();
if (await marker.count()) {
  await page.keyboard.press('Escape');
  await page.click('.battle-popup .leaflet-popup-close-button').catch(() => {});
  await page.waitForTimeout(400);
  const mb = await marker.boundingBox();
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await page.waitForTimeout(700);
  notes.push(`tooltip visible: ${(await page.locator('.battle-tooltip').count()) > 0}`);
  await page.screenshot({ path: `${OUT}/desktop-08-hover.png` });
  await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await page.waitForTimeout(900);
  notes.push(`popup opened: ${(await page.locator('.battle-popup .pop-title').count()) > 0}`);
  await page.screenshot({ path: `${OUT}/desktop-09-marker-popup.png` });
}

// --- keyboard focus --------------------------------------------------------
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
const focused = await page.evaluate(() => {
  const el = document.activeElement;
  return el ? `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 70) : 'none';
});
notes.push(`focus after 4 tabs: ${focused}`);
await page.screenshot({ path: `${OUT}/desktop-10-focus.png` });

// --- reduced motion --------------------------------------------------------
const rmCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const rm = await rmCtx.newPage();
rm.on('pageerror', (e) => issues.push(`[pageerror:rm] ${e.message}`));
await rm.goto(BASE, { waitUntil: 'networkidle' });
await rm.waitForTimeout(1800);
await rm.screenshot({ path: `${OUT}/desktop-11-reduced-motion.png` });
await rmCtx.close();

// --- mobile popup ----------------------------------------------------------
const mCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mp = await mCtx.newPage();
mp.on('console', (m) => { if (m.type() === 'error') issues.push(`[mobile:${m.type()}] ${m.text()}`); });
mp.on('pageerror', (e) => issues.push(`[pageerror:mobile] ${e.message}`));
await mp.goto(`${BASE}/?q=waterloo`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(2200);
await mp.click('.tab:has-text("Filters")');
await mp.waitForTimeout(600);
const mrow = mp.locator('.match-row').first();
if (await mrow.count()) {
  await mrow.click();
  await mp.waitForTimeout(2600);
  await mp.screenshot({ path: `${OUT}/mobile-05-popup.png` });
  notes.push(`mobile popup opened: ${await mp.locator('.battle-popup .pop-title').count() > 0}`);
}
await mCtx.close();

await ctx.close();
await browser.close();

console.log('--- notes ---');
for (const n of notes) console.log(n);
console.log(`--- console issues (${issues.length}) ---`);
for (const e of [...new Set(issues)].slice(0, 30)) console.log(e);
