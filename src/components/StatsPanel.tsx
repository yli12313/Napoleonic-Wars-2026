import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Battle } from '../data/types';
import { RESULT_COLOR } from '../data/conflicts';
import { computeStats, formatCompact, formatNumber } from '../lib/stats';

interface Props {
  battles: Battle[];
  total: number;
}

const ANIM = { isAnimationActive: true, animationDuration: 260, animationEasing: 'ease-out' } as const;

const AXIS = { fill: '#7f8794', fontSize: 10, fontFamily: 'Inter, sans-serif' } as const;

interface TipPayload {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

function DarkTooltip({
  active,
  payload,
  label,
  suffix,
  titleKey,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
  suffix?: string;
  titleKey?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const head =
    titleKey && payload[0]?.payload && typeof payload[0].payload[titleKey] === 'string'
      ? (payload[0].payload[titleKey] as string)
      : String(label ?? '');
  const rows = payload.filter((p) => Number(p.value) > 0);
  return (
    <div className="chart-tip">
      <div className="chart-tip-head">{head}</div>
      {rows.length === 0 ? (
        <div className="chart-tip-row">
          <span className="chart-tip-name">No data</span>
        </div>
      ) : (
        rows.map((p) => (
          <div className="chart-tip-row" key={String(p.dataKey)}>
            <span className="chart-tip-dot" style={{ background: p.color }} />
            <span className="chart-tip-name">{p.name}</span>
            <span className="chart-tip-val">
              {formatNumber(Number(p.value))}
              {suffix ?? ''}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function StatsPanel({ battles, total }: Props) {
  const stats = useMemo(() => computeStats(battles), [battles]);
  const { headline, byConflict, byYear } = stats;

  const empty = headline.total === 0;
  const yearsWithData = useMemo(() => byYear.filter((y) => y.battles > 0).length, [byYear]);

  return (
    <div className="stats">
      <section className="tiles" aria-label="Summary statistics">
        <div className="tile tile-wide">
          <span className="tile-label">Battles shown</span>
          <span className="tile-value">
            {headline.total}
            <span className="tile-sub">/ {total}</span>
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">Victories</span>
          <span className="tile-value is-victory">{headline.victories}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Defeats</span>
          <span className="tile-value is-defeat">{headline.defeats}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Win rate</span>
          <span className="tile-value">
            {headline.winRate === null ? '—' : `${Math.round(headline.winRate)}%`}
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">Est. casualties</span>
          <span className="tile-value">{formatCompact(headline.casualties)}</span>
          <span className="tile-foot">
            {headline.casualtyCoverage} of {headline.total} recorded
          </span>
        </div>
      </section>

      {empty ? (
        <p className="stats-empty">
          No battles match the current filters. Widen the selection to see the charts.
        </p>
      ) : (
        <>
          <section className="chart-block">
            <h3 className="section-label">Outcome by coalition</h3>
            <div className="chart-frame" style={{ height: Math.max(74, byConflict.length * 29 + 30) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byConflict}
                  layout="vertical"
                  margin={{ top: 4, right: 10, bottom: 2, left: 0 }}
                  barCategoryGap="26%"
                >
                  <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="short"
                    tick={AXIS}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(236,227,210,0.05)' }}
                    content={<DarkTooltip titleKey="label" />}
                  />
                  <Bar
                    dataKey="victory"
                    name="Victory"
                    stackId="a"
                    fill={RESULT_COLOR.victory}
                    maxBarSize={18}
                    {...ANIM}
                  />
                  <Bar
                    dataKey="inconclusive"
                    name="Inconclusive"
                    stackId="a"
                    fill={RESULT_COLOR.inconclusive}
                    maxBarSize={18}
                    {...ANIM}
                  />
                  <Bar
                    dataKey="defeat"
                    name="Defeat"
                    stackId="a"
                    fill={RESULT_COLOR.defeat}
                    radius={[0, 3, 3, 0]}
                    maxBarSize={18}
                    {...ANIM}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-block">
            <h3 className="section-label">
              Battles per year <span className="chart-note">
                {yearsWithData} active {yearsWithData === 1 ? 'year' : 'years'}
              </span>
            </h3>
            <div className="chart-frame" style={{ height: 132 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byYear} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                  <CartesianGrid stroke="rgba(236,227,210,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                  <Tooltip cursor={{ fill: 'rgba(236,227,210,0.05)' }} content={<DarkTooltip />} />
                  <Bar dataKey="battles" name="Battles" radius={[2, 2, 0, 0]} maxBarSize={16} {...ANIM}>
                    {byYear.map((y) => (
                      <Cell
                        key={y.year}
                        fill={y.battles >= 8 ? '#f0cd6a' : y.battles >= 4 ? '#c9a227' : '#8c6f18'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="chart-block">
            <h3 className="section-label">Recorded casualties over time</h3>
            <div className="chart-frame" style={{ height: 132 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byYear} margin={{ top: 6, right: 6, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="grad-fr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e8b93f" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#e8b93f" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="grad-op" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5b8fd6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#5b8fd6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(236,227,210,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={1} />
                  <YAxis
                    tick={AXIS}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v: number) => formatCompact(v)}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Area
                    type="linear"
                    dataKey="frenchCasualties"
                    name="French"
                    stroke="#e8b93f"
                    strokeWidth={1.6}
                    fill="url(#grad-fr)"
                    stackId="c"
                    {...ANIM}
                  />
                  <Area
                    type="linear"
                    dataKey="opposingCasualties"
                    name="Opposing"
                    stroke="#5b8fd6"
                    strokeWidth={1.6}
                    fill="url(#grad-op)"
                    stackId="c"
                    {...ANIM}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-caption">
              Totals count only engagements with a recorded figure, so they understate the true cost.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
