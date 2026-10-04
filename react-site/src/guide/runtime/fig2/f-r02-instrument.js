/* Rule 2 · Instrument builder (stage demo-instrument).
   Paper: "Fig · 2 · Instrument" (5KC-0) and its interacting state (5OT-0); spec figspec/r2.json.
   One illustrative number, a month's revenue, set as an instrument: its unit and basis, a scale (a bar on its axis), a
   comparator (the target tick) and the gap printed in words. Four switches take the parts away one by one, and the
   status says which questions are then left to the reader. Drag the end of the bar, or use the value slider. */
(() => {
  'use strict';

  /* ---------- the model ---------- */
  const MAX = 600, LO = 300, HI = 600, TARGET = 520, START = 482, AXIS = [0, 200, 400, 600];
  const PARTS = ['unit', 'scale', 'comp', 'gap'];
  const RAIL_H = 58; // target label 0–16, track 22–34, tick 18–38, axis labels 42–58

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
  const NB = ' ';

  /* ---------- words ---------- */
  const T = {
    title: { en: 'Instrument builder', fr: 'Constructeur d’instrument' },
    hint: { en: 'an illustrative monthly revenue', fr: 'un chiffre d’affaires mensuel, à titre d’exemple' },
    parts: {
      en: { unit: ['Unit and basis', 'Of what? $K, this month'], scale: ['Scale', 'On what range? 0 to 600'], comp: ['Comparator', 'Compared with what? The target, 520'], gap: ['Gap', 'By how much? The difference, in words'] },
      fr: { unit: ['Unité et base', 'De quoi ? k$, ce mois-ci'], scale: ['Échelle', 'Sur quelle plage ? De 0 à 600'], comp: ['Comparateur', 'Comparé à quoi ? L’objectif, 520'], gap: ['Écart', 'De combien ? La différence, en mots'] },
    },
    show: {
      en: { unit: 'Show unit and basis', scale: 'Show scale', comp: 'Show comparator', gap: 'Show gap' },
      fr: { unit: 'Afficher l’unité et la base', scale: 'Afficher l’échelle', comp: 'Afficher le comparateur', gap: 'Afficher l’écart' },
    },
    missing: {
      en: { unit: 'of what', scale: 'on what range', comp: 'compared with what', gap: 'by how much' },
      fr: { unit: 'de quoi', scale: 'sur quelle plage', comp: 'comparé à quoi', gap: 'de combien' },
    },
    partsAria: { en: 'Parts of the instrument', fr: 'Parties de l’instrument' },
    name: { en: 'Revenue', fr: 'Chiffre d’affaires' },
    basis: { en: 'this month', fr: 'ce mois-ci' },
    unit: { en: '$K', fr: 'k$' },
    target: { en: (v) => `target ${v}`, fr: (v) => `objectif ${v}` },
    words: {
      en: { below: 'below target', above: 'above target', on: 'on target' },
      fr: { below: 'sous l’objectif', above: 'au-dessus de l’objectif', on: 'sur l’objectif' },
    },
    value: { en: 'Value', fr: 'Valeur' },
    valueAria: { en: 'Revenue this month, $K', fr: 'Chiffre d’affaires du mois, k$' },
    cardAria: {
      en: 'Revenue this month as an instrument: value, scale from 0 to 600, target 520 and the gap',
      fr: 'Le chiffre d’affaires du mois comme instrument : valeur, échelle de 0 à 600, objectif 520 et écart',
    },
    handleAria: { en: 'Value, drag to change', fr: 'Valeur, faites glisser pour la changer' },
    and: { en: ' and ', fr: ' et ' },
    // the status: a lead clause that reads the card as it stands, and what is left to the reader
    lead: {
      en: (o) => `Revenue${o.unit ? ' this month' : ''}: ${o.v}${o.unit ? NB + '$K' : ''}${
        o.comp && o.gap ? (o.d === 0 ? `, exactly on the target${o.scale ? ' of 520' : ''}` : `, ${o.abs} ${o.d < 0 ? 'below' : 'above'} the target${o.scale ? ' of 520' : ''}`) : o.comp && o.scale ? ', against a target of 520' : ''}.`,
      fr: (o) => `Chiffre d’affaires${o.unit ? ' ce mois-ci' : ''} : ${o.v}${o.unit ? NB + 'k$' : ''}${
        o.comp && o.gap ? (o.d === 0 ? `, exactement sur l’objectif${o.scale ? ' de 520' : ''}` : `, ${o.abs} ${o.d < 0 ? 'sous' : 'au-dessus de'} l’objectif${o.scale ? ' de 520' : ''}`) : o.comp && o.scale ? ', face à un objectif de 520' : ''}.`,
    },
    complete: { en: 'Every question is answered on the card.', fr: 'Chaque question trouve sa réponse sur la carte.' },
    left: { en: (l) => `Left to the reader: ${l}.`, fr: (l) => `Laissé au lecteur : ${l}.` },
  };

  FIG.register('demo-instrument', (root, F) => {
    const list = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + F.t(T.and) + xs[xs.length - 1]);
    const st = { v: START, unit: true, scale: true, comp: true, gap: true };

    /* ---------- markup ---------- */
    const P = F.t(T.parts);
    const sw = PARTS.map((id) => F.toggle(id, `<span class="f2-r2-st">${P[id][0]}</span><span class="f2-r2-sq" id="${root.id}-q-${id}">${F.fr(P[id][1])}</span>`, true)).join('');
    const words = F.t(T.words);
    const controls = `<div class="f2-r2-sws" role="group" aria-label="${F.esc(F.t(T.partsAria))}">${sw}</div>
      <div class="f2-r2-val">${F.slider('v', { min: LO, max: HI, step: 1, value: st.v, label: F.t(T.value), aria: F.t(T.valueAria), out: F.num(st.v) })}</div>`;
    const card = `<div class="f2-r2-card" role="group" aria-label="${F.esc(F.fr(F.t(T.cardAria)))}">
      <div class="f2-r2-head"><div class="f2-r2-lrow"><span class="f2-r2-name">${F.t(T.name)}</span><span class="f2-r2-basis f2-r2-p-unit">${F.t(T.basis)}</span></div>
      <div class="f2-r2-vrow"><span class="f2-r2-num">${F.num(st.v)}</span><span class="f2-r2-unit f2-r2-p-unit">${F.t(T.unit)}</span></div></div>
      <div class="f2-r2-rail"></div>
      <div class="f2-r2-gapin"><div class="f2-r2-gaprow f2-r2-p-gap"><b class="f2-r2-gap"></b><span class="f2-r2-words">${['below', 'above', 'on'].map((k) => `<span data-w="${k}">${words[k]}</span>`).join('')}</span></div></div>
    </div>`;
    root.innerHTML = F.sheet({
      cls: 'f2-r2',
      title: F.t(T.title),
      hint: F.t(T.hint),
      body: `<div class="f2-r2-grid">${F.field(controls, 'f2-r2-ctl')}${F.field(card, 'f2-r2-cardf')}</div>`,
    });
    const $ = (s) => root.querySelector(s);
    const sheetEl = $('.f2-r2'), rail = $('.f2-r2-rail'), range = $('.f2-range'), out = $('[data-sl="v"] output');
    const numEl = $('.f2-r2-num'), gapEl = $('.f2-r2-gap'), gapIn = $('.f2-r2-gapin'), wordEls = [...root.querySelectorAll('.f2-r2-words [data-w]')];
    const swEls = Object.fromEntries(PARTS.map((id) => [id, root.querySelector(`[data-sw="${id}"]`)]));
    PARTS.forEach((id) => { swEls[id].setAttribute('aria-label', F.t(T.show)[id]); swEls[id].setAttribute('aria-describedby', `${root.id}-q-${id}`); });

    /* ---------- the rail: built once per width, then updated in place ---------- */
    let R = null;
    const build = () => {
      const W = Math.max(160, Math.round(rail.clientWidth)), x = (v) => (v / MAX) * W, tx = x(TARGET);
      let s = '';
      s += `<g class="f2-r2-p-scale"><rect class="f2-r2-track" x="0" y="22" width="${W}" height="12" rx="6"/><rect class="f2-r2-bar" x="0" y="22" width="0" height="12" rx="6"/></g>`;
      s += `<g class="f2-r2-axin"><g class="f2-r2-p-scale">${AXIS.map((v, i) => F.text(i === 0 ? 0 : i === AXIS.length - 1 ? W : x(v), 54, F.num(v), 'f2-r2-ax', i === 0 ? 'start' : i === AXIS.length - 1 ? 'end' : 'middle')).join('')}</g></g>`;
      s += `<g class="f2-r2-tkin"><g class="f2-r2-p-comp">${F.text(tx - 6, 12, F.t(T.target, F.num(TARGET)), 'f2-r2-tl', 'end')}<rect class="f2-r2-tick" x="${(tx - 1.5).toFixed(2)}" y="18" width="3" height="20" rx="2"/></g></g>`;
      s += `<g class="f2-handle f2-r2-h" tabindex="0" role="slider" aria-label="${F.esc(F.t(T.handleAria))}" aria-valuemin="${LO}" aria-valuemax="${HI}" aria-valuenow="${st.v}">
        <rect class="f2-r2-hit" x="-22" y="6" width="44" height="44"/><circle class="f2-r2-ring" cx="0" cy="28" r="14.25"/><circle class="f2-r2-knob" cx="0" cy="28" r="8.25"/>
        <text class="f2-r2-hv" x="0" y="7" text-anchor="middle"></text></g>`;
      rail.innerHTML = `<svg class="f2-svg f2-r2-svg" width="${W}" height="${RAIL_H}" viewBox="0 0 ${W} ${RAIL_H}" focusable="false">${s}</svg>`;
      const svg = rail.firstChild;
      R = { svg, W, x, bar: svg.querySelector('.f2-r2-bar'), axin: svg.querySelector('.f2-r2-axin'), tkin: svg.querySelector('.f2-r2-tkin'), tl: svg.querySelector('.f2-r2-tl'), h: svg.querySelector('.f2-r2-h'), hv: svg.querySelector('.f2-r2-hv') };
      wireHandle();
      parts();
      paint();
    };

    /* ---------- drawing ---------- */
    let shown = st.v; // the value the card shows now (tweens)
    let clock = 0; // the entrance clock in ms; null once entered
    const r2 = (v) => Math.round(v * 100) / 100;
    const paint = () => {
      const k = clock, at = (t0, d) => (k == null ? 1 : EASE(clamp((k - t0) / d, 0, 1)));
      const v = k == null ? shown : st.v * at(0, 600), vr = Math.round(v);
      numEl.textContent = F.num(vr);
      gapEl.textContent = F.signed(Math.round(shown) - TARGET);
      gapIn.style.opacity = k == null ? '' : r2(at(600, 200));
      if (!R) return;
      const end = R.x(v);
      R.bar.setAttribute('width', r2(end));
      R.axin.setAttribute('opacity', r2(at(100, 200)));
      const s = at(400, 200), tx = R.x(TARGET);
      R.tkin.setAttribute('transform', s === 1 ? '' : `translate(${r2(tx)} 28) scale(${r2(s)}) translate(${r2(-tx)} -28)`);
      R.h.setAttribute('transform', `translate(${r2(end)} 0)`);
      R.h.setAttribute('aria-valuenow', String(vr));
      R.h.setAttribute('aria-valuetext', `${F.num(vr)} ${F.t(T.unit)}`);
      R.hv.textContent = F.num(vr);
      // While its value is printed above the handle, the target label steps aside if the two would touch.
      const showV = R.h.classList.contains('is-dragging') || R.h.matches(':focus-visible');
      let near = false;
      if (showV) {
        try {
          const lw = R.tl.getComputedTextLength(), vw = R.hv.getComputedTextLength(), right = tx - 6, left = right - lw;
          near = end - vw / 2 - 4 < right && end + vw / 2 + 4 > left;
        } catch (e) { near = false; }
      }
      R.tl.classList.toggle('is-near', near);
      R.h.classList.toggle('is-showing', showV);
    };

    // The words of the gap follow the sign (cross-fade in CSS), the status the whole card.
    const write = () => {
      const d = st.v - TARGET, sign = d < 0 ? 'below' : d > 0 ? 'above' : 'on';
      wordEls.forEach((el) => el.classList.toggle('on', el.dataset.w === sign));
      out.textContent = F.num(st.v);
      range.setAttribute('aria-valuetext', `${F.num(st.v)} ${F.t(T.unit)}`);
      const miss = F.t(T.missing), left = [];
      if (!st.unit) left.push(miss.unit);
      if (!st.scale) left.push(miss.scale);
      if (!st.comp) left.push(miss.comp);
      if (!st.gap || !st.comp) left.push(miss.gap);
      const lead = F.t(T.lead, { v: F.num(st.v), unit: st.unit, scale: st.scale, comp: st.comp, gap: st.gap, d, abs: F.num(Math.abs(d)) });
      const rest = left.length ? F.t(T.left, list(left)) : F.t(T.complete);
      F.status(root, `<b>${F.esc(F.fr(lead))}</b> ${F.esc(F.fr(rest))}`);
    };

    // The parts that are switched off fade out where they stand; the gap needs the comparator.
    const parts = () => {
      sheetEl.classList.toggle('no-unit', !st.unit);
      sheetEl.classList.toggle('no-scale', !st.scale);
      sheetEl.classList.toggle('no-comp', !st.comp);
      sheetEl.classList.toggle('no-gap', !st.gap || !st.comp);
      swEls.gap.disabled = !st.comp;
      if (R) {
        R.h.setAttribute('tabindex', st.scale ? '0' : '-1');
        R.h.setAttribute('aria-hidden', String(!st.scale));
        if (!st.scale && document.activeElement === R.h) R.h.blur();
      }
    };

    /* ---------- changes ---------- */
    let cancelTween = null, cancelEntry = null;
    const settle = () => { if (clock === null) return; if (cancelEntry) cancelEntry(); clock = null; };
    const setValue = (v, instant) => {
      settle();
      v = clamp(Math.round(v), LO, HI);
      if (v === st.v && !instant) return;
      st.v = v;
      range.value = v;
      F.fillRange(range);
      write();
      if (cancelTween) cancelTween();
      cancelTween = null;
      if (instant || F.reduce) { shown = v; paint(); return; }
      cancelTween = F.tween(shown, v, 250, (x) => { shown = x; paint(); }, EASE);
    };

    // The value slider: a drag follows, a click or a key tweens; Shift + arrows step by 10.
    let ptr = 0;
    range.addEventListener('pointerdown', () => { ptr = 1; });
    range.addEventListener('pointermove', (e) => { if (ptr && e.buttons) ptr = 2; });
    const release = () => { ptr = 0; };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    range.addEventListener('keydown', (e) => {
      const dd = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!dd || !e.shiftKey) return;
      e.preventDefault();
      setValue(st.v + dd * 10, false);
    });
    F.bind(root, {
      sl: { v: (v) => setValue(v, ptr === 2) },
      sw: Object.fromEntries(PARTS.map((id) => [id, (on) => { settle(); st[id] = on; parts(); write(); paint(); }])),
    });

    // The end of the bar: drag it, or use the arrow keys when it has the focus.
    const wireHandle = () => {
      const h = R.h;
      // touch-action does not reach SVG marks in every browser: a touch that starts on the handle must not scroll
      h.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      F.drag(h, () => R && R.svg, {
        start: () => { settle(); paint(); },
        move: (p) => { if (R) setValue((p.x / R.W) * MAX, true); },
        end: () => paint(),
      });
      F.keys(h, (dx, dy, big) => setValue(st.v + (dx || -dy) * (big ? 10 : 1), false));
      h.addEventListener('keydown', (e) => {
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setValue(e.key === 'Home' ? LO : HI, false); }
      });
      h.addEventListener('focus', () => paint());
      h.addEventListener('blur', () => paint());
    };

    /* ---------- start ---------- */
    write();
    build();
    F.onResize(rail, () => build());
    F.enter(root, (still) => {
      if (clock === null) return;
      if (still) { clock = null; paint(); return; }
      cancelEntry = F.tween(0, 800, 800, (ms) => { clock = ms; paint(); if (ms >= 800) clock = null; }, F.ease.lin);
    });
  });
})();
