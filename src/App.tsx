import { useCallback, useMemo, useState } from 'react';
import BattleMap from './components/BattleMap';
import FilterPanel from './components/FilterPanel';
import Header from './components/Header';
import Legend from './components/Legend';
import StatsPanel from './components/StatsPanel';
import { BATTLES_CHRONOLOGICAL, CAMPAIGNS } from './data/battles';
import { CONFLICT_IDS } from './data/conflicts';
import type { Conflict, Result } from './data/types';
import { useFilterState } from './hooks/useFilterState';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ALL_RESULTS, filterBattles, type FilterState } from './lib/filters';

type Sheet = 'none' | 'filters' | 'stats';

export default function App() {
  const all = BATTLES_CHRONOLOGICAL;
  const { filters, update, clear, dirty } = useFilterState(CAMPAIGNS);
  const compact = useMediaQuery('(max-width: 900px)');

  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => filterBattles(all, filters), [all, filters]);

  /** Counts for one facet are computed with that facet's own filter removed. */
  const conflictCounts = useMemo(() => {
    const base = filterBattles(all, { ...filters, conflicts: [...CONFLICT_IDS] });
    const counts = Object.fromEntries(CONFLICT_IDS.map((c) => [c, 0])) as Record<Conflict, number>;
    for (const b of base) counts[b.conflict]++;
    return counts;
  }, [all, filters]);

  const resultCounts = useMemo(() => {
    const base = filterBattles(all, { ...filters, results: [...ALL_RESULTS] });
    const counts = { victory: 0, defeat: 0, inconclusive: 0 } as Record<Result, number>;
    for (const b of base) counts[b.result]++;
    return counts;
  }, [all, filters]);

  const campaignCounts = useMemo(() => {
    const base = filterBattles(all, { ...filters, campaign: null });
    const counts: Record<string, number> = {};
    for (const c of CAMPAIGNS) counts[c] = 0;
    for (const b of base) counts[b.campaign] = (counts[b.campaign] ?? 0) + 1;
    return counts;
  }, [all, filters]);

  const setFilters = useCallback((updater: (f: FilterState) => FilterState) => update(updater), [update]);

  const onFocus = useCallback((id: string) => {
    setFocusId(id);
    setSheet('none');
  }, []);

  const resizeKey = useMemo(
    () => (showFilters ? 1 : 0) + (showStats ? 2 : 0) + (compact ? 4 : 0) + (sheet === 'none' ? 0 : 8),
    [showFilters, showStats, compact, sheet],
  );

  const filterPanel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      conflictCounts={conflictCounts}
      resultCounts={resultCounts}
      campaigns={CAMPAIGNS}
      campaignCounts={campaignCounts}
      visible={visible}
      onFocus={onFocus}
      visibleCount={visible.length}
      totalCount={all.length}
      dirty={dirty}
      onClear={clear}
    />
  );

  return (
    <div className={`app${compact ? ' is-compact' : ''}`}>
      <Header
        battleCount={all.length}
        showFilters={showFilters}
        showStats={showStats}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onToggleStats={() => setShowStats((v) => !v)}
        compact={compact}
      />

      <main className="stage">
        {!compact && (
          <>
            <aside
              className={`dock dock-left${showFilters ? '' : ' is-hidden'}`}
              aria-label="Filters"
              aria-hidden={!showFilters}
            >
              <div className="dock-panel panel is-filters">{filterPanel}</div>
              <Legend />
            </aside>

            <aside
              className={`dock dock-right${showStats ? '' : ' is-hidden'}`}
              aria-label="Statistics"
              aria-hidden={!showStats}
            >
              <div className="dock-panel panel scroll-thin is-stats">
                <div className="dock-head">
                  <h2 className="section-label">Dispatches from the filtered set</h2>
                </div>
                <StatsPanel battles={visible} total={all.length} />
              </div>
            </aside>
          </>
        )}

        {compact && (
          <>
            <div className={`sheet-scrim${sheet === 'none' ? '' : ' is-on'}`} onClick={() => setSheet('none')} />
            <section
              className={`sheet panel scroll-thin${sheet === 'none' ? '' : ' is-open'}`}
              aria-label={sheet === 'stats' ? 'Statistics' : 'Filters'}
              aria-hidden={sheet === 'none'}
            >
              <div className="sheet-grip" aria-hidden="true" />
              <button type="button" className="sheet-close" onClick={() => setSheet('none')} aria-label="Close panel">
                ×
              </button>
              <div className="sheet-body">
                {sheet === 'stats' ? (
                  <StatsPanel battles={visible} total={all.length} />
                ) : (
                  <>
                    {filterPanel}
                    <hr className="rule" />
                    <Legend inline />
                  </>
                )}
              </div>
            </section>

            <nav className="tabbar" aria-label="Panels">
              <button
                type="button"
                className={`tab${sheet === 'filters' ? ' is-on' : ''}`}
                aria-pressed={sheet === 'filters'}
                onClick={() => setSheet((s) => (s === 'filters' ? 'none' : 'filters'))}
              >
                Filters
                <span className={`tab-badge${dirty ? ' is-dirty' : ''}`}>{visible.length}</span>
              </button>
              <button
                type="button"
                className={`tab${sheet === 'stats' ? ' is-on' : ''}`}
                aria-pressed={sheet === 'stats'}
                onClick={() => setSheet((s) => (s === 'stats' ? 'none' : 'stats'))}
              >
                Statistics
              </button>
            </nav>
          </>
        )}

        {/* Rendered last in the DOM so keyboard focus reaches the controls
            first; z-index keeps it painted underneath. */}
        <BattleMap
          all={all}
          visible={visible}
          onSelect={setSelectedId}
          focusId={focusId}
          onFocusHandled={() => setFocusId(null)}
          resizeKey={resizeKey}
        />
      </main>
    </div>
  );
}
