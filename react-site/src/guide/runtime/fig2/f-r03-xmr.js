/* Rule 3 · Signal or routine (stage demo-xmr).
   Paper: "Fig · 3 · Routine variation" (5WD-0) and its interacting state (68C-0); spec figspec/r3.json.
   Twelve illustrative weeks of sign-ups on an XmR chart. The average and the limits of routine variation come from
   the first eleven weeks; the latest week is a vertical slider. Inside the limits it stays slate (routine); beyond
   either limit it turns ink and the status calls it a signal. A switch opens the moving-range strip under the chart. */
(() => {
  'use strict';

  /* ---------- the model ---------- */
  const WEEKS = [399, 430, 408, 432, 397, 417, 442, 422, 416, 424, 433];
  const AVG = WEEKS.reduce((s, v) => s + v, 0) / WEEKS.length; // 420.0
  const MR = WEEKS.slice(1).map((v, i) => Math.abs(v - WEEKS[i])); // 31 22 24 35 20 25 20 6 8 9
  const AMR = MR.reduce((s, v) => s + v, 0) / MR.length; // 20.0
  const UCL = Math.round((AVG + 2.66 * AMR) * 10) / 10, LCL = Math.round((AVG - 2.66 * AMR) * 10) / 10; // 473.2, 366.8
  const URL_ = Math.round(3.27 * AMR * 10) / 10; // 65.4
  const HIGH = Math.max(...WEEKS), LOW = Math.min(...WEEKS), LAST = WEEKS[WEEKS.length - 1];
  const LO = 340, HI = 500, START = 452;
  // Plot block 280 tall: values 340–500 on y 12–252 (1.5 px per sign-up), week labels at 264. Strip: 112 tall,
  // its plot from 24 (80) to the base at 104 (0), 1 px per sign-up.
  const PH = 280, Y0 = 12, YH = 240, SH = 112, SB = 104;
  const yOf = (v) => Y0 + ((HI - v) / (HI - LO)) * YH;

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
  // When does the eased progress reach f? (to start each point as the line reaches it)
  const easeInv = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (EASE(m) < f) lo = m; else hi = m; } return (lo + hi) / 2; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r2 = (v) => Math.round(v * 100) / 100;

  /* ---------- words ---------- */
  const T = {
    title: { en: 'Signal or routine', fr: 'Signal ou routine' },
    hint: { en: 'illustrative weekly sign-ups', fr: 'inscriptions hebdomadaires, à titre d’exemple' },
    sw: { en: 'Show moving ranges', fr: 'Afficher les étendues mobiles' },
    sec1: { en: 'Weeks 1 to 11', fr: 'Semaines 1 à 11' },
    rows1: {
      en: ['Average', 'Average moving range', 'Upper limit, average + 2.66 ranges', 'Lower limit, average − 2.66 ranges'],
      fr: ['Moyenne', 'Étendue mobile moyenne', 'Limite haute, moyenne + 2,66 étendues', 'Limite basse, moyenne − 2,66 étendues'],
    },
    sec2: { en: 'Week 12, the latest', fr: 'Semaine 12, la dernière' },
    rows2: {
      en: ['Sign-ups', 'From the average', 'In moving ranges', 'Moving range from week 11'],
      fr: ['Inscriptions', 'Écart à la moyenne', 'En étendues mobiles', 'Étendue mobile depuis la semaine 11'],
    },
    latest: { en: 'latest', fr: 'dernière' },
    lines: {
      en: (u, a, l) => [`upper limit ${u}`, `average ${a}`, `lower limit ${l}`],
      fr: (u, a, l) => [`limite haute ${u}`, `moyenne ${a}`, `limite basse ${l}`],
    },
    stripTitle: { en: 'Moving range, the change from the week before', fr: 'Étendue mobile, l’écart avec la semaine précédente' },
    stripLines: { en: (r, a) => [`range limit ${r}`, `average ${a}`], fr: (r, a) => [`limite d’étendue ${r}`, `moyenne ${a}`] },
    chartAria: {
      en: 'Twelve weeks of sign-ups with the average and the limits of routine variation. Arrow keys read the earlier weeks.',
      fr: 'Douze semaines d’inscriptions avec la moyenne et les limites de la variation ordinaire. Les flèches lisent les semaines précédentes.',
    },
    latestAria: { en: 'Latest week, sign-ups', fr: 'Dernière semaine, inscriptions' },
    weekRead: { en: (w, v) => `Week ${w}: ${v} sign-ups`, fr: (w, v) => `Semaine ${w} : ${v} inscriptions` },
    signups: { en: (v) => `${v} sign-ups`, fr: (v) => `${v} inscriptions` },
    // the status
    inside: { en: (v, l, u) => `${v} sits inside the limits, ${l} to ${u}.`, fr: (v, l, u) => `${v} se situe dans les limites, de ${l} à ${u}.` },
    high: { en: (v) => `${v} is the highest week so far, yet inside the limits.`, fr: (v) => `${v} est la semaine la plus haute jusqu’ici, mais reste dans les limites.` },
    low: { en: (v) => `${v} is the lowest week so far, yet inside the limits.`, fr: (v) => `${v} est la semaine la plus basse jusqu’ici, mais reste dans les limites.` },
    routine: { en: 'Routine variation: no explanation is owed.', fr: 'Variation ordinaire : aucune explication n’est due.' },
    above: { en: (v, u) => `${v} is above the upper limit of ${u}.`, fr: (v, u) => `${v} dépasse la limite haute de ${u}.` },
    below: { en: (v, l) => `${v} is below the lower limit of ${l}.`, fr: (v, l) => `${v} passe sous la limite basse de ${l}.` },
    signal: { en: 'A signal: something changed, and it is worth asking what.', fr: 'Un signal : quelque chose a changé, et il vaut la peine de chercher quoi.' },
  };

  FIG.register('demo-xmr', (root, F) => {
    const st = { v: START, mr: false, pt: -1 };
    const n1 = (v) => F.num(v, 1);

    /* ---------- markup ---------- */
    const row = (label, value, cls) => `<div class="f2-r3-row"><dt>${label}</dt><dd${cls ? ` class="${cls}"` : ''}>${value}</dd></div>`;
    const r1 = F.t(T.rows1), rw2 = F.t(T.rows2);
    const working = `<div class="f2-r3-sec"><div class="f2-r3-cap">${F.t(T.sec1)}</div><dl>${row(r1[0], n1(AVG))}${row(r1[1], n1(AMR))}${row(r1[2], n1(UCL))}${row(r1[3], n1(LCL))}</dl></div>
      <div class="f2-r3-sec f2-r3-sec2"><div class="f2-r3-cap">${F.t(T.sec2)}</div><dl>${row(rw2[0], '', 'w-v')}${row(rw2[1], '', 'w-d')}${row(rw2[2], '', 'w-k')}${row(rw2[3], '', 'w-r')}</dl></div>`;
    const chart = `<div class="f2-r3-chart"><div class="f2-r3-plot" tabindex="0" role="group" aria-label="${F.esc(F.fr(F.t(T.chartAria)))}"></div><span class="f2-r3-sr" aria-live="polite"></span>
      <div class="f2-r3-stripw" aria-hidden="true"><div class="f2-r3-stripi"><div class="f2-r3-strip"><p class="f2-r3-stitle">${F.t(T.stripTitle)}</p><div class="f2-r3-sp"></div></div></div></div></div>`;
    root.innerHTML = F.sheet({
      cls: 'f2-r3',
      title: F.t(T.title),
      hint: F.t(T.hint),
      controls: F.toggle('mr', F.t(T.sw), false),
      body: `<div class="f2-r3-grid">${F.field(working, 'f2-r3-work')}${F.field(chart, 'f2-r3-chartf')}</div>`,
    });
    const $ = (s) => root.querySelector(s);
    const sheetEl = $('.f2-r3'), plot = $('.f2-r3-plot'), sp = $('.f2-r3-sp'), stripW = $('.f2-r3-stripw');
    const wv = $('.w-v'), wd = $('.w-d'), wk = $('.w-k'), wr = $('.w-r'), srEl = $('.f2-r3-sr');

    /* ---------- the chart: built once per width, then updated in place ---------- */
    let R = null;
    const build = () => {
      const W = Math.max(240, Math.round(plot.clientWidth)), wide = W >= 560;
      const lane = wide ? 96 : 40, x0 = 40, x1 = W - lane - 24, lx = x1 + 24;
      const step = (x1 - x0 - 48) / 11, xOf = (i) => x0 + 24 + i * step;
      const L = F.t(T.lines, n1(UCL), n1(AVG), n1(LCL)), lines = wide ? L : [n1(UCL), n1(AVG), n1(LCL)];
      const every = step >= 30 ? 1 : 2; // narrow: weeks 1, 3, 5, 7, 9 and the latest
      sheetEl.classList.toggle('is-narrow', !wide);
      let s = '<g class="f2-r3-frame">';
      [360, 400, 440, 480].forEach((v) => { s += F.line(x0, yOf(v) + 0.5, x1, yOf(v) + 0.5, 'f2-r3-gl') + F.text(28, yOf(v) + 4, F.num(v), 'f2-r3-ax', 'end'); });
      s += F.rect(x0, yOf(UCL), x1 - x0, yOf(LCL) - yOf(UCL), 'f2-r3-band');
      s += F.line(x0, yOf(UCL), x1, yOf(UCL), 'f2-r3-lim') + F.line(x0, yOf(LCL), x1, yOf(LCL), 'f2-r3-lim') + F.line(x0, yOf(AVG), x1, yOf(AVG), 'f2-r3-avg');
      s += F.text(lx, yOf(UCL) + 4, lines[0], 'f2-r3-ax') + F.text(lx, yOf(AVG) + 4, lines[1], 'f2-r3-ax') + F.text(lx, yOf(LCL) + 4, lines[2], 'f2-r3-ax');
      for (let i = 0; i < 12; i++) if (i === 11 || (i % every === 0 && (every === 1 || i < 10))) s += F.text(xOf(i), 276, i === 11 ? F.t(T.latest) : F.num(i + 1), 'f2-r3-ax', 'middle');
      s += F.rect(xOf(11) - 2, Y0, 4, YH, 'f2-r3-track', 2);
      s += '</g>';
      s += `<polyline class="f2-r3-line" points=""/>`;
      s += WEEKS.map((v, i) => `<circle class="f2-r3-pt" cx="${r2(xOf(i))}" cy="${r2(yOf(v))}" r="3.5"/>`).join('');
      s += `<text class="f2-r3-pv" x="0" y="0" text-anchor="middle"></text>`;
      s += `<g class="f2-handle f2-r3-h" tabindex="0" role="slider" aria-orientation="vertical" aria-label="${F.esc(F.t(T.latestAria))}" aria-valuemin="${LO}" aria-valuemax="${HI}">
        <rect class="f2-r3-hit" x="${r2(xOf(11) - 16)}" y="${Y0 - 6}" width="32" height="${YH + 12}"/>
        <circle class="f2-r3-ring" cx="${r2(xOf(11))}" cy="0" r="12"/><circle class="f2-r3-dot" cx="${r2(xOf(11))}" cy="0" r="6"/></g>`;
      s += `<text class="f2-r3-lv" x="${r2(xOf(11) + 14)}" y="0"></text>`;
      plot.innerHTML = `<svg class="f2-svg f2-r3-svg" width="${W}" height="${PH}" viewBox="0 0 ${W} ${PH}" focusable="false">${s}</svg>`;
      // the strip, on the same week columns
      const SL = F.t(T.stripLines, n1(URL_), n1(AMR)), slines = wide ? SL : [n1(URL_), n1(AMR)];
      let t = '';
      [[80, 'f2-r3-gl'], [40, 'f2-r3-gl']].forEach(([v, c]) => { t += F.line(x0, SB - v + 0.5, x1, SB - v + 0.5, c) + F.text(28, SB - v + 4, F.num(v), 'f2-r3-ax', 'end'); });
      t += F.text(28, SB + 4, F.num(0), 'f2-r3-ax', 'end');
      t += F.line(x0, SB - AMR, x1, SB - AMR, 'f2-r3-amr') + F.line(x0, SB - URL_, x1, SB - URL_, 'f2-r3-lim');
      t += F.text(lx, SB - URL_ + 4, slines[0], 'f2-r3-ax') + F.text(lx, SB - AMR + 4, slines[1], 'f2-r3-ax');
      t += MR.map((v, i) => `<path class="f2-r3-mr" d=""/>`).join('') + `<path class="f2-r3-mr f2-r3-mrl" d=""/>`;
      t += F.line(x0, SB + 0.5, x1, SB + 0.5, 'f2-r3-base');
      t += `<text class="f2-r3-mv" x="${r2(xOf(11) + 10)}" y="0"></text>`;
      sp.innerHTML = `<svg class="f2-svg f2-r3-ssvg" width="${W}" height="${SH - 24}" viewBox="0 24 ${W} ${SH - 24}" focusable="false">${t}</svg>`;
      const svg = plot.firstChild, q = (sel, el = svg) => [...el.querySelectorAll(sel)];
      const pts = WEEKS.map((v, i) => [xOf(i), yOf(v)]);
      R = {
        W, xOf, svg, pts, frame: svg.querySelector('.f2-r3-frame'), line: svg.querySelector('.f2-r3-line'), dots: q('.f2-r3-pt'), pv: svg.querySelector('.f2-r3-pv'),
        h: svg.querySelector('.f2-r3-h'), ring: svg.querySelector('.f2-r3-ring'), dot: svg.querySelector('.f2-r3-dot'), lv: svg.querySelector('.f2-r3-lv'),
        ssvg: sp.firstChild, bars: q('.f2-r3-mr', sp.firstChild), mv: sp.firstChild.querySelector('.f2-r3-mv'),
      };
      // lengths along the line, for the entrance (stroke-dashoffset) and to start each point as the line reaches it
      const all = [...pts, [xOf(11), yOf(shown)]];
      let acc = 0;
      const cum = all.map((p, i) => (i ? (acc += Math.hypot(p[0] - all[i - 1][0], p[1] - all[i - 1][1])) : 0));
      R.len = acc;
      R.ti = cum.map((c) => 200 + 600 * easeInv(c / acc)); // when the drawing line reaches each point
      wireHandle();
      paint();
      paintStrip();
    };

    /* ---------- drawing ---------- */
    let shown = st.v; // the latest value as drawn (tweens after keys and clicks)
    let clock = 0; // the entrance clock in ms; null once entered
    const outside = (v) => v > UCL || v < LCL;
    const paint = () => {
      if (!R) return;
      const k = clock, v = shown, vr = Math.round(v), xl = R.xOf(11), yl = yOf(v);
      R.line.setAttribute('points', [...R.pts, [xl, yl]].map((p) => `${r2(p[0])},${r2(p[1])}`).join(' '));
      let p = 1;
      if (k != null) {
        R.frame.setAttribute('opacity', r2(EASE(clamp(k / 200, 0, 1))));
        p = EASE(clamp((k - 200) / 600, 0, 1));
        R.line.setAttribute('stroke-dasharray', `${r2(R.len)} ${r2(R.len)}`);
        R.line.setAttribute('stroke-dashoffset', r2(R.len * (1 - p)));
      } else {
        R.frame.removeAttribute('opacity');
        R.line.removeAttribute('stroke-dasharray');
        R.line.removeAttribute('stroke-dashoffset');
      }
      // each point grows from 0 over 150 ms once the line reaches it; the latest value fades in last
      const grow = (i) => (k == null ? 1 : EASE(clamp((k - R.ti[i]) / 150, 0, 1)));
      R.dots.forEach((d, i) => d.setAttribute('r', r2(3.5 * grow(i))));
      R.dot.setAttribute('cy', r2(yl)); R.dot.setAttribute('r', r2(6 * grow(11)));
      R.ring.setAttribute('cy', r2(yl));
      R.h.classList.toggle('is-out', outside(vr));
      R.h.setAttribute('aria-valuenow', String(st.v));
      R.h.setAttribute('aria-valuetext', F.t(T.signups, F.num(st.v)));
      R.lv.setAttribute('y', r2(yl + 5));
      R.lv.textContent = F.num(vr);
      R.lv.setAttribute('opacity', k == null ? 1 : r2(EASE(clamp((k - R.ti[11] - 150) / 200, 0, 1))));
      // the week pointed at prints its value above it
      if (st.pt >= 0 && st.pt < 11) {
        R.pv.setAttribute('x', r2(R.pts[st.pt][0])); R.pv.setAttribute('y', r2(R.pts[st.pt][1] - 10));
        R.pv.textContent = F.num(WEEKS[st.pt]);
        R.pv.classList.add('on');
        R.dots.forEach((d, i) => d.classList.toggle('is-pt', i === st.pt));
      } else { R.pv.classList.remove('on'); R.dots.forEach((d) => d.classList.remove('is-pt')); }
      // the working panel, live
      wv.textContent = F.num(vr);
      wd.textContent = F.signed(vr - AVG, 1);
      wk.textContent = F.signed((vr - AVG) / AMR, 2);
      wr.textContent = F.num(Math.abs(vr - LAST));
      paintStrip();
    };
    // The strip: one bar per week from week 2, the latest live; bars grow from the base when it opens.
    let stripK = 0; // the strip's bar clock, 0…1 = 0…500 ms: bar i grows from 20·i ms over 300 ms
    const barK = (i) => EASE(clamp((500 * stripK - 20 * i) / 300, 0, 1));
    const paintStrip = () => {
      if (!R) return;
      const vr = Math.round(shown), all = [...MR, Math.abs(vr - LAST)];
      R.bars.forEach((b, i) => {
        const h = all[i] * barK(i), x = R.xOf(i + 1) - 5, top = SB - h, c = Math.min(2, h);
        b.setAttribute('d', h <= 0 ? 'M0 0' : `M${r2(x)} ${SB}V${r2(top + c)}Q${r2(x)} ${r2(top)} ${r2(x + c)} ${r2(top)}H${r2(x + 10 - c)}Q${r2(x + 10)} ${r2(top)} ${r2(x + 10)} ${r2(top + c)}V${SB}Z`);
      });
      const last = all[all.length - 1], kl = barK(all.length - 1);
      R.bars[R.bars.length - 1].classList.toggle('is-out', last > URL_);
      R.mv.setAttribute('y', r2(SB - last * kl + 2));
      R.mv.textContent = F.num(last);
      R.mv.setAttribute('opacity', r2(kl));
    };

    const write = () => {
      const v = st.v, V = F.num(v), u = n1(UCL), l = n1(LCL);
      let lead, rest;
      if (v > UCL) { lead = F.t(T.above, V, u); rest = F.t(T.signal); }
      else if (v < LCL) { lead = F.t(T.below, V, l); rest = F.t(T.signal); }
      else { lead = v > HIGH ? F.t(T.high, V) : v < LOW ? F.t(T.low, V) : F.t(T.inside, V, l, u); rest = F.t(T.routine); }
      F.status(root, `<b>${F.esc(F.fr(lead))}</b> ${F.esc(F.fr(rest))}`);
    };

    /* ---------- changes ---------- */
    let cancelTween = null, cancelEntry = null, cancelStrip = null;
    const settle = () => { if (clock === null) return; if (cancelEntry) cancelEntry(); clock = null; };
    const setValue = (v, instant) => {
      settle();
      v = clamp(Math.round(v), LO, HI);
      if (v === st.v && !instant) return;
      st.v = v;
      write();
      if (cancelTween) cancelTween();
      cancelTween = null;
      if (instant || F.reduce) { shown = v; paint(); return; }
      cancelTween = F.tween(shown, v, 250, (x) => { shown = x; paint(); }, EASE);
    };

    // The latest week: drag it along its track (a press away from the point moves it there with a tween), or keys.
    const wireHandle = () => {
      const h = R.h;
      // touch-action does not reach SVG marks in every browser: a touch that starts on the handle must not scroll
      h.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      F.drag(h, () => R && R.svg, {
        start: (p) => { settle(); point(-1); if (Math.abs(p.y - yOf(shown)) > 10) setValue(LO + ((Y0 + YH - p.y) / YH) * (HI - LO), false); },
        move: (p) => setValue(LO + ((Y0 + YH - p.y) / YH) * (HI - LO), true),
      });
      F.keys(h, (dx, dy, big) => setValue(st.v + (dy ? -dy : dx) * (big ? 10 : 1), false));
      h.addEventListener('keydown', (e) => {
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setValue(e.key === 'Home' ? HI : LO, false); }
        else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); setValue(st.v + (e.key === 'PageUp' ? 10 : -10), false); }
      });
    };

    // The earlier weeks: point at one (hover, tap, or the arrow keys on the focused chart) to print its value.
    const point = (i) => { if (i === st.pt) return; st.pt = i; paint(); srEl.textContent = i >= 0 ? F.fr(F.t(T.weekRead, i + 1, F.num(WEEKS[i]))) : ''; };
    const weekAt = (e) => {
      if (!R) return -1;
      const r = R.svg.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (y < 0 || y > PH) return -1;
      let best = -1, bd = Infinity;
      for (let i = 0; i < 12; i++) { const d = Math.abs(R.xOf(i) - x); if (d < bd) { bd = d; best = i; } }
      return best < 11 && bd < 24 ? best : -1;
    };
    plot.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' && !document.documentElement.classList.contains('f2-dragging')) point(weekAt(e)); });
    plot.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !(document.activeElement === plot && plot.matches(':focus-visible'))) point(-1); });
    plot.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !e.target.closest('.f2-r3-h')) { const i = weekAt(e); point(i === st.pt ? -1 : i); } });
    plot.addEventListener('keydown', (e) => {
      if (e.target !== plot) return;
      const m = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (m) { e.preventDefault(); point(st.pt < 0 ? (m > 0 ? 0 : 10) : clamp(st.pt + m, 0, 10)); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); point(e.key === 'Home' ? 0 : 10); }
      else if (e.key === 'Escape' && st.pt >= 0) { e.preventDefault(); point(-1); }
    });
    plot.addEventListener('focus', () => { if (st.pt < 0 && plot.matches(':focus-visible')) point(0); });
    plot.addEventListener('blur', () => point(-1));

    // The moving-range strip: its height opens over 300 ms (CSS), then the bars grow from the base, 20 ms apart.
    // Closing reverses: the bars sink, then the height closes (CSS delays it).
    const openStrip = (on) => {
      settle();
      st.mr = on;
      sheetEl.classList.toggle('is-strip', on);
      stripW.setAttribute('aria-hidden', String(!on));
      if (cancelStrip) cancelStrip();
      cancelStrip = null;
      if (F.reduce) { stripK = on ? 1 : 0; paintStrip(); return; }
      const from = stripK;
      if (on) {
        const id = setTimeout(() => { cancelStrip = F.tween(from, 1, 500 * (1 - from), (x) => { stripK = x; paintStrip(); }, F.ease.lin); }, 300);
        cancelStrip = () => clearTimeout(id);
      } else cancelStrip = F.tween(from, 0, 200 * from, (x) => { stripK = x; paintStrip(); }, F.ease.lin);
    };
    F.bind(root, { sw: { mr: (on) => openStrip(on) } });

    /* ---------- start ---------- */
    write();
    build();
    F.onResize(plot, () => build());
    F.enter(root, (still) => {
      if (clock === null) return;
      if (still) { clock = null; paint(); return; }
      const total = 200 + 600 + 150 + 200;
      cancelEntry = F.tween(0, total, total, (ms) => { clock = ms; paint(); if (ms >= total) clock = null; }, F.ease.lin);
    });
  });
})();
