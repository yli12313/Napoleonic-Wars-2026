import type { Conflict, Result, Significance, BattleType } from './types';

export interface ConflictMeta {
  id: Conflict;
  /** Short label used in dense UI. */
  label: string;
  /** Full formal name. */
  fullName: string;
  /** Headline years of the war, as historians usually give them. */
  headlineRange: string;
  /**
   * Explicit allowed span for battles filed under this category.
   * This is deliberately wider than `headlineRange` because three campaigns are
   * folded into categories whose headline dates do not contain them --
   * see DECISIONS.md (Egypt 1798, Russia 1812, Spain 1808).
   */
  allowedFrom: string;
  allowedTo: string;
  /** Accent colour used across map, filters and charts. */
  color: string;
}

export const CONFLICTS: ConflictMeta[] = [
  {
    id: 'first-coalition',
    label: 'First Coalition',
    fullName: 'War of the First Coalition',
    headlineRange: '1792–1797',
    allowedFrom: '1793-01-01',
    allowedTo: '1797-10-31',
    color: '#c9a227',
  },
  {
    id: 'second-coalition',
    label: 'Second Coalition',
    fullName: 'War of the Second Coalition',
    headlineRange: '1798–1802',
    allowedFrom: '1798-05-01',
    allowedTo: '1802-03-31',
    color: '#d98f4a',
  },
  {
    id: 'third-coalition',
    label: 'Third Coalition',
    fullName: 'War of the Third Coalition',
    headlineRange: '1805',
    allowedFrom: '1805-08-01',
    allowedTo: '1805-12-31',
    color: '#8fb8de',
  },
  {
    id: 'fourth-coalition',
    label: 'Fourth Coalition',
    fullName: 'War of the Fourth Coalition',
    headlineRange: '1806–1807',
    allowedFrom: '1806-09-01',
    allowedTo: '1807-07-31',
    color: '#5f8ec4',
  },
  {
    id: 'fifth-coalition',
    label: 'Fifth Coalition',
    fullName: 'War of the Fifth Coalition',
    headlineRange: '1808–1809',
    allowedFrom: '1808-11-01',
    allowedTo: '1809-10-31',
    color: '#a58bc9',
  },
  {
    id: 'sixth-coalition',
    label: 'Sixth Coalition',
    fullName: 'War of the Sixth Coalition',
    headlineRange: '1812–1814',
    allowedFrom: '1812-06-01',
    allowedTo: '1814-04-30',
    color: '#c9736b',
  },
  {
    id: 'seventh-coalition',
    label: 'Seventh Coalition',
    fullName: 'War of the Seventh Coalition',
    headlineRange: '1815',
    allowedFrom: '1815-06-01',
    allowedTo: '1815-07-31',
    color: '#7fae9b',
  },
];

export const CONFLICT_BY_ID: Record<Conflict, ConflictMeta> = Object.fromEntries(
  CONFLICTS.map((c) => [c.id, c]),
) as Record<Conflict, ConflictMeta>;

export const CONFLICT_IDS: Conflict[] = CONFLICTS.map((c) => c.id);

export const RESULTS: { id: Result; label: string; color: string }[] = [
  { id: 'victory', label: 'Victory', color: '#e8b93f' },
  { id: 'defeat', label: 'Defeat', color: '#5b8fd6' },
  { id: 'inconclusive', label: 'Inconclusive', color: '#9aa3ad' },
];

export const RESULT_COLOR: Record<Result, string> = {
  victory: '#e8b93f',
  defeat: '#5b8fd6',
  inconclusive: '#9aa3ad',
};

export const SIGNIFICANCE_ORDER: Significance[] = ['decisive', 'major', 'minor'];

export const TYPE_LABEL: Record<BattleType, string> = {
  battle: 'Field battle',
  siege: 'Siege',
};

/** Plausible bounding boxes per theatre, used by the validation script. */
export const THEATRE_BOUNDS = {
  europe: { minLat: 35, maxLat: 60, minLng: -10, maxLng: 40 },
  levant: { minLat: 29, maxLat: 36, minLng: 24, maxLng: 37 },
  russia: { minLat: 50, maxLat: 60, minLng: 22, maxLng: 45 },
} as const;

export const YEAR_MIN = 1793;
export const YEAR_MAX = 1815;
