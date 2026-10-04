/* Rule 10 · Uncertainty only when earned (stage demo-uncertainty).
   Paper: "Fig · 10 · Uncertainty when earned" (5TK-0) and its interacting state (60V-0); spec figspec/r10.json.
   Next month's demand for one item (normal, mean 480, sd 60, illustrative) drawn four ways: the line alone, a 90 %
   interval, 20 quantile dots and the cumulative curve. Move the stock (drag the thumb or the stock line, or use the
   arrow keys) and each form says what it can about the chance of running out. "No error measured yet" folds every
   spread back into the expected 480. The stock moves in steps of 20, the edges of the dot bins, so it never cuts a dot. */
(() => {
  'use strict';
  const NN = ' ', NB = ' ';
  const MEAN = 480, SD = 60, LO = 360, HI = 600;
  const P05 = 381.3, P95 = 578.7;
  const SMIN = 380, SMAX = 580, STEP = 20;
  // quantile dots: the 2.5th to 97.5th percentiles of the forecast, (i − 0.5) / 20
  const Q = [362.4, 393.6, 411.0, 423.9, 434.7, 444.1, 452.8, 460.9, 468.7, 476.2, 483.8, 491.3, 499.1, 507.2, 515.9, 525.3, 536.1, 549.0, 566.4, 597.6];
  const erf = (x) => {
    const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a));
  };
  const cdf = (u, sd = SD) => 0.5 * (1 + erf((u - MEAN) / (Math.max(sd, 1e-6) * Math.SQRT2)));

  const T = {
    title: { en: 'Four forms of one forecast', fr: 'Quatre formes d’une même prévision' },
    hint: { en: 'demand for one item next month, units · illustrative', fr: 'demande d’un article le mois prochain, en unités · données d’exemple' },
    noErr: { en: 'No error measured yet', fr: 'Erreur pas encore mesurée' },
    head: { en: ['If we stock', 'chance it runs out'], fr: ['Si l’on stocke', 'risque de rupture'] },
    units: { en: (n) => `${n} units`, fr: (n) => `${n}${NB}unités` },
    forms: {
      en: { line: 'Line only', interval: '90% interval', dots: '20 dots', cdf: 'Cumulative' },
      fr: { line: 'Ligne seule', interval: `Intervalle à 90${NN}%`, dots: '20 points', cdf: 'Courbe cumulée' },
    },
    dLine: { en: 'the expected 480, nothing more', fr: 'la valeur attendue, 480, rien de plus' },
    dInside: { en: (s) => `${s} lies inside 381–579`, fr: (s) => `${s} est dans 381–579` },
    dBelow: { en: (s) => `${s} lies below 381`, fr: (s) => `${s} est sous 381` },
    dAbove: { en: (s) => `${s} lies above 579`, fr: (s) => `${s} est au-dessus de 579` },
    dDots: { en: (k, s) => `${k} of 20 ${k === '1' ? 'lies' : 'lie'} above ${s}`, fr: (k, s) => `${k} sur 20 au-dessus de ${s}` },
    dCdf: { en: (f, s) => `${f} at or below ${s}`, fr: (f, s) => `${f} à ${s} ou moins` },
    dNone: { en: 'no measured error', fr: 'aucune erreur mesurée' },
    rInside: { en: '5–95%', fr: `5–95${NN}%` },
    rBelow: { en: 'over 95%', fr: `plus de 95${NN}%` },
    rAbove: { en: 'under 5%', fr: `moins de 5${NN}%` },
    zone: { en: 'demand above stock', fr: 'demande au-delà du stock' },
    axis: { en: 'Demand next month, units', fr: 'Demande le mois prochain, en unités' },
    sliderAria: { en: 'Units in stock', fr: 'Unités en stock' },
    plotAria: { en: 'One demand forecast for next month drawn four ways, against the units in stock', fr: 'Une prévision de la demande du mois prochain tracée de quatre façons, face aux unités en stock' },
    lead: {
      en: (k, s, p) => `${k} of the 20 dots ${k === 1 ? 'lies' : 'lie'} above ${s}: about a ${p} chance of running out.`,
      fr: (k, s, p) => `${k} des 20 points ${k === 1 ? 'est' : 'sont'} au-dessus de ${s}${NN}: environ ${p} de risque de rupture.`,
    },
    rest: {
      en: (c, where) => `The curve reads ${c}, the interval only ${where === 'inside' ? 'brackets it between 5 and 95%' : where === 'below' ? 'says more than 95%' : 'says less than 5%'}, and the line cannot say.`,
      fr: (c, where) => `La courbe indique ${c}, l’intervalle ${where === 'inside' ? `ne fait que l’encadrer entre 5 et 95${NN}%` : where === 'below' ? `dit seulement plus de 95${NN}%` : `dit seulement moins de 5${NN}%`}, et la ligne ne peut rien dire.`,
    },
    noLead: { en: 'No error measured yet.', fr: 'Pas encore d’erreur mesurée.' },
    noRest: {
      en: 'Until this forecast has been checked against past months, only the expected 480 is drawn, and no chance of running out can be stated.',
      fr: 'Tant que cette prévision n’a pas été confrontée aux mois passés, seule la valeur attendue, 480, est tracée, et aucun risque de rupture ne peut être annoncé.',
    },
  };
  const FORMS = ['line', 'interval', 'dots', 'cdf'];

  FIG.register('demo-uncertainty', (root, F) => {
    const st = { stock: 540, noErr: false };
    const narrow = window.matchMedia ? matchMedia('(max-width:1079px)') : { matches: false };
    const FN = F.t(T.forms), HD = F.t(T.head);

    /* ---------- markup ---------- */
    const readout = (f) => `<div class="r10-read"><div class="r10-nm"><b>${FN[f]}</b><span class="r10-desc"></span></div><span class="r10-rd"></span></div>`;
    const ticks = [360, 400, 440, 480, 520, 560, 600].map((u) => `<span class="r10-tick" style="left:${(((u - LO) / (HI - LO)) * 100).toFixed(4)}%">${F.num(u)}</span>`).join('');
    const inner = `<div class="r10-grid" role="group" aria-label="${F.esc(F.t(T.plotAria))}">` +
      `<div class="r10-row r10-srow"><div class="r10-read r10-head"><span>${HD[0]}</span><span>${HD[1]}</span></div><div class="r10-plot" data-p="slider"></div></div>` +
      FORMS.map((f) => `<div class="r10-row r10-${f}" data-form="${f}">${readout(f)}<div class="r10-plot" data-p="${f}"></div></div>`).join('') +
      `<div class="r10-axis" aria-hidden="true"><span class="r10-axt">${F.t(T.axis)}</span><div class="r10-ticks">${ticks}</div></div></div>`;
    root.innerHTML = F.sheet({ cls: 'r10', title: F.t(T.title), hint: F.t(T.hint), controls: F.toggle('noerr', F.t(T.noErr), st.noErr), body: F.field(inner, 'r10-field') });
    if (!F.reduce) root.classList.add('r10-pre');

    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const sheet = $('.f2-sheet');
    const plots = Object.fromEntries($$('.r10-plot').map((p) => [p.dataset.p, p]));
    const rowOf = (f) => root.querySelector(`.r10-row[data-form="${f}"]`);
    const desc = Object.fromEntries(FORMS.map((f) => [f, rowOf(f).querySelector('.r10-desc')]));
    const rd = Object.fromEntries(FORMS.map((f) => [f, rowOf(f).querySelector('.r10-rd')]));

    /* ---------- geometry ---------- */
    const g = { pw: 800, r: 13, hDots: 103 };
    const x = (u) => ((u - LO) / (HI - LO)) * g.pw;
    const H = { slider: 44, line: 47, interval: 47, cdf: 119 };
    const yC = (p) => 108 - 96 * p;
    const binOf = (v) => Math.floor((v - LO) / 20);
    const slots = (() => { const n = {}; return Q.map((v) => { const b = binOf(v); n[b] = (n[b] || 0) + 1; return { b, k: n[b] - 1 }; }); })();
    const dotX = (i) => x(LO + slots[i].b * 20 + 10);
    const dotY = (i) => g.hDots - 21 - slots[i].k * (2 * g.r + 4);

    // what is shown now (tweened): the stock the crossing dot sits at, the spread (1 = measured, 0 = none), the readings
    const disp = { sx: st.stock, e: 1, dots: 0, curve: 0 };
    let entered = !!F.reduce;

    // the curve, sampled every 2.5 units plus densely around 480, so a near-zero spread folds into a clean step
    const curvePath = (sd) => {
      const us = [];
      for (let u = LO; u <= HI + 0.01; u += 2.5) us.push(u);
      for (let k = -16; k <= 16; k++) us.push(MEAN + (k * sd) / 4);
      const pts = us.filter((u) => u >= LO && u <= HI).sort((a, b) => a - b).map((u) => [x(u), yC(cdf(u, sd))]);
      return F.poly(pts);
    };
    const draw = () => {
      const pw = g.pw, xs = x(st.stock), sel = 'f2-handle';
      // slider: track from 380 to 580, filled to the thumb; the stock line starts at the thumb's bottom edge
      plots.slider.innerHTML = F.svg(pw, H.slider,
        F.rect(x(SMIN), 20, x(SMAX) - x(SMIN), 4, 'r10-track', 2) + F.rect(x(SMIN), 20, xs - x(SMIN), 4, 'r10-fill', 2) +
        F.line(xs, 31, xs, H.slider + 1, 'r10-sline') + F.line(xs, 0, xs, H.slider, 'r10-hit') +
        `<g class="${sel} r10-thumb" tabindex="0" role="slider" aria-label="${F.esc(F.t(T.sliderAria))}" aria-valuemin="${SMIN}" aria-valuemax="${SMAX}">${F.circle(xs, 22, 15, 'f2-ring')}${F.circle(xs, 22, 8.25, 'r10-knob')}</g>` +
        F.text(xs + 20, 27, '', 'r10-val'), { role: 'presentation', cls: 'r10-svg' });
      const zone = (h) => F.rect(xs, 0, Math.max(0, pw - xs), h, 'r10-zone');
      const sline = (h) => F.line(xs, -1, xs, h, 'r10-sline') + F.line(xs, 0, xs, h, 'r10-hit');
      plots.line.innerHTML = F.svg(pw, H.line, zone(H.line) + F.rect(x(MEAN) - 1, 9, 2, 29, 'f2-slate', 1) +
        F.text(x(MEAN) + 8, 27, F.num(MEAN), 'r10-lab') + F.text(xs + 10, 27, F.t(T.zone), 'r10-lab r10-zlab') + sline(H.line), { role: 'presentation', cls: 'r10-svg' });
      plots.interval.innerHTML = F.svg(pw, H.interval, zone(H.interval) + F.rect(x(P05), 19.5, x(P95) - x(P05), 8, 'r10-band', 4) +
        F.rect(x(MEAN) - 1, 12, 2, 23, 'f2-slate', 1) + F.text(x(P05) - 8, 27.5, F.num(381), 'r10-lab r10-blab', 'end') + F.text(x(P95) + 8, 27.5, F.num(579), 'r10-lab r10-blab') + sline(H.interval), { role: 'presentation', cls: 'r10-svg' });
      plots.dots.innerHTML = F.svg(pw, g.hDots, zone(g.hDots) + Q.map((v, i) => F.circle(dotX(i), dotY(i), g.r, 'r10-dot', { 'data-i': i })).join('') + sline(g.hDots), { role: 'presentation', cls: 'r10-svg' });
      plots.cdf.innerHTML = F.svg(pw, H.cdf, zone(H.cdf) + [12, 60, 108].map((y) => F.line(0, y, pw, y, 'f2-grid')).join('') +
        F.text(2, 26, F.pct(100), 'r10-lab') + F.text(2, 74, F.pct(50), 'r10-lab') + F.text(pw - 2, 102, F.pct(0), 'r10-lab', 'end') +
        F.path(curvePath(SD), 'r10-curve') + sline(H.cdf) +
        `<g class="r10-cross">${F.line(0, 12.5, 0, 0, 'r10-br')}${F.line(0, 12.5, 0, 12.5, 'r10-br r10-cap')}${F.circle(0, 0, 6.5, 'r10-xo')}${F.circle(0, 0, 4.5, 'r10-xi')}${F.text(0, 24, '', 'r10-xl')}</g>`,
        { role: 'presentation', cls: 'r10-svg' });
      refs();
      place();
      spread();
    };
    let R = {};
    const refs = () => {
      const z = $('.r10-zlab');
      g.zw = z && z.getComputedTextLength ? z.getComputedTextLength() : 110;   // measured while shown, once per draw
      R = {
        thumb: $('.r10-thumb'), knob: $('.r10-knob'), ring: $('.r10-thumb .f2-ring'), fill: $('.r10-fill'), val: $('.r10-val'),
        zones: $$('.r10-zone'), slines: $$('.r10-sline'), hits: $$('.r10-hit'), zlab: $('.r10-zlab'),
        band: $('.r10-band'), blabs: $$('.r10-blab'), dots: $$('.r10-dot'), curve: $('.r10-curve'), cross: $('.r10-cross'),
        brs: $$('.r10-br'), xo: $('.r10-xo'), xi: $('.r10-xi'), xl: $('.r10-xl'),
      };
    };
    // the stock: line, zone, thumb and its value follow at once
    const place = () => {
      const xs = x(st.stock), pw = g.pw;
      R.zones.forEach((z) => { z.setAttribute('x', xs.toFixed(1)); z.setAttribute('width', Math.max(0, pw - xs).toFixed(1)); });
      R.slines.concat(R.hits).forEach((l) => { l.setAttribute('x1', xs.toFixed(1)); l.setAttribute('x2', xs.toFixed(1)); });
      R.ring.setAttribute('cx', xs.toFixed(1)); R.knob.setAttribute('cx', xs.toFixed(1));
      R.fill.setAttribute('width', Math.max(0, xs - x(SMIN)).toFixed(1));
      R.val.textContent = F.t(T.units, F.num(st.stock));
      const vw = R.val.getComputedTextLength ? R.val.getComputedTextLength() : 70;
      // the value sits 20 px from the thumb's centre, clear of its 1.5 px hover ring (r 15)
      const right = xs + 20 + vw <= pw + 20;
      R.val.setAttribute('x', (right ? xs + 20 : xs - 20).toFixed(1));
      R.val.setAttribute('text-anchor', right ? 'start' : 'end');
      R.zlab.setAttribute('x', (xs + 10).toFixed(1));
      R.zlab.classList.toggle('is-off', xs + 10 + g.zw > pw);
      R.thumb.setAttribute('aria-valuenow', String(st.stock));
      R.thumb.setAttribute('aria-valuetext', F.t(T.units, F.num(st.stock)));
      R.dots.forEach((d, i) => d.classList.toggle('is-out', Q[i] > st.stock && disp.e > 0.5));
    };
    // the crossing dot and its bracket sit at the shown stock (sx) on the shown curve
    const cross = () => {
      const sd = SD * disp.e, p = cdf(disp.sx, sd), cx = x(disp.sx), cy = yC(p);
      R.xo.setAttribute('cx', cx.toFixed(1)); R.xo.setAttribute('cy', cy.toFixed(1));
      R.xi.setAttribute('cx', cx.toFixed(1)); R.xi.setAttribute('cy', cy.toFixed(1));
      const bx = (cx + 10).toFixed(1);
      R.brs[0].setAttribute('x1', bx); R.brs[0].setAttribute('x2', bx); R.brs[0].setAttribute('y2', cy.toFixed(1));
      R.brs[1].setAttribute('x1', (cx + 6.5).toFixed(1)); R.brs[1].setAttribute('x2', (cx + 13.5).toFixed(1));
      R.xl.setAttribute('x', (cx + 18).toFixed(1));
      R.xl.textContent = F.pct(Math.round(100 * (1 - p)));
    };
    // the spread: 1 drawn as measured, 0 folded into the expected 480
    const spread = () => {
      const e = disp.e, xm = x(MEAN);
      R.band.setAttribute('x', (xm + (x(P05) - xm) * e).toFixed(1));
      R.band.setAttribute('width', Math.max(0, (x(P95) - x(P05)) * e).toFixed(1));
      R.blabs.forEach((l) => l.setAttribute('opacity', e.toFixed(3)));
      R.dots.forEach((d, i) => {
        d.setAttribute('cx', (xm + (dotX(i) - xm) * e).toFixed(1));
        d.setAttribute('cy', (dotY(i) + (g.hDots - 21 - dotY(i)) * (1 - e)).toFixed(1));
        d.setAttribute('opacity', i === 10 ? 1 : e.toFixed(3));
      });
      R.curve.setAttribute('d', curvePath(Math.max(0.4, SD * e)));
      R.curve.setAttribute('opacity', (0.3 + 0.7 * e).toFixed(3));
      R.cross.setAttribute('opacity', e.toFixed(3));
      cross();
      place();
    };

    /* ---------- words ---------- */
    const where = () => (st.stock < P05 ? 'below' : st.stock > P95 ? 'above' : 'inside');
    const curvePct = (s) => Math.round(100 * (1 - cdf(s)));
    const kAbove = (s) => Q.filter((v) => v > s).length;
    const words = () => {
      const s = F.num(st.stock), k = kAbove(st.stock), c = curvePct(st.stock), w = where();
      desc.line.textContent = F.t(T.dLine);
      rd.line.textContent = '—';
      if (st.noErr) {
        ['interval', 'dots', 'cdf'].forEach((f) => { desc[f].textContent = F.t(T.dNone); rd[f].textContent = '—'; rd[f].classList.add('is-na'); });
        F.status(root, `<b>${F.t(T.noLead)}</b> ${F.t(T.noRest)}`);
      } else {
        desc.interval.textContent = F.t(w === 'inside' ? T.dInside : w === 'below' ? T.dBelow : T.dAbove, s);
        rd.interval.textContent = F.t(w === 'inside' ? T.rInside : w === 'below' ? T.rBelow : T.rAbove);
        rd.interval.classList.add('is-na');
        desc.dots.textContent = F.t(T.dDots, F.num(k), s);
        desc.cdf.textContent = F.t(T.dCdf, F.pct(100 - c), s);
        rd.dots.classList.remove('is-na'); rd.cdf.classList.remove('is-na');
        rd.dots.textContent = F.pct(disp.dots); rd.cdf.textContent = F.pct(disp.curve);
        F.status(root, `<b>${F.t(T.lead, k, s, F.pct(5 * k))}</b> ${F.t(T.rest, F.pct(c), w)}`);
      }
      rd.line.classList.add('is-na');
    };
    let cRead = () => {}, cCross = () => {};
    const readings = (animate) => {
      if (st.noErr) { words(); return; }
      const to = { dots: 5 * kAbove(st.stock), curve: curvePct(st.stock) };
      cRead();
      cRead = F.tween({ dots: disp.dots, curve: disp.curve }, to, animate ? 250 : 0, (o) => {
        disp.dots = Math.round(o.dots); disp.curve = Math.round(o.curve);
        rd.dots.textContent = F.pct(disp.dots); rd.cdf.textContent = F.pct(disp.curve);
      });
      words();
    };

    /* ---------- changes ---------- */
    const setStock = (s, animate = true) => {
      s = Math.min(SMAX, Math.max(SMIN, Math.round(s / STEP) * STEP));
      if (s === st.stock) return;
      st.stock = s;
      place();
      cCross();
      cCross = F.tween(disp.sx, s, animate ? 200 : 0, (v) => { disp.sx = v; cross(); });
      readings(animate);
    };
    let cSpread = () => {};
    F.bind(root, {
      sw: {
        noerr: (on) => {
          st.noErr = on;
          cSpread();
          cSpread = F.tween(disp.e, on ? 0 : 1, 350, (v) => { disp.e = v; spread(); }, F.ease.inOut);
          if (!F.reduce) $$('.r10-rd, .r10-desc').forEach((el) => el.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 150 }));
          readings(true);
        },
      },
    });

    /* dragging: the thumb, the stock line in any row, or anywhere on the slider track */
    let dragging = false, plotEl = null;
    const stockAt = (clientX) => {
      const b = (plotEl || plots.slider).getBoundingClientRect();
      return LO + ((clientX - b.left) / (b.width || 1)) * (HI - LO);
    };
    const near = (e, p) => {
      const b = p.getBoundingClientRect();
      return Math.abs(e.clientX - (b.left + x(st.stock) * (b.width / g.pw))) <= 12;
    };
    $$('.r10-plot').forEach((p) => {
      p.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const onThumb = !!e.target.closest('.r10-thumb'), onTrack = p.dataset.p === 'slider';
        if (!onThumb && !onTrack && !near(e, p)) return;
        if (e.pointerType === 'mouse') e.preventDefault();
        dragging = true; plotEl = p;
        root.classList.add('r10-drag');
        R.thumb.classList.add('is-dragging');
        try { p.setPointerCapture(e.pointerId); } catch (_) { /* capture is a nicety */ }
        if (!onThumb) setStock(stockAt(e.clientX), false);
      });
      p.addEventListener('pointermove', (e) => { if (dragging && plotEl === p) setStock(stockAt(e.clientX), false); });
      const end = () => { if (!dragging) return; dragging = false; plotEl = null; root.classList.remove('r10-drag'); if (R.thumb) R.thumb.classList.remove('is-dragging'); };
      p.addEventListener('pointerup', end);
      p.addEventListener('pointercancel', end);
      p.addEventListener('lostpointercapture', end);
    });
    root.addEventListener('keydown', (e) => {
      if (!e.target.closest || !e.target.closest('.r10-thumb')) return;
      const k = e.key, d = { ArrowLeft: -STEP, ArrowDown: -STEP, ArrowRight: STEP, ArrowUp: STEP, PageDown: -3 * STEP, PageUp: 3 * STEP }[k];
      if (d != null) { e.preventDefault(); setStock(st.stock + d); }
      else if (k === 'Home') { e.preventDefault(); setStock(SMIN); }
      else if (k === 'End') { e.preventDefault(); setStock(SMAX); }
    });

    /* ---------- layout: readout 3 columns, plot 9; one column under 1080 px ---------- */
    const layout = () => {
      const W = sheet.clientWidth || 1120, col = (W - 11 * 32) / 12;
      root.style.setProperty('--r10-rw', `${Math.max(150, Math.round(3 * col + 32))}px`);
      const pw = Math.max(200, plots.slider.clientWidth || 800);
      g.pw = pw;
      g.r = Math.max(6, Math.min(13, (pw / 12) * 0.39));
      g.hDots = Math.round(3 * (2 * g.r + 4) + 13);
      root.style.setProperty('--r10-hd', `${g.hDots + 1}px`);
      const focused = document.activeElement && document.activeElement.closest && document.activeElement.closest('.r10-thumb');
      draw();
      if (focused) R.thumb.focus({ preventScroll: true });
    };
    disp.dots = F.reduce ? 5 * kAbove(st.stock) : 0;
    disp.curve = F.reduce ? curvePct(st.stock) : 0;
    layout();
    readings(false);
    F.onResize(plots.slider, layout);
    if (narrow.addEventListener) narrow.addEventListener('change', layout);

    /* ---------- entrance: dots drop in, lowest first; the curve draws; the band grows out of 480 ---------- */
    F.enter(root, (still) => {
      root.classList.remove('r10-pre');
      entered = true;
      if (still) { disp.dots = 5 * kAbove(st.stock); disp.curve = curvePct(st.stock); readings(false); return; }
      const ease = 'cubic-bezier(.33,1,.68,1)';
      R.dots.forEach((d, i) => d.animate([{ transform: 'translateY(-36px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: i * 25, easing: ease, fill: 'backwards' }));
      const len = R.curve.getTotalLength ? R.curve.getTotalLength() : 900;
      R.curve.animate([{ strokeDasharray: `${len}`, strokeDashoffset: `${len}` }, { strokeDasharray: `${len}`, strokeDashoffset: '0' }], { duration: 600, easing: ease });
      R.cross.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: 700 });
      R.band.style.transformOrigin = `${x(MEAN).toFixed(1)}px 0`;
      R.band.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 400, easing: ease });
      readings(true);
    });
  });
})();
