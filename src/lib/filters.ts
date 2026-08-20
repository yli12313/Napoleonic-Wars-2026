import type { Battle, Conflict, Result } from '../data/types';
import { CONFLICT_IDS, YEAR_MAX, YEAR_MIN } from '../data/conflicts';

export interface FilterState {
  /** Selected coalitions. Empty array means nothing is shown. */
  conflicts: Conflict[];
  /** Selected results. Empty array means nothing is shown. */
  results: Result[];
  yearFrom: number;
  yearTo: number;
  /** null = every campaign. */
  campaign: string | null;
  query: string;
}

export const ALL_RESULTS: Result[] = ['victory', 'defeat', 'inconclusive'];

export const DEFAULT_FILTERS: FilterState = {
  conflicts: [...CONFLICT_IDS],
  results: [...ALL_RESULTS],
  yearFrom: YEAR_MIN,
  yearTo: YEAR_MAX,
  campaign: null,
  query: '',
};

export function isDefaultFilters(f: FilterState): boolean {
  return (
    f.conflicts.length === CONFLICT_IDS.length &&
    f.results.length === ALL_RESULTS.length &&
    f.yearFrom === YEAR_MIN &&
    f.yearTo === YEAR_MAX &&
    f.campaign === null &&
    f.query.trim() === ''
  );
}

export function battleYear(b: Battle): number {
  return Number(b.date.slice(0, 4));
}

/** Haystack for the free-text search: name, commanders and location. */
function haystack(b: Battle): string {
  return [b.name, b.location, b.frenchCommander, b.opposingCommanders.join(' ')]
    .join(' ')
    .toLowerCase();
}

const haystackCache = new WeakMap<Battle, string>();
function cachedHaystack(b: Battle): string {
  let h = haystackCache.get(b);
  if (h === undefined) {
    h = haystack(b);
    haystackCache.set(b, h);
  }
  return h;
}

/** Strip diacritics so "Chateau" matches "Château". */
export function normalise(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterBattles(battles: Battle[], f: FilterState): Battle[] {
  const conflicts = new Set(f.conflicts);
  const results = new Set(f.results);
  const terms = normalise(f.query.trim())
    .split(/\s+/)
    .filter(Boolean);

  return battles.filter((b) => {
    if (!conflicts.has(b.conflict)) return false;
    if (!results.has(b.result)) return false;
    const year = battleYear(b);
    if (year < f.yearFrom || year > f.yearTo) return false;
    if (f.campaign !== null && b.campaign !== f.campaign) return false;
    if (terms.length) {
      const hay = normalise(cachedHaystack(b));
      for (const t of terms) if (!hay.includes(t)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------- URL sync */

const RESULT_CODE: Record<Result, string> = { victory: 'v', defeat: 'd', inconclusive: 'i' };
const CODE_RESULT: Record<string, Result> = { v: 'victory', d: 'defeat', i: 'inconclusive' };

/** Short stable codes so the query string stays readable. */
const CONFLICT_CODE: Record<Conflict, string> = {
  'first-coalition': '1',
  'second-coalition': '2',
  'third-coalition': '3',
  'fourth-coalition': '4',
  'fifth-coalition': '5',
  'sixth-coalition': '6',
  'seventh-coalition': '7',
};
const CODE_CONFLICT: Record<string, Conflict> = Object.fromEntries(
  Object.entries(CONFLICT_CODE).map(([k, v]) => [v, k as Conflict]),
) as Record<string, Conflict>;

export function filtersToSearch(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.conflicts.length !== CONFLICT_IDS.length)
    p.set('c', f.conflicts.map((c) => CONFLICT_CODE[c]).join(''));
  if (f.results.length !== ALL_RESULTS.length)
    p.set('r', f.results.map((r) => RESULT_CODE[r]).join(''));
  if (f.yearFrom !== YEAR_MIN || f.yearTo !== YEAR_MAX) p.set('y', `${f.yearFrom}-${f.yearTo}`);
  if (f.campaign !== null) p.set('k', f.campaign);
  if (f.query.trim() !== '') p.set('q', f.query.trim());
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function filtersFromSearch(search: string, campaigns: string[]): FilterState {
  const p = new URLSearchParams(search);
  const f: FilterState = { ...DEFAULT_FILTERS, conflicts: [...CONFLICT_IDS], results: [...ALL_RESULTS] };

  const c = p.get('c');
  if (c !== null) {
    const picked = c
      .split('')
      .map((ch) => CODE_CONFLICT[ch])
      .filter((v): v is Conflict => Boolean(v));
    f.conflicts = CONFLICT_IDS.filter((id) => picked.includes(id));
  }

  const r = p.get('r');
  if (r !== null) {
    const picked = r
      .split('')
      .map((ch) => CODE_RESULT[ch])
      .filter((v): v is Result => Boolean(v));
    f.results = ALL_RESULTS.filter((id) => picked.includes(id));
  }

  const y = p.get('y');
  if (y) {
    const m = /^(\d{4})-(\d{4})$/.exec(y);
    if (m) {
      const from = clampYear(Number(m[1]));
      const to = clampYear(Number(m[2]));
      f.yearFrom = Math.min(from, to);
      f.yearTo = Math.max(from, to);
    }
  }

  const k = p.get('k');
  if (k && campaigns.includes(k)) f.campaign = k;

  const q = p.get('q');
  if (q) f.query = q;

  return f;
}

function clampYear(n: number): number {
  if (!Number.isFinite(n)) return YEAR_MIN;
  return Math.min(YEAR_MAX, Math.max(YEAR_MIN, Math.round(n)));
}
