# Figures, second edition

The guide's figures are general (no running retail example), grey, interactive and animated. Each one is a file in
this folder; `core.js` and `core.css` hold what they share. The build (`react-site/scripts/build-guide.mjs`) writes
`assets/fig2.js` = `core.js` + every other `*.js` here in name order + `FIG.start();`, and appends `core.css` and every
other `*.css` here to `assets/guide.css`. `fig2.js` loads before the first edition's `figures.js`; a root drawn here is
marked `data-fig="v2"` and the first edition leaves it alone.

## Writing a figure

One file per figure, named by rule: `f-r01-programme.js` (+ `f-r01-programme.css` if it needs styles), …,
`f-r12-terms.js`, `f-cover.js`, `f-tune.js`. Wrap it in an IIFE and register the stage id:

```js
(() => {
  'use strict';
  const T = {                       // every visible string, in both languages
    title: { en: 'The programme', fr: 'Le programme' },
    hint: { en: 'drag the width', fr: 'faites glisser la largeur' },
    status: { en: (w, n) => `<b>${w} px divides by ${n} column counts.</b>`, fr: (w, n) => `<b>${w} px se divise par ${n} nombres de colonnes.</b>` },
  };
  FIG.register('demo-programme', (root, F) => {
    const st = { w: 1120 };
    root.innerHTML = F.sheet({ title: F.t(T.title), hint: F.t(T.hint), controls: F.slider('w', { min: 800, max: 1440, value: st.w, label: '', out: F.num(st.w) }), body: F.field('<div class="f2-r1-plot"></div>') });
    const plot = root.querySelector('.f2-r1-plot');
    const draw = (k = 1) => { /* build the svg at plot.clientWidth; k = entrance progress 0…1 */ F.status(root, F.t(T.status, F.num(st.w), 6)); };
    F.bind(root, { sl: { w: (v, input) => { st.w = v; input.nextElementSibling.textContent = F.num(v); draw(); } } });
    F.onResize(plot, () => draw());
    F.enter(root, (still) => (still ? draw(1) : F.tween(0, 1, 600, (k) => draw(k))));
  });
})();
```

## The API (`window.FIG`)
- `lang` ('en' | 'fr'), `reduce` (prefers-reduced-motion), `t({en, fr}, …args)` (strings or functions), `fr(s)`
  (adds French narrow spaces before ; : ? ! and inside « »).
- Numbers: `num(v, d)` (toFixed rounding, then the page's locale; real minus), `pct(v, d)`, `signed(v, d)`, `esc(s)`.
- SVG strings: `svg(w, h, inner, {label, fluid, cls})`, `line`, `rect(x, y, w, h, cls, rx)`, `circle`, `path(d, cls)`,
  `text(x, y, s, cls, anchor)`, `poly([[x, y], …])` → path data, `hatch(id)` → a <defs> hatch pattern (use
  `fill="url(#id)"`), `scale(d0, d1, r0, r1)` with `.invert`/`.clamp`, `ticks(lo, hi, n)`.
- Motion: `tween(from, to, ms, fn, ease)` (numbers or flat objects; returns cancel; instant under reduced motion),
  `ease.out/inOut/lin`, `enter(el, fn)` (once, when a quarter is visible; `fn(true)` = draw final state now),
  `onResize(el, fn)`.
- Controls (markup strings): `seg(name, [[value, label]], current, aria)`, `toggle(name, label, on)`,
  `slider(name, {min, max, step, value, label, aria, out})`, `button(name, label)`; then one
  `bind(root, {seg: {name: v => …}, sw: {name: on => …}, sl: {name: (n, input) => …}, btn: {name: () => …}})`.
- Direct manipulation: `drag(markEl, () => currentSvg, {start, move, end})` (pointer in SVG coordinates; survives
  redraws), `keys(el, (dx, dy, big) => …)` (arrow keys, Shift = big step), `refocus(root, selector)`.
  Give a draggable mark `class="f2-handle"`, `tabindex="0"`, a `role` (slider) with aria-valuenow/min/max/label, and
  a `circle class="f2-ring"` under it for the hover/focus ring.
- Layout: `sheet({title, hint, controls, body, status, cls})`, `field(inner, cls, style)`, `status(root, html)`.

## Rules for every figure
1. Greys only (see `core.css` and REDESIGN-BRIEF.md): ink for the one thing that matters or the selected state,
   slate for data, slate-light for secondary data, well/relief for bands and tracks. No cobalt or hue, except the
   focus ring that `core.css` sets.
2. On the 12-column grid: the figure is 1120 px wide on desktop (1000 under 1200 px); place internal regions with
   CSS grid on `repeat(12, 1fr)` with a 32 px gap inside the sheet, or as whole fields. Under 1080 px: one column.
3. Entrance once (`enter`): marks grow or draw in over ~600 ms. Changes tween over 250–350 ms. Nothing moves under
   reduced motion; the figure must be complete and correct without any animation.
4. During a drag, update the moving marks in place (setAttribute / textContent) when you can; a full redraw on every
   pointer move is allowed but costs focus and smoothness.
5. Every interaction has a keyboard path and updates the status sentence (`aria-live`), which says the reading in
   words. Every string is in both languages, with French typography. No console errors.
6. Test: `GUIDE_OUT=<preview>/projects/dashboard-design-guide node scripts/build-guide.mjs` from `react-site/`,
   serve the preview, and check English and French at 1440, 1180 and 390 px wide.
