interface Props {
  battleCount: number;
  /** Desktop dock visibility. */
  showFilters: boolean;
  showStats: boolean;
  onToggleFilters: () => void;
  onToggleStats: () => void;
  compact: boolean;
}

function PanelIcon({ side }: { side: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="hdr-icon">
      <rect x="1.4" y="2.4" width="13.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      {side === 'left' ? (
        <rect x="1.4" y="2.4" width="4.6" height="11.2" rx="1.6" fill="currentColor" opacity="0.85" />
      ) : (
        <rect x="10" y="2.4" width="4.6" height="11.2" rx="1.6" fill="currentColor" opacity="0.85" />
      )}
    </svg>
  );
}

export default function Header({
  battleCount,
  showFilters,
  showStats,
  onToggleFilters,
  onToggleStats,
  compact,
}: Props) {
  return (
    <header className="app-header">
      <div className="hdr-left">
        <span className="monogram" aria-hidden="true">
          N
        </span>
        <div className="hdr-title-wrap">
          <h1 className="hdr-title">
            The Battles of <span className="hdr-title-em">Napoleon Bonaparte</span>
          </h1>
          <p className="hdr-sub">
            <span className="hdr-sub-num">{battleCount}</span> engagements he commanded in person
            <span className="hdr-sub-tail">
              <span className="hdr-dot" aria-hidden="true">
                ·
              </span>
              Toulon 1793 – Waterloo 1815
            </span>
          </p>
        </div>
      </div>

      {!compact && (
        <div className="hdr-actions">
          <button
            type="button"
            className={`hdr-btn${showFilters ? ' is-on' : ''}`}
            aria-pressed={showFilters}
            onClick={onToggleFilters}
          >
            <PanelIcon side="left" />
            Filters
          </button>
          <button
            type="button"
            className={`hdr-btn${showStats ? ' is-on' : ''}`}
            aria-pressed={showStats}
            onClick={onToggleStats}
          >
            <PanelIcon side="right" />
            Statistics
          </button>
        </div>
      )}
    </header>
  );
}
