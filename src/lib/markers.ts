import type { Battle } from '../data/types';
import { CONFLICT_BY_ID } from '../data/conflicts';
import { formatNumber } from './stats';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "15 – 17 November 1796", collapsing shared month and year. */
export function formatDateRange(b: Battle): string {
  if (!b.endDate) return formatDate(b.date);
  const [y1, m1, d1] = b.date.split('-').map(Number);
  const [y2, m2, d2] = b.endDate.split('-').map(Number);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTHS[m1 - 1]} ${y1}`;
  if (y1 === y2) return `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y1}`;
  return `${formatDate(b.date)} – ${formatDate(b.endDate)}`;
}

export const MARKER_PX: Record<Battle['significance'], number> = {
  decisive: 30,
  major: 20,
  minor: 13,
};

/** The divIcon body. Everything about it is styleable from CSS. */
export function markerHtml(b: Battle): string {
  const px = MARKER_PX[b.significance];
  const classes = [
    'battle-marker',
    `is-${b.result}`,
    `is-${b.significance}`,
    `is-${b.type}`,
  ].join(' ');
  return (
    `<div class="${classes}" style="--m:${px}px">` +
    (b.significance === 'decisive' ? '<span class="marker-pulse" aria-hidden="true"></span>' : '') +
    '<span class="marker-shape" aria-hidden="true"><span class="marker-core"></span></span>' +
    '</div>'
  );
}

export function tooltipHtml(b: Battle): string {
  return (
    `<span class="tt-name">${escapeHtml(b.name)}</span>` +
    `<span class="tt-year">${b.date.slice(0, 4)}</span>`
  );
}

const RESULT_LABEL: Record<Battle['result'], string> = {
  victory: 'French victory',
  defeat: 'French defeat',
  inconclusive: 'Inconclusive',
};

function statRow(label: string, french?: number, opposing?: number): string {
  if (french === undefined && opposing === undefined) return '';
  const cell = (v?: number) =>
    v === undefined
      ? '<span class="pop-unknown" title="Not reliably recorded">—</span>'
      : `<span class="pop-num">${formatNumber(v)}</span>`;
  return (
    '<tr>' +
    `<th scope="row">${escapeHtml(label)}</th>` +
    `<td>${cell(french)}</td>` +
    `<td>${cell(opposing)}</td>` +
    '</tr>'
  );
}

export function popupHtml(b: Battle): string {
  const meta = CONFLICT_BY_ID[b.conflict];
  const hasNumbers =
    b.frenchForces !== undefined ||
    b.opposingForces !== undefined ||
    b.frenchCasualties !== undefined ||
    b.opposingCasualties !== undefined;

  const table = hasNumbers
    ? '<table class="pop-table">' +
      '<thead><tr><td></td><th scope="col">France</th><th scope="col">Opposing</th></tr></thead>' +
      '<tbody>' +
      statRow('Strength', b.frenchForces, b.opposingForces) +
      statRow('Casualties', b.frenchCasualties, b.opposingCasualties) +
      '</tbody></table>'
    : '<p class="pop-nonumbers">Strengths and losses for this action are not reliably recorded.</p>';

  return (
    `<article class="pop is-${b.result}">` +
    '<header class="pop-head">' +
    `<div class="pop-eyebrow"><span class="pop-dot" aria-hidden="true"></span>${escapeHtml(meta.label)} · ${escapeHtml(b.campaign)}</div>` +
    `<h2 class="pop-title">${escapeHtml(b.name)}</h2>` +
    `<div class="pop-sub">${escapeHtml(formatDateRange(b))} &nbsp;·&nbsp; ${escapeHtml(b.location)}</div>` +
    '</header>' +
    '<div class="pop-chips">' +
    `<span class="chip chip-result">${RESULT_LABEL[b.result]}</span>` +
    `<span class="chip">${b.type === 'siege' ? 'Siege' : 'Field battle'}</span>` +
    `<span class="chip">${escapeHtml(b.significance)}</span>` +
    '</div>' +
    '<dl class="pop-cmd">' +
    `<dt>French command</dt><dd>${escapeHtml(b.frenchCommander)}</dd>` +
    `<dt>Opposing command</dt><dd>${escapeHtml(b.opposingCommanders.join(', '))}</dd>` +
    `<dt>Against</dt><dd>${escapeHtml(b.belligerents.join(', '))}</dd>` +
    '</dl>' +
    table +
    `<p class="pop-summary">${escapeHtml(b.summary)}</p>` +
    '</article>'
  );
}

/** Cluster icons: size band by member count, styled to match the panels. */
export function clusterSizeClass(count: number): string {
  if (count >= 20) return 'is-xl';
  if (count >= 10) return 'is-lg';
  if (count >= 5) return 'is-md';
  return 'is-sm';
}
