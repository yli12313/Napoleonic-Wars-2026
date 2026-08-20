import type { Battle, Conflict, Result } from '../data/types';
import { CONFLICTS, YEAR_MAX, YEAR_MIN } from '../data/conflicts';
import { battleYear } from './filters';

export interface Headline {
  total: number;
  victories: number;
  defeats: number;
  inconclusive: number;
  /** Percentage 0-100, or null when nothing is selected. */
  winRate: number | null;
  /** Sum of both sides' recorded casualties across the filtered set. */
  casualties: number;
  /** How many of the filtered battles carry any casualty figure at all. */
  casualtyCoverage: number;
  sieges: number;
  decisive: number;
}

export interface ByConflictRow {
  id: Conflict;
  label: string;
  short: string;
  victory: number;
  defeat: number;
  inconclusive: number;
  total: number;
}

export interface ByYearRow {
  year: number;
  label: string;
  battles: number;
  frenchCasualties: number;
  opposingCasualties: number;
  casualties: number;
}

export interface Stats {
  headline: Headline;
  byConflict: ByConflictRow[];
  byYear: ByYearRow[];
}

const RESULT_KEYS: Result[] = ['victory', 'defeat', 'inconclusive'];

export function computeStats(battles: Battle[]): Stats {
  const headline: Headline = {
    total: battles.length,
    victories: 0,
    defeats: 0,
    inconclusive: 0,
    winRate: null,
    casualties: 0,
    casualtyCoverage: 0,
    sieges: 0,
    decisive: 0,
  };

  for (const b of battles) {
    if (b.result === 'victory') headline.victories++;
    else if (b.result === 'defeat') headline.defeats++;
    else headline.inconclusive++;
    if (b.type === 'siege') headline.sieges++;
    if (b.significance === 'decisive') headline.decisive++;
    const c = (b.frenchCasualties ?? 0) + (b.opposingCasualties ?? 0);
    if (c > 0) {
      headline.casualties += c;
      headline.casualtyCoverage++;
    }
  }
  headline.winRate = battles.length ? (headline.victories / battles.length) * 100 : null;

  const byConflict: ByConflictRow[] = CONFLICTS.map((c) => {
    const rows = battles.filter((b) => b.conflict === c.id);
    const row: ByConflictRow = {
      id: c.id,
      label: c.label,
      short: c.label.replace(' Coalition', ''),
      victory: 0,
      defeat: 0,
      inconclusive: 0,
      total: rows.length,
    };
    for (const k of RESULT_KEYS) row[k] = rows.filter((b) => b.result === k).length;
    return row;
  }).filter((r) => r.total > 0);

  const byYear: ByYearRow[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    const rows = battles.filter((b) => battleYear(b) === y);
    const fr = rows.reduce((s, b) => s + (b.frenchCasualties ?? 0), 0);
    const op = rows.reduce((s, b) => s + (b.opposingCasualties ?? 0), 0);
    byYear.push({
      year: y,
      label: `’${String(y).slice(2)}`,
      battles: rows.length,
      frenchCasualties: fr,
      opposingCasualties: op,
      casualties: fr + op,
    });
  }

  return { headline, byConflict, byYear };
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-GB');
}

const trimZero = (s: string) => s.replace(/\.0$/, '');

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${trimZero((n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1))}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${trimZero((n / 1000).toFixed(1))}k`;
  return String(n);
}
