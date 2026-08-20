import { useId, useMemo } from 'react';
import type { Battle, Conflict, Result } from '../data/types';
import { CONFLICTS, RESULTS, YEAR_MAX, YEAR_MIN } from '../data/conflicts';
import { ALL_RESULTS, type FilterState } from '../lib/filters';
import YearRange from './YearRange';

interface Props {
  filters: FilterState;
  setFilters: (updater: (f: FilterState) => FilterState) => void;
  /** Battle count per coalition under every *other* active filter. */
  conflictCounts: Record<Conflict, number>;
  resultCounts: Record<Result, number>;
  campaigns: string[];
  campaignCounts: Record<string, number>;
  /** The currently matching battles, used for the search result list. */
  visible: Battle[];
  onFocus: (id: string) => void;
  visibleCount: number;
  totalCount: number;
  dirty: boolean;
  onClear: () => void;
}

export default function FilterPanel({
  filters,
  setFilters,
  conflictCounts,
  resultCounts,
  campaigns,
  campaignCounts,
  visible,
  onFocus,
  visibleCount,
  totalCount,
  dirty,
  onClear,
}: Props) {
  const searchId = useId();
  const campaignId = useId();

  const toggleConflict = (id: Conflict) =>
    setFilters((f) => ({
      ...f,
      conflicts: f.conflicts.includes(id)
        ? f.conflicts.filter((c) => c !== id)
        : CONFLICTS.map((c) => c.id).filter((c) => c === id || f.conflicts.includes(c)),
    }));

  const toggleResult = (id: Result) =>
    setFilters((f) => ({
      ...f,
      results: f.results.includes(id)
        ? f.results.filter((r) => r !== id)
        : ALL_RESULTS.filter((r) => r === id || f.results.includes(r)),
    }));

  const allConflicts = filters.conflicts.length === CONFLICTS.length;
  const noConflicts = filters.conflicts.length === 0;

  const campaignOptions = useMemo(
    () => campaigns.map((c) => ({ value: c, count: campaignCounts[c] ?? 0 })),
    [campaigns, campaignCounts],
  );

  return (
    <div className="filters">
      <div className="filters-scroll scroll-thin">
      {/* ------------------------------------------------ search */}
      <section className="fsection">
        <label className="section-label" htmlFor={searchId}>
          Search
        </label>
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id={searchId}
            type="search"
            className="search-input"
            placeholder="Battle, commander, place…"
            value={filters.query}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          />
          {filters.query !== '' && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => setFilters((f) => ({ ...f, query: '' }))}
            >
              ×
            </button>
          )}
        </div>
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------ coalitions */}
      <section className="fsection">
        <div className="fsection-head">
          <h2 className="section-label" id="coalition-label">
            Coalition
          </h2>
          <div className="mini-actions">
            <button
              type="button"
              className="mini-btn"
              disabled={allConflicts}
              onClick={() => setFilters((f) => ({ ...f, conflicts: CONFLICTS.map((c) => c.id) }))}
            >
              All
            </button>
            <span className="mini-sep" aria-hidden="true" />
            <button
              type="button"
              className="mini-btn"
              disabled={noConflicts}
              onClick={() => setFilters((f) => ({ ...f, conflicts: [] }))}
            >
              None
            </button>
          </div>
        </div>

        <ul className="coalition-list" aria-labelledby="coalition-label">
          {CONFLICTS.map((c) => {
            const on = filters.conflicts.includes(c.id);
            const count = conflictCounts[c.id] ?? 0;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`coalition-row${on ? ' is-on' : ''}${count === 0 ? ' is-empty' : ''}`}
                  style={{ ['--accent' as string]: c.color }}
                  aria-pressed={on}
                  onClick={() => toggleConflict(c.id)}
                >
                  <span className="cbox" aria-hidden="true">
                    <svg viewBox="0 0 12 12">
                      <path
                        d="M2.4 6.2 4.8 8.6 9.6 3.6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="coalition-text">
                    <span className="coalition-name">{c.label}</span>
                    <span className="coalition-years">{c.headlineRange}</span>
                  </span>
                  <span className="coalition-count">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------ result */}
      <section className="fsection">
        <h2 className="section-label" id="result-label">
          Outcome
        </h2>
        <div className="result-row" role="group" aria-labelledby="result-label">
          {RESULTS.map((r) => {
            const on = filters.results.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                className={`result-chip is-${r.id}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => toggleResult(r.id)}
              >
                <span className={`swatch swatch-${r.id}`} aria-hidden="true" />
                <span className="result-label">{r.label}</span>
                <span className="result-count">{resultCounts[r.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------ years */}
      <section className="fsection">
        <div className="fsection-head">
          <h2 className="section-label">Years</h2>
          <span className="year-readout">
            {filters.yearFrom}
            <span className="year-dash">–</span>
            {filters.yearTo}
          </span>
        </div>
        <YearRange
          min={YEAR_MIN}
          max={YEAR_MAX}
          from={filters.yearFrom}
          to={filters.yearTo}
          onChange={(from, to) => setFilters((f) => ({ ...f, yearFrom: from, yearTo: to }))}
        />
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------ campaign */}
      <section className="fsection">
        <label className="section-label" htmlFor={campaignId}>
          Campaign
        </label>
        <div className="select-wrap">
          <select
            id={campaignId}
            className="campaign-select"
            value={filters.campaign ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, campaign: e.target.value === '' ? null : e.target.value }))
            }
          >
            <option value="">All campaigns</option>
            {campaignOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value} ({c.count})
              </option>
            ))}
          </select>
          <svg className="select-chevron" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {filters.query.trim() !== '' && (
        <>
          <hr className="rule" />
          <section className="fsection">
            <h2 className="section-label">Matches</h2>
            {visible.length === 0 ? (
              <p className="no-matches">Nothing found. Try a shorter term.</p>
            ) : (
              <ul className="match-list">
                {visible.slice(0, 8).map((b) => (
                  <li key={b.id}>
                    <button type="button" className="match-row" onClick={() => onFocus(b.id)}>
                      <span className={`match-dot is-${b.result}`} aria-hidden="true" />
                      <span className="match-name">{b.name}</span>
                      <span className="match-year">{b.date.slice(0, 4)}</span>
                    </button>
                  </li>
                ))}
                {visible.length > 8 && (
                  <li className="match-more">+{visible.length - 8} more on the map</li>
                )}
              </ul>
            )}
          </section>
        </>
      )}

      </div>

      {/* ------------------------------------------------ footer */}
      <div className="filters-footer">
        <p className="live-count" aria-live="polite">
          <strong>{visibleCount}</strong>
          <span className="live-of"> of {totalCount} battles shown</span>
        </p>
        {dirty && (
          <button type="button" className="clear-all" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
