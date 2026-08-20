# PLAN — The Battles of Napoleon Bonaparte

An interactive dark-themed web map of every battle Napoleon personally commanded.

## 1. Scaffold
- [x] Vite + React 18 + TypeScript project in repo root
- [x] Pin react-leaflet@4 (React 18 compatible), leaflet@1.9, recharts, leaflet.markercluster + types
- [x] Base config: tsconfig strict, vite config, scripts (`dev`, `build`, `validate`)

## 2. Data layer
- [x] `src/data/types.ts` — Battle / Result / Conflict / Significance types
- [x] `src/data/conflicts.ts` — 7 coalitions with labels, allowed date spans, colours
- [x] `src/data/battles.ts` — 60+ hand-researched battles, Toulon 1793 → Waterloo 1815
  - [x] First Coalition: Toulon, Vendémiaire, full Italian campaign (Montenotte → Tagliamento)
  - [x] Second Coalition: Malta, Egypt & Syria, Marengo
  - [x] Third Coalition: Ulm, Austerlitz
  - [x] Fourth Coalition: Jena, Eylau, Danzig, Heilsberg, Friedland
  - [x] Fifth Coalition: Spain 1808–09 + the 1809 Danube campaign
  - [x] Sixth Coalition: Russia 1812, Germany 1813, France 1814 (incl. Six Days)
  - [x] Seventh Coalition: Ligny, Waterloo
- [x] Exclude marshal-only actions; fold same-day marshal battles into summaries
- [x] `scripts/validate-battles.ts` — bbox, date-span, required fields, dup ids, endDate order
- [x] `npm run validate` passes clean

## 3. App shell & design system
- [x] `src/styles/tokens.css` — palette, type scale, elevation, motion
- [x] Google Fonts: Cormorant Garamond (display) + Inter (UI)
- [x] Header with typographic authority; layered translucent panels

## 4. Map
- [x] CARTO dark_matter tiles, correct attribution
- [x] maxBounds / min+max zoom framing Europe, reaching Egypt & Moscow
- [x] divIcon markers: hue = result, size = significance, shape = siege vs battle
- [x] Decisive-battle pulse, gated on `prefers-reduced-motion`
- [x] Custom-styled marker clustering (imperative layer, no remount on filter change)
- [x] Themed popup card + hover tooltip (name + year)
- [x] Legend

## 5. Filters
- [x] Coalition multi-select with date range + live counts, All / None
- [x] Result toggles
- [x] Dual-handle year slider 1793–1815
- [x] Campaign dropdown
- [x] Free-text search (name, commander, location)
- [x] Visible count + conditional clear-all
- [x] URL query-string sync (read on load, write on change)
- [x] Memoized filtering

## 6. Stats dashboard
- [x] Headline tiles from the *filtered* set
- [x] Stacked win/loss/inconclusive by coalition
- [x] Battles per year 1793–1815
- [x] Casualties over time
- [x] Recharts restyled for the dark theme

## 7. Responsive + a11y
- [x] Desktop: left filter dock, right stats dock
- [x] Mobile ≤390px: bottom sheets, map stays hero
- [x] Keyboard nav, focus rings, ARIA labels, contrast

## 8. Verification
- [x] `npm run build` + `npx tsc --noEmit` clean after every milestone
- [x] Playwright: dev server, screenshots @1440x900 and @390x844, inspect them
- [x] Console error check on load + interaction
- [x] Iterate on visuals until good

## 9. Docs
- [x] README.md — run instructions, data sources
- [x] DECISIONS.md — Egypt/Russia/Spain categorisation, borderline battles, null fields

---

## Status: complete

All items above are done. Final state:

- **71 battles**, 62 field battles + 9 sieges, all seven coalitions populated.
- `npm run validate` passes with zero errors and zero warnings.
- `npx tsc --noEmit` reports zero errors; `npm run build` succeeds.
- `node scripts/verify.mjs` reports zero console errors across desktop and
  mobile, with filters, deep links, hover tooltips, popups, keyboard focus order
  and reduced-motion all exercised.
- Screenshots captured and reviewed at 1440x900 and 390x844 in `scripts/shots/`.
- `README.md` and `DECISIONS.md` written.
