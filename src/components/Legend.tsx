import { useState } from 'react';

const RESULTS = [
  { id: 'victory', label: 'Victory' },
  { id: 'defeat', label: 'Defeat' },
  { id: 'inconclusive', label: 'Inconclusive' },
] as const;

export default function Legend({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(true);

  const body = (
    <div className="legend-body">
      <div className="legend-group">
        <span className="legend-group-label">Outcome</span>
        <ul className="legend-list">
          {RESULTS.map((r) => (
            <li key={r.id}>
              <span className={`battle-marker is-${r.id} is-major is-battle legend-swatch`} style={{ ['--m' as string]: '15px' }}>
                <span className="marker-shape">
                  <span className="marker-core" />
                </span>
              </span>
              {r.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="legend-group">
        <span className="legend-group-label">Form &amp; weight</span>
        <ul className="legend-list">
          <li>
            <span className="battle-marker is-victory is-major is-battle legend-swatch" style={{ ['--m' as string]: '15px' }}>
              <span className="marker-shape">
                <span className="marker-core" />
              </span>
            </span>
            Field battle
          </li>
          <li>
            <span className="battle-marker is-victory is-major is-siege legend-swatch" style={{ ['--m' as string]: '15px' }}>
              <span className="marker-shape">
                <span className="marker-core" />
              </span>
            </span>
            Siege
          </li>
          <li>
            <span className="battle-marker is-victory is-decisive is-battle legend-swatch" style={{ ['--m' as string]: '20px' }}>
              <span className="marker-pulse" />
              <span className="marker-shape">
                <span className="marker-core" />
              </span>
            </span>
            Decisive
          </li>
          <li>
            <span className="battle-marker is-victory is-minor is-battle legend-swatch" style={{ ['--m' as string]: '9px' }}>
              <span className="marker-shape">
                <span className="marker-core" />
              </span>
            </span>
            Minor
          </li>
        </ul>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="legend is-inline">
        <span className="section-label">Legend</span>
        {body}
      </div>
    );
  }

  return (
    <div className={`legend panel${open ? '' : ' is-closed'}`}>
      <button
        type="button"
        className="legend-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="section-label">Legend</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className="legend-chevron">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open && body}
    </div>
  );
}
