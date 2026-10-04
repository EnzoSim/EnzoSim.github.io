/* Rule 1 · Programme calculator (stage demo-programme).
   Paper: "Fig · 1 · Programme" (4G0-0) and its interacting state (4U9-0); spec figspec/r1.json.
   Twelve rows, one per column count, show the columns that a width and a gutter give. A count lands on whole pixels
   when it divides the width plus one gutter (ink bars); otherwise its columns are fractional (slate-light bars).
   Point at a row (hover, tap, or the arrow keys on the focused plot) to draw its gutters through every row: the rows
   whose count divides it share its edges and keep their colour, the others turn to ghosts. */
(() => {
  'use strict';

  /* ---------- the model ---------- */
  const MIN = 960, MAX = 1600, BIG = 40;
  const PRESETS = { capital: { W: 58, g: 2, unit: 'units' }, page: { W: 1120, g: 32, unit: 'px' } };
  // Share of the track per unit: 1600 px fill it; 58 units are drawn as long as 1120 px, so a preset switch does not jump.
  const PER = { px: 1 / MAX, units: 1120 / MAX / 58 };
  // Lanes, in px: count label 24 · 12 · track · 12 · value 56. Heading row 16, 12 below it the rows: 20 tall, every 32.
  const LAB = 24, X0 = 36, RIGHT = 12 + 56, TOP = 28, ROW = 20, PITCH = 32, H = TOP + 11 * PITCH + ROW;
  const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // The spec's ease-out, cubic-bezier(.2, .7, .2, 1), for the entry, every tween and the count-up.
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break; t -= e / d; }
      if (!(t >= 0 && t <= 1) || Math.abs(X(t) - x) > 1e-4) { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (X(t) < x) lo = t; else hi = t; } }
      return Y(t);
    };
  };
  const EASE = bezier(0.2, 0.7, 0.2, 1);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- words ---------- */
  const T = {
    title: { en: 'Programme calculator', fr: 'Calculateur de programme' },
    hint: { en: '1 to 12 columns at one width', fr: 'de 1 à 12 colonnes pour une même largeur' },
    presetsAria: { en: 'Presets', fr: 'Préréglages' },
    capital: { en: ['Capital, 1962', '58 + 2 units'], fr: ['Capital, 1962', '58 + 2 unités'] },
    page: { en: (w, g) => ['This page', `${w} + ${g} px`], fr: (w, g) => ['Cette page', `${w} + ${g} px`] },
    width: { en: 'Width', fr: 'Largeur' },
    widthAria: { en: 'Width in pixels', fr: 'Largeur en pixels' },
    gutter: { en: 'Gutter, px', fr: 'Gouttière, px' },
    gutterAria: { en: 'Gutter in pixels', fr: 'Gouttière en pixels' },
    unit: { en: { px: 'px', units: 'units' }, fr: { px: 'px', units: 'unités' } },
    readLabel: { en: 'Width + one gutter', fr: 'Largeur + une gouttière' },
    readNote: { en: (k) => `divides by ${k} of the 12 counts`, fr: (k) => `se divise par ${k} des 12 nombres` },
    each: { en: 'Each column', fr: 'Chaque colonne' },
    rowEach: { en: (n) => `Row ${n}, each column`, fr: (n) => `Ligne ${n}, chaque colonne` },
    valuesHead: { en: (u) => `Each column, ${u}`, fr: (u) => `Chaque colonne, ${u}` },
    plotAria: {
      en: 'Column counts from 1 to 12 and the width of each column. The up and down arrows point at a row; Escape clears.',
      fr: 'Nombres de colonnes de 1 à 12 et largeur de chaque colonne. Les flèches haut et bas pointent une ligne ; Échap efface.',
    },
    and: { en: ' and ', fr: ' et ' },
    words: {
      en: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
      fr: ['une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'],
    },
    // The status sentence: a lead clause (bold) and the rest.
    defLead: {
      en: (W, g, s, list) => `${W} + ${g} = ${s}, and ${s} divides by ${list}.`,
      fr: (W, g, s, list) => `${W} + ${g} = ${s}, et ${s} se divise par ${list}.`,
    },
    defRest: {
      en: (unit, list, one) => `Those counts land on whole ${unit === 'px' ? 'pixels' : 'units'}; ${list} ${one ? 'does' : 'do'} not.`,
      fr: (unit, list) => `Ces nombres tombent sur des ${unit === 'px' ? 'pixels entiers' : 'unités entières'} ; ${list}, non.`,
    },
    ptLead: {
      en: (n, word, w, u, frac) => (n === 1 ? `Row 1: one column of ${w} ${u}${frac}.` : `Row ${n}: ${word} columns of ${w} ${u}${frac}.`),
      fr: (n, word, w, u, frac) => (n === 1 ? `Ligne 1 : une colonne de ${w} ${u}${frac}.` : `Ligne ${n} : ${word} colonnes de ${w} ${u}${frac}.`),
    },
    ptFrac: {
      en: (unit) => `, not whole ${unit === 'px' ? 'pixels' : 'units'}`,
      fr: (unit) => `, pas des ${unit === 'px' ? 'pixels entiers' : 'unités entières'}`,
    },
    ptDivisors: {
      en: (list) => `Rows ${list} fall on the same edges, so a layout can mix them.`,
      fr: (list) => `Les lignes ${list} tombent sur les mêmes bords, si bien qu’une mise en page peut les combiner.`,
    },
    ptPrime: { en: 'Only row 1 shares its edges, the outer two.', fr: 'Seule la ligne 1 partage ses bords, les deux bords extérieurs.' },
    ptOne: { en: 'Every row starts and ends on its two edges.', fr: 'Toutes les lignes commencent et finissent sur ces deux bords.' },
  };

  FIG.register('demo-programme', (root, F) => {
    // Pixel counts are printed as the prose prints them: 1120 in English, 1 120 in French.
    const n0 = (v, d = 0) => (F.lang === 'en' ? F.num(v, d).replace(/,/g, '') : F.num(v, d));
    const list = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + F.t(T.and) + xs[xs.length - 1]);
    const unitWord = (u) => F.t(T.unit)[u];

    const st = { W: 1120, g: 32, unit: 'px', point: 0 };
    const wholeAt = (n, s = st) => (s.W + s.g) % n === 0;
    const widthAt = (n, s = st) => (s.W + s.g) / n - s.g;
    const fmtW = (v, whole) => (whole ? n0(Math.round(v)) : n0(v, 1));
    const target = () => ({ a: st.W * PER[st.unit], b: st.g * PER[st.unit], W: st.W, g: st.g });

    /* ---------- markup ---------- */
    const plabel = ([a, b]) => `<span class="f2-r1-pa">${a}</span><span class="f2-r1-dot" aria-hidden="true"> · </span><span class="f2-r1-pb">${b}</span>`;
    const presets = F.seg('preset', [['capital', plabel(F.t(T.capital))], ['page', plabel(F.t(T.page, n0(1120), n0(32)))]], 'page', F.t(T.presetsAria));
    const controls = `<div class="f2-r1-top">${F.slider('w', { min: MIN, max: MAX, step: 8, value: st.W, label: F.t(T.width), aria: F.t(T.widthAria), out: `${n0(st.W)} px` })}
      <div class="f2-r1-gut"><span class="f2-r1-lab" aria-hidden="true">${F.t(T.gutter)}</span>${F.seg('g', [8, 16, 24, 32].map((v) => [v, n0(v)]), st.g, F.t(T.gutterAria))}</div></div>
      <div class="f2-r1-read"><span class="f2-r1-lab">${F.t(T.readLabel)}</span><b class="f2-r1-sum">${n0(st.W + st.g)}</b><span class="f2-r1-note"></span>
      <div class="f2-r1-formula"><span class="f2-r1-lab f2-r1-fl"></span><span class="f2-r1-expr"></span></div></div>`;
    root.innerHTML = F.sheet({
      cls: 'f2-r1',
      title: F.t(T.title),
      hint: F.t(T.hint),
      controls: presets,
      body: `<div class="f2-r1-grid">${F.field(controls, 'f2-r1-ctl')}${F.field(`<div class="f2-r1-plot" tabindex="0" role="group" aria-label="${F.esc(F.fr(F.t(T.plotAria)))}"></div>`, 'f2-r1-plotf')}</div>`,
    });
    const $ = (s) => root.querySelector(s);
    const plot = $('.f2-r1-plot'), range = $('.f2-range'), out = $('[data-sl="w"] output');
    const sumEl = $('.f2-r1-sum'), noteEl = $('.f2-r1-note'), flEl = $('.f2-r1-fl'), exprEl = $('.f2-r1-expr');

    /* ---------- the plot: built once per width, then updated in place ---------- */
    let R = null; // element references of the current svg
    const build = () => {
      const CW = Math.max(160, Math.round(plot.clientWidth)), TW = Math.max(40, CW - X0 - RIGHT);
      let s = '';
      // heading row: the dimension line over the track, the width on a white chip, the values heading at the right
      s += F.line(X0, 7.5, X0, 7.5, 'f2-r1-dim') + F.line(X0 + 0.5, 3, X0 + 0.5, 13, 'f2-r1-tick') + F.line(X0, 3, X0, 13, 'f2-r1-tick f2-r1-tick-b');
      s += F.rect(X0, 0, 80, 16, 'f2-r1-chip') + F.text(X0, 12, '', 'f2-r1-dimt', 'middle') + F.text(CW, 12, '', 'f2-r1-vh', 'end');
      // behind the rows: one band per row (the pointed row), and per count its gutters drawn through every row
      s += '<g>' + COUNTS.map((n) => F.rect(-12, TOP + (n - 1) * PITCH - 6, CW + 24, PITCH, 'f2-r1-rb', 8)).join('') + '</g>';
      s += '<g>' + COUNTS.map((n) => `<g class="f2-r1-gs">${Array.from({ length: n - 1 }, () => F.rect(X0, TOP, 0, H - TOP)).join('')}</g>`).join('') + '</g>';
      s += COUNTS.map((n) => {
        const y = TOP + (n - 1) * PITCH;
        return `<g class="f2-r1-row">${F.text(LAB, y + 14, n0(n), 'f2-r1-n', 'end')}${Array.from({ length: n }, () => F.rect(X0, y, 0, ROW, 'f2-r1-bar', 4)).join('')}<g class="f2-r1-vin">${F.text(CW, y + 15, '', 'f2-r1-v', 'end')}</g></g>`;
      }).join('');
      plot.innerHTML = `<svg class="f2-svg f2-r1-svg" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" aria-hidden="true" focusable="false">${s}</svg>`;
      const svg = plot.firstChild, q = (sel) => [...svg.querySelectorAll(sel)];
      const rows = q('.f2-r1-row').map((g) => ({ g, bars: [...g.querySelectorAll('.f2-r1-bar')], v: g.querySelector('.f2-r1-v'), vin: g.querySelector('.f2-r1-vin') }));
      R = { svg, CW, TW, rows, rb: q('.f2-r1-rb'), gs: q('.f2-r1-gs').map((g) => [...g.children]), gsg: q('.f2-r1-gs'), dim: svg.querySelector('.f2-r1-dim'), ticks: q('.f2-r1-tick'), chip: svg.querySelector('.f2-r1-chip'), dimt: svg.querySelector('.f2-r1-dimt'), vh: svg.querySelector('.f2-r1-vh'), vhW: 0 };
      setRows();
      setPointMarks();
      paint();
    };

    /* ---------- drawing ---------- */
    let shown = target(); // what the bars show now: a, b = width and gutter as shares of the track; W, g = printed numbers
    let clock = 0; // the entrance clock in ms (rows grow, widths fade in, the sum counts up); null once entered
    const r2 = (v) => Math.round(v * 100) / 100;
    const paint = () => {
      if (!R) return;
      const v = shown, k = clock, TW = R.TW, S = v.a + v.b;
      const grow = (i) => (k == null ? 1 : EASE(clamp((k - 25 * i) / 500, 0, 1)));
      R.rows.forEach((row, i) => {
        const n = i + 1, p = grow(i), step = (S / n) * TW, bw = Math.max(0, (S / n - v.b) * TW);
        row.bars.forEach((b, j) => { b.setAttribute('x', r2(X0 + j * step * p)); b.setAttribute('width', r2(bw * p)); });
        row.v.textContent = fmtW((v.W + v.g) / n - v.g, wholeAt(n));
        row.vin.setAttribute('opacity', k == null ? 1 : r2(p));
      });
      // the dimension line spans the width; it grows with row 1
      const p1 = grow(0), end = X0 + v.a * TW * p1, mid = (X0 + end) / 2;
      R.dim.setAttribute('x2', r2(end));
      R.ticks[1].setAttribute('x1', r2(end - 0.5)); R.ticks[1].setAttribute('x2', r2(end - 0.5));
      R.chip.setAttribute('x', r2(mid - 40));
      R.dimt.setAttribute('x', r2(mid));
      R.dimt.textContent = `${n0(Math.round(v.W))} ${unitWord(st.unit)}`;
      [R.dim, R.chip, R.dimt, ...R.ticks].forEach((el) => el.setAttribute('opacity', k == null ? 1 : r2(p1)));
      // the values heading steps aside when the dimension line reaches it (only near the widest settings)
      if (!R.vhW) { try { R.vhW = R.vh.getComputedTextLength(); } catch (e) { R.vhW = 0; } }
      R.vh.classList.toggle('is-off', !!R.vhW && end > R.CW - R.vhW - 8);
      // gutter bands: for count n, band j spans from j·(W + g)/n − g to j·(W + g)/n
      R.gs.forEach((rects, i) => {
        const n = i + 1;
        rects.forEach((el, j) => { el.setAttribute('x', r2(X0 + ((j + 1) * S / n - v.b) * TW)); el.setAttribute('width', r2(v.b * TW)); });
      });
      sumEl.textContent = n0(Math.round(k == null ? v.W + v.g : (st.W + st.g) * EASE(clamp(k / 600, 0, 1))));
    };

    // Whole or fractional, per row (the target state; colours cross-fade in CSS).
    const setRows = () => {
      if (!R) return;
      R.svg.dataset.tr = 'flip';
      R.rows.forEach((row, i) => row.g.classList.toggle('is-frac', !wholeAt(i + 1)));
      R.vh.textContent = F.t(T.valuesHead, unitWord(st.unit));
      R.vhW = 0;
    };
    // The pointed row: its band, its gutters, and the ghosts of the rows that do not share its edges.
    const setPointMarks = () => {
      if (!R) return;
      const n = st.point;
      R.svg.dataset.tr = 'point';
      R.rows.forEach((row, i) => { const c = i + 1; row.g.classList.toggle('is-ghost', !!n && n % c !== 0); row.g.classList.toggle('is-pointed', c === n); });
      R.rb.forEach((el, i) => el.classList.toggle('on', i + 1 === n));
      R.gsg.forEach((el, i) => el.classList.toggle('on', i + 1 === n));
    };

    /* ---------- words that follow the state ---------- */
    const write = () => {
      const s = st.W + st.g, u = unitWord(st.unit);
      const whole = COUNTS.filter((n) => wholeAt(n)), frac = COUNTS.filter((n) => !wholeAt(n));
      noteEl.textContent = F.t(T.readNote, n0(whole.length));
      out.textContent = `${n0(st.W)} ${u}`;
      range.setAttribute('aria-valuetext', out.textContent);
      let lead, rest;
      if (st.point) {
        const n = st.point, w = fmtW(widthAt(n), wholeAt(n));
        flEl.textContent = F.t(T.rowEach, n0(n));
        exprEl.textContent = `${n0(s)} ÷ ${n0(n)} − ${n0(st.g)} = ${w}`;
        exprEl.classList.add('is-pointed');
        lead = F.t(T.ptLead, n, F.t(T.words)[n - 1], w, u, wholeAt(n) ? '' : F.t(T.ptFrac, st.unit));
        const div = COUNTS.filter((c) => c < n && n % c === 0);
        rest = n === 1 ? F.t(T.ptOne) : div.length < 2 ? F.t(T.ptPrime) : F.t(T.ptDivisors, list(div.map((c) => n0(c))));
      } else {
        flEl.textContent = F.t(T.each);
        exprEl.textContent = `${n0(s)} ÷ n − ${n0(st.g)}`;
        exprEl.classList.remove('is-pointed');
        lead = F.t(T.defLead, n0(st.W), n0(st.g), n0(s), list(whole.map((c) => n0(c))));
        rest = F.t(T.defRest, st.unit, list(frac.map((c) => n0(c))), frac.length === 1);
      }
      F.status(root, `<b>${F.esc(F.fr(lead))}</b> ${F.esc(F.fr(rest))}`);
    };

    // Controls follow the state: the slider (disabled in units), the gutter options, the presets.
    const sync = () => {
      const px = st.unit === 'px';
      range.disabled = !px;
      range.value = px ? st.W : PRESETS.page.W;
      F.fillRange(range);
      root.querySelectorAll('[data-seg="g"] [data-v]').forEach((b) => b.setAttribute('aria-checked', String(px && Number(b.dataset.v) === st.g)));
      const pre = !px ? 'capital' : st.W === PRESETS.page.W && st.g === PRESETS.page.g ? 'page' : '';
      root.querySelectorAll('[data-seg="preset"] [data-v]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === pre)));
    };

    /* ---------- changes ---------- */
    let cancelTween = null, cancelEntry = null, drawnUnit = st.unit;
    const settle = () => { // any change finishes the entrance at once
      if (clock === null) return;
      if (cancelEntry) cancelEntry();
      clock = null;
    };
    const change = (instant) => {
      settle();
      // numbers roll within one unit; across units they switch, while the bars still tween
      const unitChanged = drawnUnit !== st.unit;
      drawnUnit = st.unit;
      sync();
      setRows();
      write();
      const to = target();
      if (cancelTween) cancelTween();
      cancelTween = null;
      if (instant || F.reduce) { shown = to; paint(); return; }
      const from = { a: shown.a, b: shown.b, W: unitChanged ? to.W : shown.W, g: unitChanged ? to.g : shown.g };
      cancelTween = F.tween(from, to, 300, (v) => { shown = v; paint(); }, EASE);
    };

    // A pointer drag on the slider: values follow it with no tween. A click on the track (no move yet) still tweens.
    let ptr = 0; // 0 = no pointer, 1 = pressed, 2 = dragging
    range.addEventListener('pointerdown', () => { ptr = 1; });
    range.addEventListener('pointermove', (e) => { if (ptr && e.buttons) ptr = 2; });
    const release = () => { ptr = 0; };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    // Shift + arrows: steps of 40 px (the native range steps by 8; Home and End reach 960 and 1600).
    range.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!d || !e.shiftKey) return;
      e.preventDefault();
      const v = clamp(Number(range.value) + d * BIG, MIN, MAX);
      if (v === Number(range.value)) return;
      range.value = v;
      range.dispatchEvent(new Event('input', { bubbles: true }));
    });

    F.bind(root, {
      sl: { w: (v) => { if (st.unit !== 'px') return; st.W = v; change(ptr === 2); } },
      seg: {
        g: (v) => { if (st.unit !== 'px') { st.unit = 'px'; st.W = PRESETS.page.W; } st.g = Number(v); change(false); },
        preset: (v) => { Object.assign(st, PRESETS[v] || PRESETS.page); change(false); },
      },
    });

    /* ---------- pointing at a row ---------- */
    const point = (n) => {
      if (n === st.point) return;
      st.point = n;
      setPointMarks();
      write();
    };
    const rowAt = (e) => {
      const r = R && R.svg.getBoundingClientRect();
      if (!r) return 0;
      const y = e.clientY - r.top, i = Math.floor((y - (TOP - 6)) / PITCH);
      return y >= TOP - 6 && i >= 0 && i < 12 ? i + 1 : 0;
    };
    plot.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') point(rowAt(e)); });
    plot.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !(document.activeElement === plot && plot.matches(':focus-visible'))) point(0); });
    // A tap points at a row; a second tap on it, or a tap elsewhere, clears it.
    plot.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { const n = rowAt(e); point(n === st.point ? 0 : n); } });
    plot.addEventListener('focus', () => { if (!st.point && plot.matches(':focus-visible')) point(1); });
    plot.addEventListener('blur', () => point(0));
    plot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); point(st.point ? clamp(st.point + (e.key === 'ArrowDown' ? 1 : -1), 1, 12) : 1); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); point(e.key === 'Home' ? 1 : 12); }
      else if (e.key === 'Escape' && st.point) { e.preventDefault(); point(0); }
    });

    /* ---------- start ---------- */
    sync();
    write();
    build();
    F.onResize(plot, () => build());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (R) { R.vhW = 0; paint(); } });
    F.enter(root, (still) => {
      if (clock === null) return; // already settled by an early change
      if (still) { clock = null; paint(); return; }
      cancelEntry = F.tween(0, 775, 775, (ms) => { clock = ms; paint(); if (ms >= 775) clock = null; }, F.ease.lin);
    });
  });
})();
