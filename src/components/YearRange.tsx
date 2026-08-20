import { useCallback, useId } from 'react';

interface Props {
  min: number;
  max: number;
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
}

/**
 * Dual-handle range built from two native sliders so keyboard support,
 * screen-reader semantics and touch targets come for free.
 */
export default function YearRange({ min, max, from, to, onChange }: Props) {
  const fromId = useId();
  const toId = useId();
  const span = max - min;
  const pct = useCallback((v: number) => ((v - min) / span) * 100, [min, span]);

  const ticks = [];
  for (let y = min; y <= max; y++) {
    if (y % 5 === 0 || y === min || y === max) ticks.push(y);
  }

  return (
    <div className="year-range">
      <div className="yr-track" aria-hidden="true">
        <div className="yr-rail" />
        <div className="yr-fill" style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }} />
        <div className="yr-knob" style={{ left: `${pct(from)}%` }} />
        <div className="yr-knob" style={{ left: `${pct(to)}%` }} />
      </div>

      <label className="visually-hidden" htmlFor={fromId}>
        Earliest year
      </label>
      <input
        id={fromId}
        className="yr-input yr-from"
        type="range"
        min={min}
        max={max}
        step={1}
        value={from}
        aria-valuetext={`from ${from}`}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Math.min(v, to), to);
        }}
      />
      <label className="visually-hidden" htmlFor={toId}>
        Latest year
      </label>
      <input
        id={toId}
        className="yr-input yr-to"
        type="range"
        min={min}
        max={max}
        step={1}
        value={to}
        aria-valuetext={`to ${to}`}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(from, Math.max(v, from));
        }}
      />

      <div className="yr-ticks" aria-hidden="true">
        {ticks.map((y) => (
          <span key={y} className="yr-tick" style={{ left: `${pct(y)}%` }}>
            <i />
            <em>{y === min || y === max || y % 5 === 0 ? `’${String(y).slice(2)}` : ''}</em>
          </span>
        ))}
      </div>
    </div>
  );
}
