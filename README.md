# The Battles of Napoleon Bonaparte

<img width="1708" height="884" alt="image" src="https://github.com/user-attachments/assets/2964b79c-11cc-4a2e-bcd0-71b2e647acc0" />

An interactive dark-themed map of **every engagement Napoleon Bonaparte
personally commanded** — 71 of them, from the siege of Toulon in September 1793
to Waterloo in June 1815 — with a filter dock, a live statistics dashboard and a
linkable URL for any filtered view.

No backend. The dataset is a typed TypeScript module compiled into the bundle.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc --noEmit` then a production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run validate` | Run the dataset integrity checks (see below) |
| `npm run lint` | oxlint |

Requires Node 18+. Tested on Node 25.

---

## What's in it

### The map

- CARTO **dark_matter** raster tiles (`{s}.basemaps.cartocdn.com/dark_all/…`),
  attributed to OpenStreetMap contributors and CARTO in the bottom-right control,
  warmed slightly towards aged paper with a CSS filter.
- Framed on Europe at load, pannable to Egypt, the Levant and Moscow, with
  `maxBounds` that stop you drifting into open ocean and zoom clamped to 3–13.
- **Custom `divIcon` markers**, entirely CSS-styled:

  | Channel | Encodes | Values |
  | --- | --- | --- |
  | Hue | Result | gold = victory · blue = defeat · grey = inconclusive |
  | Fill | Result (redundant, for colour-vision safety) | solid · hollow ring · filled-and-barred |
  | Shape | Type | circle = field battle · diamond = siege |
  | Size | Significance | 30px decisive · 20px major · 13px minor |
  | Pulse | Significance | decisive battles get a slow ring, suppressed under `prefers-reduced-motion` |

- **Clustering** via `leaflet.markercluster` with custom gilt cluster icons, so
  northern Italy is readable at low zoom. Clusters containing a decisive battle
  get a brighter ring.
- **Hover** raises the marker and shows a minimal tooltip (name + year).
- **Click** opens a fully restyled popup card: name, dates, modern location,
  outcome chip, both commands, belligerents, strengths and losses where known,
  and a 2–3 sentence summary. Leaflet's default popup chrome is completely
  overridden.

### Filters (left dock on desktop, bottom sheet on mobile)

- **Coalition** — seven rows, each with its date range and a live battle count
  computed under all the *other* active filters, plus All / None shortcuts.
- **Outcome** — victory / defeat / inconclusive toggled independently.
- **Years** — dual-handle range over 1793–1815, built from two native sliders so
  keyboard and screen-reader support come for free.
- **Campaign** — secondary dropdown driven by the free-text `campaign` field, so
  you can isolate e.g. the *Six Days Campaign* inside the Sixth Coalition.
- **Search** — free text over battle name, location and commanders on both sides,
  diacritic-insensitive (`chateau` matches *Château-Thierry*). Matching battles
  are listed; clicking one flies the map to it and opens its card.
- Live count of visible battles, and a **Clear filters** button that appears only
  when something is filtered.

Filtering is memoised and the marker layer is never rebuilt — markers are created
once and added to or removed from the cluster group by set difference.

### URL state

Every filter round-trips through the query string, so a filtered view is a link
that survives a reload and the back button:

```
/?c=16&r=vd&y=1796-1814&k=Italian+Campaign&q=lannes
```

`c` = coalition digits 1–7 · `r` = `v`/`d`/`i` · `y` = year range ·
`k` = campaign · `q` = search. Defaults are omitted from the URL.

### Statistics (right dock on desktop, bottom sheet on mobile)

Everything recomputes from the **currently filtered** set, not the full dataset:

- Headline tiles: battles shown, victories, defeats, win rate, estimated
  casualties (with a note on how many of the filtered battles carry a figure).
- Win / loss / inconclusive **stacked bar by coalition**.
- **Battles per year**, 1793–1815 — the 1796 and 1814 spikes are the point.
- **Recorded casualties over time**, French versus opposing, stacked.

Recharts is restyled throughout: custom palette, dark tooltips, hairline
horizontal grid only.

### Responsive & accessible

- Desktop: two docked panels layered over the map with backdrop blur.
- ≤900px: panels become bottom sheets behind a two-tab bar; the map stays the
  hero. Verified down to 390×844.
- Keyboard-navigable throughout with visible gold focus rings; the map is placed
  last in the DOM so tabbing reaches the controls first. ARIA labels and
  `aria-pressed` on every toggle, `aria-live` on the visible count.
- `prefers-reduced-motion` disables the marker pulse and all transitions.

---

## Data

### Where it came from

Battle-by-battle research compiled by hand into `src/data/battles.ts` from the
standard reference literature on the Napoleonic Wars — principally David
Chandler's *The Campaigns of Napoleon* and *Dictionary of the Napoleonic Wars*,
Digby Smith's *The Napoleonic Wars Data Book*, Gunther Rothenberg's *The Art of
Warfare in the Age of Napoleon*, Charles Esdaile's *Napoleon's Wars*, and the
per-battle consensus reflected in Wikipedia's Napoleonic battle articles and the
Napoleon Series archives. Coordinates are the modern location of the battlefield
or of the town the battle is named for.

**Figures are rounded mid-range estimates, not archival counts.** Napoleonic
returns are unreliable by nature — French bulletins understated losses as
policy, and prisoners are often merged with killed and wounded. Where the
scholarly range is too wide or too contested to compress into a single number,
the field is `null` and the UI shows an em dash rather than a guess. See
[DECISIONS.md](./DECISIONS.md) for exactly which fields are missing and why.

### Shape

```ts
interface Battle {
  id: string;
  name: string;              // "Austerlitz"
  date: string;              // ISO; multi-day engagements use the start date
  endDate?: string;          // multi-day engagements and sieges
  lat: number; lng: number;
  location: string;          // modern place name
  conflict: Conflict;        // one of seven coalitions
  campaign: string;          // theatre label, e.g. "Six Days Campaign"
  result: Result;            // victory | defeat | inconclusive (French POV)
  type: 'battle' | 'siege';
  frenchCommander: string;
  opposingCommanders: string[];
  belligerents: string[];
  frenchForces?: number; opposingForces?: number;
  frenchCasualties?: number; opposingCasualties?: number;
  summary: string;
  significance: 'decisive' | 'major' | 'minor';
}
```

### Coverage

| Coalition | Battles | Allowed date span |
| --- | --- | --- |
| First (1792–1797) | 20 | 1793-01-01 → 1797-10-31 |
| Second (1798–1802) | 9 | 1798-05-01 → 1802-03-31 |
| Third (1805) | 2 | 1805-08-01 → 1805-12-31 |
| Fourth (1806–1807) | 6 | 1806-09-01 → 1807-07-31 |
| Fifth (1808–1809) | 9 | 1808-11-01 → 1809-10-31 |
| Sixth (1812–1814) | 23 | 1812-06-01 → 1814-04-30 |
| Seventh (1815) | 2 | 1815-06-01 → 1815-07-31 |
| **Total** | **71** | 62 field battles, 9 sieges |

Three campaigns are folded into categories whose headline years do not contain
them — Egypt 1798 into the Second, Russia 1812 into the Sixth, and Napoleon's
Spanish campaign of 1808–09 into the Fifth. The reasoning is in
[DECISIONS.md](./DECISIONS.md), and it is why dates are validated against an
explicit per-category span rather than the coalition's headline years.

### Validation

```bash
npm run validate
```

Checks unique ids, all required fields present and non-empty, coordinates inside
a plausible bounding box for their theatre (Europe / Levant / Russia), dates
inside the explicit allowed span for their category, `endDate` strictly after
`date`, positive and plausible numeric fields, casualties not exceeding
strengths, every coalition populated, and at least 60 battles. It exits non-zero
on any failure.

---

## Project layout

```
src/
  data/
    types.ts        Battle, Result, Conflict, Significance
    conflicts.ts    the seven coalitions: labels, allowed spans, colours
    battles.ts      the dataset — 71 hand-researched engagements
  lib/
    filters.ts      filter state, memoisable filtering, URL encode/decode
    stats.ts        headline / by-coalition / by-year aggregates
    markers.ts      divIcon, tooltip and popup HTML builders
  hooks/
    useFilterState.ts   filter state synced to the query string
    useMediaQuery.ts
  components/
    Header.tsx  BattleMap.tsx  BattleMarkers.tsx  FilterPanel.tsx
    YearRange.tsx  StatsPanel.tsx  Legend.tsx
  styles/
    tokens.css  app.css  panels.css  map.css  charts.css
scripts/
  validate-battles.ts   dataset integrity checks
  shoot.mjs             Playwright screenshots, desktop + mobile
  verify.mjs            Playwright interaction & console-error sweep
  shots/                captured screenshots
```

## Verification

Screenshots and an interaction sweep are scripted. With the dev server running:

```bash
node scripts/shoot.mjs    # screenshots at 1440x900 and 390x844 → scripts/shots/
node scripts/verify.mjs   # filters, deep links, hover, popups, focus order,
                          # reduced motion; reports any console errors
```

Both report zero console errors and zero failed requests.

## Stack

React 18 · TypeScript (strict) · Vite 6 · react-leaflet 4 + Leaflet 1.9 ·
leaflet.markercluster · Recharts 2 · hand-written CSS with custom properties.
Fonts are Cormorant Garamond and Inter from Google Fonts.
