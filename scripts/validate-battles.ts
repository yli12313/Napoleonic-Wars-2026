/**
 * Dataset integrity check.
 *
 *   npm run validate
 *
 * Checks: unique ids, required fields present and non-empty, coordinates inside
 * a plausible bounding box for the battle's theatre, dates inside the explicit
 * allowed span for the battle's category (NOT the coalition's headline years --
 * see DECISIONS.md), endDate after date, sane numeric ranges.
 */
import { BATTLES } from '../src/data/battles';
import { CONFLICT_BY_ID, CONFLICT_IDS, THEATRE_BOUNDS, YEAR_MIN, YEAR_MAX } from '../src/data/conflicts';
import type { Battle } from '../src/data/types';

const errors: string[] = [];
const warnings: string[] = [];

const fail = (b: Battle | null, msg: string) =>
  errors.push(b ? `[${b.id}] ${msg}` : msg);

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const RESULTS = new Set(['victory', 'defeat', 'inconclusive']);
const TYPES = new Set(['battle', 'siege']);
const SIGNIFICANCES = new Set(['decisive', 'major', 'minor']);

/** A battle's coordinates must fall inside at least one theatre box. */
function inAnyTheatre(lat: number, lng: number): boolean {
  return Object.values(THEATRE_BOUNDS).some(
    (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng,
  );
}

const seen = new Map<string, Battle>();

for (const b of BATTLES) {
  // -- identity ---------------------------------------------------------
  if (!b.id || !/^[a-z0-9-]+$/.test(b.id)) fail(b, `invalid id: ${JSON.stringify(b.id)}`);
  if (seen.has(b.id)) fail(b, 'duplicate id');
  seen.set(b.id, b);

  // -- required strings -------------------------------------------------
  for (const key of ['name', 'location', 'campaign', 'frenchCommander', 'summary'] as const) {
    if (typeof b[key] !== 'string' || b[key].trim() === '') fail(b, `empty required field: ${key}`);
  }
  if (b.summary.length < 80) warnings.push(`[${b.id}] summary is very short (${b.summary.length} chars)`);

  // -- required arrays --------------------------------------------------
  for (const key of ['opposingCommanders', 'belligerents'] as const) {
    if (!Array.isArray(b[key]) || b[key].length === 0) fail(b, `empty required array: ${key}`);
    else if (b[key].some((v) => typeof v !== 'string' || v.trim() === ''))
      fail(b, `blank entry in ${key}`);
  }

  // -- enums ------------------------------------------------------------
  if (!CONFLICT_IDS.includes(b.conflict)) fail(b, `unknown conflict: ${b.conflict}`);
  if (!RESULTS.has(b.result)) fail(b, `unknown result: ${b.result}`);
  if (!TYPES.has(b.type)) fail(b, `unknown type: ${b.type}`);
  if (!SIGNIFICANCES.has(b.significance)) fail(b, `unknown significance: ${b.significance}`);

  // -- dates ------------------------------------------------------------
  if (!ISO.test(b.date)) fail(b, `date is not ISO yyyy-mm-dd: ${b.date}`);
  if (Number.isNaN(Date.parse(b.date))) fail(b, `unparseable date: ${b.date}`);
  if (b.endDate !== undefined) {
    if (!ISO.test(b.endDate)) fail(b, `endDate is not ISO yyyy-mm-dd: ${b.endDate}`);
    else if (!(b.endDate > b.date)) fail(b, `endDate ${b.endDate} is not after date ${b.date}`);
  }

  const meta = CONFLICT_BY_ID[b.conflict];
  if (meta) {
    if (b.date < meta.allowedFrom || b.date > meta.allowedTo)
      fail(b, `date ${b.date} outside allowed span for ${meta.label} (${meta.allowedFrom}..${meta.allowedTo})`);
    if (b.endDate && b.endDate > meta.allowedTo)
      fail(b, `endDate ${b.endDate} outside allowed span for ${meta.label}`);
  }

  const year = Number(b.date.slice(0, 4));
  if (year < YEAR_MIN || year > YEAR_MAX) fail(b, `year ${year} outside ${YEAR_MIN}-${YEAR_MAX}`);

  // -- geography --------------------------------------------------------
  if (typeof b.lat !== 'number' || typeof b.lng !== 'number' || Number.isNaN(b.lat) || Number.isNaN(b.lng))
    fail(b, 'lat/lng must be numbers');
  else if (!inAnyTheatre(b.lat, b.lng))
    fail(b, `coordinates ${b.lat},${b.lng} fall outside every plausible theatre box`);

  // -- numbers ----------------------------------------------------------
  for (const key of ['frenchForces', 'opposingForces', 'frenchCasualties', 'opposingCasualties'] as const) {
    const v = b[key];
    if (v === undefined) continue;
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0)
      fail(b, `${key} must be a positive number, got ${String(v)}`);
    if (typeof v === 'number' && v > 700000) fail(b, `${key} implausibly large: ${v}`);
  }
  if (b.frenchForces && b.frenchCasualties && b.frenchCasualties > b.frenchForces)
    fail(b, `frenchCasualties (${b.frenchCasualties}) exceed frenchForces (${b.frenchForces})`);
  if (b.opposingForces && b.opposingCasualties && b.opposingCasualties > b.opposingForces * 1.6)
    warnings.push(`[${b.id}] opposingCasualties far exceed opposingForces -- check`);
}

// -- collection-level checks ----------------------------------------------
const coverage = new Map<string, number>();
for (const b of BATTLES) coverage.set(b.conflict, (coverage.get(b.conflict) ?? 0) + 1);
for (const id of CONFLICT_IDS) {
  if (!coverage.get(id)) fail(null, `no battles filed under ${id}`);
}
if (BATTLES.length < 60) fail(null, `dataset has ${BATTLES.length} battles; at least 60 required`);

// -- report ----------------------------------------------------------------
const green = '\x1b[32m', red = '\x1b[31m', yellow = '\x1b[33m', dim = '\x1b[2m', reset = '\x1b[0m';

console.log(`${dim}Validating ${BATTLES.length} battles...${reset}\n`);
for (const id of CONFLICT_IDS) {
  const meta = CONFLICT_BY_ID[id];
  console.log(`  ${meta.label.padEnd(20)} ${String(coverage.get(id) ?? 0).padStart(3)}  ${dim}${meta.allowedFrom} .. ${meta.allowedTo}${reset}`);
}
const sieges = BATTLES.filter((b) => b.type === 'siege').length;
console.log(`\n  ${dim}field battles ${BATTLES.length - sieges} / sieges ${sieges}${reset}`);

if (warnings.length) {
  console.log(`\n${yellow}${warnings.length} warning(s):${reset}`);
  for (const w of warnings) console.log(`  ${yellow}!${reset} ${w}`);
}

if (errors.length) {
  console.log(`\n${red}${errors.length} error(s):${reset}`);
  for (const e of errors) console.log(`  ${red}x${reset} ${e}`);
  process.exit(1);
}

console.log(`\n${green}All checks passed.${reset}`);
