/* Rule 4 · A balance that must hold (stage demo-bridge).
   Paper: "Fig · 4 · Identity" (6UI-0) and its interacting state (73L-0); spec figspec/r4.json.
   One illustrative month of cash: opening + receipts − payments = closing, drawn as two stacked columns on one scale
   (left: opening + receipts; right: payments + closing), so the two sides always end level. Drag the top of the
   opening, the top of the left column or the top of the payments (or use the ledger sliders): the other side and the
   closing follow. When payments pass the left side, their excess turns ink, the account is overdrawn and the scale
   reaches below zero. A switch sets a plain waterfall of the same month beside the columns, on the same scale. */
(() => {
  'use strict';

  /* ---------- the model ---------- */
  const TERMS = { o: [0, 200], r: [0, 400], p: [0, 600] };
  const START = { o: 120, r: 340, p: 310 };
  const MAX = 600, PT = 32, PH = 300; // the plot: 600 at y 32, the domain's minimum at y 332
  const TICKS = [600, 400, 200, 0, -200, -400, -600];
  const WF_MS = 300 + 3 * 120 + 300 + 150; // slide, four steps 120 ms apart (300 ms each), then the connectors

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
  const r2 = (v) => Math.round(v * 100) / 100;
  const minOf = (s) => { const c = s.o + s.r - s.p; return c < 0 ? Math.floor(c / 100) * 100 : 0; };

  /* ---------- words ---------- */
  const T = {
    title: { en: 'A balance that must hold', fr: 'Un équilibre qui doit tenir' },
    hint: { en: 'illustrative cash for one month, $K', fr: 'la trésorerie d’un mois, à titre d’exemple, en k$' },
    sw: { en: 'Compare with a waterfall', fr: 'Comparer avec une cascade' },
    ledger: {
      en: { o: 'Opening balance', r: '+ Receipts', p: '− Payments', c: '= Closing balance' },
      fr: { o: 'Solde d’ouverture', r: '+ Encaissements', p: '− Décaissements', c: '= Solde de clôture' },
    },
    seg: {
      en: { o: 'Opening', r: 'Receipts', p: 'Payments', c: 'Closing', x: 'Overdrawn' },
      fr: { o: 'Ouverture', r: 'Encaissements', p: 'Décaissements', c: 'Clôture', x: 'Découvert' },
    },
    under: { en: ['Opening + receipts', 'Payments + closing'], fr: ['Ouverture + encaissements', 'Décaissements + clôture'] },
    tCols: { en: 'Two sides on one scale', fr: 'Deux côtés sur une même échelle' },
    tWf: { en: 'The same month as a waterfall', fr: 'Le même mois en cascade' },
    each: { en: (t) => `${t} on each side`, fr: (t) => `${t} de chaque côté` },
    inOut: { en: (a, b) => `${a} in, ${b} out`, fr: (a, b) => `${a} en entrée, ${b} en sortie` },
    aria: {
      en: 'Cash for one month: opening plus receipts against payments plus closing, on one scale',
      fr: 'La trésorerie d’un mois : ouverture plus encaissements face à décaissements plus clôture, sur une même échelle',
    },
    wfAria: { en: 'The same month as a waterfall, on the same scale', fr: 'Le même mois en cascade, sur la même échelle' },
    handle: { en: (t) => `${t}, drag to change`, fr: (t) => `${t}, faites glisser pour changer` },
    lead: { en: (o, r, p, c) => `${o} + ${r} − ${p} = ${c}.`, fr: (o, r, p, c) => `${o} + ${r} − ${p} = ${c}.` },
    pos: {
      en: (t) => `Both sides end level at ${t}; the closing balance is whatever the payments leave.`,
      fr: (t) => `Les deux côtés finissent au même niveau, à ${t} ; le solde de clôture est ce que laissent les décaissements.`,
    },
    zero: {
      en: 'The payments take all of the left side: the month closes with nothing.',
      fr: 'Les décaissements prennent tout le côté gauche : le mois se clôt sur rien.',
    },
    neg: {
      en: (x) => `The right side now rises ${x} above the left: the account is overdrawn.`,
      fr: (x) => `Le côté droit dépasse maintenant le gauche de ${x} : le compte est à découvert.`,
    },
  };

  FIG.register('demo-bridge', (root, F) => {
    const st = { ...START, wf: false, pt: null };
    const closing = (s = st) => s.o + s.r - s.p;
    const N = (x) => F.num(Math.round(x) + 0); // never prints −0 while a value tweens through zero
    const SEG = F.t(T.seg), LED = F.t(T.ledger);

    /* ---------- markup ---------- */
    const lrow = (k) => `<div class="f2-r4-lrow" data-term="${k}">${F.slider(k, { min: TERMS[k][0], max: TERMS[k][1], step: 1, value: st[k], label: LED[k], aria: LED[k].replace(/^[+−=]\s*/, ''), out: F.num(st[k]) })}</div>`;
    const ledger = `<div class="f2-r4-terms">${lrow('o')}${lrow('r')}${lrow('p')}</div>
      <div class="f2-r4-total" data-term="c"><span>${LED.c}</span><b class="f2-r4-cv"></b></div>`;
    root.innerHTML = F.sheet({
      cls: 'f2-r4',
      title: F.t(T.title),
      hint: F.t(T.hint),
      controls: F.toggle('wf', F.t(T.sw), false),
      body: `<div class="f2-r4-grid">${F.field(ledger, 'f2-r4-led')}${F.field(`<div class="f2-r4-plot" role="group" aria-label="${F.esc(F.fr(F.t(T.aria)))}"></div><div class="f2-r4-wfw" aria-hidden="true"><div class="f2-r4-wfi"><div class="f2-r4-wfp" role="img" aria-label="${F.esc(F.fr(F.t(T.wfAria)))}"></div></div></div>`, 'f2-r4-plotf')}</div>`,
    });
    const $ = (s) => root.querySelector(s);
    const sheetEl = $('.f2-r4'), plot = $('.f2-r4-plot'), wfp = $('.f2-r4-wfp'), wfw = $('.f2-r4-wfw'), cv = $('.f2-r4-cv');
    const ranges = { o: $('[data-sl="o"] .f2-range'), r: $('[data-sl="r"] .f2-range'), p: $('[data-sl="p"] .f2-range') };
    const outs = { o: $('[data-sl="o"] output'), r: $('[data-sl="r"] output'), p: $('[data-sl="p"] output') };

    /* ---------- layout, per width ---------- */
    // Wide (≥ 560 px): the pair is centred, or sits at x 64 with the waterfall to the right of a divider (Paper: 372).
    // Narrow: the pair sits at x 64 and the waterfall opens in a second block underneath.
    const lay = (W) => {
      const wide = W >= 560;
      const cw = W >= 680 ? 112 : wide ? 96 : clamp(Math.round((W - 40 - 8 - 24 - 96) / 2), 56, 112);
      const pairW = 2 * cw + 8, offL = wide ? Math.round((40 + W) / 2 - pairW / 2) : 64, onL = 64;
      const D = onL + pairW + 76;
      const wfL = wide ? D + 24 : 64, wfR = wide ? W - 26 : W - 16;
      const wcw = wfR - wfL >= 270 ? 48 : 40, wstep = (wfR - wfL - wcw) / 3;
      return { W, wide, cw, pairW, offL, onL, D, wfL, wfR, wcw, wstep, names: cw >= 96 };
    };

    let R = null;
    const grid = (W) => TICKS.map((v) => `<g class="f2-r4-tk${v === 0 ? ' is-base' : ''}" data-v="${v}">${F.line(40, 0, W, 0, v === 0 ? 'f2-r4-base' : 'f2-r4-gl')}${F.text(28, 4, F.num(v), 'f2-r4-ax', 'end')}</g>`).join('');
    const wfMarkup = () => ['o', 'r', 'p', 'c'].map((k) => `<g class="f2-r4-step" data-term="${k}"><rect class="f2-r4-s f2-r4-s-${k}" rx="2"/><text class="f2-r4-sv" text-anchor="middle"></text><text class="f2-r4-sn f2-r4-ax" text-anchor="middle">${SEG[k]}</text></g>`).join('')
      + [0, 1, 2].map(() => '<line class="f2-r4-con"/>').join('');
    const segLabel = (k) => `<g class="f2-r4-lab f2-r4-lab-${k}" data-term="${k === 'x' ? 'p' : k}"><text class="f2-r4-ln" text-anchor="middle">${SEG[k]}</text><text class="f2-r4-lv" text-anchor="middle"></text></g>`;
    const handle = (k) => `<g class="f2-handle f2-r4-h" data-k="${k}" data-term="${k}" tabindex="0" role="slider" aria-orientation="vertical" aria-label="${F.esc(F.t(T.handle, SEG[k]))}" aria-valuemin="${TERMS[k][0]}" aria-valuemax="${TERMS[k][1]}">
      <rect class="f2-r4-hit"/><circle class="f2-r4-ring" r="14.25"/><circle class="f2-r4-knob" r="8.25"/><text class="f2-r4-hv" text-anchor="middle"></text></g>`;
    const build = () => {
      const W = Math.max(260, Math.round(plot.clientWidth)), L = lay(W);
      sheetEl.classList.toggle('is-narrow', !L.wide);
      let s = `<g class="f2-r4-frame">${grid(W)}</g>`;
      s += `<g class="f2-r4-on"><line class="f2-r4-div" x1="${L.D + 0.5}" y1="0" x2="${L.D + 0.5}" y2="356"/>
        ${F.text(L.onL + L.pairW / 2, 12, F.t(T.tCols), 'f2-r4-tt', 'middle')}${F.text((L.wfL + L.wfR) / 2, 12, F.t(T.tWf), 'f2-r4-tt', 'middle')}</g>`;
      s += `<g class="f2-r4-cols">
        <rect class="f2-r4-seg f2-r4-o" data-term="o" rx="2"/><rect class="f2-r4-seg f2-r4-r" data-term="r" rx="2"/>
        <rect class="f2-r4-seg f2-r4-p" data-term="p" rx="2"/><rect class="f2-r4-seg f2-r4-c" data-term="c" rx="2"/><rect class="f2-r4-seg f2-r4-x" data-term="p" rx="2"/>
        ${['o', 'r', 'p', 'c', 'x'].map(segLabel).join('')}
        <line class="f2-r4-bal"/><text class="f2-r4-bl" text-anchor="middle"></text>
        <text class="f2-r4-ul f2-r4-ax" text-anchor="middle"></text><text class="f2-r4-ur f2-r4-ax" text-anchor="middle"></text></g>`;
      if (L.wide) s += `<g class="f2-r4-wf">${wfMarkup()}</g>`;
      s += handle('o') + handle('p') + handle('r');
      plot.innerHTML = `<svg class="f2-svg f2-r4-svg" width="${W}" height="360" viewBox="0 0 ${W} 360" focusable="false">${s}</svg>`;
      wfp.innerHTML = L.wide ? '' : `<svg class="f2-svg f2-r4-svg2" width="${W}" height="360" viewBox="0 0 ${W} 360" focusable="false"><g class="f2-r4-frame">${grid(W)}</g><g class="f2-r4-wf">${wfMarkup()}</g></svg>`;
      const svg = plot.firstChild, svg2 = wfp.firstChild, q1 = (sel) => svg.querySelector(sel);
      const wfRoot = L.wide ? svg : svg2;
      R = {
        L, svg, svg2, H: 360,
        ticks: [...svg.querySelectorAll('.f2-r4-tk'), ...(svg2 ? svg2.querySelectorAll('.f2-r4-tk') : [])],
        on: q1('.f2-r4-on'), seg: Object.fromEntries(['o', 'r', 'p', 'c', 'x'].map((k) => [k, q1(`.f2-r4-${k}`)])),
        lab: Object.fromEntries(['o', 'r', 'p', 'c', 'x'].map((k) => { const g = q1(`.f2-r4-lab-${k}`); return [k, { g, n: g.firstChild, v: g.lastChild }]; })),
        bal: q1('.f2-r4-bal'), bl: q1('.f2-r4-bl'), ul: q1('.f2-r4-ul'), ur: q1('.f2-r4-ur'),
        steps: [...wfRoot.querySelectorAll('.f2-r4-step')].map((g) => ({ g, k: g.dataset.term, rect: g.querySelector('rect'), v: g.querySelector('.f2-r4-sv'), n: g.querySelector('.f2-r4-sn') })),
        cons: [...wfRoot.querySelectorAll('.f2-r4-con')], wf: wfRoot.querySelector('.f2-r4-wf'),
        h: Object.fromEntries([...svg.querySelectorAll('.f2-r4-h')].map((g) => [g.dataset.k, { g, hit: g.querySelector('.f2-r4-hit'), ring: g.querySelector('.f2-r4-ring'), knob: g.querySelector('.f2-r4-knob'), v: g.querySelector('.f2-r4-hv') }])),
      };
      // Labels that do not fit their slot go on two lines (French), or alternate rows (waterfall steps).
      const U = F.t(T.under), pitch = L.cw + 8;
      [[R.ul, U[0]], [R.ur, U[1]]].forEach(([el, txt]) => {
        el.textContent = txt;
        let w = 0; try { w = el.getComputedTextLength(); } catch (e) { w = 0; }
        if (w > pitch - 6) { const [a, b] = txt.split(' + '); el.innerHTML = `<tspan x="0" dy="0">${F.esc(a)} +</tspan><tspan x="0" dy="16">${F.esc(b)}</tspan>`; el.dataset.two = '1'; }
      });
      let ws = []; try { ws = R.steps.map((st_) => st_.n.getComputedTextLength()); } catch (e) { ws = []; }
      R.stagger = ws.length === 4 && ws.some((w, i) => i < 3 && (w + ws[i + 1]) / 2 + 6 > L.wstep);
      const tall = R.stagger || R.ul.dataset.two;
      if (tall) { R.H = 376; [svg, svg2].forEach((el) => { if (el) { el.setAttribute('height', 376); el.setAttribute('viewBox', `0 0 ${W} 376`); } }); }
      wireHandles();
      wirePoint();
      paint();
    };

    /* ---------- drawing ---------- */
    let shown = { o: st.o, r: st.r, p: st.p, min: 0 }; // what is drawn now (tweens)
    let clock = 0; // the entrance clock in ms; null once entered
    let wfMs = 0; // the waterfall clock in ms (0 = off, WF_MS = fully on)
    const paint = () => {
      if (!R) return;
      const L = R.L, k = clock, v = shown, sc = PH / (MAX - v.min), y = (x) => PT + (MAX - x) * sc;
      // the scale: ticks at 600 … −600 that the domain reaches
      R.ticks.forEach((g) => { const t = Number(g.dataset.v), on = t >= v.min - 0.5; g.setAttribute('transform', `translate(0 ${r2(y(t) + 0.5)})`); g.style.display = on ? '' : 'none'; });
      // the entrance: opening, receipts, payments, closing grow 120 ms apart (240 ms each); the balance line last
      const g = (i) => (k == null ? 1 : EASE(clamp((k - 120 * i) / 240, 0, 1)));
      const gl = k == null ? 1 : EASE(clamp((k - 600) / 200, 0, 1));
      // the waterfall clock: the pair slides 300 ms, then the steps grow 120 ms apart, then the connectors
      const slide = L.wide ? EASE(clamp(wfMs / 300, 0, 1)) : 0;
      // (narrow plots wait the same 300 ms while the waterfall's block opens)
      const sg = (i) => EASE(clamp((wfMs - 300 - 120 * i) / 300, 0, 1)), gc = clamp((wfMs - 960) / 150, 0, 1);
      R.on.setAttribute('opacity', r2(slide));
      R.on.style.display = L.wide && wfMs > 0 ? '' : 'none';
      const x0 = L.offL + (L.onL - L.offL) * slide, x1 = x0 + L.cw + 8, cw = L.cw;
      const o = v.o * g(0), r = v.r * g(1), p = v.p * g(2), left = o + r, c = v.o + v.r - v.p;
      // left column: opening from 0, receipts above it (2 px gap)
      const box = (el, x, lo, hi, gapBelow) => {
        const top = y(hi), bot = y(lo) - (gapBelow ? 2 : 0), h = bot - top;
        if (h <= 0.2 || hi - lo <= 0) { el.setAttribute('height', 0); el.setAttribute('width', 0); return 0; }
        el.setAttribute('x', r2(x)); el.setAttribute('y', r2(top)); el.setAttribute('width', cw); el.setAttribute('height', r2(h)); return h;
      };
      const hO = box(R.seg.o, x0, 0, o, false), hR = box(R.seg.r, x0, o, left, o > 0);
      // right column: payments from 0; the closing above them, or, when payments pass the left top, their excess in ink
      let hP, hC = 0, hX = 0;
      if (c >= 0) { hP = box(R.seg.p, x1, 0, p, false); hC = box(R.seg.c, x1, p, p + c * g(3), p > 0); box(R.seg.x, x1, 0, 0); }
      else { const lt = v.o + v.r; hP = box(R.seg.p, x1, 0, Math.min(p, lt), false); hX = box(R.seg.x, x1, lt, Math.max(lt, p), lt > 0 && p > lt); box(R.seg.c, x1, 0, 0); }
      // labels: inside (two lines) when the segment is 40 px or taller, beside the column when shorter
      const place = (key, x, lo, hi, h, side, val) => {
        const lb = R.lab[key];
        if (h <= 0) { lb.g.style.display = 'none'; return; }
        lb.g.style.display = '';
        lb.v.textContent = N(val);
        const mid = (y(lo) + y(hi)) / 2, inside = h >= 40, roomL = x - 40;
        let tx = x + cw / 2, anchor = 'middle', cls = 'in';
        if (!inside) {
          if (side === 'r') { tx = x + cw + 12; anchor = 'start'; cls = 'out'; }
          else if (roomL >= 76) { tx = x - 12; anchor = 'end'; cls = 'out'; }
          else if (h >= 16) cls = 'in1';
          else { lb.g.style.display = 'none'; return; }
        }
        const two = cls !== 'in1' && (cls === 'out' || L.names);
        lb.n.style.display = two ? '' : 'none';
        [lb.n, lb.v].forEach((t) => { t.setAttribute('x', r2(tx)); t.setAttribute('text-anchor', anchor); });
        if (two) { lb.n.setAttribute('y', r2(mid - 6)); lb.v.setAttribute('y', r2(mid + 13)); } else lb.v.setAttribute('y', r2(mid + 5));
        lb.g.setAttribute('class', `f2-r4-lab f2-r4-lab-${key} is-${cls}`);
      };
      place('o', x0, 0, o, hO, 'l', v.o);
      place('r', x0, o, left, hR, 'l', v.r);
      if (c >= 0) { place('p', x1, 0, p, hP, 'r', v.p); place('c', x1, p, p + c * g(3), hC, 'r', c); place('x', x1, 0, 0, 0, 'r', 0); }
      else { place('p', x1, 0, Math.min(p, v.o + v.r), hP, 'r', v.p); place('x', x1, v.o + v.r, p, hX, 'r', -c); place('c', x1, 0, 0, 0, 'r', 0); R.lab.x.g.setAttribute('class', 'f2-r4-lab f2-r4-lab-x is-out'); }
      if (c < 0 && hX > 0) { const lx = R.lab.x; [lx.n, lx.v].forEach((t) => { t.setAttribute('x', r2(x1 + cw + 12)); t.setAttribute('text-anchor', 'start'); }); lx.n.style.display = ''; const mid = (y(v.o + v.r) + y(p)) / 2; lx.n.setAttribute('y', r2(mid - 6)); lx.v.setAttribute('y', r2(mid + 13)); }
      // the balance line across both tops, its label 24 px above
      const yb = y(left) + 0.5, bx0 = x0 - 12, bx1 = x0 + L.pairW + 12;
      R.bal.setAttribute('x1', r2(bx0)); R.bal.setAttribute('x2', r2(bx0 + (bx1 - bx0) * gl)); R.bal.setAttribute('y1', r2(yb)); R.bal.setAttribute('y2', r2(yb));
      R.bal.style.display = left > 0 ? '' : 'none';
      R.bl.textContent = c < 0 ? F.t(T.inOut, F.num(v.o + v.r), F.num(v.p)) : F.t(T.each, F.num(v.o + v.r));
      // overdrawn, the label sits over the left column; when wider than it, it ends just before the right column
      let bw = 0; try { bw = R.bl.getComputedTextLength(); } catch (e) { bw = 0; }
      if (c < 0 && bw > cw + 4) { R.bl.setAttribute('text-anchor', 'end'); R.bl.setAttribute('x', r2(x1 - 8)); }
      else { R.bl.setAttribute('text-anchor', 'middle'); R.bl.setAttribute('x', r2(c < 0 ? x0 + cw / 2 : x0 + L.pairW / 2)); }
      R.bl.setAttribute('y', r2(yb - 12.5));
      R.bl.setAttribute('opacity', r2(gl));
      // the names of the two sides, under the plot
      const uy = PT + PH + 8 + 12;
      [[R.ul, x0 + cw / 2], [R.ur, x1 + cw / 2]].forEach(([el, x]) => { el.setAttribute('x', r2(x)); el.setAttribute('y', r2(uy)); el.querySelectorAll('tspan').forEach((t) => t.setAttribute('x', r2(x))); });
      // the waterfall: Opening 0→o, Receipts o→o+r, Payments (o+r)→c, Closing 0→c; connectors at each running total
      const xs = (i) => L.wfL + i * L.wstep, runs = [[0, v.o], [v.o, v.o + v.r], [v.o + v.r, c], [0, c]];
      R.wf.style.display = wfMs > 0 ? '' : 'none';
      R.steps.forEach((s, i) => {
        const [a, b] = runs[i], gi = sg(i), e = a + (b - a) * gi, top = y(Math.max(a, e)), bot = y(Math.min(a, e)), x = xs(i);
        s.rect.setAttribute('x', r2(x)); s.rect.setAttribute('width', L.wcw); s.rect.setAttribute('y', r2(top)); s.rect.setAttribute('height', r2(Math.max(0, bot - top)));
        s.v.textContent = i === 0 ? N(v.o) : i === 1 ? F.signed(Math.round(v.r)) : i === 2 ? N(-v.p) : N(c);
        const below = i === 3 && c < 0;
        s.v.setAttribute('x', r2(x + L.wcw / 2)); s.v.setAttribute('y', r2(below ? y(c) + 16 : y(Math.max(a, b)) - 8));
        s.v.setAttribute('opacity', r2(gi));
        s.v.classList.toggle('is-c', i === 3);
        s.n.setAttribute('x', r2(x + L.wcw / 2)); s.n.setAttribute('y', r2(uy + (R.stagger && i % 2 ? 16 : 0)));
      });
      R.cons.forEach((ln, i) => {
        const yv = i === 0 ? v.o : i === 1 ? v.o + v.r : c, yy = y(yv) + 0.5, a = xs(i) + L.wcw, b = xs(i + 1);
        ln.setAttribute('x1', r2(a)); ln.setAttribute('x2', r2(a + (b - a) * gc)); ln.setAttribute('y1', r2(yy)); ln.setAttribute('y2', r2(yy));
        ln.style.display = gc > 0 ? '' : 'none';
      });
      // the handles: on the top of the opening, the top of the left column and the top of the payments
      const hp = { o: [x0 + cw / 2, y(o)], r: [x0 + cw / 2, y(left)], p: [x1 + cw / 2, y(p)] };
      const yO = hp.o[1], yR = hp.r[1], split = Math.min(10, Math.max(0, (yO - yR) / 2));
      ['o', 'r', 'p'].forEach((key) => {
        const H = R.h[key], [hx, hy] = hp[key];
        H.ring.setAttribute('cx', r2(hx)); H.ring.setAttribute('cy', r2(hy));
        H.knob.setAttribute('cx', r2(hx)); H.knob.setAttribute('cy', r2(hy));
        H.v.setAttribute('x', r2(hx)); H.v.setAttribute('y', r2(hy - 22)); H.v.textContent = F.num(st[key]);
        const up = key === 'o' ? split : 10, down = key === 'r' ? split : 10;
        H.hit.setAttribute('x', r2(hx - cw / 2)); H.hit.setAttribute('width', cw);
        H.hit.setAttribute('y', r2(hy - up)); H.hit.setAttribute('height', r2(up + down));
        H.g.setAttribute('aria-valuenow', String(st[key]));
        H.g.setAttribute('aria-valuetext', `${SEG[key]} ${F.num(st[key])}`);
      });
      // while a value is printed above its handle, the balance label steps aside if the two would meet
      const act = ['o', 'r', 'p'].find((key) => R.h[key].g.classList.contains('is-dragging') || R.h[key].g.matches(':focus-visible'));
      ['o', 'r', 'p'].forEach((key) => R.h[key].g.classList.toggle('is-showing', key === act));
      let near = false;
      if (act) {
        try {
          const a = R.h[act].v.getBBox(), b = R.bl.getBBox();
          near = a.x < b.x + b.width + 4 && b.x < a.x + a.width + 4 && a.y < b.y + b.height + 2 && b.y < a.y + a.height + 2;
        } catch (e) { near = false; }
      }
      R.bl.classList.toggle('is-near', near);
      cv.textContent = N(c);
    };

    // Pointing at a term lights it in both forms and in the ledger; the rest fade to half.
    const lit = () => {
      const t = st.pt;
      sheetEl.classList.toggle('is-pt', !!t);
      root.querySelectorAll('[data-term]').forEach((el) => el.classList.toggle('is-lit', el.dataset.term === t || (t === 'c' && (el.classList.contains('f2-r4-x') || el.classList.contains('f2-r4-lab-x')))));
    };

    const write = () => {
      const c = closing();
      ['o', 'r', 'p'].forEach((k) => { outs[k].textContent = F.num(st[k]); ranges[k].value = st[k]; F.fillRange(ranges[k]); });
      const lead = F.t(T.lead, F.num(st.o), F.num(st.r), F.num(st.p), F.num(c));
      const rest = c > 0 ? F.t(T.pos, F.num(st.o + st.r)) : c === 0 ? F.t(T.zero) : F.t(T.neg, F.num(-c));
      F.status(root, `<b>${F.esc(F.fr(lead))}</b> ${F.esc(F.fr(rest))}`);
    };

    /* ---------- changes: a small multi-channel tween (terms 250 ms, the domain 300 ms) ---------- */
    const chans = {};
    let raf = 0;
    const frame = (now) => {
      let live = false;
      Object.keys(chans).forEach((key) => {
        const ch = chans[key];
        if (ch.t0 == null) ch.t0 = now;
        const q = Math.min(1, (now - ch.t0) / ch.ms);
        shown[key] = ch.from + (ch.to - ch.from) * EASE(q);
        if (q < 1) live = true; else delete chans[key];
      });
      paint();
      raf = live ? requestAnimationFrame(frame) : 0;
    };
    const to = (key, val, ms) => {
      if (F.reduce || !ms) { delete chans[key]; shown[key] = val; return; }
      chans[key] = { from: shown[key], to: val, ms, t0: null };
      if (!raf) raf = requestAnimationFrame(frame);
    };
    let cancelEntry = null;
    const settle = () => { if (clock === null) return; if (cancelEntry) cancelEntry(); clock = null; };
    const set = (key, val, instant) => {
      settle();
      val = clamp(Math.round(val), TERMS[key][0], TERMS[key][1]);
      if (val === st[key]) { paint(); return; }
      st[key] = val;
      write();
      to(key, val, instant ? 0 : 250);
      to('min', minOf(st), 300);
      paint();
    };

    // Ledger sliders: a drag follows, a click or a key tweens; Shift + arrows step by 10.
    let ptr = 0;
    Object.entries(ranges).forEach(([key, el]) => {
      el.addEventListener('pointerdown', () => { ptr = 1; });
      el.addEventListener('pointermove', (e) => { if (ptr && e.buttons) ptr = 2; });
      el.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
        if (!d || !e.shiftKey) return;
        e.preventDefault();
        set(key, st[key] + d * 10, false);
      });
    });
    const release = () => { ptr = 0; };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    // The waterfall: on, the pair slides left and the steps grow in order; off reverses (faster).
    let cancelWf = null;
    const waterfall = (on) => {
      settle();
      st.wf = on;
      sheetEl.classList.toggle('is-wf', on);
      wfw.setAttribute('aria-hidden', String(!on || (R && R.L.wide)));
      if (cancelWf) cancelWf();
      cancelWf = null;
      if (F.reduce) { wfMs = on ? WF_MS : 0; paint(); return; }
      const from = wfMs, target = on ? WF_MS : 0, ms = on ? (WF_MS - from) : from * 0.55;
      cancelWf = F.tween(from, target, Math.max(1, ms), (x) => { wfMs = x; paint(); }, F.ease.lin);
    };
    F.bind(root, {
      sl: Object.fromEntries(['o', 'r', 'p'].map((key) => [key, (val) => set(key, val, ptr === 2)])),
      sw: { wf: (on) => waterfall(on) },
    });

    // The handles: drag along the column, or the arrow keys (Shift for 10).
    const wireHandles = () => {
      Object.entries(R.h).forEach(([key, H]) => {
        H.g.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        const valueAt = (py) => { const sc = PH / (MAX - shown.min), v = MAX - (py - PT) / sc; return key === 'r' ? v - st.o : v; };
        F.drag(H.g, () => R && R.svg, {
          start: () => { settle(); point(key); paint(); },
          move: (pp) => set(key, valueAt(pp.y), true),
          end: () => { point(null); paint(); },
        });
        F.keys(H.g, (dx, dy, big) => set(key, st[key] + (dy ? -dy : dx) * (big ? 10 : 1), false));
        H.g.addEventListener('keydown', (e) => {
          if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); set(key, e.key === 'Home' ? TERMS[key][0] : TERMS[key][1], false); }
        });
        H.g.addEventListener('focus', () => { if (H.g.matches(':focus-visible')) point(key); paint(); });
        H.g.addEventListener('blur', () => { point(null); paint(); });
      });
    };

    // Pointing: a segment or a step (hover, tap) or a ledger row (hover, focus).
    const point = (t) => { if (t === st.pt) return; st.pt = t; lit(); };
    const wirePoint = () => {
      [R.svg, R.svg2].forEach((svg) => {
        if (!svg) return;
        svg.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch' || document.documentElement.classList.contains('f2-dragging')) return; const el = e.target.closest('[data-term]'); point(el ? el.dataset.term : null); });
        svg.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !document.documentElement.classList.contains('f2-dragging')) point(null); });
        svg.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch' || e.target.closest('.f2-r4-h')) return; const el = e.target.closest('[data-term]'); const t = el ? el.dataset.term : null; point(t === st.pt ? null : t); });
      });
    };
    root.querySelectorAll('.f2-r4-lrow, .f2-r4-total').forEach((row) => {
      row.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') point(row.dataset.term); });
      row.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !row.contains(document.activeElement)) point(null); });
      row.addEventListener('focusin', () => point(row.dataset.term));
      row.addEventListener('focusout', () => point(null));
    });

    /* ---------- start ---------- */
    write();
    build();
    F.onResize(plot, () => build());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (R) build(); });
    F.enter(root, (still) => {
      if (clock === null) return;
      if (still) { clock = null; paint(); return; }
      cancelEntry = F.tween(0, 800, 800, (ms) => { clock = ms; paint(); if (ms >= 800) clock = null; }, F.ease.lin);
    });
  });
})();
