/** Outcome of an engagement, always from the French perspective. */
export type Result = 'victory' | 'defeat' | 'inconclusive';

export type Conflict =
  | 'first-coalition'
  | 'second-coalition'
  | 'third-coalition'
  | 'fourth-coalition'
  | 'fifth-coalition'
  | 'sixth-coalition'
  | 'seventh-coalition';

export type BattleType = 'battle' | 'siege';

export type Significance = 'decisive' | 'major' | 'minor';

export interface Battle {
  id: string;
  /** Common English name, without the "Battle of" prefix. */
  name: string;
  /** ISO date. Multi-day engagements carry the start date here. */
  date: string;
  /** ISO date; present for multi-day engagements and sieges. */
  endDate?: string;
  lat: number;
  lng: number;
  /** Modern place name, e.g. "Slavkov u Brna, Czech Republic". */
  location: string;
  conflict: Conflict;
  /** Free-text theatre label, e.g. "Italian Campaign", "Six Days Campaign". */
  campaign: string;
  result: Result;
  type: BattleType;
  /** Napoleon plus notable subordinates present. */
  frenchCommander: string;
  opposingCommanders: string[];
  /** Opposing nations / powers. */
  belligerents: string[];
  frenchForces?: number;
  opposingForces?: number;
  frenchCasualties?: number;
  opposingCasualties?: number;
  /** 2-3 sentences: what happened and why it mattered. */
  summary: string;
  significance: Significance;
}
