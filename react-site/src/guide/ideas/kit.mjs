// The drawing kit for chapter 1's "idea drawings": one small grey figure per person, showing what they proposed.
// Every drawing is an inner-SVG string for a 352 × 200 viewBox, built at build time (no script on the page).
// Colours come from classes styled in runtime/page.css (.idea svg …), so drawings never carry hex values:
//   fills   i-ink  i-slate  i-light  i-well  i-relief  i-field      strokes  s-ink  s-slate  s-light  s-rule
//   text    t-lab (12 px, ink2)  t-val (12 px, 600, ink)  t-ax (11 px, ink3)  t-big (22 px, 600, ink)
//   .i-dash dashed stroke   ·   .i-draw a line that draws itself in when the block is first seen
//   hatch: fill="url(#i-hatch)" (the pattern is defined once per page)
export const W = 352, H = 200;
const n = (v) => Math.round(v * 10) / 10;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const rect = (x, y, w, h, cls = 'i-slate', rx = 0) => `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, w))}" height="${n(Math.max(0, h))}"${rx ? ` rx="${rx}"` : ''} class="${cls}"/>`;
export const line = (x1, y1, x2, y2, cls = 's-rule', w = 1) => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" class="${cls}" stroke-width="${w}"/>`;
export const circle = (cx, cy, r, cls = 'i-slate') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" class="${cls}"/>`;
// pts: [[x, y], …] → a polyline path. draw: true makes it draw itself in.
export const path = (pts, cls = 's-slate', w = 1.5, draw = false) => `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1])).join('')}" fill="none" class="${cls}${draw ? ' i-draw' : ''}"${draw ? ' pathLength="1"' : ''} stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const area = (pts, cls = 'i-well') => `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1])).join('')}Z" class="${cls}"/>`;
export const raw = (d, cls = 's-slate', w = 1.5) => `<path d="${d}" fill="none" class="${cls}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// anchor: 'start' | 'middle' | 'end'
export const text = (x, y, s, cls = 't-lab', anchor = 'start') => `<text x="${n(x)}" y="${n(y)}" class="${cls}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${esc(s)}</text>`;
export const g = (inner, attrs = '') => `<g${attrs ? ' ' + attrs : ''}>${inner}</g>`;
// Pick the string for the page language: t(lang, 'plan', 'plan') or t(lang, {en, fr}).
export const t = (lang, en, fr) => (typeof en === 'object' ? en[lang] || en.en : lang === 'fr' ? fr : en);
// French figures: decimal comma, narrow no-break space for thousands.
export const num = (lang, v, d = 0) => { const s = Number(v).toFixed(d); const [a, b] = s.split('.'); const th = a.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'fr' ? ' ' : ','); return (b ? th + (lang === 'fr' ? ',' : '.') + b : th).replace('-', '−'); };
