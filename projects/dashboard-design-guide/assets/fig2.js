/* Figures, second edition: the shared core.
   Every figure is a file in this folder that calls FIG.register('stage-id', mount). The build concatenates core.js,
   the figure files in name order, and a final FIG.start(), into assets/fig2.js, which loads before the first edition's
   figures.js. A root drawn here is marked data-fig="v2" and the first edition skips it.

   A mount receives (root, api): root is the empty <div class="stage" id="…">, api is FIG. It draws the figure, binds
   its controls, and calls FIG.enter(root, fn) for its entrance. All words go through FIG.t({en, fr}); all numbers
   through FIG.num / FIG.pct / FIG.signed, so French gets a decimal comma, narrow spaces and a real minus. */
(function () {
  'use strict';
  const doc = document.documentElement;
  const lang = /^fr\b/i.test(doc.lang || '') ? 'fr' : 'en';
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const NN = ' ', NB = ' ';

  /* ---------- words and numbers ---------- */
  const t = (o, ...args) => {
    const v = o == null ? '' : typeof o === 'string' ? o : o[lang] != null ? o[lang] : o.en;
    return typeof v === 'function' ? v(...args) : v;
  };
  const fmts = {};
  const fmt = (d) => fmts[d] || (fmts[d] = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-CA', { minimumFractionDigits: d, maximumFractionDigits: d }));
  // Rounding is toFixed's, so English and French agree to the digit; the minus is a real minus.
  const num = (v, d = 0) => fmt(d).format(Number(Number(v).toFixed(d))).replace(/^-/, '−').replace(/ | /g, NN);
  const pct = (v, d = 0) => num(v, d) + (lang === 'fr' ? NN + '%' : '%');
  const signed = (v, d = 0) => (Number(Number(v).toFixed(d)) > 0 ? '+' : '') + num(v, d);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // French punctuation: a narrow no-break space before ; : ? ! and inside « ».
  const fr = (s) => (lang === 'fr' ? String(s).replace(/\s*([;:?!])/g, NN + '$1').replace(/«\s*/g, '«' + NN).replace(/\s*»/g, NN + '»') : s);

  /* ---------- SVG ---------- */
  const r1 = (v) => Math.round(v * 10) / 10;
  const attrs = (o) => (o ? Object.entries(o).filter(([, v]) => v != null && v !== false).map(([k, v]) => ` ${k}="${esc(v)}"`).join('') : '');
  const svg = (w, h, inner, o = {}) => `<svg class="f2-svg${o.cls ? ' ' + o.cls : ''}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="${o.role || 'img'}"${o.label ? ` aria-label="${esc(o.label)}"` : ''}${o.fluid ? ' style="width:100%;height:auto"' : ''}>${inner}</svg>`;
  const line = (x1, y1, x2, y2, cls, a) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"${cls ? ` class="${cls}"` : ''}${attrs(a)}/>`;
  const rect = (x, y, w, h, cls, rx = 0, a) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}"${rx ? ` rx="${rx}"` : ''}${cls ? ` class="${cls}"` : ''}${attrs(a)}/>`;
  const circle = (cx, cy, r, cls, a) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"${cls ? ` class="${cls}"` : ''}${attrs(a)}/>`;
  const path = (d, cls, a) => `<path d="${d}"${cls ? ` class="${cls}"` : ''}${attrs(a)}/>`;
  const text = (x, y, s, cls, anchor = 'start', a) => `<text x="${r1(x)}" y="${r1(y)}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}${cls ? ` class="${cls}"` : ''}${attrs(a)}>${s}</text>`;
  const poly = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + r1(p[0]) + ' ' + r1(p[1])).join('');
  // A hatch pattern for forecasts (slate on white), defined once per svg that uses it.
  const hatch = (id = 'f2-hatch', cls = 'f2-hatch-line') => `<defs><pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#FFFFFF"/><line x1="0" y1="0" x2="0" y2="6" class="${cls}"/></pattern></defs>`;

  // Linear scale with invert and clamp.
  const scale = (d0, d1, r0, r1_) => {
    const s = (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1_ - r0);
    s.invert = (p) => d0 + ((p - r0) / (r1_ - r0 || 1)) * (d1 - d0);
    s.clamp = (v) => Math.min(Math.max(v, Math.min(d0, d1)), Math.max(d0, d1));
    return s;
  };
  // Round ticks: 1, 2, 2.5 or 5 times a power of ten.
  const ticks = (lo, hi, n = 5) => {
    const raw = (hi - lo) / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toFixed(10)));
    return out;
  };

  /* ---------- motion ---------- */
  const ease = { out: (k) => 1 - Math.pow(1 - k, 3), inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), lin: (k) => k };
  // Tween a number or a flat object of numbers. Returns a cancel function. Instant under reduced motion.
  const tween = (from, to, ms, onUpdate, e = ease.out) => {
    const obj = typeof from === 'object';
    const at = (k) => (obj ? Object.fromEntries(Object.keys(to).map((key) => [key, from[key] + (to[key] - from[key]) * k])) : from + (to - from) * k);
    if (reduce || !ms) { onUpdate(to, 1); return () => {}; }
    let raf = 0, t0 = null, live = true;
    const step = (now) => {
      if (!live) return;
      if (t0 === null) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      onUpdate(at(e(k)), k);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { live = false; cancelAnimationFrame(raf); };
  };
  // Run fn once, when 30 % of el is in view (at once under reduced motion or without IntersectionObserver).
  const enter = (el, fn) => {
    if (reduce || !('IntersectionObserver' in window)) { fn(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(false); } }, { threshold: 0.3 });
    io.observe(el);
  };
  // Redraw on width changes (debounced to a frame); fn(width).
  const onResize = (el, fn) => {
    let w = el.clientWidth, raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const n = el.clientWidth; if (n && n !== w) { w = n; fn(n); } }); });
    ro.observe(el);
    return () => ro.disconnect();
  };

  /* ---------- controls (markup) ---------- */
  const seg = (name, options, current, label) => `<div class="f2-seg" role="radiogroup" aria-label="${esc(label || name)}" data-seg="${name}">${options.map(([v, l]) => `<button type="button" role="radio" data-v="${esc(v)}" aria-checked="${String(v) === String(current)}">${l}</button>`).join('')}</div>`;
  const toggle = (name, label, on) => `<button type="button" class="f2-switch" role="switch" data-sw="${name}" aria-checked="${!!on}"><i aria-hidden="true"></i><span>${label}</span></button>`;
  const slider = (name, o) => `<label class="f2-slider" data-sl="${name}"><span class="f2-sl-label">${o.label || ''}</span><input class="f2-range" type="range" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${o.value}" aria-label="${esc(o.aria || o.label || name)}"><output>${o.out != null ? o.out : o.value}</output></label>`;
  const button = (name, label) => `<button type="button" class="f2-btn" data-btn="${name}">${label}</button>`;
  // Paint the filled part of a range input (its value as a percentage, read by CSS).
  const fillRange = (input) => { const k = (input.value - input.min) / (input.max - input.min || 1); input.style.setProperty('--k', (k * 100).toFixed(2) + '%'); };

  // One delegated listener per root: handlers.seg[name](value), .sw[name](on), .sl[name](number, input), .btn[name]().
  const bind = (root, h = {}) => {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('.f2-seg [data-v]');
      if (b && h.seg) { const g = b.closest('[data-seg]'), n = g.dataset.seg; g.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-checked', String(x === b))); if (h.seg[n]) h.seg[n](b.dataset.v); return; }
      const s = e.target.closest('[data-sw]');
      if (s && h.sw) { const on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', String(on)); if (h.sw[s.dataset.sw]) h.sw[s.dataset.sw](on); return; }
      const k = e.target.closest('[data-btn]');
      if (k && h.btn && h.btn[k.dataset.btn]) h.btn[k.dataset.btn]();
    });
    root.addEventListener('keydown', (e) => {
      const b = e.target.closest('.f2-seg [data-v]');
      if (!b || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const all = [...b.closest('[data-seg]').querySelectorAll('[data-v]')], i = all.indexOf(b), d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
      const nx = all[(i + d + all.length) % all.length]; nx.focus(); nx.click();
    });
    root.addEventListener('input', (e) => {
      const r = e.target.closest('.f2-range'); if (!r) return;
      fillRange(r);
      const n = r.closest('[data-sl]').dataset.sl;
      if (h.sl && h.sl[n]) h.sl[n](Number(r.value), r);
    });
    root.querySelectorAll('.f2-range').forEach(fillRange);
  };

  /* ---------- direct manipulation ---------- */
  // Drag a mark: callbacks receive the pointer in the SVG's own coordinates. `svgOf` is the SVG element or a function
  // that returns the current one, so a figure may redraw while dragging. Moves are followed on the window, so the drag
  // survives the mark being replaced; still, prefer updating marks in place (setAttribute) during a drag.
  const drag = (target, svgOf, cb = {}) => {
    const cur = () => (typeof svgOf === 'function' ? svgOf() : svgOf);
    let last = null;
    const pt = (e) => {
      const s = cur(), m = s && s.isConnected && s.getScreenCTM();
      if (!m) return last || { x: 0, y: 0 };
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return (last = { x: p.x, y: p.y });
    };
    target.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    target.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      target.classList.add('is-dragging');
      document.documentElement.classList.add('f2-dragging');
      if (cb.start) cb.start(pt(e), e);
      const move = (ev) => { if (cb.move) cb.move(pt(ev), ev); };
      const up = (ev) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        target.classList.remove('is-dragging');
        document.documentElement.classList.remove('f2-dragging');
        if (cb.end) cb.end(pt(ev), ev);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  };
  // Put the focus back on a handle after a redraw replaced it (keyboard use keeps working).
  const refocus = (root, selector) => { const el = root.querySelector(selector); if (el && document.activeElement !== el) el.focus({ preventScroll: true }); };
  // Arrow keys on a focused handle: fn(dx, dy, big) with dx/dy in −1, 0, 1; Shift makes the step big.
  const keys = (el, fn) => el.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!m) return;
    e.preventDefault();
    fn(m[0], m[1], e.shiftKey);
  });

  /* ---------- the sheet ---------- */
  // { title, hint, controls, body, status } → the figure's sheet. body holds fields (FIG.field).
  const sheet = (o) => `<section class="f2-sheet${o.cls ? ' ' + o.cls : ''}"><header class="f2-head"><div class="f2-title"><h3>${o.title}</h3>${o.hint ? `<span class="f2-hint">${o.hint}</span>` : ''}</div>${o.controls ? `<div class="f2-ctl">${o.controls}</div>` : ''}</header><div class="f2-body">${o.body || ''}</div><p class="f2-status" aria-live="polite">${o.status || ''}</p></section>`;
  const field = (inner, cls = '', style = '') => `<div class="f2-field${cls ? ' ' + cls : ''}"${style ? ` style="${style}"` : ''}>${inner}</div>`;
  const status = (root, html) => { const s = root.querySelector('.f2-status'); if (s && s.innerHTML !== html) s.innerHTML = html; };

  /* ---------- registry ---------- */
  const reg = {};
  const failed = { en: 'This figure could not be drawn.', fr: 'Cette figure n’a pas pu être dessinée.' };
  const register = (id, mount) => { reg[id] = mount; };
  const start = () => {
    Object.keys(reg).forEach((id) => {
      const root = document.getElementById(id);
      if (!root || root.dataset.fig) return;
      root.dataset.fig = 'v2';
      root.classList.add('f2-root');
      try { reg[id](root, FIG); } catch (err) { root.innerHTML = `<p class="f2-status">${t(failed)}</p>`; console.error('fig2', id, err); }
    });
  };

  const FIG = { lang, reduce, NN, NB, t, num, pct, signed, esc, fr, svg, line, rect, circle, path, text, poly, hatch, scale, ticks, ease, tween, enter, onResize, seg, toggle, slider, button, fillRange, bind, drag, keys, refocus, sheet, field, status, register, start };
  window.FIG = FIG;
})();

/* Cover · One dashboard, twelve rules (stage #board), and the dashboard it draws (shared with f-tune.js).
   Paper: "Fig · 0 · One dashboard" (4TN-0), "· interacting" (6E6-0), "· phone" (6UJ-0), "· phone · interacting" (8KV-0);
   spec figspec/r0.json.
   The weekly review of an imaginary online shop, laid on the twelve-column grid, with the twelve rule keys above it.
   Point at a key (hover, focus, tap): the region that applies the rule is outlined (parts of fields for rules 3, 6, 9,
   10 and 11, the page's columns for rule 1), the rest dims, and the status states the rule. Point at a region: its keys
   light and the status names the rules it uses. Point at a week to read all three rows down one line; drag the staffing
   line on next week's forecast. Under 1080 px the keys become a scroller; under 640 px it sticks under the site header.
   FIG.coverDashboard(F, host, opts) draws the dashboard rows alone; the system chapter's tune figure uses rows A and B. */
(() => {
  'use strict';
  const NN = '\u202F', NB = '\u00A0';

  /* ---------- data: every number illustrative (figspec/r0.json "data") ---------- */
  const SIGN = [296, 312, 288, 305, 318, 290, 301, 322, 298, 309, 315, 412];
  const ORD = [1160, 1210, 1150, 1190, 1230, 1170, 1140, 1200, 1220, 1180, 1190, 1240];
  const REV = [81.2, 84.7, 80.5, 83.3, 86.1, 81.9, 79.8, 84.0, 85.4, 82.6, 83.3, 86.8];
  const PLAN = [83.5, 85.0, 86.5, 88.0, 89.5, 91.0, 92.5, 94.0, 95.5, 97.0, 98.5, 100.0];
  // Routine variation from weeks 1 to 11: the average plus or minus 2.66 times the average moving range.
  const routine = (v) => {
    const b = v.slice(0, 11), mean = b.reduce((s, x) => s + x, 0) / b.length;
    const mr = b.slice(1).map((x, i) => Math.abs(x - b[i])), mmr = mr.reduce((s, x) => s + x, 0) / mr.length;
    return { mean, hi: mean + 2.66 * mmr, lo: mean - 2.66 * mmr };
  };
  const ROWS = [
    { id: 'signups', v: SIGN, d: 0, dom: [250, 420], r: routine(SIGN) },
    { id: 'orders', v: ORD, d: 0, dom: [1050, 1320], r: routine(ORD) },
    { id: 'revenue', v: REV, d: 1, dom: [0, 110], plan: PLAN },
  ];
  const KPIS = [
    { id: 'orders', v: 1240, d: 0, max: 1500, cmp: 1430, kind: 'plan' },
    { id: 'revenue', v: 86.8, d: 1, max: 120, cmp: 100, kind: 'plan', unit: 'k' },
    { id: 'signups', v: 412, d: 0, max: 500, cmp: 330, kind: 'target' },
    { id: 'conversion', v: 2.6, d: 1, max: 4, cmp: 2.4, kind: 'lastYear', unit: '%' },
  ];
  const CASH = { opening: 120, receipts: 86.8, payments: 74.8, closing: 132, max: 240 }; // 120 + 86.8 = 74.8 + 132 = 206.8
  const TILES = [['north', 128, 1, 2, 1], ['west', 58, 0, 1, 2], ['central', 116, 1, 2, 2], ['east', 64, 0, 3, 2], ['south', 46, 0, 2, 3]];
  const PRODUCTS = [['A', 420, 31.2, 5], ['B', 310, 22.4, 2], ['C', 260, 15.6, -2], ['D', 150, 10.1, 14], ['E', 100, 7.5, 4]];
  const TOTAL = [1240, 86.8, 4];
  const OUTCOMES = [1150, 1175, 1175, 1200, 1200, 1200, 1225, 1225, 1225, 1225, 1250, 1250, 1250, 1275, 1275, 1275, 1300, 1300, 1325, 1350];
  // The staffing line stays on the drawn axis (1,133 to 1,367 orders); every reading from 0 to 20 of 20 is reachable.
  const STAFF = { def: 1290, min: 1140, max: 1360, step: 10, big: 50 };
  const AX = [1250 - 350 / 3, 1250 + 350 / 3]; // the dotplot's axis: one bin and a third beyond 1,150 and 1,350
  const SPAN = { instruments: 3, weeks: 8, cash: 4, regions: 4, products: 5, next: 7, words: 12 };
  const ORDER = ['instruments', 'weeks', 'cash', 'regions', 'products', 'next', 'words'];

  // From figspec/r0.json (rules) and content/en.js, fr.js (ruleExtras[n].oneLine), copied exactly.
  const RULES = {
    1: { ch: 2, hl: "overlay", key: {"en": "Grid", "fr": "Grille"},
      title: {"en": "Start from a grid that divides", "fr": "Partir d’une grille qui se divise"},
      one: {"en": "Choose a width whose sum with one gutter divides by every column count you need, then make the regions unequal on purpose.", "fr": "Choisissez une largeur dont la somme avec une gouttière se divise par chaque nombre de colonnes dont vous avez besoin, puis rendez les régions inégales à dessein."},
      here: {"en": "Here: the regions span 3 + 3 + 3 + 3, 8 + 4, 5 + 7 and 12 of the twelve columns, and every gap between them falls in a gutter.", "fr": "Ici : les régions couvrent 3 + 3 + 3 + 3, 8 + 4, 5 + 7 et 12 des douze colonnes, et chaque intervalle entre elles tombe dans une gouttière."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r1", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r1"} },
    2: { ch: 2, hl: "outline", key: {"en": "Instrument", "fr": "Instrument"},
      title: {"en": "Give every number an instrument", "fr": "Donner un instrument à chaque nombre"},
      one: {"en": "Give each headline number its unit, a scale, one comparator and the gap, and leave out bands nobody can define.", "fr": "Donnez à chaque chiffre clé son unité, une échelle, un comparateur et l’écart, et laissez de côté les bandes que personne ne sait définir."},
      here: {"en": "Here: each headline number carries its unit, a scale, one named comparator and the gap.", "fr": "Ici : chaque chiffre clé porte son unité, une échelle, un comparateur nommé et l’écart."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r2", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r2"} },
    3: { ch: 2, hl: "part", key: {"en": "Variation", "fr": "Variation"},
      title: {"en": "Compare against routine variation", "fr": "Comparer à la variation ordinaire"},
      one: {"en": "Treat a change as news only when it leaves the limits of routine variation, and say which reference you used until you have them.", "fr": "Ne tenez un changement pour un fait nouveau que lorsqu’il sort des limites de la variation ordinaire, et dites quelle référence vous employez tant que vous ne les avez pas."},
      here: {"en": "Here: sign-ups left their routine range in week 12; orders stayed inside theirs.", "fr": "Ici : les inscriptions sont sorties de leur plage ordinaire en semaine 12 ; les commandes sont restées dans la leur."},
      link: {"en": "/projects/dashboard-design-guide/frame-and-measure/#r3", "fr": "/projects/dashboard-design-guide/fr/cadre-et-mesure/#r3"} },
    4: { ch: 3, hl: "outline", key: {"en": "Identity", "fr": "Identité"},
      title: {"en": "Draw the identity", "fr": "Dessiner l’identité"},
      one: {"en": "When the numbers obey a law, draw the law: put both sides on one scale so the answer is a gap the eye can measure.", "fr": "Quand les nombres obéissent à une loi, dessinez la loi : placez les deux membres sur une même échelle, pour que la réponse soit un écart que l’œil peut mesurer."},
      here: {"en": "Here: opening plus receipts and payments plus closing share one scale, and both bars end at 206.8.", "fr": "Ici : solde d’ouverture plus encaissements et décaissements plus solde de clôture partagent une même échelle, et les deux barres finissent à 206,8."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r4", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r4"} },
    5: { ch: 3, hl: "outline", key: {"en": "Tone", "fr": "Ton"},
      title: {"en": "Shade for hierarchy, print the quantity", "fr": "Ombrer pour hiérarchiser, imprimer la quantité"},
      one: {"en": "Let tone say what belongs together and print the number wherever the amount matters; keep strong colour small.", "fr": "Laissez le ton dire ce qui va ensemble et imprimez le nombre partout où le montant compte ; réservez la couleur forte aux petites surfaces."},
      here: {"en": "Here: the two campaign regions share one tone, and every count is printed.", "fr": "Ici : les deux régions de la campagne partagent un même ton, et chaque nombre est imprimé."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r5", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r5"} },
    6: { ch: 3, hl: "part", key: {"en": "Fills", "fr": "Remplissage"},
      title: {"en": "Give each fill one job", "fr": "Donner un seul rôle à chaque remplissage"},
      one: {"en": "Give every fill one meaning and let its strength say how firm the quantity is; never let the accent also mean clickable.", "fr": "Donnez à chaque remplissage un seul sens et laissez son intensité dire à quel point la quantité est ferme ; ne laissez jamais l’accent signifier aussi « cliquable »."},
      here: {"en": "Here: solid is what happened, dashed is a plan, hatched is a forecast, and each keeps that meaning in every region.", "fr": "Ici : le plein dit ce qui a eu lieu, le tireté un plan, la hachure une prévision, et chacun garde ce sens dans chaque région."},
      link: {"en": "/projects/dashboard-design-guide/marks-and-surfaces/#r6", "fr": "/projects/dashboard-design-guide/fr/marques-et-surfaces/#r6"} },
    7: { ch: 4, hl: "outline", key: {"en": "Axis", "fr": "Axe"},
      title: {"en": "Share one axis", "fr": "Partager un même axe"},
      one: {"en": "Keep one set of columns for time and put every measure under it, so a reader compares by looking down instead of remembering.", "fr": "Gardez un seul jeu de colonnes pour le temps et placez chaque mesure dessous, pour qu’un lecteur compare en regardant vers le bas au lieu de se souvenir."},
      here: {"en": "Here: sign-ups, orders and revenue sit under the same twelve week columns; point at a week to read all three.", "fr": "Ici : inscriptions, commandes et chiffre d’affaires sont sous les mêmes douze colonnes de semaines ; pointez une semaine pour lire les trois."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r7", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r7"} },
    8: { ch: 4, hl: "outline", key: {"en": "Tables", "fr": "Tableaux"},
      title: {"en": "Set tables to be read", "fr": "Composer les tableaux pour être lus"},
      one: {"en": "Edit a table like text: round to the digits that vary, order rows by size, align figures right, and remove every line the eye does not need.", "fr": "Révisez un tableau comme un texte : arrondissez aux chiffres qui varient, classez les lignes par grandeur, alignez les nombres à droite, et retirez chaque filet dont l’œil n’a pas besoin."},
      here: {"en": "Here: the products are ordered by revenue, rounded to the digits that vary, set right, with one in-cell bar and two rules.", "fr": "Ici : les produits sont classés par chiffre d’affaires, arrondis aux chiffres qui varient, alignés à droite, avec une barre dans la cellule et deux filets."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r8", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r8"} },
    9: { ch: 4, hl: "part", key: {"en": "Figures", "fr": "Chiffres"},
      title: {"en": "Choose type for figures", "fr": "Choisir une typographie pour les chiffres"},
      one: {"en": "Pick a face whose figures are tabular and keep their width in bold, then measure the minus, the percent sign and the decimal point too.", "fr": "Choisissez un caractère dont les chiffres sont tabulaires et gardent leur chasse en gras, puis mesurez aussi le signe moins, le signe pour cent et le séparateur décimal."},
      here: {"en": "Here: every figure is tabular, so the columns hold still when a row turns bold.", "fr": "Ici : tous les chiffres sont tabulaires, donc les colonnes ne bougent pas quand une ligne passe en gras."},
      link: {"en": "/projects/dashboard-design-guide/reading-order/#r9", "fr": "/projects/dashboard-design-guide/fr/ordre-de-lecture/#r9"} },
    10: { ch: 5, hl: "part", key: {"en": "Spread", "fr": "Incertitude"},
      title: {"en": "Show uncertainty only when it is earned", "fr": "Ne montrer l’incertitude que lorsqu’elle est méritée"},
      one: {"en": "Draw a spread only when a model has measured its error, and then draw it as something a reader can count.", "fr": "Ne dessinez une dispersion que lorsqu’un modèle a mesuré son erreur, et dessinez-la alors comme quelque chose qu’un lecteur peut compter."},
      here: {"en": "Here: next week is drawn as 20 outcomes you can count, because its error was measured over 40 weeks; the plan carries no spread.", "fr": "Ici : la semaine prochaine est dessinée en 20 issues que l’on peut compter, parce que son erreur a été mesurée sur 40 semaines ; le plan n’a pas de dispersion."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r10", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r10"} },
    11: { ch: 5, hl: "part", key: {"en": "Control", "fr": "Commande"},
      title: {"en": "Put each control on its consequence", "fr": "Placer chaque commande sur sa conséquence"},
      one: {"en": "Put the control on a chart of what it changes, keep every change visible and reversible, and make an override give its reason.", "fr": "Placez la commande sur un graphique de ce qu’elle modifie, gardez chaque changement visible et réversible, et exigez qu’un ajustement manuel donne sa raison."},
      here: {"en": "Here: the staffing line sits on the forecast it changes; drag it and the chance of running short follows, and Undo steps back.", "fr": "Ici : la ligne d’effectif est posée sur la prévision qu’elle modifie ; déplacez-la et le risque de manquer suit, et Annuler revient en arrière."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r11", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r11"} },
    12: { ch: 5, hl: "outline", key: {"en": "Words", "fr": "Mots"},
      title: {"en": "Use plain words, and say what the numbers are", "fr": "Employer des mots simples et dire ce que sont les nombres"},
      one: {"en": "Use the reader’s words, define the terms they will search for, and say plainly what kind of number each figure is.", "fr": "Employez les mots du lecteur, définissez les termes qu’il cherchera, et dites clairement de quel type de nombre relève chaque chiffre."},
      here: {"en": "Here: every measure is named in the reader’s words and defined under the dashboard, and the numbers say they are illustrative.", "fr": "Ici : chaque mesure porte les mots du lecteur et est définie sous le tableau de bord, et les nombres disent qu’ils sont fictifs."},
      link: {"en": "/projects/dashboard-design-guide/candour-and-control/#r12", "fr": "/projects/dashboard-design-guide/fr/franchise-et-controle/#r12"} },
  };
  const REGION_SENT = {
    instruments: {"en": "Uses rules 2 and 9: every headline number has its unit, a scale, a named comparator and the gap, in tabular figures.", "fr": "Applique les règles 2 et 9 : chaque chiffre clé a son unité, une échelle, un comparateur nommé et l’écart, en chiffres tabulaires."},
    weeks: {"en": "Uses rules 3, 6 and 7: one set of week columns for every measure, a routine range for each series, and fills with one job each.", "fr": "Applique les règles 3, 6 et 7 : un seul jeu de colonnes de semaines pour chaque mesure, une plage ordinaire pour chaque série, et des remplissages à un seul rôle."},
    cash: {"en": "Uses rule 4: the cash identity is drawn, so the balance is a line the eye can check.", "fr": "Applique la règle 4 : l’identité de trésorerie est dessinée, donc l’équilibre est une ligne que l’œil vérifie."},
    regions: {"en": "Uses rule 5: tone groups the campaign regions and every count is printed.", "fr": "Applique la règle 5 : le ton regroupe les régions de la campagne et chaque nombre est imprimé."},
    products: {"en": "Uses rules 8 and 9: ordered by revenue, rounded to the digits that vary, set right with one in-cell bar and two rules; every figure tabular.", "fr": "Applique les règles 8 et 9 : classé par chiffre d’affaires, arrondi aux chiffres qui varient, aligné à droite avec une barre et deux filets ; chiffres tabulaires."},
    next: {"en": "Uses rules 10, 11 and 6: a measured forecast drawn as outcomes to count, the staffing control on top of it, and hatching for what is forecast.", "fr": "Applique les règles 10, 11 et 6 : une prévision mesurée dessinée en issues à compter, la commande d’effectif posée dessus, et la hachure pour ce qui est prévu."},
    words: {"en": "Uses rule 12: every measure is defined in the reader’s words.", "fr": "Applique la règle 12 : chaque mesure est définie avec les mots du lecteur."},
  };
  const REGION_RULES = { instruments: [2, 9], weeks: [3, 6, 7], cash: [4], regions: [5], products: [8, 9], next: [6, 10, 11], words: [12] };
  const TERMS = {"en": [["Orders", "Paid orders, counted in the week they are paid."], ["Revenue", "What paid orders brought in after refunds and before tax, in thousands of dollars."], ["Sign-ups", "New accounts with a confirmed email address."], ["Routine range", "The average of weeks 1 to 11, plus or minus 2.66 times the average change from week to week."]], "fr": [["Commandes", "Les commandes payées, comptées dans la semaine de leur paiement."], ["Chiffre d’affaires", "Ce que les commandes payées ont rapporté, après remboursements et avant taxes, en milliers de dollars."], ["Inscriptions", "Les nouveaux comptes dont l’adresse électronique est confirmée."], ["Plage ordinaire", "La moyenne des semaines 1 à 11, plus ou moins 2,66 fois l’écart moyen d’une semaine à la suivante."]]} ;
  const LABELS = {"en": {"keysAria": "The twelve rules", "reading": "Reading", "week12": "Week 12", "ruleOf": "Rule {n} of 12", "region": "Region", "readIt": "Read it in chapter {n} →", "undo": "Undo", "reset": "Reset", "staffFor": "staff for {N}", "ordersInWeek13": "orders in week 13", "week": "Week", "routineRange": "routine range", "signal": "signal", "plan": "plan", "forecast": "forecast", "staffing": "staffing", "campaign": "campaign", "total": "Total", "outcomesAbove": "outcomes are above the staffing line: a {share} chance of running short.", "medianLine": "Median 1,240; 90% between 1,175 and 1,325.", "errorLine": "Error measured over the last 40 weeks.", "bothBars": "Both bars end at 206.8, so the week balances.", "belowPlan": "below plan", "routine": "routine", "perWeek": "per week", "kPerWeek": "$K per week", "columns": "{n} columns"}, "fr": {"keysAria": "Les douze règles", "reading": "Lecture", "week12": "Semaine 12", "ruleOf": "Règle {n} sur 12", "region": "Région", "readIt": "La lire au chapitre {n} →", "undo": "Annuler", "reset": "Réinitialiser", "staffFor": "effectif pour {N}", "ordersInWeek13": "commandes en semaine 13", "week": "Semaine", "routineRange": "plage ordinaire", "signal": "signal", "plan": "plan", "forecast": "prévision", "staffing": "effectif", "campaign": "campagne", "total": "Total", "outcomesAbove": "issues sont au-dessus de la ligne d’effectif : {share} de risque de manquer.", "medianLine": "Médiane 1 240 ; 90 % entre 1 175 et 1 325.", "errorLine": "Erreur mesurée sur les 40 dernières semaines.", "bothBars": "Les deux barres finissent à 206,8 : la semaine est équilibrée.", "belowPlan": "sous le plan", "routine": "ordinaire", "perWeek": "par semaine", "kPerWeek": "k$ par semaine", "columns": "{n} colonnes"}} ;
  const STATUS = {"default": {"en": {"which": ["Reading", "Week 12"], "lead": "Sign-ups rose above their routine range, the only signal this week.", "rest": "Orders stayed inside theirs, and revenue is 13.2 below a plan that assumed growth.", "hint": "Point at a rule to find it on the page, or at a region to see the rules it uses."}, "fr": {"which": ["Lecture", "Semaine 12"], "lead": "Les inscriptions sont sorties par le haut de leur plage ordinaire, seul signal de la semaine.", "rest": "Les commandes sont restées dans la leur, et le chiffre d’affaires est 13,2 sous un plan qui supposait de la croissance.", "hint": "Pointez une règle pour la trouver sur la page, ou une région pour voir les règles qu’elle applique."}}, "week": {"en": "<b>Week {w}: {signups} sign-ups, {orders} orders, {revenue} $K of revenue.</b> {signalClause}", "fr": "<b>Semaine {w} : {signups} inscriptions, {orders} commandes, {revenue} k$ de chiffre d’affaires.</b> {signalClause}", "signalClause": {"en": {"inside": "Every measure is inside its routine range.", "signal": "Sign-ups are outside their routine range: a signal."}, "fr": {"inside": "Chaque mesure est dans sa plage ordinaire.", "signal": "Les inscriptions sont hors de leur plage ordinaire : un signal."}}}, "staffing": {"en": "<b>Staff for {N} orders: {k} of 20 outcomes are higher, a {share} chance of running short.</b> The median outcome is 1,240.", "fr": "<b>Effectif pour {N} commandes : {k} issues sur 20 sont au-dessus, soit {share} de risque de manquer.</b> L’issue médiane est 1 240.", "share": "k of 20 as words when exact (1 in 5, 1 in 4, 1 in 2, 1 in 10, 1 in 20); otherwise a whole percentage", "none": {"en": "No outcome is higher: staff covers all twenty.", "fr": "Aucune issue n’est au-dessus : l’effectif couvre les vingt."}}} ;

  /* ---------- words (everything not in the tables above) ---------- */
  const T = {
    sheetTitle: { en: 'Weekly review', fr: 'Revue de la semaine' },
    sheetHint: { en: 'an imaginary online shop · week 12 · illustrative numbers', fr: 'une boutique en ligne imaginaire · semaine 12 · nombres fictifs' },
    kpi: {
      en: { orders: ['Orders', 'week 12'], revenue: ['Revenue', 'week 12'], signups: ['Sign-ups', 'week 12'], conversion: ['Conversion', 'orders ÷ visitors'] },
      fr: { orders: ['Commandes', 'semaine 12'], revenue: ['Chiffre d’affaires', 'semaine 12'], signups: ['Inscriptions', 'semaine 12'], conversion: ['Conversion', 'commandes ÷ visiteurs'] },
    },
    unitK: { en: '$K', fr: 'k$' },
    cmp: { en: { plan: 'plan', target: 'target', lastYear: 'last year' }, fr: { plan: 'plan', target: 'objectif', lastYear: 'l’an dernier' } },
    wkTitle: { en: 'Week by week', fr: 'Semaine par semaine' },
    wkCtx: { en: 'weeks 1 to 12, one axis for every measure', fr: 'semaines 1 à 12, un seul axe pour chaque mesure' },
    rowName: { en: { signups: 'Sign-ups', orders: 'Orders', revenue: 'Revenue' }, fr: { signups: 'Inscriptions', orders: 'Commandes', revenue: 'Chiffre d’affaires' } },
    revK: { en: 'Revenue, $K', fr: 'Chiffre d’affaires, k$' },
    range: { en: (lo, hi) => `range ${lo} to ${hi}`, fr: (lo, hi) => `plage de ${lo} à ${hi}` },
    planV: { en: (v) => `plan ${v}`, fr: (v) => `plan ${v}` },
    abovePlan: { en: 'above plan', fr: 'au-dessus du plan' },
    onPlan: { en: 'on plan', fr: 'au niveau du plan' },
    wkAria: {
      en: (o) => `Sign-ups, orders and revenue for weeks 1 to 12. Sign-ups: week 12 at ${o.s} is above the routine range of ${o.slo} to ${o.shi}. Orders: week 12 at ${o.o} is inside the routine range of ${o.olo} to ${o.ohi}. Revenue: week 12 at ${o.r} $K, below the plan of ${o.p}.`,
      fr: (o) => `Inscriptions, commandes et chiffre d’affaires des semaines 1 à 12. Inscriptions : la semaine 12, à ${o.s}, est au-dessus de la plage ordinaire de ${o.slo} à ${o.shi}. Commandes : la semaine 12, à ${o.o}, est dans la plage ordinaire de ${o.olo} à ${o.ohi}. Chiffre d’affaires : ${o.r} k$ en semaine 12, sous le plan de ${o.p}.`,
    },
    cashTitle: { en: 'Cash', fr: 'Trésorerie' },
    cashCtx: { en: 'week 12, $K', fr: 'semaine 12, k$' },
    // French uses the short plain words, so each label fits inside its bar.
    seg: { en: { opening: 'opening', receipts: 'receipts', payments: 'payments', closing: 'closing' }, fr: { opening: 'ouverture', receipts: 'entrées', payments: 'sorties', closing: 'clôture' } },
    cashAria: {
      en: (o) => `Cash in week 12, $K: opening ${o.a} plus receipts ${o.b} makes ${o.t}; payments ${o.c} plus closing ${o.d} makes ${o.t}. The week balances.`,
      fr: (o) => `Trésorerie en semaine 12, k$ : ouverture ${o.a} plus entrées ${o.b} font ${o.t} ; sorties ${o.c} plus clôture ${o.d} font ${o.t}. La semaine est équilibrée.`,
    },
    regTitle: { en: 'Sign-ups by region', fr: 'Inscriptions par région' },
    week12: { en: 'week 12', fr: 'semaine 12' },
    region: { en: { north: 'North', west: 'West', central: 'Central', east: 'East', south: 'South' }, fr: { north: 'Nord', west: 'Ouest', central: 'Centre', east: 'Est', south: 'Sud' } },
    prTitle: { en: 'Products', fr: 'Produits' },
    prCtx: { en: 'week 12, ordered by revenue', fr: 'semaine 12, classés par chiffre d’affaires (CA)' },
    prCtxN: { en: 'week 12, revenue in $K, ordered by revenue', fr: 'semaine 12, chiffre d’affaires (CA) en k$, classés par CA' },
    prCols: { en: ['Product', 'Orders', 'Revenue, $K', 'vs weeks 8–11'], fr: ['Produit', 'Commandes', 'CA, k$', 'vs sem. 8–11'] },
    prColsN: { en: ['Product', 'Orders', 'Revenue', 'vs 8–11'], fr: ['Produit', 'Commandes', 'CA', 'vs 8–11'] },
    product: { en: (x) => `Product ${x}`, fr: (x) => `Produit ${x}` },
    prAria: { en: 'Products in week 12, ordered by revenue', fr: 'Produits en semaine 12, classés par chiffre d’affaires' },
    nxTitle: { en: 'Orders next week', fr: 'Commandes la semaine prochaine' },
    nxCtx: { en: 'week 13, twenty equally likely outcomes', fr: 'semaine 13, vingt issues également probables' },
    countOf: { en: (k) => `<span class="cv-cn">${k}</span> of 20`, fr: (k) => `<span class="cv-cn">${k}</span> sur 20` },
    above1: { en: 'outcome is above the staffing line: a {share} chance of running short.', fr: 'issue est au-dessus de la ligne d’effectif : {share} de risque de manquer.' },
    share: { en: { 1: '1\u00A0in\u00A020', 2: '1\u00A0in\u00A010', 4: '1\u00A0in\u00A05', 5: '1\u00A0in\u00A04', 10: '1\u00A0in\u00A02' }, fr: { 1: '1\u00A0sur\u00A020', 2: '1\u00A0sur\u00A010', 4: '1\u00A0sur\u00A05', 5: '1\u00A0sur\u00A04', 10: '1\u00A0sur\u00A02' } },
    median: { en: (m, a, b) => `Median ${m}; 90% between ${a} and ${b}.`, fr: (m, a, b) => `Médiane ${m} ; 90${NN}% entre ${a} et ${b}.` },
    staffAria: { en: 'Staffing line', fr: 'Ligne d’effectif' },
    staffText: { en: (n, k) => `staff for ${n} orders, ${k} of 20 outcomes higher`, fr: (n, k) => `effectif pour ${n} commandes, ${k} issues sur 20 au-dessus` },
    dpAria: {
      en: (n, k) => `Orders in week 13 as twenty equally likely outcomes, from 1,150 to 1,350, median 1,240. The staffing line is at ${n}; ${k} of 20 outcomes are higher.`,
      fr: (n, k) => `Commandes en semaine 13 en vingt issues également probables, de 1 150 à 1 350, médiane 1 240. La ligne d’effectif est à ${n} ; ${k} issues sur 20 sont au-dessus.`,
    },
    wdTitle: { en: 'What the numbers are', fr: 'Ce que sont les nombres' },
    wdCtx: { en: 'plain words for every measure on this page', fr: 'des mots simples pour chaque mesure de la page' },
    // cover only
    ruleAria: { en: (n, s) => `Rule ${n}: ${s}`, fr: (n, s) => `Règle ${n} : ${s}` },
    ruleOf: { en: (n) => `Rule ${n} of 12`, fr: (n) => `Règle ${n} sur 12` },
    readIt: { en: (c) => `Read it in chapter ${c} →`, fr: (c) => `La lire au chapitre ${c} →` },
    weekN: { en: (w) => `Week ${w}`, fr: (w) => `Semaine ${w}` },
    readingWeek: { en: (w) => `Reading · week ${w}`, fr: (w) => `Lecture · semaine ${w}` },
    rulesList: {
      en: (ns) => (ns.length === 1 ? `Rule ${ns[0]}` : `Rules ${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`),
      fr: (ns) => (ns.length === 1 ? `Règle ${ns[0]}` : `Règles ${ns.slice(0, -1).join(', ')} et ${ns[ns.length - 1]}`),
    },
    stripRegion: { en: (title, list, many) => `${title} ${many ? 'use' : 'uses'} ${list}`, fr: (title, list) => `${title} : ${list}` },
    stripRule: { en: (n, s) => `Rule ${n} · ${s}`, fr: (n, s) => `Règle ${n} · ${s}` },
    staffTitle: { en: (n) => `Staff for ${n} orders`, fr: (n) => `Effectif pour ${n} commandes` },
    hintTouch: { en: 'Tap a rule to find it on the page, or a region to see its rules.', fr: 'Touchez une règle pour la trouver sur la page, ou une région pour voir ses règles.' },
    columns: { en: (n) => `${n} columns`, fr: (n) => `${n} colonnes` },
  };

  const pc = (k) => (Math.max(0, Math.min(1, k)) * 100).toFixed(3) + '%';
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
  const above = (n) => OUTCOMES.filter((v) => v > n).length;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const union = (rs) => {
    const ok = rs.filter((r) => r && (r.width > 0 || r.height > 0));
    if (!ok.length) return null;
    const l = Math.min(...ok.map((r) => r.left)), t = Math.min(...ok.map((r) => r.top));
    const r_ = Math.max(...ok.map((r) => r.right)), b = Math.max(...ok.map((r) => r.bottom));
    return { left: l, top: t, right: r_, bottom: b, width: r_ - l, height: b - t };
  };

  /* =====================================================================================================
     The dashboard: rows A (instruments), B (week by week; cash over regions), C (products; next week),
     D (words), on a grid of twelve equal columns with the inset as gap.
     opts: { rows: 'ABCD', uid, describedBy (id of the status the fields point to), interactive (fields focusable; default
     true), onWeek(w|null, src), onStaff(phase), onSettle(field), onLayout() }
     ===================================================================================================== */
  function coverDashboard(F, host, opts = {}) {
    const rows = opts.rows || 'ABCD';
    const uid = opts.uid || 'cv';
    const t = F.t, num = F.num, fr = F.fr, esc = F.esc;
    const lab = t(LABELS);
    const desc = opts.describedBy ? ` aria-describedby="${opts.describedBy}"` : '';
    const st = { week: null, N: STAFF.def, hist: [], row: 28, dragging: false, k: above(STAFF.def) };
    const signed = (v, d) => F.signed(v, d);
    const pctS = (v) => signed(v, 0) + (F.lang === 'fr' ? NN + '%' : '%');
    const live = opts.interactive !== false;
    const field = (cls, region, label, inner, extra = '') =>
      `<div class="cv-f ${cls}" data-region="${region}" role="group" aria-label="${esc(label)}"${live ? ' tabindex="0"' : ''}${desc}${extra}>${inner}</div>`;
    const tbar = (title, ctx, legend = '', part = '') =>
      `<div class="cv-tbar"${part ? ` data-part="${part}"` : ''}><div class="cv-tt"><b>${title}</b>${ctx}</div>${legend ? `<div class="cv-lg">${legend}</div>` : ''}</div>`;
    const dash16 = `<svg class="cv-lgi" width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><line x1="0" y1="5" x2="16" y2="5" class="cv-plan"/></svg>`;

    /* ---------- markup ---------- */
    const kpiHTML = (k, i) => {
      const [name, ctx] = t(T.kpi)[k.id];
      const unit = k.unit === 'k' ? t(T.unitK) : k.unit === '%' ? '%' : '';
      const cmp = `${t(T.cmp)[k.kind]} ${k.unit === '%' ? F.pct(k.cmp, 1) : num(k.cmp, k.d)}`;
      const gap = signed(k.v - k.cmp, k.d) + (k.unit === '%' ? NB + 'pt' : '');
      return field('cv-kpi', 'instruments', name, `<div class="cv-kh" data-part="kpi-head"><span class="cv-kl">${name}</span><span class="cv-kc">${ctx}</span></div>
        <div class="cv-kv" data-part="kpi-value"><span class="cv-kn" data-v="${k.v}" data-d="${k.d}">${num(k.v, k.d)}</span>${unit ? `<span class="cv-ku">${unit}</span>` : ''}</div>
        <div class="cv-ks" data-part="kpi-scale" aria-hidden="true"><i class="cv-ktr"></i><i class="cv-kbar" style="width:${pc(k.v / k.max)}"></i><i class="cv-ktk" style="left:${pc(k.cmp / k.max)}"></i></div>
        <div class="cv-kf" data-part="kpi-foot"><b>${gap}</b><span>${fr(cmp)}</span></div>`, ` data-k="${k.id}" style="--o:${i}"`);
    };
    const weeksHTML = () => field('cv-weeks', 'weeks', t(T.wkTitle), tbar(t(T.wkTitle), `<span>${t(T.wkCtx)}</span>`,
      `<span><i class="cv-sw cv-sw-rng"></i>${lab.routineRange}</span><span><i class="cv-sw cv-sw-sig"></i>${lab.signal}</span><span>${dash16}${lab.plan}</span>`, 'wk-head') +
      `<div class="cv-chart"></div>`, ' style="--o:4"');
    const cashHTML = () => {
      const C = CASH, s = t(T.seg), p = (v) => pc(v / C.max), tot = C.opening + C.receipts;
      const n1 = (v) => num(v, 1);
      const seg = (cls, l, w, word, v) => `<span class="cv-seg ${cls}" style="left:${l};width:${w}"><span><em>${word}${NB}</em>${n1(v)}</span></span>`;
      return field('cv-cash', 'cash', t(T.cashTitle), tbar(t(T.cashTitle), `<span>${t(T.cashCtx)}</span>`) +
        `<div class="cv-id" role="img" aria-label="${esc(fr(t(T.cashAria, { a: n1(C.opening), b: n1(C.receipts), c: n1(C.payments), d: n1(C.closing), t: n1(tot) })))}">
          <div class="cv-idr">${seg('cv-bal cv-l', '0px', p(C.opening), s.opening, C.opening)}${seg('cv-flow cv-r', `calc(${p(C.opening)} + 2px)`, `calc(${p(C.receipts)} - 2px)`, s.receipts, C.receipts)}</div>
          <div class="cv-idr cv-idr2">${seg('cv-flow cv-l', '0px', p(C.payments), s.payments, C.payments)}${seg('cv-bal cv-r', `calc(${p(C.payments)} + 2px)`, `calc(${p(C.closing)} - 2px)`, s.closing, C.closing)}</div>
          <i class="cv-idl" style="left:calc(${p(tot)} + .5px)"></i><b class="cv-idt" style="left:calc(${p(tot)} + 8.5px)">${n1(tot)}</b>
        </div><p class="cv-cap">${fr(lab.bothBars)}</p>`, ' style="--o:5"');
    };
    const regionsHTML = () => field('cv-regions', 'regions', t(T.regTitle), tbar(t(T.regTitle), `<span>${t(T.week12)}</span>`, `<span><i class="cv-sw cv-sw-camp"></i>${lab.campaign}</span>`) +
      `<div class="cv-tiles">${TILES.map(([id, n, camp, c, r], i) => `<div class="cv-tile${camp ? ' is-camp' : ''}" style="grid-column:${c};grid-row:${r};--i:${i}"><span>${t(T.region)[id]}</span><b>${num(n)}</b></div>`).join('')}</div>`, ' style="--o:6"');
    const productsHTML = () => {
      const c = t(T.prCols), cn = t(T.prColsN), two = (a, b) => `<span class="cv-wd">${a}</span><span class="cv-nw">${b}</span>`;
      const max = PRODUCTS[0][2];
      const tr = (cells, cls, i) => `<div class="cv-tr${cls}" role="row" style="--i:${i}">${cells}</div>`;
      const head = tr(`<span role="columnheader" data-part="pr-name">${c[0]}</span><span role="columnheader" data-part="pr-orders">${c[1]}</span><span role="columnheader" data-part="pr-rev">${two(c[2], cn[2])}</span><span data-part="pr-bar" aria-hidden="true"></span><span role="columnheader" data-part="pr-chg">${two(c[3], cn[3])}</span>`, ' cv-th', 0);
      const body = PRODUCTS.map(([x, o, r, ch], i) => tr(`<span role="rowheader" data-part="pr-name">${t(T.product, x)}</span><span role="cell" data-part="pr-orders">${num(o)}</span><span role="cell" data-part="pr-rev">${num(r, 1)}</span><span data-part="pr-bar" aria-hidden="true"><i class="cv-ib" style="width:${pc(r / max)}"></i></span><span role="cell" data-part="pr-chg">${pctS(ch)}</span>`, '', i + 1)).join('');
      const tot = tr(`<span role="rowheader" data-part="pr-name">${lab.total}</span><span role="cell" data-part="pr-orders">${num(TOTAL[0])}</span><span role="cell" data-part="pr-rev">${num(TOTAL[1], 1)}</span><span data-part="pr-bar" aria-hidden="true"></span><span role="cell" data-part="pr-chg">${pctS(TOTAL[2])}</span>`, ' cv-ttl', 6);
      return field('cv-products', 'products', t(T.prTitle), tbar(t(T.prTitle), two(t(T.prCtx), t(T.prCtxN))) +
        `<div class="cv-tab" role="table" aria-label="${esc(t(T.prAria))}">${head}${body}${tot}</div>`, ' style="--o:7"');
    };
    const nextHTML = () => {
      const hk = `${uid}-hk`;
      const hatchKey = `<svg class="cv-lgi" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">${F.hatch(hk, 'cv-hatch-key')}<circle cx="6" cy="6" r="5.25" class="cv-dot-h" fill="url(#${hk})"/></svg>`;
      return field('cv-next', 'next', t(T.nxTitle), tbar(t(T.nxTitle), `<span>${t(T.nxCtx)}</span>`, `<span>${hatchKey}${lab.forecast}</span><span>${dash16}${lab.staffing}</span>`, 'nx-head') +
        `<div class="cv-nx"><div class="cv-dp" data-part="nx-plot"></div>
          <div class="cv-ro"><div class="cv-cnt" data-part="nx-count"><div class="cv-cnt-n"></div><p class="cv-cnt-s"></p></div>
            <div class="cv-notes" data-part="nx-notes"><p>${fr(t(T.median, num(1240), num(1175), num(1325)))}</p><p>${fr(lab.errorLine)}</p></div>
            <div class="cv-hist"><button type="button" class="f2-btn" data-act="undo">${lab.undo}</button><button type="button" class="f2-btn" data-act="reset">${lab.reset}</button></div></div></div>`, ' style="--o:8"');
    };
    const wordsHTML = () => field('cv-words', 'words', t(T.wdTitle), tbar(t(T.wdTitle), `<span>${t(T.wdCtx)}</span>`) +
      `<dl class="cv-terms">${t(TERMS).map(([a, b]) => `<div><dt>${a}</dt><dd>${fr(b)}</dd></div>`).join('')}</dl>`, ' style="--o:9"');

    host.innerHTML = `<div class="cv-grid">${rows.includes('A') ? KPIS.map(kpiHTML).join('') : ''}${rows.includes('B') ? weeksHTML() + cashHTML() + regionsHTML() : ''}${rows.includes('C') ? productsHTML() + nextHTML() : ''}${rows.includes('D') ? wordsHTML() : ''}</div>`;
    const q = (s) => host.querySelector(s);
    const qa = (s) => [...host.querySelectorAll(s)];
    const fields = qa('.cv-f');
    const byRegion = {};
    fields.forEach((f) => (byRegion[f.dataset.region] = byRegion[f.dataset.region] || []).push(f));

    /* ---------- week by week ---------- */
    const chart = q('.cv-chart');
    let G = null, hair = null, vals = [], ticks = [];
    const yOf = (i, v) => { const r = ROWS[i]; return G.top(i) + G.band - ((v - r.dom[0]) / (r.dom[1] - r.dom[0])) * G.band; };
    const wordOf = (i, w) => {
      const r = ROWS[i], v = r.v[w - 1];
      if (r.plan) { const p = r.plan[w - 1]; return [Math.abs(v - p) < 0.05 ? t(T.onPlan) : v < p ? lab.belowPlan : t(T.abovePlan), false]; }
      const sig = v > r.r.hi || v < r.r.lo;
      return [sig ? lab.signal : lab.routine, sig];
    };
    function drawWeeks() {
      if (!chart) return;
      const W = Math.max(240, Math.round(chart.clientWidth || 0));
      if (W === 240 && !chart.clientWidth) return;
      const wide = W >= 560;
      if (wide) {
        const band = 2 * st.row, pitch = band + 16, L = 116, R = W - 109;
        G = { wide, W, band, pitch, L, R, cw: (R - L) / 12, top: (i) => i * pitch + 8, H: 3 * pitch + 24 };
      } else {
        const band = Math.round((44 * st.row) / 28), pitch = band + 44;
        G = { wide, W, band, pitch, L: 0, R: W, cw: W / 12, top: (i) => i * pitch + 28, H: 2 * pitch + 28 + band + 28 };
      }
      G.x = (w) => G.L + (w - 0.5) * G.cw;
      const { L, R } = G, x = G.x, crisp = (v) => Math.round(v) + 0.5;
      const ptR = wide ? 2.75 : 2.25, sigR = wide ? 5.5 : 5, lastR = wide ? 4.5 : 4, bw = wide ? 16 : 12;
      const base = G.top(2) + G.band;
      let svg = '';
      ROWS.forEach((r, i) => {
        if (r.plan) {
          const bars = r.v.map((v, j) => F.rect(x(j + 1) - bw / 2, yOf(i, v), bw, base - yOf(i, v), 'cv-bar', 2, { style: `--i:${j}` })).join('');
          const plan = `<polyline class="cv-planl" points="${r.plan.map((v, j) => `${x(j + 1).toFixed(1)},${yOf(i, v).toFixed(1)}`).join(' ')}"/>`;
          svg += `<g data-part="wk-${r.id}">${bars}${plan}${F.line(L, base + 0.5, R, base + 0.5, 'cv-base')}</g>`;
          return;
        }
        const yh = yOf(i, r.r.hi), yl = yOf(i, r.r.lo), pts = r.v.map((v, j) => [x(j + 1), yOf(i, v)]);
        const dots = pts.slice(0, 11).map((p, j) => F.circle(p[0], p[1], ptR, 'cv-pt', { style: `--i:${j}` })).join('');
        const last = pts[11];
        const lastDot = i === 0 ? F.circle(last[0], last[1], sigR, 'cv-sig') : F.circle(last[0], last[1], lastR, 'cv-last');
        svg += `<g data-part="wk-${r.id}">${F.rect(L, yh, R - L, yl - yh, 'cv-rng', 3)}${F.line(L, crisp(yOf(i, r.r.mean)) , R, crisp(yOf(i, r.r.mean)), 'cv-mean')}<polyline class="cv-line" points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>${dots}${lastDot}</g>`;
      });
      svg += `<line class="cv-hair" x1="0" y1="${G.top(0) - 4}" x2="0" y2="${base + 4}"/>`;
      const o = { s: num(412), slo: num(ROWS[0].r.lo), shi: num(ROWS[0].r.hi), o: num(1240), olo: num(ROWS[1].r.lo), ohi: num(ROWS[1].r.hi), r: num(86.8, 1), p: num(100, 1) };
      let html = `<svg class="f2-svg cv-wsvg" width="${W}" height="${base + 4}" viewBox="0 0 ${W} ${base + 4}" role="img" aria-label="${esc(fr(t(T.wkAria, o)))}">${svg}</svg>`;
      const names = t(T.rowName);
      ROWS.forEach((r, i) => {
        const part = ` data-part="wk-${r.id}"`;
        if (G.wide) {
          html += `<div class="cv-rl"${part} style="top:${G.top(i) + G.band / 2}px"><b>${names[r.id]}</b><span>${r.plan ? lab.kPerWeek : lab.perWeek}</span></div>`;
          if (r.plan) html += `<span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.plan[11]) - 8).toFixed(1)}px">${num(r.plan[11], 1)}</span>`;
          else html += `<span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.r.hi) - 8).toFixed(1)}px">${num(r.r.hi)}</span><span class="cv-lim"${part} style="left:${R + 6}px;top:${(yOf(i, r.r.lo) - 8).toFixed(1)}px">${num(r.r.lo)}</span>`;
          html += `<div class="cv-val"${part}><b></b><span></span></div>`;
        } else {
          const ctx = r.plan ? fr(t(T.planV, num(r.plan[11], 1))) : fr(t(T.range, num(r.r.lo), num(r.r.hi)));
          html += `<div class="cv-rh"${part} style="top:${i * G.pitch}px"><span class="cv-rh-l"><b>${r.plan ? t(T.revK) : names[r.id]}</b><span>${ctx}</span></span><span class="cv-val"><b></b><span></span></span></div>`;
        }
        const a = G.wide ? i * G.pitch : i * G.pitch - 2, b = G.wide ? i * G.pitch + G.pitch - 6 : G.top(i) + G.band + 2;
        html += `<i class="cv-anc" data-anc="wk-${r.id}" style="left:-4px;width:${W + 8}px;top:${a}px;height:${b - a}px"></i>`;
      });
      const axTop = G.wide ? G.H - 18 : base + 8;
      const shown = G.wide ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 3, 5, 7, 9, 11, 12];
      html += `<div class="cv-axis" data-part="wk-axis" style="top:${axTop}px" aria-hidden="true">${G.wide ? `<span class="cv-axt">${lab.week}</span>` : ''}${shown.map((w) => `<span class="cv-tk" data-w="${w}" style="left:${(x(w) - 15).toFixed(1)}px">${num(w)}</span>`).join('')}</div>`;
      html += `<div class="cv-hit" style="left:${L}px;width:${R - L}px;top:0;height:${base + 4}px"></div>`;
      chart.style.height = G.H + 'px';
      chart.classList.toggle('is-wide', G.wide);
      chart.innerHTML = html;
      hair = chart.querySelector('.cv-hair');
      vals = [...chart.querySelectorAll('.cv-val')];
      ticks = [...chart.querySelectorAll('.cv-tk')];
      updateWeek();
    }
    function updateWeek() {
      if (!G || !hair) return;
      const w = st.week || 12;
      const xw = G.x(w);
      hair.setAttribute('x1', xw.toFixed(1));
      hair.setAttribute('x2', xw.toFixed(1));
      chart.classList.toggle('is-pointed', st.week != null);
      ROWS.forEach((r, i) => {
        const el = vals[i]; if (!el) return;
        const v = r.v[w - 1], [word, sig] = wordOf(i, w);
        el.firstChild.textContent = num(v, r.d);
        el.lastChild.textContent = word;
        el.classList.toggle('is-sig', sig);
        if (G.wide) {
          const y = yOf(i, v), top = clamp(y - 10, i * G.pitch - 8, i * G.pitch + G.pitch - 40);
          el.style.top = top.toFixed(1) + 'px';
          el.style.left = (G.W - 67) + 'px';
        }
      });
      ticks.forEach((tk) => tk.classList.toggle('is-on', +tk.dataset.w === w));
    }
    const setWeek = (w, src) => {
      const nw = w == null ? null : clamp(w, 1, 12);
      if (nw === st.week) return;
      st.week = nw;
      updateWeek();
      if (opts.onWeek) opts.onWeek(nw, src);
    };
    if (chart) {
      const weekAt = (e) => {
        if (!G) return null;
        const r = chart.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        if (px < G.L || px > G.R || py < 0 || py > G.top(2) + G.band + 4) return null;
        return clamp(Math.floor((px - G.L) / G.cw) + 1, 1, 12);
      };
      chart.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') setWeek(weekAt(e), 'ptr'); });
      chart.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') setWeek(null, 'ptr'); });
      chart.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { const w = weekAt(e); if (w) setWeek(w, 'touch'); } });
    }

    /* ---------- cash: hide a bar's word when the bar is too short for it ---------- */
    function fitCash() {
      const over = (s) => s.scrollWidth > s.clientWidth + 0.5;
      qa('.cv-seg').forEach((s) => {
        s.classList.remove('is-snug', 'is-tight');
        if (!over(s)) return;
        s.classList.add('is-snug'); // a smaller inset first, then the number alone
        if (over(s)) { s.classList.remove('is-snug'); s.classList.add('is-tight'); }
      });
    }

    /* ---------- products: narrow lanes and labels when the table is narrow ---------- */
    function fitProducts() {
      const f = q('.cv-products'); if (!f) return;
      const w = f.clientWidth - parseFloat(getComputedStyle(f).paddingLeft) - parseFloat(getComputedStyle(f).paddingRight);
      f.classList.toggle('is-narrow', w < 400);
    }

    /* ---------- instruments: the context goes under the name in every card if one name would wrap ---------- */
    function fitKpis() {
      const ks = qa('.cv-kpi'); if (!ks.length) return;
      ks.forEach((k) => k.classList.remove('is-stack'));
      if (window.matchMedia('(max-width:639px)').matches) { ks.forEach((k) => k.classList.add('is-stack')); return; }
      const wraps = ks.some((k) => { const h = k.querySelector('.cv-kh'); return h.offsetHeight > 24; });
      if (wraps) ks.forEach((k) => k.classList.add('is-stack'));
    }

    /* ---------- next week: the dotplot, the staffing line, the readout ---------- */
    const nx = q('.cv-nx'), dp = q('.cv-dp');
    let D = null, dsvg = null, hp = 0;
    const shareOf = (k) => t(T.share)[k] || F.pct(k * 5);
    const xN = (v) => D.cx + (v - 1250) * D.k;
    function drawNext() {
      if (!nx || !dp) return;
      const BW = nx.clientWidth; if (!BW) return;
      const side = BW >= 520;
      nx.classList.toggle('is-side', side);
      const PW = side ? Math.min(320, BW - 32 - 190) : Math.min(BW, 420);
      dp.style.width = PW + 'px';
      const k = Math.min(1.2, (PW - 30) / (AX[1] - AX[0]));
      D = { PW, k, cx: PW / 2, r: (12.25 * k) / 1.2 };
      const pitch = D.r * 2 + 3.5, hid = `${uid}-h${++hp}`;
      const bins = {};
      const dots = OUTCOMES.map((v) => { const j = (bins[v] = (bins[v] || 0) + 1) - 1; return { v, j, x: xN(v), y: 136 - j * pitch }; });
      const order = dots.slice().sort((a, b) => a.j - b.j || a.x - b.x);
      const dotHTML = dots.map((d) => `<g class="cv-dot" data-v="${d.v}" style="--i:${order.indexOf(d)}">${F.circle(d.x, d.y, D.r, 'cv-dot-b')}${F.circle(d.x, d.y, D.r, 'cv-dot-h', { fill: `url(#${hid})` })}</g>`).join('');
      const ticksHTML = [1150, 1200, 1250, 1300, 1350].map((v) => F.text(xN(v), 170, num(v), 'cv-dpt', 'middle')).join('');
      const x0 = xN(AX[0]), x1 = xN(AX[1]);
      dp.innerHTML = `<svg class="f2-svg cv-dps" width="${PW}" height="192" viewBox="0 0 ${PW} 192" role="img" aria-label="">${F.hatch(hid, 'cv-hatch-line')}
        <g data-part="nx-zone"><rect class="cv-zone" y="34" height="116" rx="4"/></g>
        <g class="cv-ghosts"></g>
        <g data-part="nx-dots" class="cv-dots">${dotHTML}</g>
        <g data-part="nx-axis">${F.line(x0, 150.5, x1, 150.5, 'cv-dpax')}${ticksHTML}${F.text(x0, 188, lab.ordersInWeek13, 'cv-dpt')}</g>
        <g data-part="nx-staff" class="cv-staff"><line class="cv-sline" y1="25" y2="150"/><text class="cv-slab" y="20"></text>
          <g class="f2-handle cv-handle" tabindex="0" role="slider" aria-label="${esc(t(T.staffAria))}" aria-valuemin="${STAFF.min}" aria-valuemax="${STAFF.max}">
            <rect class="cv-shit" y="0" width="28" height="152"/><circle class="f2-ring" cy="16" r="14.25"/><circle class="cv-thumb" cy="16" r="8.25"/></g></g></svg>`;
      dsvg = dp.querySelector('svg');
      const handle = dp.querySelector('.cv-handle');
      F.drag(handle, () => dsvg, {
        start: (p) => { st.dragging = true; st.from = st.N; st.dx = p.x - xN(st.N); nx.classList.add('is-dragging'); if (opts.onStaff) opts.onStaff('start'); },
        move: (p) => { const n = snap(p.x - st.dx); if (n !== st.N) place(n); if (opts.onStaff) opts.onStaff('move'); },
        end: (p, ev) => { st.dragging = false; nx.classList.remove('is-dragging'); commit(st.from); if (opts.onStaff) opts.onStaff('end', ev); },
      });
      let burst = null;
      handle.addEventListener('keydown', (e) => {
        const big = e.shiftKey ? STAFF.big : STAFF.step;
        const m = { ArrowLeft: -big, ArrowDown: -big, ArrowRight: big, ArrowUp: big }[e.key];
        let n = null;
        if (m != null) n = st.N + m; else if (e.key === 'Home') n = STAFF.min; else if (e.key === 'End') n = STAFF.max;
        if (n == null) return;
        e.preventDefault();
        if (burst == null) burst = st.N;
        place(clamp(n, STAFF.min, STAFF.max));
        if (opts.onStaff) opts.onStaff('key');
      });
      handle.addEventListener('keyup', () => { if (burst != null) { const b = burst; burst = null; commit(b); } });
      handle.addEventListener('blur', () => { if (burst != null) { const b = burst; burst = null; commit(b); } if (opts.onStaff) opts.onStaff('blur'); });
      place(st.N, true);
      drawGhosts();
    }
    const snap = (px) => clamp(Math.round((1250 + (px - D.cx) / D.k) / STAFF.step) * STAFF.step, STAFF.min, STAFF.max);
    function place(n, quiet) {
      st.N = n;
      if (!dsvg) return;
      const X = xN(n), x1 = xN(AX[1]);
      const zone = dsvg.querySelector('.cv-zone');
      zone.setAttribute('x', Math.min(X, x1).toFixed(1));
      zone.setAttribute('width', Math.max(0, x1 - X).toFixed(1));
      const sl = dsvg.querySelector('.cv-sline');
      sl.setAttribute('x1', X.toFixed(1)); sl.setAttribute('x2', X.toFixed(1));
      dsvg.querySelector('.cv-shit').setAttribute('x', (X - 14).toFixed(1));
      dsvg.querySelectorAll('.cv-handle circle').forEach((c) => c.setAttribute('cx', X.toFixed(1)));
      const lb = dsvg.querySelector('.cv-slab');
      lb.textContent = fill(lab.staffFor, { N: num(n) });
      let w = 90; try { w = lb.getComputedTextLength(); } catch { /* not rendered yet */ }
      const flip = X + 14 + w > D.PW + (nx.classList.contains('is-side') ? 24 : 6); // may run into the gutter, never into the readout
      lb.setAttribute('x', (flip ? X - 14 : X + 14).toFixed(1));
      lb.setAttribute('text-anchor', flip ? 'end' : 'start');
      const k = above(n);
      dsvg.querySelectorAll('.cv-dot').forEach((d) => d.classList.toggle('is-above', +d.dataset.v > n));
      const h = dsvg.querySelector('.cv-handle');
      h.setAttribute('aria-valuenow', String(n));
      h.setAttribute('aria-valuetext', t(T.staffText, num(n), k));
      dsvg.setAttribute('aria-label', fr(t(T.dpAria, num(n), k)));
      readout(k, quiet);
      histButtons();
    }
    let cntStop = () => {};
    function readout(k, quiet) {
      const box = q('.cv-cnt'); if (!box) return;
      const n = box.querySelector('.cv-cnt-n'), s = box.querySelector('.cv-cnt-s');
      if (!n.firstChild) n.innerHTML = t(T.countOf, k);
      const cn = n.querySelector('.cv-cn');
      const from = st.k;
      st.k = k;
      cntStop();
      if (quiet || from === k) cn.textContent = num(k);
      else cntStop = F.tween(from, k, 250, (v) => { cn.textContent = num(Math.round(v)); });
      s.textContent = k === 0 ? fr(t(STATUS.staffing.none)) : fr(fill(k === 1 ? t(T.above1) : lab.outcomesAbove, { share: shareOf(k) })).replace(/ a (\d)/, ' a\u00A0$1');
    }
    function drawGhosts() {
      const g = dsvg && dsvg.querySelector('.cv-ghosts'); if (!g) return;
      const seen = new Set();
      const last = st.hist.slice(-3).filter((v) => v !== st.N && !seen.has(v) && seen.add(v));
      g.innerHTML = last.map((v) => F.line(xN(v), 25, xN(v), 150, 'cv-ghost')).join('');
    }
    function commit(from) {
      if (from == null || from === st.N) return;
      st.hist.push(from);
      if (st.hist.length > 12) st.hist.shift();
      drawGhosts();
      histButtons();
      if (opts.onStaff) opts.onStaff('commit');
    }
    function histButtons() {
      const h = q('.cv-hist'); if (!h) return;
      const any = st.hist.length > 0 || st.N !== STAFF.def;
      h.classList.toggle('is-on', any);
      h.querySelector('[data-act="undo"]').disabled = !st.hist.length;
      h.querySelector('[data-act="reset"]').disabled = !any;
      h.querySelectorAll('button').forEach((b) => (b.tabIndex = any ? 0 : -1));
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.cv-hist [data-act]'); if (!b || b.disabled) return;
      if (b.dataset.act === 'undo' && st.hist.length) place(st.hist.pop());
      else if (b.dataset.act === 'reset') { st.hist = []; place(STAFF.def); }
      drawGhosts();
      histButtons();
      if (opts.onStaff) opts.onStaff('history');
    });

    /* ---------- entrance: each field rises in when a fifth of it is in view, in reading order ---------- */
    const order = (f) => ORDER.indexOf(f.dataset.region) * 10 + (+(f.style.getPropertyValue('--o')) || 0);
    function countUp(f, delay) {
      const el = f.querySelector('.cv-kn'); if (!el) return;
      const v = +el.dataset.v, d = +el.dataset.d;
      el.style.minWidth = el.offsetWidth + 'px';
      el.textContent = num(0, d);
      setTimeout(() => F.tween(0, v, 600, (x) => { el.textContent = num(x, d); }, F.ease.out), delay);
      setTimeout(() => { el.style.minWidth = ''; el.textContent = num(v, d); }, delay + 700);
    }
    const entered = new Set();
    function go(f, delay) {
      if (entered.has(f)) return;
      entered.add(f);
      f.style.setProperty('--cv-d', delay + 'ms');
      f.classList.remove('cv-wait');
      f.classList.add('cv-go');
      if (f.classList.contains('cv-kpi')) countUp(f, delay);
      setTimeout(() => { f.classList.remove('cv-go'); f.style.removeProperty('--cv-d'); if (opts.onSettle) opts.onSettle(f); }, delay + 1500);
    }
    function entrance() {
      if (F.reduce || !('IntersectionObserver' in window)) return;
      fields.forEach((f) => f.classList.add('cv-wait'));
      const io = new IntersectionObserver((es) => {
        const batch = es.filter((e) => e.isIntersecting).map((e) => e.target).sort((a, b) => order(a) - order(b));
        batch.forEach((f, i) => { io.unobserve(f); go(f, i * 60); });
      }, { threshold: 0.2 });
      fields.forEach((f) => io.observe(f));
      window.addEventListener('beforeprint', () => fields.forEach((f) => { io.unobserve(f); f.classList.remove('cv-wait'); }));
    }

    function layout() { fitKpis(); fitProducts(); drawWeeks(); drawNext(); fitCash(); }
    layout();
    entrance();
    F.onResize(host, () => layout());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitKpis(); fitCash(); if (dsvg) place(st.N, true); if (opts.onLayout) opts.onLayout(); });

    return {
      host, fields, byRegion, st, layout, setWeek, drawWeeks,
      setRow(px) { st.row = px; drawWeeks(); },
      staffing: () => ({ N: st.N, k: above(st.N), hist: st.hist.length }),
      shareOf,
    };
  }

  /* =====================================================================================================
     The cover: keys, status, the sheet, and pointing in both directions.
     ===================================================================================================== */
  FIG.coverDashboard = coverDashboard;
  FIG.register('board', (root, F) => {
    const t = F.t, num = F.num, fr = F.fr, esc = F.esc;
    const uid = 'cv-' + (root.id || 'board');
    const lab = t(LABELS);
    const href = (n) => {
      const l = window.GUIDE_DATA && window.GUIDE_DATA.links && window.GUIDE_DATA.links.rule;
      return typeof l === 'function' ? l(n) : t(RULES[n].link);
    };
    const keysHTML = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1, R = RULES[n];
      return `<button type="button" class="cv-key" role="radio" aria-checked="false" data-n="${n}" tabindex="${n === 1 ? 0 : -1}" aria-label="${esc(fr(t(T.ruleAria, n, t(R.title))))}" style="--i:${i}"><span class="cv-kb">${n}</span><span class="cv-kw" aria-hidden="true">${t(R.key)}</span></button>`;
    }).join('');
    root.innerHTML = `<div class="cv cv-cover">
      <div class="cv-bar"><div class="cv-keys" role="radiogroup" aria-label="${esc(lab.keysAria)}">${keysHTML}</div>
        <div class="cv-strip" aria-hidden="true"><b></b><span></span></div></div>
      <div class="cv-status" id="${uid}-status"><div class="cv-which"></div><div class="cv-text" aria-live="polite"></div></div>
      <section class="cv-sheet" aria-label="${esc(t(T.sheetTitle))}"><header class="cv-head"><h3>${t(T.sheetTitle)}</h3><span>${t(T.sheetHint)}</span></header>
        <div class="cv-dash"></div>
        <div class="cv-ov" aria-hidden="true"><div class="cv-cols">${'<i></i>'.repeat(12)}</div><div class="cv-tags"></div><div class="cv-boxes"></div></div></section>
      <div class="cv-status cv-measure" aria-hidden="true"><div class="cv-which"></div><div class="cv-text"></div></div>
    </div>`;
    const fig = root.closest('figure'), heading = document.getElementById('ex-h');
    if (fig && heading && !fig.hasAttribute('aria-labelledby')) fig.setAttribute('aria-labelledby', 'ex-h');
    const $ = (s) => root.querySelector(s);
    const bar = $('.cv-bar'), keysEl = $('.cv-keys'), strip = $('.cv-strip'), statusEl = $('.cv-status'), sheet = $('.cv-sheet');
    const whichEl = statusEl.querySelector('.cv-which'), textEl = statusEl.querySelector('.cv-text');
    const meas = $('.cv-measure'), boxesEl = $('.cv-boxes'), tagsEl = $('.cv-tags');
    const keys = [...root.querySelectorAll('.cv-key')];
    const mqPhone = window.matchMedia('(max-width:639px)'), mqStack = window.matchMedia('(max-width:1079px)');
    const touchy = () => window.matchMedia('(hover:none)').matches;

    /* state: one pinned selection, one transient one (pointer or keyboard), and the week or staffing reading */
    const S = { pin: null, tr: null, week: null, staff: false };
    const same = (a, b) => !!a && !!b && a.t === b.t && (a.t === 'rule' ? a.n === b.n : a.id === b.id);
    const sel = () => (S.tr ? S.tr.sel : S.pin);
    let lastPT = 'mouse';

    const dash = coverDashboard(F, $('.cv-dash'), {
      rows: 'ABCD', uid, describedBy: `${uid}-status`,
      onWeek: (w, src) => { S.week = w; if (w != null) S.staff = false; if (src === 'touch' && w != null) { S.pin = { t: 'region', id: 'weeks' }; S.tr = null; } apply(); },
      onStaff: (phase, ev) => {
        if (phase === 'blur') { if (!S.tr || !same(S.tr.sel, { t: 'region', id: 'next' })) S.staff = false; renderStatus(); return; }
        S.staff = true; S.week = null;
        if (phase === 'start' && lastPT === 'touch') { S.pin = { t: 'region', id: 'next' }; S.tr = null; }
        apply();
        if (phase === 'end' && lastPT !== 'touch' && ev) { // after a drag, pointing follows the pointer again
          const el = document.elementFromPoint(ev.clientX, ev.clientY), f = el && el.closest && el.closest('.cv-f');
          if (f && root.contains(f)) point({ t: 'region', id: f.dataset.region }); else scheduleClear();
        }
      },
      onSettle: () => placeBoxes(currentBoxes),
      onLayout: () => { reserve(); placeBoxes(currentBoxes); },
    });
    const fields = dash.fields, byRegion = dash.byRegion;
    const allF = (id) => byRegion[id] || [];
    const P = (s) => [...root.querySelectorAll(s)];

    /* ---------- what each rule points at (figspec/r0.json rules[n].highlight) ---------- */
    function targets(s) {
      const box = (els, kind = 'part', pad) => ({ els: els.filter(Boolean), kind, pad });
      const whole = (id) => allF(id).map((f) => box([f], 'field'));
      if (!s) return { bright: null, dims: [], boxes: [], cols: false };
      if (s.t === 'region') return { bright: new Set(allF(s.id)), dims: [], boxes: whole(s.id), cols: false };
      const kp = allF('instruments');
      switch (s.n) {
        case 1: return { bright: null, dims: [], boxes: [], cols: true };
        case 2: return { bright: new Set(kp), dims: [], boxes: whole('instruments') };
        case 3: return { bright: new Set(allF('weeks')), dims: P('.cv-weeks [data-part="wk-revenue"], .cv-weeks [data-part="wk-axis"]'), boxes: [box(P('.cv-anc[data-anc="wk-signups"], .cv-anc[data-anc="wk-orders"]'))] };
        case 4: return { bright: new Set(allF('cash')), dims: [], boxes: whole('cash') };
        case 5: return { bright: new Set(allF('regions')), dims: [], boxes: whole('regions') };
        case 6: return { bright: new Set([...allF('weeks'), ...allF('next')]), dims: P('.cv-weeks [data-part="wk-signups"], .cv-weeks [data-part="wk-orders"], .cv-weeks [data-part="wk-axis"], [data-part="nx-count"], [data-part="nx-notes"]'), boxes: [box(P('.cv-anc[data-anc="wk-revenue"]')), box(P('[data-part="nx-plot"]'))] };
        case 7: return { bright: new Set(allF('weeks')), dims: [], boxes: whole('weeks') };
        case 8: return { bright: new Set(allF('products')), dims: [], boxes: whole('products') };
        case 9: return { bright: new Set([...allF('products'), ...kp]), dims: P('[data-part="pr-name"], [data-part="pr-bar"], [data-part="kpi-head"], [data-part="kpi-scale"], [data-part="kpi-foot"]'), boxes: [box(P('[data-part="pr-orders"], [data-part="pr-rev"]')), box(P('[data-part="pr-chg"]')), ...kp.map((f) => box([f.querySelector('.cv-kn'), f.querySelector('.cv-ku')], 'part', 6))] };
        case 10: return { bright: new Set(allF('next')), dims: P('[data-part="nx-count"]'), boxes: [box(P('[data-part="nx-plot"]')), box(P('[data-part="nx-notes"]'))] };
        case 11: return { bright: new Set(allF('next')), dims: P('[data-part="nx-dots"], [data-part="nx-notes"]'), boxes: [box(P('[data-part="nx-zone"], [data-part="nx-staff"]')), box(P('[data-part="nx-count"]'))] };
        case 12: return { bright: new Set(allF('words')), dims: [], boxes: whole('words') };
        default: return { bright: null, dims: [], boxes: [], cols: false };
      }
    }

    /* ---------- outlines: a pool of boxes that slide from target to target ---------- */
    let currentBoxes = [];
    const pool = [];
    function placeBoxes(list) {
      currentBoxes = list || [];
      const base = sheet.getBoundingClientRect();
      const rects = currentBoxes.map((b) => {
        const u = union(b.els.map((el) => el.getBoundingClientRect()));
        if (!u) return null;
        const o = b.kind === 'field' ? 2 : b.pad != null ? b.pad : 8;
        const rf = b.kind === 'field' ? (parseFloat(getComputedStyle(b.els[0]).borderTopLeftRadius) || 12) + 2 : 10;
        return { x: u.left - base.left - o, y: u.top - base.top - o, w: u.width + 2 * o, h: u.height + 2 * o, r: rf };
      }).filter(Boolean);
      while (pool.length < rects.length) { const d = document.createElement('i'); d.className = 'cv-bx'; boxesEl.appendChild(d); pool.push(d); }
      pool.forEach((d, i) => {
        const r = rects[i];
        if (!r) { d.classList.remove('is-on'); return; }
        const fresh = !d.classList.contains('is-on');
        if (fresh) d.classList.add('cv-nt');
        d.style.transform = `translate(${r.x.toFixed(1)}px,${r.y.toFixed(1)}px)`;
        d.style.width = r.w.toFixed(1) + 'px';
        d.style.height = r.h.toFixed(1) + 'px';
        d.style.borderRadius = r.r + 'px';
        if (fresh) { void d.offsetWidth; d.classList.remove('cv-nt'); }
        d.classList.add('is-on');
      });
    }
    function placeTags(on) {
      if (!on || mqStack.matches) { tagsEl.innerHTML = ''; return; }
      const base = sheet.getBoundingClientRect();
      tagsEl.innerHTML = fields.map((f) => {
        const r = f.getBoundingClientRect();
        return `<span class="cv-tag" style="left:${(r.right - base.left - 12).toFixed(1)}px;top:${(r.top - base.top - 10).toFixed(1)}px">${t(T.columns, SPAN[f.dataset.region])}</span>`;
      }).join('');
    }
    function highlight(s) {
      const g = targets(s);
      fields.forEach((f) => f.classList.toggle('cv-dim', !!g.bright && !g.bright.has(f)));
      P('[data-part].cv-dim').forEach((el) => { if (!g.dims.includes(el)) el.classList.remove('cv-dim'); });
      g.dims.forEach((el) => el.classList.add('cv-dim'));
      root.classList.toggle('cv-cols-on', !!g.cols);
      placeBoxes(g.boxes);
      placeTags(!!g.cols);
    }

    /* ---------- the status: default, rule, region, week, staffing ---------- */
    function model() {
      const s = sel();
      if (S.staff) {
        const { N, k } = dash.staffing(), n = num(N);
        let lead;
        if (k === 0) lead = F.lang === 'fr' ? `<b>Effectif pour ${n} commandes.</b> ${fr(t(STATUS.staffing.none))} L’issue médiane est ${num(1240)}.` : `<b>Staff for ${n} orders.</b> ${t(STATUS.staffing.none)} The median outcome is ${num(1240)}.`;
        else if (k === 1) lead = F.lang === 'fr' ? `<b>Effectif pour ${n} commandes${NN}: 1 issue sur 20 est au-dessus, soit ${dash.shareOf(1)} de risque de manquer.</b> L’issue médiane est ${num(1240)}.` : `<b>Staff for ${n} orders: 1 of 20 outcomes is higher, a ${dash.shareOf(1)} chance of running short.</b> The median outcome is ${num(1240)}.`;
        else lead = fr(fill(t(STATUS.staffing), { N: n, k: num(k), share: dash.shareOf(k) })).replace(/1 240|1,240/, num(1240));
        const strip2 = lead.replace(/<\/?b>/g, '').replace(/^[^:]*:\s*/, '');
        return { which: [lab.reading, t(T.weekN, 13), ''], plab: t(T.readingWeek, 13), lead, mixed: true, strip: [t(T.staffTitle, n), k === 0 ? fr(t(STATUS.staffing.none)) : strip2.charAt(0).toUpperCase() + strip2.slice(1)] };
      }
      if (S.week != null) {
        const w = S.week, i = w - 1;
        const sig = SIGN[i] > ROWS[0].r.hi || SIGN[i] < ROWS[0].r.lo || ORD[i] > ROWS[1].r.hi || ORD[i] < ROWS[1].r.lo;
        const clause = t(STATUS.week.signalClause)[sig ? 'signal' : 'inside'];
        const lead = fr(fill(t(STATUS.week), { w: num(w), signups: num(SIGN[i]), orders: num(ORD[i]), revenue: num(REV[i], 1), signalClause: clause }));
        const plain = lead.replace(/<\/?b>/g, '');
        return { which: [lab.reading, t(T.weekN, w), ''], plab: t(T.readingWeek, w), lead, mixed: true, strip: [t(T.weekN, w), plain.replace(/^[^:]*:\s*/, '')] };
      }
      if (!s) {
        const D = t(STATUS.default);
        return { which: [D.which[0], D.which[1], ''], plab: t(T.readingWeek, 12), lead: fr(D.lead), rest: fr(D.rest), hint: fr(touchy() ? t(T.hintTouch) : D.hint), strip: [t(T.readingWeek, 12), fr(D.lead)] };
      }
      if (s.t === 'rule') {
        const R = RULES[s.n];
        return { which: [t(T.ruleOf, s.n), fr(t(R.title)), `<a href="${esc(href(s.n))}">${t(T.readIt, R.ch)}</a>`], lead: fr(t(R.one)), soft: true, rest: fr(t(R.here)), strip: [fr(t(T.stripRule, s.n, t(R.title))), fr(t(R.one))] };
      }
      const title = REGION_TITLE[s.id], list = t(T.rulesList, REGION_RULES[s.id]), sent = fr(t(REGION_SENT[s.id]));
      const tail = sent.replace(/^[^:]*:\s*/, '');
      return { which: [lab.region, t(title), list], lead: sent, soft: true, strip: [fr(t(T.stripRegion, t(title), list.toLowerCase(), s.id === 'instruments')), tail.charAt(0).toUpperCase() + tail.slice(1)] };
    }
    const REGION_TITLE = { instruments: { en: 'Instruments', fr: 'Instruments' }, weeks: T.wkTitle, cash: T.cashTitle, regions: T.regTitle, products: T.prTitle, next: T.nxTitle, words: T.wdTitle };
    const whichHTML = (m) => `${m.plab ? `<span class="cv-plab">${m.plab}</span>` : ''}<span class="cv-w1">${m.which[0]}</span><span class="cv-w2">${m.which[1]}</span>${m.which[2] ? `<span class="cv-w3">${m.which[2]}</span>` : ''}`;
    const textHTML = (m) => `<p class="cv-lead${m.soft ? ' is-soft' : ''}${m.mixed ? ' is-mixed' : ''}">${m.lead}</p>${m.rest ? `<p class="cv-rest">${m.rest}</p>` : ''}${m.hint ? `<p class="cv-hint">${m.hint}</p>` : ''}`;
    let lastStatus = '';
    function renderStatus() {
      const m = model();
      const wh = whichHTML(m), tx = textHTML(m);
      if (wh + tx === lastStatus) return;
      lastStatus = wh + tx;
      whichEl.classList.toggle('has-plab', !!m.plab);
      whichEl.innerHTML = wh;
      textEl.innerHTML = tx;
      strip.firstChild.innerHTML = m.strip[0];
      strip.lastChild.innerHTML = m.strip[1];
      if (!F.reduce) { statusEl.classList.remove('cv-x'); void statusEl.offsetWidth; statusEl.classList.add('cv-x'); }
    }
    // Reserve the tallest status at this width, so pointing never moves the page.
    function reserve() {
      const mw = meas.querySelector('.cv-which'), mt = meas.querySelector('.cv-text');
      const save = { pin: S.pin, tr: S.tr, week: S.week, staff: S.staff };
      let max = 0;
      const tryM = (o) => { Object.assign(S, o); const m = model(); mw.classList.toggle('has-plab', !!m.plab); mw.innerHTML = whichHTML(m); mt.innerHTML = textHTML(m); max = Math.max(max, meas.offsetHeight); };
      tryM({ pin: null, tr: null, week: null, staff: false });
      for (let n = 1; n <= 12; n++) tryM({ pin: { t: 'rule', n }, tr: null, week: null, staff: false });
      ORDER.forEach((id) => tryM({ pin: { t: 'region', id }, tr: null, week: null, staff: false }));
      [1, 5, 12].forEach((w) => tryM({ pin: null, tr: null, week: w, staff: false }));
      tryM({ pin: null, tr: null, week: null, staff: true });
      Object.assign(S, save);
      statusEl.style.minHeight = max + 'px';
    }

    /* ---------- apply the state ---------- */
    function apply() {
      const s = sel();
      keys.forEach((k) => {
        const n = +k.dataset.n;
        const on = !!s && s.t === 'rule' && s.n === n;
        const lit = !!s && s.t === 'region' && REGION_RULES[s.id].includes(n);
        k.setAttribute('aria-checked', String(on));
        k.classList.toggle('is-on', on || lit);
      });
      root.classList.toggle('cv-pinned', !!S.pin);
      highlight(s);
      renderStatus();
    }
    const setTr = (s, src) => {
      const next = s ? { sel: s, src } : null;
      if ((next && S.tr && same(next.sel, S.tr.sel) && next.src === S.tr.src) || (!next && !S.tr)) return;
      S.tr = next;
      if (!s || !same(s, { t: 'region', id: 'next' })) S.staff = false;
      apply();
    };
    const release = () => { S.pin = null; S.tr = null; S.staff = false; if (S.week != null) dash.setWeek(null, 'esc'); S.week = null; apply(); };
    function togglePin(s) {
      if (same(S.pin, s)) { S.pin = null; if (S.tr && same(S.tr.sel, s) && S.tr.src !== 'ptr') S.tr = null; }
      else { S.pin = s; S.tr = S.tr && same(S.tr.sel, s) ? S.tr : null; }
      if (!same(s, { t: 'region', id: 'next' })) S.staff = false;
      apply();
      return !!S.pin && same(S.pin, s);
    }

    /* ---------- phone: the sticky bar, scrolling to a target, sliding the scroller ---------- */
    let cvTop = 0;
    const measureTop = () => {
      const h = document.querySelector('.g-head');
      cvTop = h ? Math.round(h.getBoundingClientRect().height) : 0;
      root.style.setProperty('--cv-top', cvTop + 'px');
    };
    let stuckRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(stuckRaf);
      stuckRaf = requestAnimationFrame(() => {
        if (!mqPhone.matches) { bar.classList.remove('is-stuck'); return; }
        const b = bar.getBoundingClientRect(), s = statusEl.getBoundingClientRect(), r = root.getBoundingClientRect();
        const stuck = b.top <= cvTop + 1 && s.bottom < b.bottom + 2 && r.bottom > b.bottom + strip.offsetHeight + 40;
        bar.classList.toggle('is-stuck', stuck);
      });
    };
    let scrollStop = () => {};
    function scrollToTarget(s) {
      const g = targets(s);
      let el = g.boxes.length ? union(g.boxes[0].els.map((x) => x.getBoundingClientRect())) : null;
      if (!el && s.t === 'region') el = allF(s.id)[0] && allF(s.id)[0].getBoundingClientRect();
      if (!el) el = sheet.getBoundingClientRect();
      const offset = cvTop + bar.offsetHeight + strip.offsetHeight + 12;
      const y = Math.max(0, window.scrollY + el.top - offset);
      scrollStop();
      scrollStop = F.tween(window.scrollY, y, 300, (v) => window.scrollTo(0, v), F.ease.inOut);
    }
    // The scroller slides its lit keys into view, centred as a group (the first of them never leaves the left edge).
    function slideKeys() {
      const lit = keys.filter((x) => x.classList.contains('is-on'));
      if (!lit.length || keysEl.scrollWidth <= keysEl.clientWidth) return;
      const pad = parseFloat(getComputedStyle(keysEl).paddingLeft) || 0;
      const a = lit[0].offsetLeft, z = lit[lit.length - 1].offsetLeft + lit[lit.length - 1].offsetWidth;
      const left = Math.min(a - pad, (a + z) / 2 - keysEl.clientWidth / 2);
      keysEl.scrollTo({ left: Math.max(0, left), behavior: F.reduce ? 'auto' : 'smooth' });
    }

    /* ---------- pointer ---------- */
    // Pointing settles after 60 ms on one target, so a pointer crossing the keys or the sheet does not flicker through them.
    let dwell = 0, pending = null, leaveT = 0;
    const scheduleClear = () => { clearTimeout(leaveT); leaveT = setTimeout(() => { if (S.tr && S.tr.src === 'ptr') setTr(null); }, 140); };
    const point = (s) => {
      if (dash.st.dragging) return;
      clearTimeout(leaveT);
      if (pending && same(pending, s)) return;
      clearTimeout(dwell);
      pending = null;
      if (S.tr && same(S.tr.sel, s)) return;
      pending = s;
      dwell = setTimeout(() => { pending = null; setTr(s, 'ptr'); }, 60);
    };
    const unpoint = () => { clearTimeout(dwell); pending = null; };
    root.addEventListener('pointerdown', (e) => { lastPT = e.pointerType || 'mouse'; }, true);
    keysEl.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const k = e.target.closest('.cv-key');
      if (k) point({ t: 'rule', n: +k.dataset.n });
    });
    keysEl.addEventListener('pointerout', (e) => { if (e.pointerType !== 'touch' && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.cv-key'))) unpoint(); });
    bar.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { unpoint(); scheduleClear(); } });
    statusEl.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') clearTimeout(leaveT); });
    statusEl.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') scheduleClear(); });
    const dashEl = $('.cv-dash');
    dashEl.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const f = e.target.closest('.cv-f');
      if (f) point({ t: 'region', id: f.dataset.region });
    });
    sheet.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { unpoint(); if (!dash.st.dragging) scheduleClear(); } });
    root.addEventListener('click', (e) => {
      const k = e.target.closest('.cv-key');
      if (k) {
        const s = { t: 'rule', n: +k.dataset.n };
        if (togglePin(s) && mqPhone.matches) scrollToTarget(s);
        return;
      }
      if (e.target.closest('a, button, .cv-handle')) return;
      if (e.target.closest('.cv-status, .cv-strip')) { if (S.pin) release(); return; }
      const f = e.target.closest('.cv-f');
      if (!f) return;
      if (lastPT === 'touch' && e.target.closest('.cv-hit')) return; // a tap on the weeks plot reads a week (and pins the region)
      const s = { t: 'region', id: f.dataset.region };
      if (togglePin(s) && mqStack.matches) slideKeys();
    });
    document.addEventListener('click', (e) => { if ((S.pin || S.week != null) && !root.contains(e.target)) release(); });

    /* ---------- keyboard ---------- */
    const rove = (k) => keys.forEach((x) => (x.tabIndex = x === k ? 0 : -1));
    keysEl.addEventListener('keydown', (e) => {
      const k = e.target.closest('.cv-key'); if (!k) return;
      const i = +k.dataset.n - 1;
      const j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: 11 }[e.key];
      if (j == null) return;
      e.preventDefault();
      const nk = keys[(j + 12) % 12];
      nk.focus();
      if (mqStack.matches) nk.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: F.reduce ? 'auto' : 'smooth' });
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (S.pin || S.tr || S.week != null || S.staff) { e.preventDefault(); release(); } return; }
      const f = e.target.classList && e.target.classList.contains('cv-f') ? e.target : null;
      if (!f) return;
      if (f.dataset.region === 'weeks' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        dash.setWeek((S.week || 12) + (e.key === 'ArrowRight' ? 1 : -1), 'kbd');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePin({ t: 'region', id: f.dataset.region });
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.pin && !root.contains(document.activeElement)) release(); });
    root.addEventListener('focusin', (e) => {
      const vis = e.target.matches && e.target.matches(':focus-visible');
      const k = e.target.closest('.cv-key');
      if (k) { rove(k); if (vis) setTr({ t: 'rule', n: +k.dataset.n }, 'kbd'); return; }
      const f = e.target.closest('.cv-f');
      if (f && vis) setTr({ t: 'region', id: f.dataset.region }, 'kbd');
    });
    root.addEventListener('focusout', (e) => {
      const to = e.relatedTarget;
      if (to && root.contains(to)) {
        if (S.week != null && e.target.classList && e.target.classList.contains('cv-weeks') && !e.target.contains(to)) dash.setWeek(null, 'kbd');
        return;
      }
      if (S.tr && S.tr.src === 'kbd') { S.tr = null; S.staff = false; }
      if (S.week != null && e.target.classList && e.target.classList.contains('cv-weeks')) { dash.setWeek(null, 'kbd'); return; }
      apply();
    });

    /* ---------- entrance of the keys and the status ---------- */
    if (!F.reduce && 'IntersectionObserver' in window) {
      root.classList.add('cv-pre');
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        root.classList.remove('cv-pre');
        root.classList.add('cv-in');
        setTimeout(() => root.classList.remove('cv-in'), 1600);
      }, { threshold: 0.2 });
      io.observe(bar);
    }

    /* ---------- layout ---------- */
    const relayout = () => { measureTop(); reserve(); highlight(sel()); onScroll(); };
    F.onResize(root, relayout);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measureTop(); onScroll(); }, { passive: true });
    measureTop();
    reserve();
    apply();
    onScroll();
  });
})();

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

/* Rule 5 · Surface lab (stage demo-surfaces).
   Paper: "Fig · 5 · Surfaces" (7MX-0) and its interacting state (7WF-0); spec figspec/r5.json.
   Four small models, each with one switch and its own reading (the panel's status line):
   A, enclosure beats nearness (regions drawn around the wider gaps regroup the dots);
   B, one grey on two grounds (simultaneous contrast; a bridge joins the chips);
   C, corners that nest (the inner radius becomes outer − inset);
   D, tone ranks but only the printed number counts (five regions shaded by sign-ups). */
(() => {
  'use strict';

  /* ---------- the models ---------- */
  const DOTS = [38, 86, 166, 214, 294, 342, 422, 470]; // on a 508 px view, centred at 254
  const REGIONS = [[1, 2], [3, 4], [5, 6]]; // dots 2–3, 4–5, 6–7
  const TILES = [
    { k: 'north', v: 420, tone: '#BDC3CA', dark: false },
    { k: 'south', v: 380, tone: '#D3D7DE', dark: false },
    { k: 'east', v: 610, tone: '#57606D', dark: true },
    { k: 'west', v: 590, tone: '#616A77', dark: true },
    { k: 'central', v: 450, tone: '#ADB3BC', dark: false },
  ];
  const VIEW_W = 508; // the views are 508 × 160 in Paper

  /* ---------- words ---------- */
  const T = {
    title: { en: 'Surface lab', fr: 'Laboratoire des surfaces' },
    hint: { en: 'four small models, one switch each', fr: 'quatre petits modèles, un interrupteur chacun' },
    A: {
      title: { en: 'Enclosure beats nearness', fr: 'Le contour l’emporte sur la proximité' },
      sw: { en: 'Draw regions', fr: 'Tracer les régions' },
      aria: { en: 'Eight dots in four close pairs', fr: 'Huit points en quatre paires rapprochées' },
      ariaOn: { en: 'Eight dots; three regions enclose pairs across the wider gaps', fr: 'Huit points ; trois régions entourent des paires par-dessus les écarts larges' },
      off: {
        en: ['Nearness groups the dots.', 'With no regions drawn, each dot pairs with its close neighbour.'],
        fr: ['La proximité groupe les points.', 'Sans région tracée, chaque point s’apparie à son proche voisin.'],
      },
      on: {
        en: ['The regions win.', 'Each region pairs two dots across the wider gap, so enclosure overrides nearness.'],
        fr: ['Les régions l’emportent.', 'Chaque région apparie deux points par-dessus l’écart le plus large : le contour l’emporte sur la proximité.'],
      },
    },
    B: {
      title: { en: 'One grey, two grounds', fr: 'Un gris, deux fonds' },
      sw: { en: 'Join the chips', fr: 'Relier les pastilles' },
      aria: { en: 'Two chips of the same grey on a dark and a light ground', fr: 'Deux pastilles du même gris sur un fond sombre et un fond clair' },
      off: {
        en: ['The left chip looks lighter.', 'The two chips sit on grounds of different tone. Join them to compare.'],
        fr: ['La pastille de gauche paraît plus claire.', 'Les deux pastilles reposent sur des fonds de tons différents. Reliez-les pour comparer.'],
      },
      on: {
        en: ['They are one grey, #98A2B1.', 'The ground changes how a tone looks, so a tone cannot carry a value from one surface to another.'],
        fr: ['C’est un seul gris, #98A2B1.', 'Le fond change l’apparence d’un ton : un ton ne peut donc pas porter une valeur d’une surface à l’autre.'],
      },
    },
    C: {
      title: { en: 'Corners that nest', fr: 'Des coins imbriqués' },
      sw: { en: 'Inner = outer − inset', fr: 'Intérieur = extérieur − retrait' },
      aria: { en: 'A rounded surface nested in another', fr: 'Une surface arrondie imbriquée dans une autre' },
      labels: { en: ['outer 36 · inset 20 · inner 36', 'inner 36 − 20 = 16'], fr: ['extérieur 36 · retrait 20 · intérieur 36', 'intérieur 36 − 20 = 16'] },
      off: {
        en: ['Equal radii leave a thick corner.', 'The band between the two edges swells where they turn.'],
        fr: ['Des rayons égaux laissent un coin épais.', 'La bande entre les deux bords enfle là où ils tournent.'],
      },
      on: {
        en: ['36 − 20 = 16, and the edges run parallel.', 'The inset stays even all the way round the corner.'],
        fr: ['36 − 20 = 16, et les bords restent parallèles.', 'Le retrait reste égal tout autour du coin.'],
      },
    },
    D: {
      title: { en: 'Tone ranks, numbers count', fr: 'Le ton classe, les nombres comptent' },
      sw: { en: 'Print the numbers', fr: 'Imprimer les nombres' },
      aria: { en: 'Five regions shaded by sign-ups', fr: 'Cinq régions ombrées selon les inscriptions' },
      regions: {
        en: { north: 'North', south: 'South', east: 'East', west: 'West', central: 'Central' },
        fr: { north: 'Nord', south: 'Sud', east: 'Est', west: 'Ouest', central: 'Centre' },
      },
      off: {
        en: ['East and West look alike.', 'Tone ranks the regions roughly, but it cannot say how much more.'],
        fr: ['L’Est et l’Ouest se ressemblent.', 'Le ton classe grossièrement les régions, mais il ne peut pas dire de combien.'],
      },
      on: {
        en: (e, w, s, k) => [`East ${e}, West ${w}, South ${s}.`, `Printed, the amounts compare exactly: East is ${k} times South.`],
        fr: (e, w, s, k) => [`Est ${e}, Ouest ${w}, Sud ${s}.`, `Imprimés, les montants se comparent exactement : l’Est vaut ${k} fois le Sud.`],
      },
    },
  };

  FIG.register('demo-surfaces', (root, F) => {
    const st = { A: false, B: false, C: false, D: false };
    const RG = F.t(T.D.regions);
    const val = (k) => TILES.find((t) => t.k === k).v;
    const reading = (id, on) => {
      const r = on && id === 'D' ? F.t(T.D.on, F.num(val('east')), F.num(val('west')), F.num(val('south')), F.num(val('east') / val('south'), 1)) : F.t(T[id][on ? 'on' : 'off']);
      return [F.fr(r[0]), F.fr(r[1])];
    };

    /* ---------- markup: four panels, each a field with a header, a view and its reading ---------- */
    const views = {
      A: () => REGIONS.map(() => '<i class="f2-r5-reg"></i>').join('') + DOTS.map((_, j) => `<i class="f2-r5-dot" style="--d:${100 + 40 * j}ms"></i>`).join(''),
      B: () => '<i class="f2-r5-gr f2-r5-gl"></i><i class="f2-r5-gr f2-r5-grr"></i><i class="f2-r5-bridge"></i><i class="f2-r5-chip"></i><i class="f2-r5-chip"></i>',
      C: () => `<div class="f2-r5-spec"><i class="f2-r5-outer"></i><i class="f2-r5-inner"></i>${F.t(T.C.labels).map((l, i) => `<span class="f2-r5-cl f2-r5-cl${i}">${l}</span>`).join('')}</div>`,
      D: () => TILES.map((t, i) => `<i class="f2-r5-tile${t.dark ? ' is-dark' : ''}" style="--tone:${t.tone};--d:${240 + 30 * i}ms"><b>${F.num(t.v)}</b></i><span class="f2-r5-tl">${RG[t.k]}</span>`).join(''),
    };
    const panel = (id, i) => {
      const [a0, a1] = reading(id, false), [b0, b1] = reading(id, true);
      return F.field(`<div class="f2-r5-ph"><h4>${F.t(T[id].title)}</h4>${F.toggle(id, F.t(T[id].sw), false)}</div>
        <div class="f2-r5-view f2-r5-v${id}" style="--d:${80 * i}ms" role="img" aria-label="${F.esc(F.fr(F.t(T[id].aria)))}">${views[id]()}</div>
        <div class="f2-r5-read" aria-hidden="true"><p class="is-on"><b>${F.esc(a0)}</b> <span>${F.esc(a1)}</span></p><p><b>${F.esc(b0)}</b> <span>${F.esc(b1)}</span></p></div>
        <p class="f2-r5-sr" aria-live="polite"></p>`, `f2-r5-panel f2-r5-p${id}`);
    };
    root.innerHTML = F.sheet({ cls: 'f2-r5', title: F.t(T.title), hint: F.t(T.hint), body: `<div class="f2-r5-grid">${['A', 'B', 'C', 'D'].map(panel).join('')}</div>` });
    const sheetEl = root.querySelector('.f2-r5');
    const P = Object.fromEntries(['A', 'B', 'C', 'D'].map((id) => [id, root.querySelector(`.f2-r5-p${id}`)]));
    if (!F.reduce) sheetEl.classList.add('f2-r5-pre'); // the entrance starts from here

    /* ---------- layout of each view at its width ---------- */
    const px = (el, o) => Object.entries(o).forEach(([k, v]) => { el.style[k] = typeof v === 'number' ? `${Math.round(v * 100) / 100}px` : v; });
    const layout = () => {
      // A: the dots keep their proportions; below 508 px the spacing shrinks and so, a little, do the dots and regions
      const a = P.A.querySelector('.f2-r5-view'), Wa = a.clientWidth || VIEW_W, s = Math.min(1, Wa / VIEW_W);
      const xs = DOTS.map((x) => Wa / 2 + (x - VIEW_W / 2) * s), d = Math.max(10, 14 * s), h = Math.max(26, 38 * s);
      a.querySelectorAll('.f2-r5-dot').forEach((el, j) => px(el, { left: xs[j] - d / 2, top: 80 - d / 2, width: d, height: d }));
      a.querySelectorAll('.f2-r5-reg').forEach((el, j) => { const [p, q] = REGIONS[j]; px(el, { left: xs[p] - h / 2, top: 80 - h / 2, width: xs[q] - xs[p] + h, height: h, borderRadius: h / 2 }); });
      // B: a ground 360 × 128 split in two, a chip centred in each half, the bridge between the chips
      const b = P.B.querySelector('.f2-r5-view'), Wb = b.clientWidth || VIEW_W, gw = Math.min(360, Wb - 24), gl = (Wb - gw) / 2, half = gw / 2, c = Math.min(56, half - 40);
      const [g1, g2] = b.querySelectorAll('.f2-r5-gr'), [c1, c2] = b.querySelectorAll('.f2-r5-chip');
      px(g1, { left: gl, top: 16, width: half, height: 128 }); px(g2, { left: gl + half, top: 16, width: half, height: 128 });
      const cl = gl + half / 2 - c / 2, cr = gl + half + half / 2 - c / 2;
      px(c1, { left: cl, top: 80 - c / 2, width: c, height: c }); px(c2, { left: cr, top: 80 - c / 2, width: c, height: c });
      px(b.querySelector('.f2-r5-bridge'), { left: cl + c - 2, top: 72, width: cr - cl - c + 4, height: 16 });
      // C: the outer surface 240 × 136 (narrower if it must), the inner one inset by 20
      const cv = P.C.querySelector('.f2-r5-view'), Wc = cv.clientWidth || VIEW_W, ow = Math.min(240, Wc - 24);
      px(cv.querySelector('.f2-r5-spec'), { left: (Wc - ow) / 2, top: 12, width: ow, height: 136 });
      // D: five tiles of 84 (smaller on narrow views), 8 apart, their names under them
      const dv = P.D.querySelector('.f2-r5-view'), Wd = dv.clientWidth || VIEW_W, t = Math.min(84, Math.floor((Wd - 32) / 5)), tl = (Wd - (5 * t + 32)) / 2;
      dv.querySelectorAll('.f2-r5-tile').forEach((el, i) => px(el, { left: tl + i * (t + 8), top: 20 + (84 - t) / 2, width: t, height: t }));
      dv.querySelectorAll('.f2-r5-tl').forEach((el, i) => px(el, { left: tl + i * (t + 8) - 4, top: 20 + (84 - t) / 2 + t + 10, width: t + 8 }));
    };

    /* ---------- switches ---------- */
    const set = (id, on) => {
      st[id] = on;
      P[id].classList.toggle('is-on', on);
      const [r0, r1] = P[id].querySelectorAll('.f2-r5-read p');
      r0.classList.toggle('is-on', !on); r1.classList.toggle('is-on', on);
      const [l0, l1] = reading(id, on);
      P[id].querySelector('.f2-r5-sr').textContent = `${l0} ${l1}`;
      if (id === 'A') P.A.querySelector('.f2-r5-view').setAttribute('aria-label', F.fr(F.t(on ? T.A.ariaOn : T.A.aria)));
    };
    F.bind(root, { sw: Object.fromEntries(['A', 'B', 'C', 'D'].map((id) => [id, (on) => set(id, on)])) });

    /* ---------- start ---------- */
    layout();
    F.onResize(sheetEl, () => layout());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
    F.enter(root, () => { sheetEl.classList.remove('f2-r5-pre'); });
  });
})();

/* Rule 6 · One job for each fill (stage demo-notation).
   Paper: "Fig · 6 · Notation" (81N-0) and its interacting state (87G-0); spec figspec/r6.json.
   An illustrative year of monthly revenue: actual (solid slate, January to July), forecast (hatched, August to
   December), the plan (a dashed sleeve) and last year (a light bar). Coded by fill, the series stay apart in grey.
   The segmented control recodes the same chart by hue, printed in grey (#98A2B1 for all four, the hues named in the
   key only): the bars merge and the key stops working. Point at a month (hover, tap, arrow keys) to read it. */
(() => {
  'use strict';

  /* ---------- the data ---------- */
  const LY = [92, 88, 101, 104, 110, 115, 108, 112, 120, 126, 138, 152];
  const PLAN = [100, 95, 110, 112, 118, 124, 117, 121, 130, 136, 149, 164];
  const THIS = [97, 99, 112, 108, 123, 128, 121, 125, 133, 141, 154, 170]; // actual Jan–Jul, forecast Aug–Dec
  const ACTUAL_TO = 7; // months 0–6 are actual
  const GREY = '#98A2B1', SLATE = '#5A6676', LIGHT = '#B7BFCA';
  // The plot block: 272 tall, 0–180 on y 248 → 8 (4/3 px per $K), months from x 48 in slots of 84 (min. 56).
  const BASE = 248, TOP = 8, X0 = 48, MIN_SLOT = 56, H = 272;
  const yOf = (v) => BASE - (v / 180) * (BASE - TOP);

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
  // Colour between two hex greys (fills cross-fade while the coding changes).
  const mix = (a, b, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
  // A dashed outline (4 3) drawn up to a share p of its length L.
  const dashDraw = (L, p) => {
    if (p >= 1) return '4 3';
    if (p <= 0) return `0 ${r2(L + 10)}`;
    const l = L * p, a = [];
    for (let s = 0; s < l;) { a.push(r2(Math.min(4, l - s))); s += 4; if (s >= l) break; a.push(r2(Math.min(3, l - s))); s += 3; }
    if (a.length % 2) a.push(r2(L + 10)); else a.push(0, r2(L + 10));
    return a.join(' ');
  };

  /* ---------- words ---------- */
  const T = {
    title: { en: 'One job for each fill', fr: 'Un rôle pour chaque remplissage' },
    hint: { en: 'illustrative monthly revenue, $K', fr: 'chiffre d’affaires mensuel, à titre d’exemple, en k$' },
    codes: { en: [['fill', 'By fill'], ['hue', 'By hue, printed in grey']], fr: [['fill', 'Par le remplissage'], ['hue', 'Par la teinte, imprimé en gris']] },
    codeAria: { en: 'Coding', fr: 'Codage' },
    keyFill: { en: ['Actual', 'Forecast', 'Plan', 'Last year'], fr: ['Réel', 'Prévision', 'Plan', 'Année précédente'] },
    keyHue: { en: ['Actual, blue', 'Forecast, orange', 'Plan, green', 'Last year, violet'], fr: ['Réel, bleu', 'Prévision, orange', 'Plan, vert', 'Année précédente, violet'] },
    keyNote: { en: 'as printed in grey', fr: 'tels qu’imprimés en gris' },
    mon: {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    },
    month: {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    },
    chartAria: {
      en: 'Monthly revenue: actual January to July, forecast August to December, with the plan and last year. Arrow keys read each month.',
      fr: 'Chiffre d’affaires mensuel : réel de janvier à juillet, prévision d’août à décembre, avec le plan et l’année précédente. Les flèches lisent chaque mois.',
    },
    onPlan: { en: (d) => (d ? `${d} on plan` : 'on plan'), fr: (d) => (d ? `${d} face au plan` : 'pile sur le plan') },
    // the status
    fillNone: {
      en: ['Fill carries the meaning.', 'Solid is actual, hatched is forecast, the dashed sleeve is the plan and the light bar is last year, and it all reads in grey.'],
      fr: ['Le remplissage porte le sens.', 'Le plein est le réel, le hachuré la prévision, le contour pointillé le plan et la barre claire l’année précédente, et tout se lit en gris.'],
    },
    fillLead: {
      en: (m, kind, v, p) => `${m}: ${kind ? 'forecast' : 'actual'} ${v} against a plan of ${p}.`,
      fr: (m, kind, v, p) => `${m} : ${kind ? 'prévision' : 'réel'} ${v} face à un plan de ${p}.`,
    },
    fillRest: {
      en: (d, ad, pc, up, ly) => `That is ${d === 0 ? 'exactly on plan' : `${ad} ${d > 0 ? 'over' : 'under'} plan`}, and ${pc === null ? `level with last year’s ${ly}` : `${pc} ${up ? 'up' : 'down'} on last year’s ${ly}`}.`,
      fr: (d, ad, pc, up, ly) => `Soit ${d === 0 ? 'exactement le plan' : `${ad} ${d > 0 ? 'au-dessus du' : 'sous le'} plan`}, et ${pc === null ? `autant que les ${ly} de l’année précédente` : `${pc} ${up ? 'de plus' : 'de moins'} que les ${ly} de l’année précédente`}.`,
    },
    hueNone: {
      en: ['Coded by hue and printed in grey, the series merge.', 'The key’s four colours have become one grey, so it can no longer say which bar is which.'],
      fr: ['Codées par la teinte et imprimées en gris, les séries se confondent.', 'Les quatre couleurs de la légende sont devenues un seul gris : elle ne peut plus dire quelle barre est laquelle.'],
    },
    hueLead: { en: (m, a, b, c) => `${m} reads ${a}, ${b} and ${c}, but which is the plan?`, fr: (m, a, b, c) => `${m} affiche ${a}, ${b} et ${c}, mais lequel est le plan ?` },
    hueRest: { en: 'Printed in grey, the key’s four hues have become one grey.', fr: 'Imprimées en gris, les quatre teintes de la légende sont devenues un seul gris.' },
  };

  FIG.register('demo-notation', (root, F) => {
    const st = { code: 'fill', m: -1 };
    const hid = `${root.id}-hatch`;
    const KF = F.t(T.keyFill), KH = F.t(T.keyHue), MON = F.t(T.mon), MONTH = F.t(T.month);

    /* ---------- markup ---------- */
    const hatchDefs = (id) => `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="1.5" height="5" fill="${SLATE}"/></pattern></defs>`;
    const swatch = (kind) => kind === 'forecast'
      ? `<svg class="f2-r6-sw" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">${hatchDefs(hid + '-k')}<rect x=".75" y=".75" width="12.5" height="12.5" fill="url(#${hid}-k)" stroke="${SLATE}" stroke-width="1.5"/></svg>`
      : `<i class="f2-r6-sw f2-r6-sw-${kind}" aria-hidden="true"></i>`;
    const keyFill = ['actual', 'forecast', 'plan', 'ly'].map((k, i) => `<span class="f2-r6-ki">${swatch(k)}${KF[i]}</span>`).join('');
    const keyHue = KH.map((l) => `<span class="f2-r6-ki"><i class="f2-r6-sw f2-r6-sw-grey" aria-hidden="true"></i>${l}</span>`).join('') + `<span class="f2-r6-kn">${F.t(T.keyNote)}</span>`;
    root.innerHTML = F.sheet({
      cls: 'f2-r6',
      title: F.t(T.title),
      hint: F.t(T.hint),
      controls: F.seg('code', F.t(T.codes), st.code, F.t(T.codeAria)),
      body: F.field(`<div class="f2-r6-key"><div class="f2-r6-kf is-on">${keyFill}</div><div class="f2-r6-kh" aria-hidden="true">${keyHue}</div></div>
        <div class="f2-r6-scroll" tabindex="0" role="group" aria-label="${F.esc(F.fr(F.t(T.chartAria)))}"><div class="f2-r6-plot"><i class="f2-r6-band"></i><div class="f2-r6-svgw"></div><div class="f2-r6-card" aria-hidden="true"></div></div></div>`, 'f2-r6-chartf'),
    });
    const $ = (s) => root.querySelector(s);
    const sheetEl = $('.f2-r6'), scroll = $('.f2-r6-scroll'), plotEl = $('.f2-r6-plot'), svgw = $('.f2-r6-svgw'), band = $('.f2-r6-band'), card = $('.f2-r6-card');
    const keyF = $('.f2-r6-kf'), keyH = $('.f2-r6-kh');

    /* ---------- the plot: built once per width, then updated in place ---------- */
    let R = null;
    const build = () => {
      const avail = Math.max(240, Math.round(scroll.clientWidth)), slot = Math.max(MIN_SLOT, Math.min(84, (avail - X0) / 12));
      const W = Math.round(X0 + 12 * slot);
      plotEl.style.width = `${W}px`;
      let s = hatchDefs(hid);
      [50, 100, 150].forEach((v) => { s += F.line(X0, yOf(v) + 0.5, W, yOf(v) + 0.5, 'f2-r6-gl'); });
      [0, 50, 100, 150].forEach((v) => { s += F.text(36, yOf(v) + 4, F.num(v), 'f2-r6-ax', 'end'); });
      s += F.line(X0, BASE + 0.5, W, BASE + 0.5, 'f2-r6-base');
      for (let m = 0; m < 12; m++) {
        const fc = m >= ACTUAL_TO;
        s += `<g class="f2-r6-m" data-m="${m}"><rect class="f2-r6-ly"/><path class="f2-r6-sleeve"/><rect class="f2-r6-ph" fill="${GREY}"/>`
          + (fc ? `<rect class="f2-r6-fc" fill="url(#${hid})"/><rect class="f2-r6-ty" fill="${GREY}"/>` : '<rect class="f2-r6-ty"/>')
          + `</g>`;
        s += F.text(X0 + slot * (m + 0.5), BASE + 8 + 12, MON[m], 'f2-r6-ax', 'middle');
      }
      svgw.innerHTML = `<svg class="f2-svg f2-r6-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${s}</svg>`;
      const svg = svgw.firstChild;
      R = { W, slot, svg, months: [...svg.querySelectorAll('.f2-r6-m')].map((g) => ({ ly: g.querySelector('.f2-r6-ly'), sl: g.querySelector('.f2-r6-sleeve'), ph: g.querySelector('.f2-r6-ph'), fc: g.querySelector('.f2-r6-fc'), ty: g.querySelector('.f2-r6-ty') })) };
      band.style.width = `${r2(slot)}px`;
      paint();
      placeBand(false);
      placeCard();
    };

    /* ---------- drawing ---------- */
    const shown = { h: 0, f: 0 }; // h: geometry fill → hue (300 ms); f: fills fill → hue (200 ms)
    let clock = 0; // the entrance clock in ms; null once entered
    const paint = () => {
      if (!R) return;
      const k = clock, h = shown.h, f = shown.f;
      R.months.forEach((M, m) => {
        const c = X0 + R.slot * (m + 0.5), g = k == null ? 1 : EASE(clamp((k - 20 * m) / 400, 0, 1));
        const sp = k == null ? 1 : clamp((k - 20 * m - 400) / 300, 0, 1);
        // a bar from the base to v (grown by g); an outlined bar is inset by half its 1.5 px stroke, its foot on the base
        const bar = (el, x, w, v, inset) => {
          const top = yOf(v * g), i = inset ? 0.75 : 0;
          el.setAttribute('x', r2(x + i)); el.setAttribute('width', r2(Math.max(0, w - 2 * i)));
          el.setAttribute('y', r2(top + i)); el.setAttribute('height', r2(Math.max(0, BASE - top - i)));
        };
        // last year: 12 wide at c − 23 (light), or 14 wide (grey)
        bar(M.ly, c - 23, 12 + 2 * h, LY[m]);
        M.ly.setAttribute('fill', mix(LIGHT, GREY, f));
        // the plan: a dashed sleeve 30 wide at c − 7 from the base to the plan, or a grey bar 14 wide at c + 9
        const px = c - 7 + 16 * h, pw = 30 - 16 * h, py = yOf(PLAN[m] * (sp > 0 || k == null ? 1 : 0));
        const L = pw + 2 * (BASE - py);
        M.sl.setAttribute('d', sp > 0 || k == null ? `M${r2(px)},${BASE} V${r2(py)} H${r2(px + pw)} V${BASE}` : '');
        M.sl.setAttribute('stroke-dasharray', k == null ? '4 3' : dashDraw(L, sp));
        M.sl.setAttribute('opacity', r2(1 - f));
        bar(M.ph, px, pw, PLAN[m] * (k == null ? 1 : sp > 0 ? 1 : 0));
        M.ph.setAttribute('opacity', r2(f));
        // this year: 22 wide at c − 3 (solid actual, hatched forecast), or 14 wide at c − 7 (grey)
        const tx = c - 3 - 4 * h, tw = 22 - 8 * h;
        if (M.fc) { bar(M.fc, tx, tw, THIS[m], true); M.fc.setAttribute('opacity', r2(1 - f)); bar(M.ty, tx, tw, THIS[m]); M.ty.setAttribute('opacity', r2(f)); }
        else { bar(M.ty, tx, tw, THIS[m]); M.ty.setAttribute('fill', mix(SLATE, GREY, f)); }
      });
      keyF.style.opacity = k == null ? '' : r2(EASE(clamp(k / 400, 0, 1)));
    };

    // The pointed month: a band behind its slot (slides 150 ms), a card beside its bars (fades in with a 4 px rise).
    const placeBand = (animate) => {
      if (!R) return;
      if (st.m < 0) { band.classList.remove('on'); return; }
      const x = X0 + R.slot * st.m;
      if (!band.classList.contains('on') || !animate) { band.style.transition = 'none'; band.style.transform = `translateX(${r2(x)}px)`; void band.offsetWidth; band.style.transition = ''; }
      else band.style.transform = `translateX(${r2(x)}px)`;
      band.classList.add('on');
    };
    const placeCard = () => {
      if (!R || st.m < 0) { card.classList.remove('on'); return; }
      const m = st.m, c = X0 + R.slot * (m + 0.5), fc = m >= ACTUAL_TO, d = THIS[m] - PLAN[m];
      const mark = (cls) => (cls === 'forecast' ? `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x=".75" y=".75" width="8.5" height="8.5" fill="url(#${hid})" stroke="${SLATE}" stroke-width="1.5"/></svg>` : `<i class="f2-r6-cm f2-r6-sw-${cls}"></i>`);
      const row = (cls, name, v) => `<div class="f2-r6-cr">${mark(cls)}${name ? `<span>${name}</span>` : ''}<b>${v}</b></div>`;
      card.innerHTML = `<div class="f2-r6-ct">${MONTH[m]}</div>` + (st.code === 'fill'
        ? row(fc ? 'forecast' : 'actual', KF[fc ? 1 : 0], F.num(THIS[m])) + row('plan', KF[2], F.num(PLAN[m])) + row('ly', KF[3], F.num(LY[m])) + `<div class="f2-r6-cr f2-r6-cd"><i class="f2-r6-cm"></i><b>${F.t(T.onPlan, d ? F.signed(d) : 0)}</b></div>`
        : row('grey', '', F.num(LY[m])) + row('grey', '', F.num(THIS[m])) + row('grey', '', F.num(PLAN[m])));
      const cw = card.offsetWidth || 120, chh = card.offsetHeight || 100, left = m >= 10 ? c - 23 - 14 - cw : c + 23 + 14;
      const top = clamp(yOf(Math.max(LY[m], PLAN[m], THIS[m])) - 8, 0, BASE - chh);
      card.style.left = `${r2(clamp(left, 0, R.W - cw))}px`;
      card.style.top = `${r2(top)}px`;
      card.classList.add('on');
    };

    const write = () => {
      const m = st.m;
      let lead, rest;
      if (st.code === 'fill') {
        if (m < 0) [lead, rest] = F.t(T.fillNone);
        else {
          const v = THIS[m], p = PLAN[m], ly = LY[m], d = v - p, pc = Math.round(((v - ly) / ly) * 100);
          lead = F.t(T.fillLead, MONTH[m], m >= ACTUAL_TO, F.num(v), F.num(p));
          rest = F.t(T.fillRest, d, F.num(Math.abs(d)), pc === 0 ? null : F.pct(Math.abs(pc)), pc > 0, F.num(ly));
        }
      } else if (m < 0) [lead, rest] = F.t(T.hueNone);
      else { lead = F.t(T.hueLead, MONTH[m], F.num(LY[m]), F.num(THIS[m]), F.num(PLAN[m])); rest = F.t(T.hueRest); }
      F.status(root, `<b>${F.esc(F.fr(lead))}</b> ${F.esc(F.fr(rest))}`);
    };

    /* ---------- changes ---------- */
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
      if (F.reduce) { delete chans[key]; shown[key] = val; return; }
      chans[key] = { from: shown[key], to: val, ms, t0: null };
      if (!raf) raf = requestAnimationFrame(frame);
    };
    let cancelEntry = null;
    const settle = () => { if (clock === null) return; if (cancelEntry) cancelEntry(); clock = null; };
    const recode = (code) => {
      settle();
      st.code = code;
      const hue = code === 'hue';
      sheetEl.classList.toggle('is-hue', hue);
      keyF.classList.toggle('is-on', !hue); keyH.classList.toggle('is-on', hue);
      keyF.setAttribute('aria-hidden', String(hue)); keyH.setAttribute('aria-hidden', String(!hue));
      to('h', hue ? 1 : 0, 300);
      to('f', hue ? 1 : 0, 200);
      paint();
      placeCard();
      write();
    };
    F.bind(root, { seg: { code: (v) => recode(v) } });

    // Pointing: hover or tap a month; or Tab into the chart and use the arrow keys (Escape clears).
    const point = (m, animate = true) => {
      if (m === st.m) return;
      st.m = m;
      placeBand(animate);
      placeCard();
      write();
      if (m >= 0 && scroll.scrollWidth > scroll.clientWidth && R) {
        const x = X0 + R.slot * m, l = scroll.scrollLeft, w = scroll.clientWidth;
        if (x < l + 8) scroll.scrollLeft = Math.max(0, x - 24);
        else if (x + R.slot + 140 > l + w) scroll.scrollLeft = x + R.slot + 140 - w;
      }
    };
    const monthAt = (e) => {
      if (!R) return -1;
      const r = plotEl.getBoundingClientRect(), x = e.clientX - r.left;
      const m = Math.floor((x - X0) / R.slot);
      return x >= X0 && m >= 0 && m < 12 ? m : -1;
    };
    plotEl.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') point(monthAt(e)); });
    plotEl.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && !(document.activeElement === scroll && scroll.matches(':focus-visible'))) point(-1); });
    plotEl.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { const m = monthAt(e); point(m === st.m ? -1 : m); } });
    scroll.addEventListener('focus', () => { if (st.m < 0 && scroll.matches(':focus-visible')) point(0, false); });
    scroll.addEventListener('blur', () => point(-1));
    scroll.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (d) { e.preventDefault(); point(st.m < 0 ? (d > 0 ? 0 : 11) : clamp(st.m + d, 0, 11)); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); point(e.key === 'Home' ? 0 : 11); }
      else if (e.key === 'Escape' && st.m >= 0) { e.preventDefault(); point(-1); }
    });

    /* ---------- start ---------- */
    write();
    build();
    F.onResize(scroll, () => build());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeCard());
    F.enter(root, (still) => {
      if (clock === null) return;
      if (still) { clock = null; paint(); return; }
      const total = 20 * 11 + 400 + 300;
      cancelEntry = F.tween(0, total, total, (ms) => { clock = ms; paint(); if (ms >= total) clock = null; }, F.ease.lin);
    });
  });
})();

/* Rule 7 · Share one axis (stage demo-axis).
   Paper: "Fig · 7 · Share one axis" (49T-0) and its interacting state (4CX-0); spec figspec/r7.json.
   Four weekly measures of a generic online business stacked on one set of week columns. Point at a week (hover, drag,
   touch, or arrow keys on the focused stack) to read all four down one line. "Own axes" gives each panel its own,
   slightly offset time scale, so the same vertical line meets a different week in each panel. "Order" slides the rows. */
(() => {
  'use strict';
  const NN = '\u202F', NB = '\u00A0';
  const WEEKS = 12;
  // Illustrative weekly figures. Revenue = orders × $52 average order, in $ thousands, rounded to 0.1.
  const SERIES = [
    { key: 'visitors', d: 1, dom: [38, 52], off: 0, v: [40.0, 41.2, 42.0, 42.9, 43.6, 44.8, 45.5, 46.1, 47.0, 47.8, 48.6, 49.5] },
    { key: 'signups', d: 0, dom: [600, 1600], off: 0.25, v: [1200, 1240, 1260, 1290, 1310, 1340, 760, 1180, 1410, 1430, 1460, 1490] },
    { key: 'orders', d: 0, dom: [350, 600], off: -0.75, v: [470, 480, 490, 500, 505, 515, 525, 390, 470, 540, 550, 560] },
    { key: 'revenue', d: 1, dom: [18, 31], off: -0.6, v: [24.4, 25.0, 25.5, 26.0, 26.3, 26.8, 27.3, 20.3, 24.4, 28.1, 28.6, 29.1] },
  ];
  const ORDERS = { funnel: ['visitors', 'signups', 'orders', 'revenue'], dip: ['signups', 'orders', 'revenue', 'visitors'] };

  const T = {
    title: { en: 'One axis, read down', fr: 'Un axe, lu de haut en bas' },
    hint: { en: 'four measures over twelve weeks · illustrative', fr: 'quatre mesures, douze semaines · données d’exemple' },
    order: { en: 'Order', fr: 'Ordre' },
    orderAria: { en: 'Order of the rows', fr: 'Ordre des lignes' },
    orders: {
      en: [['funnel', 'Funnel'], ['dip', 'Largest dip'], ['az', 'A to Z']],
      fr: [['funnel', 'Entonnoir'], ['dip', 'Plus forte baisse'], ['az', 'De A à Z']],
    },
    own: { en: 'Own axes', fr: 'Axes propres' },
    week: { en: (w) => `Week ${w}`, fr: (w) => `Semaine ${w}` },
    axis: { en: 'Week', fr: 'Semaine' },
    wk: { en: (w) => `wk ${w}`, fr: (w) => `sem. ${w}` },
    names: {
      en: { visitors: ['Visitors', 'thousands'], signups: ['Sign-ups', 'new accounts'], orders: ['Orders', 'placed'], revenue: ['Revenue', '$ thousands'] },
      fr: { visitors: ['Visiteurs', 'milliers'], signups: ['Inscriptions', 'nouveaux comptes'], orders: ['Commandes', 'passées'], revenue: ['Chiffre d’affaires', 'milliers de dollars'] },
    },
    stackAria: { en: 'Four weekly measures on one week axis', fr: 'Quatre mesures hebdomadaires sur un même axe des semaines' },
    // aria-valuetext of the stack; o = formatted values, k = the week each panel reads (differs from w under own axes)
    valuetext: {
      en: (w, o, k) => `Week ${w}: visitors ${o.visitors} thousand${k.visitors}, sign-ups ${o.signups}${k.signups}, orders ${o.orders}${k.orders}, revenue ${o.revenue} thousand dollars${k.revenue}`,
      fr: (w, o, k) => `Semaine ${w}${NN}: visiteurs ${o.visitors} milliers${k.visitors}, inscriptions ${o.signups}${k.signups}, commandes ${o.orders}${k.orders}, chiffre d’affaires ${o.revenue} milliers de dollars${k.revenue}`,
    },
    fromWeek: { en: (k) => ` (week ${k})`, fr: (k) => ` (semaine ${k})` },
    // status sentences
    defLead: { en: 'Sign-ups fell in week 7, orders and revenue in week 8.', fr: 'Les inscriptions ont chuté en semaine 7, les commandes et le chiffre d’affaires en semaine 8.' },
    defRest: {
      en: 'Visitors held, so the drop began at sign-up and reached orders a week later.',
      fr: `Les visiteurs se sont maintenus${NN}: la baisse est partie de l’inscription et a atteint les commandes une semaine plus tard.`,
    },
    ptLead: { en: (w, note) => `Week ${w}: ${note}`, fr: (w, note) => `Semaine ${w}${NN}: ${note}` },
    ptRest: {
      en: (o) => `Visitors ${o.visitors}${NB}k, sign-ups ${o.signups}, orders ${o.orders}, revenue $${o.revenue}${NB}k.`,
      fr: (o) => `Visiteurs ${o.visitors}${NN}k, inscriptions ${o.signups}, commandes ${o.orders}, chiffre d’affaires ${o.revenue}${NN}k$.`,
    },
    notes: {
      en: { trend: 'all four on trend.', w7: (n) => `sign-ups fell to ${n} while visitors held.`, w8: (n) => `orders fell to ${n}, a week after sign-ups.`, w9: 'sign-ups back, orders and revenue recovering.', back: 'all four back on trend.' },
      fr: {
        trend: 'les quatre mesures suivent leur tendance.',
        w7: (n) => `les inscriptions sont tombées à ${n} alors que les visiteurs se maintenaient.`,
        w8: (n) => `les commandes sont tombées à ${n}, une semaine après les inscriptions.`,
        w9: 'les inscriptions reviennent, les commandes et le chiffre d’affaires se redressent.',
        back: 'les quatre mesures ont retrouvé leur tendance.',
      },
    },
    ownLead: {
      en: (w, k) => `With own axes, week ${w} of visitors lines up with week ${k} of orders and revenue.`,
      fr: (w, k) => `Avec des axes propres, la semaine ${w} des visiteurs s’aligne sur la semaine ${k} des commandes et du chiffre d’affaires.`,
    },
    ownSame: { en: 'With own axes, the panels no longer share their weeks.', fr: 'Avec des axes propres, les panneaux ne partagent plus leurs semaines.' },
    ownRest: { en: 'The one-week lag can no longer be read by looking down.', fr: 'Le décalage d’une semaine ne se lit plus de haut en bas.' },
  };

  FIG.register('demo-axis', (root, F) => {
    const L = F.t(T.names);
    const narrow = window.matchMedia ? matchMedia('(max-width:1079px)') : { matches: false };
    const st = { w: WEEKS, pointed: false, own: false, order: 'funnel' };
    const az = SERIES.map((s) => s.key).sort((a, b) => L[a][0].localeCompare(L[b][0], F.lang));
    const orderOf = (o) => (o === 'az' ? az : ORDERS[o] || ORDERS.funnel);
    // The week a panel reads under the shared line: its own week under own axes (the line is shifted by `off` weeks).
    const local = (s, w = st.w) => (st.own ? Math.min(WEEKS, Math.max(1, Math.round(w - s.off))) : w);
    const fmt = (s, v) => F.num(v, s.d);

    /* ---------- markup ---------- */
    const rowsHTML = SERIES.map((s) => `<div class="r7-row" data-k="${s.key}">
      <div class="r7-read"><div class="r7-name"><b>${L[s.key][0]}</b><span>${L[s.key][1]}</span></div>
        <div class="r7-val"><span class="r7-num">${fmt(s, 0)}</span><span class="r7-wk"></span></div></div>
      <div class="r7-plot"></div></div>`).join('');
    const ticksHTML = Array.from({ length: WEEKS }, (_, i) => `<span class="r7-tick" data-w="${i + 1}" style="left:${(((i + 0.5) / WEEKS) * 100).toFixed(4)}%"><span>${F.num(i + 1)}</span><b>${F.num(i + 1)}</b></span>`).join('');
    const inner = `<div class="r7-top"><span class="r7-cap" aria-hidden="true"></span><div class="r7-pz" aria-hidden="true"><span class="r7-pill"><span class="r7-pillt"></span></span></div></div>
      <div class="r7-stack" tabindex="0" role="slider" aria-label="${F.esc(F.t(T.stackAria))}" aria-valuemin="1" aria-valuemax="${WEEKS}" aria-valuenow="${st.w}">${rowsHTML}</div>
      <div class="r7-axis" aria-hidden="true"><span class="r7-axt">${F.t(T.axis)}</span><div class="r7-ticks">${ticksHTML}</div></div>`;
    const controls = `<span class="r7-ord"><span class="r7-ord-lab" aria-hidden="true">${F.t(T.order)}</span>${F.seg('order', F.t(T.orders), st.order, F.t(T.orderAria))}</span>${F.toggle('own', F.t(T.own), st.own)}`;
    root.innerHTML = F.sheet({ cls: 'r7', title: F.t(T.title), hint: F.t(T.hint), controls, body: F.field(inner, 'r7-field') });
    if (!F.reduce) root.classList.add('r7-pre');

    const $ = (s) => root.querySelector(s);
    const sheet = $('.f2-sheet'), stack = $('.r7-stack'), cap = $('.r7-cap'), pill = $('.r7-pill'), pillT = $('.r7-pillt');
    const ticks = [...root.querySelectorAll('.r7-tick')];
    const rows = SERIES.map((s) => {
      const el = root.querySelector(`.r7-row[data-k="${s.key}"]`);
      return { s, el, plot: el.querySelector('.r7-plot'), num: el.querySelector('.r7-num'), wk: el.querySelector('.r7-wk') };
    });

    /* ---------- geometry ---------- */
    const geo = { pw: 800, ph: 80, slot: 80, band: 800 / WEEKS };
    const xOf = (wk) => (wk - 0.5) * geo.band;
    const yOf = (s, v) => geo.ph - 12 - ((v - s.dom[0]) / (s.dom[1] - s.dom[0])) * (geo.ph - 24);
    const valAt = (s, d) => {
      const i = Math.min(WEEKS - 1, Math.max(0, d - 1)), i0 = Math.floor(i), i1 = Math.min(WEEKS - 1, i0 + 1);
      return s.v[i0] + (s.v[i1] - s.v[i0]) * (i - i0);
    };

    // What is shown now (tweened toward the state): the line's shared week, each panel's week, each readout value.
    const disp = { pos: st.w, d: {}, val: {} };
    SERIES.forEach((s) => { disp.d[s.key] = st.w; disp.val[s.key] = F.reduce ? s.v[st.w - 1] : 0; });
    let entered = !!F.reduce, counting = false;

    const drawRow = (r) => {
      const s = r.s, pts = s.v.map((v, i) => [xOf(i + 1), yOf(s, v)]);
      const own = s.v.map((_, i) => F.line(xOf(i + 1), geo.ph - 5, xOf(i + 1), geo.ph - 1, 'r7-otick')).join('');
      r.plot.innerHTML = F.svg(geo.pw, geo.ph,
        `<g class="r7-shift"><g class="r7-oticks">${own}</g>${F.path(F.poly(pts), 'r7-line')}</g>` +
        F.line(0, 0, 0, geo.ph, 'r7-guide') +
        `<g class="r7-shift"><g class="r7-dot">${F.circle(0, 0, 6.5, 'r7-dot-o')}${F.circle(0, 0, 4.5, 'r7-dot-i')}</g></g>`,
        { cls: 'r7-svg', role: 'presentation' });
      r.path = r.plot.querySelector('.r7-line');
      r.guide = r.plot.querySelector('.r7-guide');
      r.dot = r.plot.querySelector('.r7-dot');
      r.shift = [...r.plot.querySelectorAll('.r7-shift')];
      if (!entered && !counting) { const len = r.path.getTotalLength(); r.path.style.strokeDasharray = len; r.path.style.strokeDashoffset = len; }
    };
    const shiftRows = () => rows.forEach((r) => r.shift.forEach((g) => { g.style.transform = `translateX(${st.own ? (r.s.off * geo.band).toFixed(2) : 0}px)`; }));
    const slotRows = () => {
      const ord = orderOf(st.order);
      rows.forEach((r) => { r.el.style.transform = `translateY(${ord.indexOf(r.s.key) * geo.slot}px)`; });
    };
    // Move the marks in place: the guide line and pill at the shared week, each dot at its panel's week.
    const place = () => {
      const x = xOf(disp.pos).toFixed(2);
      rows.forEach((r) => {
        r.guide.setAttribute('x1', x); r.guide.setAttribute('x2', x);
        const d = disp.d[r.s.key];
        r.dot.setAttribute('transform', `translate(${xOf(d).toFixed(2)} ${yOf(r.s, valAt(r.s, d)).toFixed(2)})`);
      });
      pill.style.left = `${(((disp.pos - 0.5) / WEEKS) * 100).toFixed(3)}%`;
    };
    const readouts = () => rows.forEach((r) => { r.num.textContent = fmt(r.s, disp.val[r.s.key]); });

    const layout = () => {
      const W = sheet.clientWidth || 1120, col = (W - 11 * 32) / 12;
      root.style.setProperty('--r7-rw', `${Math.max(150, Math.round(3 * col + 32))}px`);
      geo.ph = narrow.matches ? 72 : 80;
      geo.slot = narrow.matches ? geo.ph + 28 : geo.ph;
      root.style.setProperty('--r7-ph', `${geo.ph}px`);
      root.style.setProperty('--r7-slot', `${geo.slot}px`);
      geo.pw = Math.max(120, rows[0].plot.clientWidth || 800);
      geo.band = geo.pw / WEEKS;
      rows.forEach(drawRow);
      root.classList.add('r7-still');           // no slide while re-slotting after a resize
      shiftRows(); slotRows(); place();
      void root.offsetWidth;
      root.classList.remove('r7-still');
    };

    /* ---------- words ---------- */
    const note = (w) => {
      const N = F.t(T.notes);
      if (w <= 6) return N.trend;
      if (w === 7) return N.w7(F.num(SERIES[1].v[6]));
      if (w === 8) return N.w8(F.num(SERIES[2].v[7]));
      if (w === 9) return N.w9;
      return N.back;
    };
    const values = (w) => Object.fromEntries(SERIES.map((s) => [s.key, fmt(s, s.v[local(s, w) - 1])]));
    // the value a readout shows (and counts up to on entry): what its panel reads now
    const s0 = (s) => s.v[local(s) - 1];
    const texts = () => {
      const w = st.w, o = values(w);
      // the cap and the pill cross-fade to the new week (150 ms)
      const wl = F.t(T.week, w);
      [[cap, true], [pillT, st.pointed]].forEach(([el, shown]) => {
        if (el.textContent === wl) return;
        el.textContent = wl;
        if (!F.reduce && entered && shown) el.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 150 });
      });
      ticks.forEach((t) => t.classList.toggle('is-on', +t.dataset.w === w));
      rows.forEach((r) => { r.wk.textContent = F.t(T.wk, local(r.s, w)); });
      root.classList.toggle('r7-pt', st.pointed);
      root.classList.toggle('r7-own', st.own);
      const k = Object.fromEntries(SERIES.map((s) => [s.key, local(s, w) !== w ? F.t(T.fromWeek, local(s, w)) : '']));
      stack.setAttribute('aria-valuenow', String(w));
      stack.setAttribute('aria-valuetext', F.t(T.valuetext, w, o, k));
      let lead, rest;
      if (st.own) {
        const kk = local(SERIES[2], w);
        lead = kk === w ? F.t(T.ownSame) : F.t(T.ownLead, w, kk);
        rest = F.t(T.ownRest);
      } else if (!st.pointed) { lead = F.t(T.defLead); rest = F.t(T.defRest); }
      else { lead = F.t(T.ptLead, w, note(w)); rest = F.t(T.ptRest, o); }
      F.status(root, `<b>${lead}</b> ${rest}`);
    };

    /* ---------- changes ---------- */
    let cGlide = () => {}, cVal = () => {};
    const go = () => {
      const from = { pos: disp.pos }, to = { pos: st.w };
      SERIES.forEach((s) => { from[s.key] = disp.d[s.key]; to[s.key] = local(s); });
      cGlide();
      cGlide = F.tween(from, to, 200, (o) => { disp.pos = o.pos; SERIES.forEach((s) => { disp.d[s.key] = o[s.key]; }); place(); });
      if (!counting) {
        const vf = {}, vt = {};
        SERIES.forEach((s) => { vf[s.key] = disp.val[s.key]; vt[s.key] = s.v[local(s) - 1]; });
        cVal();
        cVal = F.tween(vf, vt, 250, (o) => { Object.assign(disp.val, o); readouts(); });
      }
      texts();
    };
    const select = (w, pointed = true) => {
      w = Math.min(WEEKS, Math.max(1, w));
      if (w === st.w && pointed === st.pointed) return;
      st.w = w; st.pointed = pointed;
      go();
    };

    F.bind(root, {
      seg: {
        order: (v) => {
          st.order = v;
          const ord = orderOf(v);
          rows.forEach((r) => { r.el.style.transitionDelay = F.reduce ? '0ms' : `${ord.indexOf(r.s.key) * 40}ms`; });
          slotRows();
        },
      },
      sw: {
        own: (on) => {
          st.own = on;
          // Turning own axes on with nothing pointed yet shows the lag case at once: week 8.
          if (on && !st.pointed) { st.w = 8; st.pointed = true; }
          shiftRows(); go();
        },
      },
    });

    /* pointing: hover, press and drag (mouse, pen, touch); the nearest week band is selected and stays selected */
    let dragging = false;
    const weekAt = (clientX, clamp) => {
      const b = rows[0].plot.getBoundingClientRect();
      if (!b.width) return null;
      const x = clientX - b.left;
      if (!clamp && (x < 0 || x > b.width)) return null;
      return Math.min(WEEKS, Math.max(1, Math.floor(x / (b.width / WEEKS)) + 1));
    };
    stack.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const w = weekAt(e.clientX, false);
      if (w == null) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      dragging = true;
      try { stack.setPointerCapture(e.pointerId); } catch (_) { /* capture is a nicety */ }
      select(w);
    });
    stack.addEventListener('pointermove', (e) => {
      if (!dragging && e.pointerType !== 'mouse') return;
      const w = weekAt(e.clientX, dragging);
      if (w != null) select(w);
    });
    const stop = () => { dragging = false; };
    stack.addEventListener('pointerup', stop);
    stack.addEventListener('pointercancel', stop);
    stack.addEventListener('lostpointercapture', stop);
    stack.addEventListener('keydown', (e) => {
      const k = e.key;
      let w = null;
      if (k === 'ArrowLeft' || k === 'ArrowDown') w = st.w - 1;
      else if (k === 'ArrowRight' || k === 'ArrowUp') w = st.w + 1;
      else if (k === 'PageDown') w = st.w - 4;
      else if (k === 'PageUp') w = st.w + 4;
      else if (k === 'Home') w = 1;
      else if (k === 'End') w = WEEKS;
      else if (k === 'Escape') { if (st.pointed || st.w !== WEEKS) { e.preventDefault(); select(WEEKS, false); } return; }
      if (w == null) return;
      e.preventDefault();
      select(w);
    });

    /* ---------- first draw, resize, entrance ---------- */
    layout();
    readouts();
    texts();
    rows.forEach((r) => r.el.classList.toggle('is-drawn', entered));
    F.onResize(rows[0].plot, layout);
    if (narrow.addEventListener) narrow.addEventListener('change', layout);

    F.enter(root, (still) => {
      if (still || entered) {
        entered = true; root.classList.remove('r7-pre');
        rows.forEach((r) => { r.el.classList.add('is-drawn'); r.path.style.strokeDasharray = ''; r.path.style.strokeDashoffset = ''; });
        SERIES.forEach((s) => { disp.val[s.key] = s0(s); });
        readouts();
        return;
      }
      counting = true;
      root.classList.remove('r7-pre');         // axis labels fade in (CSS, 300 ms)
      const ord = orderOf(st.order);
      let left = rows.length;
      rows.forEach((r) => {
        const delay = ord.indexOf(r.s.key) * 80;
        setTimeout(() => {
          F.tween(0, 1, 600, (k, raw) => {
            const len = r.path.getTotalLength();
            r.path.style.strokeDasharray = len;
            r.path.style.strokeDashoffset = len * (1 - k);
            disp.val[r.s.key] = s0(r.s) * k;
            r.num.textContent = fmt(r.s, disp.val[r.s.key]);
            if (raw >= 1) {
              r.path.style.strokeDasharray = ''; r.path.style.strokeDashoffset = '';
              r.el.classList.add('is-drawn');
              disp.val[r.s.key] = s0(r.s);
              r.num.textContent = fmt(r.s, disp.val[r.s.key]);
              if (--left === 0) { counting = false; entered = true; }
            }
          });
        }, delay);
      });
    });
  });
})();

/* Rule 8 · Tables to be read (stage demo-table).
   Paper: "Fig · 8 · Tables to be read" (4IZ-0) and its interacting state, all rules off (4QL-0); spec figspec/r8.json.
   Five regions × four measures. Five switches apply or remove one table rule each (furniture, alignment, rounding,
   order, an in-cell bar); All off / All on set the five at once. Column widths never change, so only the switched rule
   moves anything: rows slide to their order, figures slide to their edge, rounded figures cross-fade, lines fade. */
(() => {
  'use strict';
  const NN = '\u202F', NB = '\u00A0';
  const RULES = ['furniture', 'align', 'round', 'order', 'bar'];
  const COLS = ['reg', 'rev', 'ord', 'aov', 'chg'];
  // Illustrative month. Revenue = orders × average order value, exact to the cent.
  const DATA = [
    { id: 'north', rev: 1284347.28, ord: 24718, aov: 51.96, chg: 4.37 },
    { id: 'south', rev: 962078.32, ord: 19804, aov: 48.58, chg: -2.14 },
    { id: 'east', rev: 2041957.6, ord: 37262, aov: 54.8, chg: 11.62 },
    { id: 'west', rev: 731583.49, ord: 15013, aov: 48.73, chg: 0.85 },
    { id: 'central', rev: 1507150.5, ord: 28410, aov: 53.05, chg: 6.09 },
  ];
  const TYPED = DATA.map((d) => d.id);
  const BYSIZE = DATA.slice().sort((a, b) => b.rev - a.rev).map((d) => d.id);
  const MAX = Math.max(...DATA.map((d) => d.rev));

  const T = {
    title: { en: 'Five rules, one table', fr: 'Cinq règles, un tableau' },
    hint: { en: 'revenue by region · illustrative', fr: 'chiffre d’affaires par région · données d’exemple' },
    allOff: { en: 'All off', fr: 'Tout désactiver' },
    allOn: { en: 'All on', fr: 'Tout activer' },
    rules: {
      en: [['Remove grid lines and fills', 'Tschichold'], ['Align right, tabular figures', 'Schwabish'], ['Round, and state units once', 'Ehrenberg'], ['Order rows by size', 'Ehrenberg'], ['One bar in the cell', 'Rao and Card']],
      fr: [['Retirer filets et fonds', 'Tschichold'], ['Aligner à droite, chiffres tabulaires', 'Schwabish'], ['Arrondir, unité dite une fois', 'Ehrenberg'], ['Trier les lignes par taille', 'Ehrenberg'], ['Une barre dans la cellule', 'Rao et Card']],
    },
    rulesAria: { en: 'Table rules', fr: 'Règles du tableau' },
    tableAria: { en: 'Revenue, orders, average order and change on last year for five regions', fr: 'Chiffre d’affaires, commandes, panier moyen et évolution sur un an pour cinq régions' },
    headRound: { en: ['Region', 'Revenue, $ M', 'Orders, k', 'Avg. order, $', 'vs last year, %'], fr: ['Région', 'Chiffre d’affaires, M$', 'Commandes, k', 'Panier moyen, $', 'sur un an, en\u202F%'] },
    headRaw: { en: ['Region', 'Revenue', 'Orders', 'Average order value', 'Change vs last year'], fr: ['Région', 'Chiffre d’affaires', 'Commandes', 'Panier moyen', 'Évolution sur un an'] },
    regions: { en: { north: 'North', south: 'South', east: 'East', west: 'West', central: 'Central' }, fr: { north: 'Nord', south: 'Sud', east: 'Est', west: 'Ouest', central: 'Centre' } },
    allOnLead: {
      en: (a, b) => `East leads with $${a}${NB}M, nearly three times West’s $${b}${NB}M.`,
      fr: (a, b) => `L’Est mène avec ${a}${NN}M$, près de trois fois les ${b}${NN}M$ de l’Ouest.`,
    },
    allOnRest: { en: 'Ordered, rounded and set right, the revenue column reads in one pass.', fr: 'Triée, arrondie et alignée à droite, la colonne du chiffre d’affaires se lit d’un seul regard.' },
    allOffLead: { en: 'The spreadsheet default.', fr: 'Le réglage par défaut du tableur.' },
    allOffRest: {
      en: 'To find the largest region you compare five amounts of up to nine digits, set left, in the order they were typed.',
      fr: 'Pour trouver la région qui pèse le plus, il faut comparer cinq montants de neuf chiffres au plus, alignés à gauche, dans l’ordre de saisie.',
    },
    partLead: { en: (n) => `${n} of 5 rules on.`, fr: (n) => `${n} règle${n > 1 ? 's' : ''} sur 5 activée${n > 1 ? 's' : ''}.` },
    sentences: {
      en: {
        furniture: ['Without boxes and stripes, the figures are the darkest marks on the page.', 'Boxes and stripes are back, as dark as the figures they hold.'],
        align: ['Set right in tabular figures, units sit under units and the longest figure is the largest.', 'Set left, the places no longer line up, so length says nothing about size.'],
        round: ['Rounded to the digits that vary, each figure is two or three digits long, with its unit once in the header.', 'Every cent is back, and the unit repeats in every cell.'],
        order: ['Ordered by revenue, the largest region comes first and the smallest last.', 'Rows return to the order they were typed.'],
        bar: ['A bar in each revenue cell lets the eye compare lengths before reading digits.', 'Without the bar, comparing sizes means reading every figure.'],
      },
      fr: {
        furniture: ['Sans cadres ni bandes, les chiffres sont les marques les plus sombres de la page.', 'Les cadres et les bandes reviennent, aussi sombres que les chiffres qu’ils contiennent.'],
        align: ['Alignés à droite en chiffres tabulaires, les unités tombent sous les unités, et le nombre le plus long est le plus grand.', 'Alignés à gauche, les rangs ne coïncident plus, et la longueur ne dit plus rien de la taille.'],
        round: ['Arrondi aux chiffres qui varient, chaque nombre tient en deux ou trois chiffres, et son unité n’apparaît qu’une fois, dans l’en-tête.', 'Chaque centime revient, et l’unité se répète dans chaque cellule.'],
        order: ['Triée par chiffre d’affaires, la plus grande région vient en premier et la plus petite en dernier.', 'Les lignes reprennent l’ordre de saisie.'],
        bar: ['Une barre dans chaque cellule du chiffre d’affaires laisse l’œil comparer des longueurs avant de lire des chiffres.', 'Sans la barre, comparer les tailles oblige à lire chaque nombre.'],
      },
    },
  };

  FIG.register('demo-table', (root, F) => {
    const st = { furniture: true, align: true, round: true, order: true, bar: true };
    let last = null, entered = !!F.reduce;
    const R = F.t(T.regions), RL = F.t(T.rules);
    const money = (v, d) => (F.lang === 'fr' ? `${F.num(v, d)}${NN}$` : `$${F.num(v, d)}`);
    const fig = (d, c) => {
      if (c === 'rev') return st.round ? F.num(d.rev / 1e6, 2) : money(d.rev, 2);
      if (c === 'ord') return st.round ? F.num(d.ord / 1e3, 1) : F.num(d.ord, 0);
      if (c === 'aov') return st.round ? F.num(d.aov, 0) : money(d.aov, 2);
      return st.round ? F.signed(d.chg, 0) : F.pct(d.chg, 2);
    };

    /* ---------- markup ---------- */
    const switches = RULES.map((k, i) => F.toggle(k, `<span class="r8-sl"><span class="r8-lab">${RL[i][0]}</span><span class="r8-src">${RL[i][1]}</span></span>`, st[k])).join('');
    const head = COLS.map((c) => `<span role="columnheader" class="r8-th r8-${c}${c === 'reg' ? '' : ' r8-n'}"><span class="r8-t" data-key="h:${c}"></span></span>`).join('');
    const rowHTML = (d) => `<div role="row" class="r8-tr" data-key="r:${d.id}" data-id="${d.id}">` +
      `<span role="rowheader" class="r8-td r8-reg"><span class="r8-t" data-key="${d.id}:reg">${R[d.id]}</span></span>` +
      `<span role="cell" class="r8-td r8-rev r8-n"><span class="r8-grp"><span class="r8-lane" data-key="${d.id}:lane" aria-hidden="true"><i class="r8-bar" style="width:${((d.rev / MAX) * 90).toFixed(2)}%"></i></span><span class="r8-t" data-key="${d.id}:rev"></span></span></span>` +
      ['ord', 'aov', 'chg'].map((c) => `<span role="cell" class="r8-td r8-${c} r8-n"><span class="r8-t" data-key="${d.id}:${c}"></span></span>`).join('') +
      '</div>';
    const table = `<div class="r8-scroll"><div class="r8-table" role="table" aria-label="${F.esc(F.t(T.tableAria))}">` +
      '<div class="r8-fills" aria-hidden="true"></div>' +
      `<div class="r8-thead" role="rowgroup"><div class="r8-hrow" role="row" data-key="hrow">${head}</div><i class="r8-hrule" aria-hidden="true"></i></div>` +
      `<div class="r8-tbody" role="rowgroup">${DATA.map(rowHTML).join('')}</div>` +
      '<div class="r8-lines" aria-hidden="true"></div></div></div>';
    root.innerHTML = F.sheet({
      cls: 'r8', title: F.t(T.title), hint: F.t(T.hint),
      controls: F.button('alloff', F.t(T.allOff)) + F.button('allon', F.t(T.allOn)),
      body: `<div class="f2-field r8-rules" role="group" aria-label="${F.esc(F.t(T.rulesAria))}">${switches}</div>` + F.field(table, 'r8-tfield'),
    });
    if (!F.reduce) root.classList.add('r8-pre');

    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const sheet = $('.f2-sheet'), tbl = $('.r8-table'), tbody = $('.r8-tbody'), hrow = $('.r8-hrow'), hrule = $('.r8-hrule');
    const fills = $('.r8-fills'), lines = $('.r8-lines');
    const rowEl = Object.fromEntries($$('.r8-tr').map((r) => [r.dataset.id, r]));
    const byKey = (k) => root.querySelector(`[data-key="${k}"]`);

    /* ---------- state → page ---------- */
    const texts = () => {
      const H = F.t(st.round ? T.headRound : T.headRaw);
      COLS.forEach((c, i) => { byKey(`h:${c}`).textContent = H[i]; });
      DATA.forEach((d) => ['rev', 'ord', 'aov', 'chg'].forEach((c) => { byKey(`${d.id}:${c}`).textContent = fig(d, c); }));
    };
    // One figure lane for the revenue column: as wide as its widest figure, so the bars share one baseline.
    const figLane = () => {
      const rg = document.createRange();
      const w = Math.max(40, ...DATA.map((d) => { rg.selectNodeContents(byKey(`${d.id}:rev`)); return rg.getBoundingClientRect().width; }));
      root.style.setProperty('--r8-figw', `${Math.ceil(w)}px`);
    };
    const classes = () => {
      root.classList.toggle('r8-furn', st.furniture);
      root.classList.toggle('r8-al', st.align);
      root.classList.toggle('r8-rd', st.round);
      root.classList.toggle('r8-bars', st.bar);
    };
    // Spreadsheet furniture (shown when the first rule is off): fills behind the rows, lines in front, both fixed to
    // the grid positions, so rows slide under them; the header rule is the one line the clean table keeps.
    const furniture = () => {
      const tb = tbl.getBoundingClientRect(), hb = hrow.getBoundingClientRect();
      const W = tb.width, top = hb.bottom - tb.top, rh = 44, n = DATA.length, H = top + n * rh;
      const xs = [...hrow.children].slice(1).map((c) => c.getBoundingClientRect().left - tb.left);
      fills.innerHTML = `<i style="top:0;height:${top}px;background:var(--f2-relief)"></i>` +
        [1, 3].map((k) => `<i style="top:${top + k * rh}px;height:${rh}px"></i>`).join('');
      lines.innerHTML = `<b style="width:${W}px;height:${H}px"></b>` +
        xs.map((x) => `<i style="left:${(x - 1).toFixed(1)}px;top:0;width:1px;height:${H}px"></i>`).join('') +
        Array.from({ length: n }, (_, k) => `<i style="left:0;top:${top + k * rh - 1}px;width:${W}px;height:1px"></i>`).join('');
      hrule.style.top = `${top - 1}px`;
    };

    /* ---------- FLIP: remember where everything was, change, then slide from there ---------- */
    const snap = () => {
      const m = new Map();
      $$('[data-key]').forEach((el) => {
        const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
        const cell = el.closest('.r8-th, .r8-td');
        m.set(el.dataset.key, {
          l: b.left, r: b.right, t: b.top, txt: el.textContent,
          right: !!cell && cell.classList.contains('r8-n') && st.align,
          font: cs.font, color: cs.color, fvn: cs.fontVariantNumeric,
        });
      });
      return m;
    };
    const EASE_OUT = 'cubic-bezier(.33,1,.68,1)', EASE_IO = 'cubic-bezier(.65,0,.35,1)';
    const flip = (old) => {
      $$('.r8-tr').forEach((r) => {
        const o = old.get(r.dataset.key), dy = o ? o.t - r.getBoundingClientRect().top : 0;
        if (Math.abs(dy) > 0.5) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: EASE_IO });
      });
      $$('.r8-t[data-key], .r8-lane[data-key]').forEach((el) => {
        const o = old.get(el.dataset.key);
        if (!o) return;
        const b = el.getBoundingClientRect(), cell = el.closest('.r8-th, .r8-td');
        const right = !!cell && cell.classList.contains('r8-n') && st.align;
        const dx = el.classList.contains('r8-t') && right && o.right ? o.r - b.right : o.l - b.left;
        if (Math.abs(dx) > 0.5) el.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 250, easing: EASE_OUT });
        if (el.classList.contains('r8-t') && o.txt !== el.textContent) {
          // cross-fade: the old figure fades out where it was (100 ms), the new one fades in (150 ms)
          const row = el.closest('[data-key^="r:"], [data-key="hrow"]'), ro = row && old.get(row.dataset.key);
          if (row && ro) {
            const g = document.createElement('span');
            g.className = 'r8-ghost';
            g.setAttribute('aria-hidden', 'true');
            g.textContent = o.txt;
            g.style.cssText = `left:${(o.l - ro.l).toFixed(1)}px;top:${(o.t - ro.t).toFixed(1)}px;font:${o.font};color:${o.color};font-variant-numeric:${o.fvn}`;
            row.appendChild(g);
            const a = g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: 'forwards' });
            a.onfinish = () => g.remove();
            setTimeout(() => g.remove(), 400);
          }
          el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], { duration: 250, easing: 'linear' });
        }
      });
    };

    const status = () => {
      const n = RULES.filter((k) => st[k]).length;
      let lead, rest;
      if (n === RULES.length) { lead = F.t(T.allOnLead, F.num(2.04, 2), F.num(0.73, 2)); rest = F.t(T.allOnRest); }
      else if (n === 0) { lead = F.t(T.allOffLead); rest = F.t(T.allOffRest); }
      else { lead = F.t(T.partLead, n); rest = last ? F.t(T.sentences)[last.key][last.on ? 0 : 1] : ''; }
      F.status(root, `<b>${lead}</b> ${rest}`);
    };

    const apply = () => {
      const motion = entered && !F.reduce;
      const old = motion ? snap() : null;
      // rows in their order (moved first, then a style flush, so transitions started below run on the moved rows)
      (st.order ? BYSIZE : TYPED).forEach((id) => tbody.appendChild(rowEl[id]));
      void tbody.offsetHeight;
      classes();
      texts();
      figLane();
      furniture();
      if (old) flip(old);
      status();
    };

    F.bind(root, {
      sw: Object.fromEntries(RULES.map((k) => [k, (on) => { st[k] = on; last = { key: k, on }; apply(); }])),
      btn: {
        alloff: () => setAll(false),
        allon: () => setAll(true),
      },
    });
    const setAll = (on) => {
      RULES.forEach((k) => { st[k] = on; });
      $$('[data-sw]').forEach((s) => s.setAttribute('aria-checked', String(on)));
      last = null;
      apply();
    };

    /* ---------- layout on the grid: rules field 4 columns, table 8 (split at the centre of the gutter) ---------- */
    const layout = () => {
      const W = sheet.clientWidth || 1120, col = (W - 11 * 32) / 12;
      root.style.setProperty('--r8-rw', `${Math.round(4 * col + 100)}px`);
      figLane();
      furniture();
    };
    apply();
    layout();
    F.onResize(sheet, layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout).catch(() => {});

    /* ---------- entrance: rows rise and fade in, 40 ms apart; then the bars grow ---------- */
    F.enter(root, (still) => {
      root.classList.remove('r8-pre');
      entered = true;
      if (still) return;
      const rows = $$('.r8-tr');
      rows.forEach((r, i) => r.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 40, easing: EASE_OUT, fill: 'backwards' }));
      const t0 = (rows.length - 1) * 40 + 400;
      $$('.r8-bar').forEach((b) => b.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 600, delay: t0, easing: EASE_OUT, fill: 'backwards' }));
    });
  });
})();

/* Rule 9 · Type for figures (stage demo-type).
   Paper: "Fig · 9 · Type for figures" (579-0) and its interacting state (5FA-0); spec figspec/r9.json.
   One column of figures set in five open typefaces. "Bold row" sets the selected row in 700 over a grey ghost of its
   400, so any shift shows as a doubling; "Tabular figures" switches every figure between tabular and proportional
   digits. Every width is measured live in the reader's browser once the faces have loaded (400 and 700 only), and the
   status sentence is written from those measures, so it stays true in both languages (French figures carry a decimal
   comma and a thin space). */
(() => {
  'use strict';
  const NN = '\u202F', NB = '\u00A0';
  const FACES = ['Instrument Sans', 'IBM Plex Sans', 'Hanken Grotesk', 'Geist', 'Archivo'];
  // Illustrative, $ thousands: 1,204.5 − 38.0 − 96.4 = 1,070.1; 1,070.1 − 938.5 = 131.6; 131.6 ÷ 1,070.1 = 12.3 %.
  const VALUES = [1204.5, -38.0, -96.4, 1070.1, -938.5, 131.6, 12.3];
  const PCT = 6, RULED = [3, 5];
  const DIGITS = '0123456789';

  const T = {
    title: { en: 'Bold without a shift', fr: 'Le gras sans décalage' },
    hint: { en: 'one column of figures in five open typefaces', fr: 'une colonne de nombres dans cinq caractères libres' },
    bold: { en: 'Bold row', fr: 'Ligne en gras' },
    tab: { en: 'Tabular figures', fr: 'Chiffres tabulaires' },
    rows: {
      en: ['Revenue', 'Returns', 'Discounts', 'Net revenue', 'Cost of goods', 'Gross profit', 'Gross margin'],
      fr: ['Chiffre d’affaires', 'Retours', 'Remises', 'Chiffre d’affaires net', 'Coût des marchandises', 'Marge brute', 'Taux de marge brute'],
    },
    note: { en: (r) => `${r} at 56${NB}px`, fr: (r) => `${r} à 56${NB}px` },
    regular: { en: 'Regular, 400', fr: 'Normal, 400' },
    boldW: { en: 'Bold, 700', fr: 'Gras, 700' },
    wider: { en: 'Bold is wider by', fr: 'Le gras élargit de' },
    px: { en: (v) => `${v}${NB}px`, fr: (v) => `${v}${NB}px` },
    rowsAria: { en: 'Rows of figures', fr: 'Lignes de chiffres' },
    facesAria: { en: 'Typeface shown in the specimen', fr: 'Caractère montré dans le spécimen' },
    offLead: { en: 'Seven figures, five faces, every column in line.', fr: 'Sept nombres, cinq caractères, toutes les colonnes alignées.' },
    offRest: { en: 'Turn on the bold row to see which faces keep their figures still when the weight changes.', fr: 'Activez la ligne en gras pour voir quels caractères gardent leurs chiffres immobiles quand la graisse change.' },
    and: { en: 'and', fr: 'et' },
    lead: {
      en: (row, max, face, tail) => `In bold, ${row} grows ${max}${NB}px wider in ${face}${tail}.`,
      fr: (row, max, face, tail) => `En gras, la ligne ${row} s’élargit de ${max}${NB}px en ${face}${tail}.`,
    },
    leadNone: { en: (row) => `In bold, ${row} keeps its width in all five faces.`, fr: (row) => `En gras, la ligne ${row} garde sa chasse dans les cinq caractères.` },
    tailStill: { en: (f) => ` and not at all in ${f}`, fr: (f) => ` et pas du tout en ${f}` },
    tailNarrow: { en: (v, f) => ` and ${v}${NB}px narrower in ${f}`, fr: (v, f) => ` et rétrécit de ${v}${NB}px en ${f}` },
    tailLess: { en: (v, f) => ` and only ${v}${NB}px in ${f}`, fr: (v, f) => ` et de ${v}${NB}px seulement en ${f}` },
    seps: {
      en: (faces, n, chars, amount) => `${faces} widen${n > 1 ? '' : 's'} only at ${chars}, ${amount}`,
      fr: (faces, n, chars, amount) => `${faces} ne s’élargi${n > 1 ? 'ssent' : 't'} qu’${chars}, ${amount}`,
    },
    aboutPx: { en: 'about a pixel', fr: 'd’environ un pixel' },
    byPx: { en: (a) => `by ${a}${NB}px`, fr: (a) => `de ${a}${NB}px` },
    byRange: { en: (a, b) => `by ${a} to ${b}${NB}px`, fr: (a, b) => `de ${a} à ${b}${NB}px` },
    digits: {
      en: (others, n, max) => (others ? `${others}, like ${max}, widen${n > 1 ? '' : 's'} every digit` : `${max} widens every digit`),
      fr: (others, n, max) => (others ? `${others}, comme ${max}, élargi${n > 1 ? 'ssent' : 't'} chaque chiffre` : `${max} élargit chaque chiffre`),
    },
    chars: {
      en: { ',': 'the comma', '.': 'the point', '−': 'the minus', '%': 'the percent sign', ' ': 'the thin space', ' ': 'the space', ' ': 'the space' },
      fr: { ',': 'au séparateur décimal', '.': 'au point', '\u2212': 'au signe moins', '%': 'au signe %', '\u202F': 'au séparateur des milliers', '\u00A0': 'à l’espace', ' ': 'à l’espace' },
    },
    tabLead: {
      en: (faces, n) => `Without tabular figures, ${faces} fall${n > 1 ? '' : 's'} out of line.`,
      fr: (faces, n) => `Sans chiffres tabulaires, ${faces} se désaligne${n > 1 ? 'nt' : ''}.`,
    },
    tabRest: {
      en: (faces, n) => `${faces} ${n > 1 ? 'have' : 'has'} tabular digits only, so ${n > 1 ? 'their columns hold' : 'its column holds'}.`,
      fr: (faces, n) => `${faces} n’${n > 1 ? 'ont' : 'a'} que des chiffres tabulaires${NN}: ${n > 1 ? 'leurs colonnes tiennent' : 'sa colonne tient'}.`,
    },
    tabAll: { en: 'Without tabular figures, every face here keeps its digits in line.', fr: 'Sans chiffres tabulaires, chaque caractère garde ici ses chiffres alignés.' },
  };

  // The faces this figure tests: add a Google Fonts stylesheet for any the page does not load (400 and 700 only).
  const fontsReady = () => new Promise((resolve) => {
    const hrefs = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => decodeURIComponent(l.href || ''));
    const has = (f) => hrefs.some((h) => h.includes('fonts.googleapis.com') && new RegExp(`family=${f.replace(/ /g, '\\+')}(?=[:&]|$)`).test(h));
    const miss = FACES.filter((f) => !has(f));
    const done = () => {
      if (!document.fonts || !document.fonts.load) { resolve(); return; }
      const probe = `${DIGITS},.\u2212%${NN}`;
      Promise.all(FACES.flatMap((f) => [400, 700].map((w) => document.fonts.load(`${w} 18px "${f}"`, probe))))
        .catch(() => {}).then(() => document.fonts.ready).then(resolve, resolve);
    };
    if (!miss.length) { done(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${miss.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&')}&display=swap`;
    let fired = false;
    const once = () => { if (!fired) { fired = true; done(); } };
    link.addEventListener('load', once);
    link.addEventListener('error', once);
    setTimeout(once, 5000);
    document.head.appendChild(link);
  });

  FIG.register('demo-type', (root, F) => {
    const st = { row: 3, face: 0, bold: false, tab: true };
    const ROWS = F.t(T.rows);
    const fmt = (i) => (i === PCT ? F.pct(VALUES[i], 1) : F.num(VALUES[i], 1));
    const ffam = (i) => `'${FACES[i]}',ui-sans-serif,system-ui,sans-serif`;
    const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} ${F.t(T.and)} ${a[a.length - 1]}`);

    /* ---------- markup ---------- */
    const cell = (r, i) => `<span class="r9-c" data-face="${i}" style="font-family:${ffam(i)}"><span class="r9-g">${fmt(r)}</span><span class="r9-b" aria-hidden="true">${fmt(r)}</span></span>`;
    const names = FACES.map((f, i) => `<button type="button" role="radio" class="r9-fn" data-face="${i}" aria-checked="${i === st.face}" tabindex="${i === st.face ? 0 : -1}" style="font-family:${ffam(i)}">${f}</button>`).join('');
    const rows = VALUES.map((_, r) => `<div class="r9-row${RULED.includes(r) ? ' r9-ruled' : ''}" role="radio" data-row="${r}" aria-checked="${r === st.row}" tabindex="${r === st.row ? 0 : -1}" aria-label="${F.esc(ROWS[r])}"><span class="r9-lab">${ROWS[r]}</span>${FACES.map((_, i) => cell(r, i)).join('')}</div>`).join('');
    const measures = `<div class="r9-ms" aria-hidden="true"><span class="r9-lab">${F.t(T.wider)}</span>${FACES.map((_, i) => `<span class="r9-m" data-face="${i}"></span>`).join('')}</div>`;
    const matrix = `<div class="r9-scroll"><div class="r9-mx"><i class="r9-band" aria-hidden="true"></i>` +
      `<div class="r9-hd" role="radiogroup" aria-label="${F.esc(F.t(T.facesAria))}"><span class="r9-lab"></span>${names}</div>` +
      `<div class="r9-rows" role="radiogroup" aria-label="${F.esc(F.t(T.rowsAria))}">${rows}</div>${measures}</div></div>`;
    const spec = `<div class="r9-sh"><b class="r9-sface"></b><span class="r9-snote"></span></div>` +
      '<div class="r9-sbox"><span class="r9-sg"></span><span class="r9-sb" aria-hidden="true"></span></div>' +
      `<div class="r9-sm"><div><span>${F.t(T.regular)}</span><span class="r9-v" data-m="r"></span></div>` +
      `<div><span>${F.t(T.boldW)}</span><span class="r9-v" data-m="b"></span></div>` +
      `<div><span>${F.t(T.wider)}</span><span class="r9-v r9-vd" data-m="d"></span></div></div>`;
    root.innerHTML = F.sheet({
      cls: 'r9', title: F.t(T.title), hint: F.t(T.hint),
      controls: F.toggle('bold', F.t(T.bold), st.bold) + F.toggle('tab', F.t(T.tab), st.tab),
      body: F.field(spec, 'r9-spec') + F.field(matrix, 'r9-mfield'),
    });
    if (!F.reduce) root.classList.add('r9-pre');
    const probe = document.createElement('span');
    probe.className = 'r9-probe';
    probe.setAttribute('aria-hidden', 'true');
    root.appendChild(probe);

    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const sheet = $('.f2-sheet'), mx = $('.r9-mx'), band = $('.r9-band'), sbox = $('.r9-sbox'), sg = $('.r9-sg'), sb = $('.r9-sb');
    const rowEls = $$('.r9-row'), nameEls = $$('.r9-fn'), mEls = $$('.r9-m');
    const vEl = { r: $('[data-m="r"]'), b: $('[data-m="b"]'), d: $('[data-m="d"]') };

    /* ---------- measuring ---------- */
    const width = (el) => el.getBoundingClientRect().width;
    // a character's advance in em, in a face and weight, with the current figure setting
    const em = (face, wt, s) => {
      probe.style.fontFamily = ffam(face);
      probe.style.fontWeight = wt;
      probe.style.fontVariantNumeric = st.tab ? 'tabular-nums lining-nums' : 'proportional-nums lining-nums';
      probe.textContent = s;
      return width(probe) / 100;
    };
    const shown = { r: 0, b: 0, d: 0, m: FACES.map(() => 0) };
    let deltas = FACES.map(() => 0);
    let cNum = () => {};
    const measure = (animate) => {
      const row = rowEls[st.row];
      deltas = FACES.map((_, i) => { const c = row.children[i + 1]; return width(c.querySelector('.r9-b')) - width(c.querySelector('.r9-g')); });
      const to = { r: width(sg), b: width(sb) };
      to.d = to.b - to.r;
      const from = { r: shown.r, b: shown.b, d: shown.d };
      FACES.forEach((_, i) => { from[`m${i}`] = shown.m[i]; to[`m${i}`] = deltas[i]; });
      cNum();
      cNum = F.tween(from, to, animate ? 250 : 0, (o) => {
        shown.r = o.r; shown.b = o.b; shown.d = o.d;
        vEl.r.textContent = F.t(T.px, F.num(o.r, 1));
        vEl.b.textContent = F.t(T.px, F.num(o.b, 1));
        vEl.d.textContent = F.t(T.px, F.num(o.d, 1));
        FACES.forEach((_, i) => { shown.m[i] = o[`m${i}`]; mEls[i].textContent = F.t(T.px, F.num(o[`m${i}`], 1)); });
      });
      mEls.forEach((m, i) => m.classList.toggle('is-on', st.bold && Math.abs(deltas[i]) >= 0.05));
      status();
    };

    /* ---------- words, from the measures ---------- */
    const status = () => {
      let lead, rest;
      const fig = fmt(st.row), digs = [...new Set([...fig].filter((c) => DIGITS.includes(c)))];
      if (!st.bold && st.tab) { lead = F.t(T.offLead); rest = F.t(T.offRest); }
      else if (!st.bold) {
        // which faces keep one width for every digit without the tabular setting
        const hold = [], out = [];
        FACES.forEach((f, i) => { const w = [...DIGITS].map((c) => em(i, 400, c)); (Math.max(...w) - Math.min(...w) < 0.003 ? hold : out).push(f); });
        if (!out.length) { lead = F.t(T.tabAll); rest = ''; }
        else { lead = F.t(T.tabLead, list(out), out.length); rest = hold.length ? F.t(T.tabRest, list(hold), hold.length) : ''; }
      } else {
        const max = Math.max(...deltas), iMax = deltas.indexOf(max), min = Math.min(...deltas), iMin = deltas.indexOf(min);
        if (max < 0.05) { lead = F.t(T.leadNone, ROWS[st.row]); rest = ''; }
        else {
          const tail = Math.abs(min) < 0.05 ? F.t(T.tailStill, FACES[iMin]) : min < 0 ? F.t(T.tailNarrow, F.num(-min, 1), FACES[iMin]) : F.t(T.tailLess, F.num(min, 1), FACES[iMin]);
          lead = F.t(T.lead, ROWS[st.row], F.num(max, 1), FACES[iMax], iMin === iMax ? '' : tail);
          // the others: faces that widen only at their separators, and faces that widen every digit
          const groups = new Map(), widen = [];
          FACES.forEach((f, i) => {
            if (i === iMin || Math.abs(deltas[i]) < 0.05) return;
            const digitsGrow = digs.some((c) => Math.abs(em(i, 700, c) - em(i, 400, c)) > 0.005);
            if (digitsGrow) { widen.push(i); return; }
            const seps = [...new Set([...fig].filter((c) => !DIGITS.includes(c)))].filter((c) => Math.abs(em(i, 700, c) - em(i, 400, c)) > 0.01);
            const key = seps.join('');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(i);
          });
          const names = F.t(T.chars), parts = [];
          groups.forEach((faces, key) => {
            const chars = list([...key].map((c) => names[c] || `“${c}”`));
            const d = faces.map((i) => deltas[i]), lo = Math.min(...d), hi = Math.max(...d);
            const amount = lo >= 0.75 && hi <= 1.5 ? F.t(T.aboutPx) : faces.length === 1 || F.num(lo, 1) === F.num(hi, 1) ? F.t(T.byPx, F.num(hi, 1)) : F.t(T.byRange, F.num(lo, 1), F.num(hi, 1));
            if (key) parts.push(F.t(T.seps, list(faces.map((i) => FACES[i])), faces.length, chars, amount));
          });
          if (widen.length) {
            const others = widen.filter((i) => i !== iMax).map((i) => FACES[i]);
            parts.push(widen.includes(iMax) ? F.t(T.digits, list(others), others.length, FACES[iMax]) : F.t(T.digits, list(others.slice(0, -1)), others.length - 1, others[others.length - 1]));
          }
          rest = parts.length ? `${parts.join(F.lang === 'fr' ? `${NN}; ` : '; ')}.` : '';
          rest = rest.charAt(0).toUpperCase() + rest.slice(1);
        }
      }
      F.status(root, `<b>${lead}</b>${rest ? ' ' + rest : ''}`);
    };

    /* ---------- state → page ---------- */
    const placeBand = () => {
      const n = nameEls[st.face], mb = mx.getBoundingClientRect(), nb = n.getBoundingClientRect();
      const ms = $('.r9-ms').getBoundingClientRect();
      band.style.width = `${nb.width.toFixed(1)}px`;
      band.style.height = `${(ms.bottom - mb.top + 8 + 4).toFixed(1)}px`;
      band.style.transform = `translateX(${(nb.left - mb.left).toFixed(1)}px)`;
    };
    const specimen = () => {
      const f = ffam(st.face), txt = fmt(st.row);
      sbox.style.fontFamily = f;
      sg.textContent = txt; sb.textContent = txt;
      $('.r9-sface').textContent = FACES[st.face];
      $('.r9-sface').style.fontFamily = '';
      $('.r9-snote').textContent = F.t(T.note, ROWS[st.row]);
    };
    const paint = () => {
      root.classList.toggle('r9-bold', st.bold);
      root.classList.toggle('r9-prop', !st.tab);
      rowEls.forEach((r, i) => { r.classList.toggle('is-sel', i === st.row); r.setAttribute('aria-checked', String(i === st.row)); r.tabIndex = i === st.row ? 0 : -1; });
      nameEls.forEach((n, i) => { n.setAttribute('aria-checked', String(i === st.face)); n.tabIndex = i === st.face ? 0 : -1; });
      $$('[data-face]').forEach((c) => c.classList.toggle('is-face', +c.dataset.face === st.face));
      const bs = $('[data-sw="bold"]');
      if (bs) bs.setAttribute('aria-checked', String(st.bold));
      specimen();
      placeBand();
    };
    const update = (animate = true) => { paint(); measure(animate && !F.reduce); };

    // cross-fade the specimen (face change) or every figure (tabular change)
    const fadeSpecimen = () => {
      if (F.reduce || !entered) return;
      const g = sbox.cloneNode(true);
      g.classList.add('r9-sghost');
      g.setAttribute('aria-hidden', 'true');
      g.style.top = `${sbox.offsetTop}px`;
      g.style.left = `${sbox.offsetLeft}px`;
      g.style.width = `${sbox.offsetWidth}px`;
      sbox.parentNode.insertBefore(g, sbox);
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = () => g.remove();
      setTimeout(() => g.remove(), 600);
      sbox.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    };
    const fadeFigures = () => {
      if (F.reduce || !entered) return;
      $$('.r9-c, .r9-sbox').forEach((c) => c.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 150 }));
    };

    /* ---------- interactions ---------- */
    const setRow = (r, focus) => {
      r = Math.max(0, Math.min(VALUES.length - 1, r));
      const was = st.row;
      st.row = r; st.bold = true;
      if (r !== was) fadeSpecimen();
      update();
      if (focus) rowEls[r].focus();
    };
    const setFace = (i, focus) => {
      i = (i + FACES.length) % FACES.length;
      if (i !== st.face) { st.face = i; fadeSpecimen(); update(); }
      if (focus) nameEls[i].focus();
    };
    F.bind(root, {
      sw: {
        bold: (on) => { st.bold = on; update(); },
        tab: (on) => { st.tab = on; fadeFigures(); update(); },
      },
    });
    // a click on a figure picks its row (and turns the bold row on) and its face; on a face name, just the face
    root.addEventListener('click', (e) => {
      const c = e.target.closest('.r9-c[data-face], .r9-fn[data-face], .r9-m[data-face]');
      const r = e.target.closest('.r9-row');
      if (!c && !r) return;
      const nf = c ? +c.dataset.face : st.face, nr = r ? +r.dataset.row : st.row;
      if (nf !== st.face || nr !== st.row) fadeSpecimen();
      st.face = nf; st.row = nr;
      if (r) st.bold = true;
      update();
    });
    $('.r9-rows').addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); setRow(st.row + 1, true); }
      else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); setRow(st.row - 1, true); }
      else if (k === 'Home') { e.preventDefault(); setRow(0, true); }
      else if (k === 'End') { e.preventDefault(); setRow(VALUES.length - 1, true); }
      else if (k === ' ' || k === 'Enter') { e.preventDefault(); st.bold = !st.bold; update(); }
    });
    $('.r9-hd').addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); setFace(st.face + 1, true); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); setFace(st.face - 1, true); }
      else if (k === 'Home') { e.preventDefault(); setFace(0, true); }
      else if (k === 'End') { e.preventDefault(); setFace(FACES.length - 1, true); }
    });

    /* ---------- layout: specimen 4 columns, faces 8 (split at the centre of the gutter) ---------- */
    let entered = !!F.reduce;
    // a row label too long for its column (French, or a narrow window) is set on two lines at 13/15
    // (measured at its selected weight, 600, so selecting a row never truncates it)
    const ctx = document.createElement('canvas').getContext('2d');
    const fitLabels = () => $$('.r9-row .r9-lab').forEach((l) => {
      l.classList.remove('r9-two');
      if (!ctx) return;
      ctx.font = '600 14px "Instrument Sans", ui-sans-serif, system-ui, sans-serif';
      if (ctx.measureText(l.textContent).width > l.clientWidth - 2) l.classList.add('r9-two');
    });
    const layout = () => {
      const W = sheet.clientWidth || 1120, col = (W - 11 * 32) / 12;
      root.style.setProperty('--r9-sw', `${Math.round(4 * col + 100)}px`);
      fitLabels();
      root.classList.add('r9-still');
      placeBand();
      void root.offsetWidth;
      root.classList.remove('r9-still');
    };
    update(false);
    layout();
    F.onResize(sheet, () => { layout(); measure(false); });
    fontsReady().then(() => { layout(); measure(entered); });
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { layout(); measure(false); });

    /* ---------- entrance: the specimen rises, the face columns fade in left to right ---------- */
    F.enter(root, (still) => {
      root.classList.remove('r9-pre');
      entered = true;
      if (still) return;
      const ease = 'cubic-bezier(.33,1,.68,1)';
      $('.r9-spec').animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: ease, fill: 'backwards' });
      FACES.forEach((_, i) => $$(`[data-face="${i}"]`).forEach((c) => c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120 + i * 60, easing: ease, fill: 'backwards' })));
    });
  });
})();

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

/* Rule 11 · Control on its consequence (stage demo-control).
   Paper: "Fig · 11 · Control on its consequence" (6RB-0) and its interacting state (6VE-0); spec figspec/r11.json.
   The price of one generic product is a point on its own revenue curve: drag it (or focus it and use the arrow keys)
   and the margin marker, the readouts and the deltas follow. Every release leaves a ghost and a step in the history,
   which Undo (or Ctrl/Cmd+Z) walks back; Set price commits, and a price away from the recommended $40 asks for a
   reason first. Illustrative model: volume = 3,000 − 50 p a month, unit cost $20. */
(() => {
  'use strict';
  const NN = ' ', NB = ' ';
  const P0 = 30, PREC = 40, PMIN = 22, PMAX = 58, COST = 20;
  const vol = (p) => 3000 - 50 * p;
  const rev = (p) => (p * vol(p)) / 1000;            // $ thousands a month
  const mar = (p) => ((p - COST) * vol(p)) / 1000;
  const KEEP = 8;

  const T = {
    title: { en: 'A control that is its own chart', fr: 'Une commande qui est son propre graphique' },
    hint: { en: 'price of one product · drag the point · illustrative', fr: 'prix d’un produit · faites glisser le point · données d’exemple' },
    reset: { en: 'Reset', fr: 'Réinitialiser' },
    yUnit: { en: '$ thousands a month', fr: 'k$ par mois' },
    curves: { en: ['Revenue', 'Margin'], fr: ['Chiffre d’affaires', 'Marge'] },
    recommended: { en: (p) => `recommended ${p}`, fr: (p) => `recommandé, ${p}` },
    readouts: {
      en: [['Price', 'per unit'], ['Volume', 'units a month'], ['Revenue', 'a month'], ['Margin', 'a month, after cost']],
      fr: [['Prix', 'par unité'], ['Volume', 'unités par mois'], ['Chiffre d’affaires', 'par mois'], ['Marge', 'par mois, après coût']],
    },
    history: { en: 'History', fr: 'Historique' },
    moves: { en: (n) => (n ? `${n} move${n > 1 ? 's' : ''}` : 'no moves yet'), fr: (n) => (n ? `${n}${NB}déplacement${n > 1 ? 's' : ''}` : 'aucun déplacement') },
    start: { en: 'start', fr: 'départ' },
    undo: { en: 'Undo', fr: 'Défaire' },
    set: { en: 'Set price', fr: 'Fixer le prix' },
    question: { en: (p, r) => `Why ${p} and not the recommended ${r}?`, fr: (p, r) => `Pourquoi ${p} et pas le prix recommandé de ${r}${NN}?` },
    placeholder: { en: 'e.g. a competitor’s price, a contract, a clearance', fr: 'par ex. le prix d’un concurrent, un contrat, un déstockage' },
    save: { en: (p) => `Save and set ${p}`, fr: (p) => `Enregistrer et fixer ${p}` },
    cancel: { en: 'Cancel', fr: 'Annuler' },
    pointAria: { en: 'Price', fr: 'Prix' },
    plotAria: { en: 'Revenue and margin a month across prices from $20 to $60', fr: 'Chiffre d’affaires et marge par mois pour des prix de 20 $ à 60 $' },
    valuetext: {
      en: (p, v, r, m) => `${p}: ${v} units, revenue ${r} thousand, margin ${m} thousand dollars`,
      fr: (p, v, r, m) => `${p}${NN}: ${v}${NB}unités, chiffre d’affaires ${r} milliers, marge ${m} milliers de dollars`,
    },
    lead: {
      en: (p, v, r, m) => `At ${p}, ${v} units a month bring ${r} of revenue and ${m} of margin.`,
      fr: (p, v, r, m) => `À ${p}, ${v}${NB}unités par mois rapportent ${r} de chiffre d’affaires et ${m} de marge.`,
    },
    restStart: { en: (r) => `Revenue peaks here; margin peaks at the recommended ${r}.`, fr: (r) => `Le chiffre d’affaires culmine ici${NN}; la marge culmine au prix recommandé de ${r}.` },
    restRec: { en: 'This is the recommended price, where margin peaks.', fr: 'C’est le prix recommandé, là où la marge culmine.' },
    // since the start: dr, dm = formatted absolute changes; kind = 'trade' | 'both' | 'same'
    since: {
      en: (s, dr, dm, kind) => (kind === 'trade' ? `Since ${s}, ${dr} less revenue for ${dm} more margin` : kind === 'same' ? `Since ${s}, ${dr} less revenue for the same margin` : `Since ${s}, ${dr} less revenue and ${dm} less margin`),
      fr: (s, dr, dm, kind) => (kind === 'trade' ? `Depuis ${s}, ${dr} de chiffre d’affaires en moins pour ${dm} de marge en plus` : kind === 'same' ? `Depuis ${s}, ${dr} de chiffre d’affaires en moins pour une marge inchangée` : `Depuis ${s}, ${dr} de chiffre d’affaires et ${dm} de marge en moins`),
    },
    pending: { en: (p, r) => `; ${p} is not the recommended ${r}, so it asks why.`, fr: (p, r) => `${NN}; ${p} n’est pas le prix recommandé de ${r}, d’où la question.` },
    saved: { en: (p) => `; set at ${p} with a reason.`, fr: (p) => `${NN}; fixé à ${p} avec une raison.` },
    setAt: { en: (p) => `; set at ${p}.`, fr: (p) => `${NN}; fixé à ${p}.` },
  };

  FIG.register('demo-control', (root, F) => {
    const fr = F.lang === 'fr';
    const usd = (v, d = 0) => (fr ? `${F.num(v, d)}${NN}$` : `$${F.num(v, d)}`);
    const kusd = (v) => (fr ? `${F.num(v, 1)}${NN}k$` : `$${F.num(v, 1)}${NB}k`);
    const sgn = (v, d) => (Number(Number(v).toFixed(d)) > 0 ? '+' : Number(Number(v).toFixed(d)) < 0 ? '−' : '');
    const dUsd = (v, d) => `${sgn(v, d)}${usd(Math.abs(v), d)}`;
    const dK = (v) => `${sgn(v, 1)}${kusd(Math.abs(v))}`;
    const RO = F.t(T.readouts), CV = F.t(T.curves);
    // the committed history: steps of prices, the first is the start; set = the price last committed with Set price
    const st = { p: P0, trail: [{ p: P0 }], set: P0, asking: false };

    /* ---------- markup ---------- */
    const cellHTML = (i, k) => `<div class="r11-cell" data-k="${k}"><div class="r11-ch"><span>${RO[i][0]}</span><span class="r11-d"></span></div><b class="r11-v"></b><span class="r11-u">${RO[i][1]}</span></div>`;
    const cons = `<div class="r11-ro">${cellHTML(0, 'p')}${cellHTML(1, 'v')}${cellHTML(2, 'r')}${cellHTML(3, 'm')}</div>` +
      `<div class="r11-hist"><div class="r11-hh"><span>${F.t(T.history)}</span><span class="r11-n"></span></div><div class="r11-trail"></div>` +
      `<div class="r11-acts"><div class="r11-btns">${F.button('undo', F.t(T.undo))}${F.button('set', F.t(T.set))}</div>` +
      `<div class="r11-ask" hidden><label class="r11-q" for="r11-why-${Math.random().toString(36).slice(2, 7)}"></label><input class="r11-why" type="text" autocomplete="off" maxlength="120" placeholder="${F.esc(F.t(T.placeholder))}">` +
      `<div class="r11-askb">${F.button('save', '')}<button type="button" class="r11-cancel" data-btn="cancel">${F.t(T.cancel)}</button></div></div></div></div>`;
    root.innerHTML = F.sheet({
      cls: 'r11', title: F.t(T.title), hint: F.t(T.hint), controls: F.button('reset', F.t(T.reset)),
      body: F.field(`<div class="r11-unit">${F.t(T.yUnit)}</div><div class="r11-plot" role="group" aria-label="${F.esc(F.t(T.plotAria))}"></div>`, 'r11-pfield') + F.field(cons, 'r11-cfield'),
    });
    const lab = root.querySelector('.r11-q'), why = root.querySelector('.r11-why');
    why.id = lab.htmlFor;
    if (!F.reduce) root.classList.add('r11-pre');

    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const sheet = $('.f2-sheet'), plot = $('.r11-plot'), trailEl = $('.r11-trail'), ask = $('.r11-ask'), btns = $('.r11-btns');
    const bUndo = $('[data-btn="undo"]'), bSet = $('[data-btn="set"]'), bSave = $('[data-btn="save"]');
    const cell = (k) => $(`.r11-cell[data-k="${k}"]`);

    /* ---------- geometry: x(p) = 40 + (p − 20) × (w − 52) / 40, y(v) = 16 + (50 − v) × 6 ---------- */
    const g = { w: 692, h: 344 };
    const x = (p) => 40 + ((p - 20) * (g.w - 52)) / 40;
    const y = (v) => 16 + (50 - v) * 6;
    const curve = (fn) => { const pts = []; for (let p = 20; p <= 60.001; p += 0.5) pts.push([x(p), y(fn(p))]); return F.poly(pts); };
    let svg = null, R = {};
    const draw = () => {
      const w = g.w, h = g.h, ticksX = [20, 30, 40, 50, 60];
      const grid = [10, 20, 30, 40, 50].map((v) => F.line(40, y(v), w - 12, y(v), 'f2-grid')).join('') + F.line(40, y(0), w - 12, y(0), 'f2-base');
      const yl = [0, 10, 20, 30, 40, 50].map((v) => F.text(30, y(v) + 4, F.num(v), 'f2-ax', 'end')).join('');
      const xl = ticksX.map((p) => F.text(x(p), 336, usd(p), 'f2-ax r11-xt', 'middle', { 'data-p': p })).join('');
      plot.innerHTML = F.svg(w, h,
        grid + yl + xl +
        F.path(curve(mar), 'r11-mar') + F.path(curve(rev), 'r11-rev') +
        F.text(46, 43, CV[0], 'r11-cl') + F.text(x(46), y(mar(46)) + 30, CV[1], 'r11-cl') +
        F.text(x(PREC), y(mar(PREC)) - 17, F.t(T.recommended, usd(PREC)), 'r11-rl', 'middle') +
        F.circle(x(PREC), y(mar(PREC)), 9, 'r11-rec') +
        '<g class="r11-ghosts"></g>' +
        F.line(0, 0, 0, y(0), 'r11-guide') +
        `<g class="r11-mm">${F.circle(0, 0, 5, 'r11-mmc')}</g>` +
        `<g class="r11-pill" aria-hidden="true">${F.rect(-24, 0, 48, 20, 'r11-pillr', 10)}${F.text(0, 14, '', 'r11-pillt', 'middle')}</g>` +
        `<g class="f2-handle r11-pt" tabindex="0" role="slider" aria-label="${F.esc(F.t(T.pointAria))}" aria-valuemin="${PMIN}" aria-valuemax="${PMAX}">` +
        `${F.circle(0, 0, 20, 'r11-hit')}${F.circle(0, 0, 14.5, 'f2-ring')}${F.circle(0, 0, 8.5, 'r11-pto')}${F.circle(0, 0, 6.5, 'r11-pti')}${F.text(0, -22, '', 'r11-ptl', 'middle')}</g>`,
        { cls: 'r11-svg', role: 'presentation' });
      svg = plot.querySelector('svg');
      R = {
        ghosts: $('.r11-ghosts'), guide: $('.r11-guide'), mm: $('.r11-mm'), pill: $('.r11-pill'), pillt: $('.r11-pillt'), pt: $('.r11-pt'), ptl: $('.r11-ptl'),
        xt: $$('.r11-xt'), rev: $('.r11-rev'), mar: $('.r11-mar'),
      };
      bindPoint();
      ghosts();
      place(shown.p);
    };

    /* ---------- the marks at a (possibly fractional, while gliding) price ---------- */
    const shown = { p: P0 };
    const place = (p) => {
      shown.p = p;
      const px = x(p), py = y(rev(p)), my = y(mar(p));
      R.pt.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
      R.mm.setAttribute('transform', `translate(${px.toFixed(1)} ${my.toFixed(1)})`);
      R.guide.setAttribute('x1', px.toFixed(1)); R.guide.setAttribute('x2', px.toFixed(1)); R.guide.setAttribute('y1', (py + 8).toFixed(1));
      R.pill.setAttribute('transform', `translate(${px.toFixed(1)} 322)`);
      R.pillt.textContent = usd(Math.round(p));
      R.ptl.textContent = usd(Math.round(p));
      R.xt.forEach((t) => t.classList.toggle('is-hid', Math.abs(x(+t.dataset.p) - px) < 46));
    };
    // ghosts: where the point was at each earlier step (the last eight; older ones fainter)
    const ghosts = () => {
      const cur = st.trail[st.trail.length - 1].p;
      const past = st.trail.slice(0, -1).map((s) => s.p).filter((p) => p !== cur).slice(-KEEP);
      R.ghosts.innerHTML = past.map((p, i) => F.circle(x(p), y(rev(p)), 4.5, 'r11-gh', { opacity: (1 - ((past.length - 1 - i) / KEEP) * 0.7).toFixed(2) })).join('');
    };

    /* ---------- readouts, history, words ---------- */
    const vals = (p) => ({ p, v: vol(p), r: rev(p), m: mar(p) });
    const disp = vals(P0);
    let cNum = () => {};
    const readouts = (animate) => {
      const to = vals(st.p), from = { ...disp };
      cNum();
      cNum = F.tween(from, to, animate ? 250 : 0, (o) => {
        Object.assign(disp, o);
        cell('p').querySelector('.r11-v').textContent = usd(o.p, 2);
        cell('v').querySelector('.r11-v').textContent = F.num(o.v);
        cell('r').querySelector('.r11-v').textContent = kusd(o.r);
        cell('m').querySelector('.r11-v').textContent = kusd(o.m);
      });
      const moved = st.p !== P0, d0 = vals(P0);
      const deltas = { p: dUsd(st.p - P0, 2), v: F.signed(vol(st.p) - d0.v), r: dK(rev(st.p) - d0.r), m: dK(mar(st.p) - d0.m) };
      ['p', 'v', 'r', 'm'].forEach((k) => {
        const d = cell(k).querySelector('.r11-d'), t = moved ? deltas[k] : '';
        if (d.textContent !== t) {
          d.textContent = t;
          if (!F.reduce && entered && t) d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
        }
      });
    };
    const trail = () => {
      const n = st.trail.length - 1;
      $('.r11-n').textContent = F.t(T.moves, n);
      if (!n) {
        trailEl.innerHTML = `<span class="r11-step is-cur"><i></i><b>${usd(P0, 2)}</b></span><span class="r11-start">${F.t(T.start)}</span>`;
      } else {
        const steps = st.trail.slice(-4), more = st.trail.length > 4;
        trailEl.innerHTML = (more ? '<span class="r11-arr">…</span>' : '') + steps.map((s, i) => {
          const cur = i === steps.length - 1;
          return `${i ? '<span class="r11-arr" aria-hidden="true">→</span>' : ''}<span class="r11-step${cur ? ' is-cur' : ''}"${s.reason ? ` title="${F.esc(s.reason)}"` : ''}><i></i>${cur ? `<b>${usd(s.p)}</b>` : usd(s.p)}${s.reason ? '<em aria-hidden="true">*</em>' : ''}</span>`;
        }).join('');
      }
      bUndo.disabled = n === 0;
      bSet.disabled = st.p === st.set;
    };
    const status = () => {
      const p = st.p, o = vals(p), s0 = vals(P0);
      const lead = F.t(T.lead, usd(p), F.num(o.v), kusd(o.r), kusd(o.m));
      let rest;
      if (p === PREC) rest = F.t(T.restRec);
      else if (p === P0) rest = F.t(T.restStart, usd(PREC));
      else {
        const dr = s0.r - o.r, dm = o.m - s0.m;
        const kind = Math.abs(dm) < 0.05 ? 'same' : dm > 0 ? 'trade' : 'both';
        rest = F.t(T.since, usd(P0), kusd(Math.abs(dr)), kusd(Math.abs(dm)), kind) +
          (st.asking ? F.t(T.pending, usd(p), usd(PREC)) : st.set === p ? (st.trail[st.trail.length - 1].reason ? F.t(T.saved, usd(p)) : F.t(T.setAt, usd(p))) : '.');
      }
      F.status(root, `<b>${lead}</b> ${rest}`);
      R.pt.setAttribute('aria-valuenow', String(p));
      R.pt.setAttribute('aria-valuetext', F.t(T.valuetext, usd(p), F.num(o.v), F.num(o.r, 1), F.num(o.m, 1)));
    };
    const refresh = (animate = true) => { readouts(animate && entered); trail(); status(); };

    /* ---------- moving the price ---------- */
    let cGlide = () => {};
    const move = (p) => {
      p = Math.min(PMAX, Math.max(PMIN, Math.round(p)));
      if (p === st.p) return;
      cGlide();
      st.p = p;
      if (st.asking) closeAsk(false);
      place(p);
      refresh();
    };
    // a release (or a pause after arrow keys) adds a step and leaves a ghost where the point was
    const commitMove = () => {
      const last = st.trail[st.trail.length - 1];
      if (st.p === last.p) return;
      st.trail.push({ p: st.p });
      ghosts();
      const gh = R.ghosts.lastElementChild;
      if (gh && !F.reduce) gh.animate([{ opacity: 0 }, { opacity: gh.getAttribute('opacity') }], { duration: 200 });
      refresh();
    };
    let kTimer = 0;
    const flushKeys = () => { if (kTimer) { clearTimeout(kTimer); kTimer = 0; commitMove(); } };
    const bindPoint = () => {
      F.drag(R.pt, () => svg, {
        start: () => { flushKeys(); R.pt.classList.add('is-dragging'); root.classList.add('r11-drag'); },
        move: (pt) => move(20 + ((pt.x - 40) * 40) / (g.w - 52)),
        end: () => { R.pt.classList.remove('is-dragging'); root.classList.remove('r11-drag'); commitMove(); },
      });
      R.pt.addEventListener('keydown', (e) => {
        let p = null;
        const big = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') p = st.p - big;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') p = st.p + big;
        else if (e.key === 'PageDown') p = st.p - 5;
        else if (e.key === 'PageUp') p = st.p + 5;
        else if (e.key === 'Home') p = PMIN;
        else if (e.key === 'End') p = PMAX;
        if (p == null) return;
        e.preventDefault();
        move(p);
        clearTimeout(kTimer);
        kTimer = setTimeout(() => { kTimer = 0; commitMove(); }, 700);
      });
    };
    const glideTo = (p) => {
      cGlide();
      const from = shown.p;
      st.p = p;
      refresh();
      cGlide = F.tween(from, p, 350, (v) => place(v), F.ease.inOut);
    };
    const undo = () => {
      flushKeys();
      if (st.asking) closeAsk(false);
      if (st.trail.length < 2) return;
      st.trail.pop();
      const prev = st.trail[st.trail.length - 1].p;
      if (st.set !== P0 && !st.trail.some((s) => s.p === st.set)) st.set = P0;
      ghosts();
      glideTo(prev);
    };
    const reset = () => {
      flushKeys();
      if (st.asking) closeAsk(false);
      st.trail = [{ p: P0 }];
      st.set = P0;
      ghosts();
      glideTo(P0);
    };

    /* ---------- set price, and the reason an override needs ---------- */
    const openAsk = () => {
      st.asking = true;
      lab.textContent = F.fr(F.t(T.question, usd(st.p), usd(PREC)));
      bSave.textContent = F.t(T.save, usd(st.p));
      why.value = '';
      bSave.disabled = true;
      btns.hidden = true;
      ask.hidden = false;
      if (!F.reduce) ask.animate([{ opacity: 0, height: '0px' }, { opacity: 1, height: `${ask.scrollHeight}px` }], { duration: 250, easing: 'cubic-bezier(.33,1,.68,1)' });
      why.focus({ preventScroll: true });
      status();
    };
    const closeAsk = (focusSet = true) => {
      st.asking = false;
      ask.hidden = true;
      btns.hidden = false;
      if (focusSet) (bSet.disabled ? R.pt : bSet).focus({ preventScroll: true });
      trail(); status();
    };
    const setPrice = () => {
      flushKeys();
      if (st.p === st.set) return;
      if (st.p === PREC) { commitSet(null); return; }
      openAsk();
    };
    const commitSet = (reason) => {
      // the committed price becomes a step of its own if it is not already the last one
      const last = st.trail[st.trail.length - 1];
      if (last.p !== st.p) { st.trail.push({ p: st.p }); ghosts(); }
      if (reason) st.trail[st.trail.length - 1].reason = reason;
      st.set = st.p;
      if (st.asking) closeAsk(false);
      trail(); status();
      R.pt.focus({ preventScroll: true });
    };
    why.addEventListener('input', () => { bSave.disabled = why.value.trim().length < 3; });
    why.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !bSave.disabled) { e.preventDefault(); commitSet(why.value.trim()); }
      else if (e.key === 'Escape') { e.preventDefault(); closeAsk(); }
    });
    F.bind(root, {
      btn: {
        undo, reset, set: setPrice,
        save: () => { if (why.value.trim().length >= 3) commitSet(why.value.trim()); },
        cancel: () => closeAsk(),
      },
    });
    root.addEventListener('keydown', (e) => {
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.target !== why) { e.preventDefault(); undo(); }
    });

    /* ---------- layout: plot field 8 columns, consequences 4 (split at the centre of the gutter) ---------- */
    let entered = !!F.reduce;
    const layout = () => {
      const W = sheet.clientWidth || 1120, col = (W - 11 * 32) / 12;
      root.style.setProperty('--r11-pw', `${Math.round(8 * col + 228)}px`);
      const w = Math.max(260, plot.clientWidth || 692);
      if (w === g.w && svg) return;
      g.w = w;
      const focused = document.activeElement === (R.pt || null);
      draw();
      if (focused) R.pt.focus({ preventScroll: true });
    };
    root.style.setProperty('--r11-pw', '740px');
    layout();
    refresh(false);
    F.onResize(plot, layout);
    F.onResize(sheet, layout);

    /* ---------- entrance: revenue draws, margin 100 ms later, then the point and markers pop in ---------- */
    F.enter(root, (still) => {
      root.classList.remove('r11-pre');
      entered = true;
      if (still) return;
      const ease = 'cubic-bezier(.33,1,.68,1)';
      [[R.rev, 0], [R.mar, 100]].forEach(([c, delay]) => {
        const len = c.getTotalLength();
        c.animate([{ strokeDasharray: `${len}`, strokeDashoffset: `${len}` }, { strokeDasharray: `${len}`, strokeDashoffset: '0' }], { duration: 600, delay, easing: ease, fill: 'backwards' });
      });
      [R.pt.querySelector('.r11-pti'), R.pt.querySelector('.r11-pto'), R.mm, $('.r11-rec')].forEach((m) => {
        m.style.transformBox = 'fill-box'; m.style.transformOrigin = 'center';
        m.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, delay: 700, easing: ease, fill: 'backwards' });
      });
    });
  });
})();

/* Rule 12 · Plain words (stage demo-terms).
   Paper: "Fig · 12 · Plain words" (7C9-0) and its interacting state (7JM-0); spec figspec/r12.json.
   Eight generic terms, each worked out from one illustrative September (48,000 visitors, 1,440 orders, $72,000
   revenue, $43,200 cost of goods, 2,000 customers on 1 September of whom 120 left, 3,960 web and 2,160 app users with
   720 on both). Select a term to see what it counts, its period and unit, the arithmetic and what kind of number it
   is; underlined words in the arithmetic lead to the other terms. */
(() => {
  'use strict';
  const NN = ' ', NB = ' ';
  // value kinds: money in dollars, a percentage, a count of people; d = decimals
  const TERMS = [
    { id: 'revenue', v: 72000, k: 'usd', d: 0 },
    { id: 'grossMargin', v: 40, k: 'pct', d: 0 },
    { id: 'conversion', v: 3.0, k: 'pct', d: 1 },
    { id: 'aov', v: 50, k: 'usd', d: 2 },
    { id: 'churn', v: 6.0, k: 'pct', d: 1 },
    { id: 'retention', v: 94.0, k: 'pct', d: 1 },
    { id: 'activeUsers', v: 5400, k: 'count', d: 0 },
    { id: 'runRate', v: 864000, k: 'usd', d: 0 },
  ];
  const IDS = TERMS.map((t) => t.id);

  // Arithmetic as tokens: [n, figure] [w, word] [o, operator] [l, linked word, term id]. Figures are formatted per language.
  const W = {
    en: {
      title: 'Plain words, worked out',
      hint: 'eight terms, each computed from one month · illustrative',
      insteadOf: 'instead of',
      labels: ['Counts', 'Period and unit', 'Worked out', 'Kind of number'],
      listAria: 'Terms',
      cardAria: 'Definition of the selected term',
      terms: {
        revenue: {
          name: 'Revenue', unit: 'in September', instead: ['top line', 'turnover'],
          counts: 'Money customers paid for the orders they placed in September, before any cost.',
          period: '1 to 30 September, in US dollars.',
          work: (f) => [['n', f.n(1440)], ['w', 'orders'], ['o', '×'], ['n', f.usd(50, 2)], ['l', 'average order value', 'aov'], ['o', '='], ['n', f.usd(72000)]],
          kind: 'An amount of money over one month, counted, not estimated.',
          lead: (f) => `Revenue: ${f.usd(72000)} in September.`,
        },
        grossMargin: {
          name: 'Gross margin', unit: 'of revenue, September', instead: ['GM', 'gross profit %'],
          counts: 'The share of revenue left after paying for the goods that were sold.',
          period: (f) => `September, as a percentage of revenue; in dollars it is ${f.usd(28800)}.`,
          work: (f) => [['o', '('], ['n', f.usd(72000)], ['l', 'revenue', 'revenue'], ['o', '−'], ['n', f.usd(43200)], ['w', 'cost of goods'], ['o', ')'], ['o', '÷'], ['n', f.usd(72000)], ['o', '='], ['n', f.pct(40)]],
          kind: (f) => `A share, not an amount: the same margin in dollars is ${f.usd(28800)}.`,
          lead: (f) => `Gross margin: ${f.pct(40)} of revenue in September.`,
        },
        conversion: {
          name: 'Conversion rate', unit: 'of visitors, September', instead: ['CVR', 'CR'],
          counts: 'The share of visitors who placed an order.',
          period: 'September; visitors and orders counted over the same 30 days.',
          work: (f) => [['n', f.n(1440)], ['w', 'orders'], ['o', '÷'], ['n', f.n(48000)], ['w', 'visitors'], ['o', '='], ['n', f.pct(3, 1)]],
          kind: 'A share of people, not of money; it says nothing about the size of an order.',
          lead: (f) => `Conversion rate: ${f.pct(3, 1)} of September’s visitors.`,
        },
        aov: {
          name: 'Average order value', unit: 'per order, September', instead: ['AOV', 'basket size'],
          counts: 'What one order brings in, on average.',
          period: 'September, in US dollars per order.',
          work: (f) => [['n', f.usd(72000)], ['l', 'revenue', 'revenue'], ['o', '÷'], ['n', f.n(1440)], ['w', 'orders'], ['o', '='], ['n', f.usd(50, 2)]],
          kind: 'An average: many orders may be far smaller or larger.',
          lead: (f) => `Average order value: ${f.usd(50, 2)} per order in September.`,
        },
        churn: {
          name: 'Churn', unit: 'of customers, September', instead: ['attrition', 'logo churn'],
          counts: 'The share of customers at the start of the month who had left by its end.',
          period: (f) => `1 to 30 September, as a share of the ${f.n(2000)} customers on 1 September.`,
          work: (f) => [['n', f.n(120)], ['w', 'customers lost'], ['o', '÷'], ['n', f.n(2000)], ['w', 'at the start'], ['o', '='], ['n', f.pct(6, 1)]],
          kind: 'A share of customers, not of revenue; new customers are not netted off.',
          lead: (f) => `Churn: ${f.pct(6, 1)} of customers in September.`,
        },
        retention: {
          name: 'Retention', unit: 'of customers, September', instead: ['GRR', 'logo retention'],
          counts: 'The share of customers at the start of the month who were still customers at its end.',
          period: (f) => `1 to 30 September, of the ${f.n(2000)} customers on 1 September.`,
          work: (f) => [['n', f.n(1880)], ['w', 'stayed'], ['o', '÷'], ['n', f.n(2000)], ['w', 'at the start'], ['o', '='], ['n', f.pct(94, 1)], ['w', ', that is'], ['n', f.pct(100)], ['o', '−'], ['n', f.pct(6, 1)], ['l', 'churn', 'churn']],
          kind: (f) => `The complement of churn: the two always add up to ${f.pct(100)}.`,
          lead: (f) => `Retention: ${f.pct(94, 1)} of customers in September.`,
        },
        activeUsers: {
          name: 'Active users', unit: 'people, September', instead: ['MAU', 'monthly actives'],
          counts: 'People who signed in at least once in September, each counted once.',
          period: '1 to 30 September, in distinct people.',
          work: (f) => [['n', f.n(3960)], ['w', 'on the web'], ['o', '+'], ['n', f.n(2160)], ['w', 'in the app'], ['o', '−'], ['n', f.n(720)], ['w', 'on both'], ['o', '='], ['n', f.n(5400)]],
          kind: 'A count of people, with no one counted twice; not visits, not sessions.',
          lead: (f) => `Active users: ${f.n(5400)} people in September.`,
        },
        runRate: {
          name: 'Run rate', unit: 'a year, at September’s pace', instead: ['ARR', 'annualised revenue'],
          counts: 'What a year would bring if every month earned what September did.',
          period: 'September, scaled up to twelve months, in US dollars a year.',
          work: (f) => [['n', f.usd(72000)], ['l', 'revenue', 'revenue'], ['w', 'in September'], ['o', '×'], ['n', f.n(12)], ['w', 'months'], ['o', '='], ['n', f.usd(864000)]],
          kind: 'A projection, not a forecast: it assumes no season, no growth and no churn.',
          lead: (f) => `Run rate: ${f.usd(864000)} a year.`,
          rest: 'A projection, not a forecast: September’s revenue times twelve, with no season, growth or churn.',
        },
      },
    },
    fr: {
      title: 'Des mots simples, chiffres à l’appui',
      hint: 'huit termes, chacun calculé sur un mois · données d’exemple',
      insteadOf: 'au lieu de',
      labels: ['Ce qu’il compte', 'Période et unité', 'Calcul', 'Type de nombre'],
      listAria: 'Termes',
      cardAria: 'Définition du terme sélectionné',
      terms: {
        revenue: {
          name: 'Chiffre d’affaires', unit: 'en septembre', instead: ['CA', 'top line'],
          counts: 'L’argent payé par les clients pour les commandes passées en septembre, avant tout coût.',
          period: 'Du 1er au 30 septembre, en dollars américains.',
          work: (f) => [['n', f.n(1440)], ['w', 'commandes'], ['o', '×'], ['n', f.usd(50, 2)], ['l', 'de panier moyen', 'aov'], ['o', '='], ['n', f.usd(72000)]],
          kind: 'Un montant d’argent sur un mois, compté, pas estimé.',
          lead: (f) => `Chiffre d’affaires${NN}: ${f.usd(72000)} en septembre.`,
        },
        grossMargin: {
          name: 'Marge brute', unit: 'du chiffre d’affaires, septembre', instead: ['MB', 'taux de MB'],
          counts: 'La part du chiffre d’affaires qui reste après avoir payé les marchandises vendues.',
          period: (f) => `Septembre, en pourcentage du chiffre d’affaires${NN}; en dollars, elle vaut ${f.usd(28800)}.`,
          work: (f) => [['o', '('], ['n', f.usd(72000)], ['w', 'de'], ['l', 'chiffre d’affaires', 'revenue'], ['o', '−'], ['n', f.usd(43200)], ['w', 'de coût des marchandises'], ['o', ')'], ['o', '÷'], ['n', f.usd(72000)], ['o', '='], ['n', f.pct(40)]],
          kind: (f) => `Une part, pas un montant${NN}: la même marge en dollars vaut ${f.usd(28800)}.`,
          lead: (f) => `Marge brute${NN}: ${f.pct(40)} du chiffre d’affaires en septembre.`,
        },
        conversion: {
          name: 'Taux de conversion', unit: 'des visiteurs, septembre', instead: ['CVR', 'CR'],
          counts: 'La part des visiteurs qui ont passé une commande.',
          period: `Septembre${NN}; visiteurs et commandes comptés sur les mêmes 30${NB}jours.`,
          work: (f) => [['n', f.n(1440)], ['w', 'commandes'], ['o', '÷'], ['n', f.n(48000)], ['w', 'visiteurs'], ['o', '='], ['n', f.pct(3, 1)]],
          kind: `Une part de personnes, pas d’argent${NN}; elle ne dit rien de la taille d’une commande.`,
          lead: (f) => `Taux de conversion${NN}: ${f.pct(3, 1)} des visiteurs de septembre.`,
        },
        aov: {
          name: 'Panier moyen', unit: 'par commande, septembre', instead: ['AOV', 'PM'],
          counts: 'Ce que rapporte une commande, en moyenne.',
          period: 'Septembre, en dollars américains par commande.',
          work: (f) => [['n', f.usd(72000)], ['w', 'de'], ['l', 'chiffre d’affaires', 'revenue'], ['o', '÷'], ['n', f.n(1440)], ['w', 'commandes'], ['o', '='], ['n', f.usd(50, 2)]],
          kind: `Une moyenne${NN}: beaucoup de commandes peuvent être bien plus petites ou plus grandes.`,
          lead: (f) => `Panier moyen${NN}: ${f.usd(50, 2)} par commande en septembre.`,
        },
        churn: {
          name: 'Clients perdus', unit: 'des clients, septembre', instead: ['churn', 'attrition'],
          counts: 'La part des clients du début du mois partis avant sa fin.',
          period: (f) => `Du 1er au 30 septembre, en part des ${f.n(2000)} clients du 1er septembre.`,
          work: (f) => [['n', f.n(120)], ['w', 'clients perdus'], ['o', '÷'], ['n', f.n(2000)], ['w', 'au départ'], ['o', '='], ['n', f.pct(6, 1)]],
          kind: `Une part de clients, pas de chiffre d’affaires${NN}; les nouveaux clients ne sont pas déduits.`,
          lead: (f) => `Clients perdus${NN}: ${f.pct(6, 1)} des clients en septembre.`,
        },
        retention: {
          name: 'Clients conservés', unit: 'des clients, septembre', instead: ['GRR', 'rétention'],
          counts: 'La part des clients du début du mois encore clients à sa fin.',
          period: (f) => `Du 1er au 30 septembre, parmi les ${f.n(2000)} clients du 1er septembre.`,
          work: (f) => [['n', f.n(1880)], ['w', 'restés'], ['o', '÷'], ['n', f.n(2000)], ['w', 'au départ'], ['o', '='], ['n', f.pct(94, 1)], ['w', ', soit'], ['n', f.pct(100)], ['o', '−'], ['n', f.pct(6, 1)], ['w', 'de'], ['l', 'clients perdus', 'churn']],
          kind: (f) => `Le complément des clients perdus${NN}: les deux font toujours ${f.pct(100)}.`,
          lead: (f) => `Clients conservés${NN}: ${f.pct(94, 1)} des clients en septembre.`,
        },
        activeUsers: {
          name: 'Utilisateurs actifs', unit: 'personnes, septembre', instead: ['MAU', 'actifs mensuels'],
          counts: 'Les personnes qui se sont connectées au moins une fois en septembre, chacune comptée une fois.',
          period: 'Du 1er au 30 septembre, en personnes distinctes.',
          work: (f) => [['n', f.n(3960)], ['w', 'sur le web'], ['o', '+'], ['n', f.n(2160)], ['w', 'dans l’app'], ['o', '−'], ['n', f.n(720)], ['w', 'sur les deux'], ['o', '='], ['n', f.n(5400)]],
          kind: `Un nombre de personnes, sans doublon${NN}; ni des visites, ni des sessions.`,
          lead: (f) => `Utilisateurs actifs${NN}: ${f.n(5400)} personnes en septembre.`,
        },
        runRate: {
          name: 'Rythme annualisé', unit: 'par an, au rythme de septembre', instead: ['ARR', 'run rate'],
          counts: 'Ce que rapporterait une année si chaque mois gagnait autant que septembre.',
          period: 'Septembre, porté à douze mois, en dollars américains par an.',
          work: (f) => [['n', f.usd(72000)], ['w', 'de'], ['l', 'chiffre d’affaires', 'revenue'], ['w', 'en septembre'], ['o', '×'], ['n', f.n(12)], ['w', 'mois'], ['o', '='], ['n', f.usd(864000)]],
          kind: `Une projection, pas une prévision${NN}: elle ne suppose ni saison, ni croissance, ni clients perdus.`,
          lead: (f) => `Rythme annualisé${NN}: ${f.usd(864000)} par an.`,
          rest: `Une projection, pas une prévision${NN}: le chiffre d’affaires de septembre multiplié par douze, sans saison, ni croissance, ni clients perdus.`,
        },
      },
    },
  };

  FIG.register('demo-terms', (root, F) => {
    const L = W[F.lang] || W.en;
    const fr = F.lang === 'fr';
    const f = {
      n: (v, d = 0) => F.num(v, d),
      pct: (v, d = 0) => F.pct(v, d),
      usd: (v, d = 0) => (fr ? `${F.num(v, d)}${NN}$` : `$${F.num(v, d)}`),
    };
    const val = (t, v = t.v) => (t.k === 'usd' ? f.usd(v, t.d) : t.k === 'pct' ? f.pct(v, t.d) : f.n(v, t.d));
    const txt = (s) => (typeof s === 'function' ? s(f) : s);
    const st = { i: 0 };

    /* ---------- markup ---------- */
    const rows = TERMS.map((t, i) => `<button type="button" role="radio" class="r12-row" data-i="${i}" aria-checked="${i === st.i}" tabindex="${i === st.i ? 0 : -1}"><span class="r12-nm">${L.terms[t.id].name}</span><span class="r12-vl">${val(t)}</span></button>`).join('');
    const defs = L.labels.map((l, i) => `<div class="r12-def${i === 2 ? ' r12-work' : ''}"><span class="r12-dl">${l}</span><div class="r12-dt"></div></div>`).join('');
    const card = `<div class="r12-card" role="region" aria-label="${F.esc(L.cardAria)}" aria-live="off">` +
      '<div class="r12-ch"><h4 class="r12-name"></h4><div class="r12-inst"></div></div>' +
      '<div class="r12-big"><b class="r12-value"></b><span class="r12-unit"></span></div>' +
      `<div class="r12-defs">${defs}</div></div>`;
    root.innerHTML = F.sheet({
      cls: 'r12', title: L.title, hint: L.hint,
      body: F.field(`<i class="r12-sel" aria-hidden="true"></i><div class="r12-list" role="radiogroup" aria-label="${F.esc(L.listAria)}">${rows}</div>`, 'r12-lfield') + F.field(card, 'r12-cfield'),
    });
    if (!F.reduce) root.classList.add('r12-pre');

    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const sheet = $('.f2-sheet'), lfield = $('.r12-lfield'), list = $('.r12-list'), sel = $('.r12-sel'), cardEl = $('.r12-card');
    const rowEls = $$('.r12-row'), valueEl = $('.r12-value');
    const dts = $$('.r12-dt');

    /* ---------- the card ---------- */
    const work = (toks) => toks.map(([k, s, to]) => (k === 'l' ? `<button type="button" class="r12-link" data-to="${to}">${s}</button>` : `<span class="r12-${k}">${s}</span>`)).join('');
    const fill = (i) => {
      const t = TERMS[i], c = L.terms[t.id];
      $('.r12-name').textContent = c.name;
      $('.r12-inst').innerHTML = `<span class="r12-io">${L.insteadOf}</span>${c.instead.map((w) => `<s>${w}</s>`).join('')}`;
      $('.r12-unit').textContent = c.unit;
      dts[0].textContent = txt(c.counts);
      dts[1].textContent = txt(c.period);
      dts[2].innerHTML = work(c.work(f));
      dts[3].textContent = txt(c.kind);
    };
    const status = () => {
      const c = L.terms[TERMS[st.i].id];
      F.status(root, `<b>${c.lead(f)}</b> ${txt(c.rest || c.kind)}`);
    };
    let cVal = () => {}, shownV = 0, shownT = TERMS[0];
    const showValue = (t, from, ms) => {
      cVal();
      cVal = F.tween(from, t.v, ms, (v) => { shownV = v; valueEl.textContent = val(t, v); }, F.ease.out);
      shownT = t;
    };

    /* ---------- the list: a radio group whose selection follows focus ---------- */
    const placeSel = (animate) => {
      const r = rowEls[st.i], lb = lfield.getBoundingClientRect(), rb = r.getBoundingClientRect();
      sel.classList.toggle('r12-still', !animate);
      sel.style.width = `${rb.width.toFixed(1)}px`;
      sel.style.height = `${rb.height.toFixed(1)}px`;
      sel.style.transform = `translate(${(rb.left - lb.left + lfield.scrollLeft).toFixed(1)}px, ${(rb.top - lb.top).toFixed(1)}px)`;
    };
    let cOut = null;
    const select = (i, { focus = false } = {}) => {
      i = (i + TERMS.length) % TERMS.length;
      if (focus) rowEls[i].focus({ preventScroll: false });
      if (i === st.i) return;
      const was = TERMS[st.i], t = TERMS[i];
      st.i = i;
      rowEls.forEach((r, k) => { r.setAttribute('aria-checked', String(k === i)); r.tabIndex = k === i ? 0 : -1; });
      placeSel(true);
      if (rowEls[i].scrollIntoView && lfield.scrollWidth > lfield.clientWidth) rowEls[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: F.reduce ? 'auto' : 'smooth' });
      status();
      const sameUnit = was.k === t.k;
      if (F.reduce || !entered) { fill(i); showValue(t, t.v, 0); return; }
      // the card cross-fades (120 ms out, 180 ms in, rising 6 px); the value counts when the unit is the same
      const parts = $$('.r12-ch, .r12-unit, .r12-defs').concat(sameUnit ? [] : [valueEl]);
      if (cOut) cOut.forEach((a) => a.cancel());
      cOut = parts.map((p) => p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }));
      if (sameUnit) showValue(t, shownV, 300);
      cOut[0].onfinish = () => {
        fill(i);
        if (!sameUnit) showValue(t, t.v, 0);
        cOut.forEach((a) => a.cancel());
        cOut = null;
        parts.forEach((p) => p.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.33,1,.68,1)' }));
      };
    };
    root.addEventListener('click', (e) => {
      const r = e.target.closest('.r12-row'), l = e.target.closest('.r12-link');
      if (r) select(+r.dataset.i);
      else if (l) select(IDS.indexOf(l.dataset.to), { focus: true });
    });
    list.addEventListener('keydown', (e) => {
      const k = e.key;
      let i = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') i = st.i + 1;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') i = st.i - 1;
      else if (k === 'Home') i = 0;
      else if (k === 'End') i = TERMS.length - 1;
      if (i == null) return;
      e.preventDefault();
      select(i, { focus: true });
    });

    /* ---------- layout: the list 4 columns, the card 8 (split at the centre of the gutter) ---------- */
    let entered = !!F.reduce;
    const layout = () => {
      const W_ = sheet.clientWidth || 1120, col = (W_ - 11 * 32) / 12;
      root.style.setProperty('--r12-lw', `${Math.round(4 * col + 100)}px`);
      placeSel(false);
    };
    fill(st.i);
    showValue(TERMS[st.i], F.reduce ? TERMS[st.i].v : 0, 0);
    status();
    layout();
    F.onResize(sheet, layout);
    F.onResize(lfield, () => placeSel(false));
    lfield.addEventListener('scroll', () => placeSel(false), { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeSel(false)).catch(() => {});

    /* ---------- entrance: rows fade in top to bottom, the value counts up from zero ---------- */
    F.enter(root, (still) => {
      root.classList.remove('r12-pre');
      entered = true;
      if (still) { showValue(TERMS[st.i], TERMS[st.i].v, 0); return; }
      rowEls.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: i * 30, fill: 'backwards' }));
      sel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'backwards' });
      showValue(TERMS[st.i], 0, 500);
    });
  });
})();

/* The system · Tune the system (stage #demo-tune). Paper "Fig · 9 · Tune" (7LD-0); spec figspec/tune.json.
   Three tokens restyle the cover's own dashboard: the depth of the surface tones, the sheet radius and the density.
   The excerpt is rows A and B of the cover, drawn by the same code (FIG.coverDashboard in f-cover.js); the tokens are
   custom properties on this root that the dashboard's styles read (--cv-sheet, --cv-ground, --cv-well, --cv-rs,
   --cv-rf, --cv-inset, --cv-pad, --cv-row), so tones, radii, paddings and gaps tween by CSS transitions. The current
   token block is written into the page's <pre id="tokens">, which the page's "Copy tokens" button copies. */
(() => {
  'use strict';
  const NB = ' ';

  // From figspec/tune.json, copied exactly.
  const T = {
    title: {"en": "Tune the system", "fr": "Régler le système"},
    hint: {"en": "three tokens restyle the cover’s dashboard", "fr": "trois tokens restylent le tableau de bord de la couverture"},
    reset: {"en": "Reset to the dashboard", "fr": "Revenir au tableau de bord"},
    surface: {"en": "Surface tones", "fr": "Tons des surfaces"}, surfaceAria: {"en": "Depth of the surface tones, in percent", "fr": "Profondeur des tons de surface, en pourcentage"},
    radius: {"en": "Sheet radius", "fr": "Rayon des feuilles"}, radiusAria: {"en": "Sheet radius in pixels", "fr": "Rayon des feuilles, en pixels"},
    density: {"en": "Density", "fr": "Densité"},
    dens: { en: [["compact", "Compact"], ["regular", "Regular"], ["roomy", "Roomy"]], fr: [["compact", "Serrée"], ["regular", "Normale"], ["roomy", "Aérée"]] },
    densWord: {"en": {"compact": "compact", "regular": "regular", "roomy": "roomy"}, "fr": {"compact": "serrée", "regular": "normale", "roomy": "aérée"}},
    status: {"en": "<b>Surfaces at {d}, sheet radius {r}, field radius {ri}, {density} density.</b> ", "fr": "<b>Surfaces à {d}, rayon des feuilles {r}, rayon des champs {ri}, densité {density}.</b> "},
    def: {"en": "These are the values the dashboard on the cover uses.", "fr": "Ce sont les valeurs du tableau de bord de la couverture."},
    notes: {pale: {"en": "With the tones this close to white the sheets lose their edges, and grouping rests on spacing alone.", "fr": "Avec des tons aussi proches du blanc, les feuilles perdent leurs bords, et le regroupement ne tient plus qu’à l’espacement."}, deep: {"en": "Deeper tones separate the layers more firmly and leave the page less calm.", "fr": "Des tons plus profonds séparent plus nettement les couches et rendent la page moins calme."}, sharp: {"en": "Below the inset the field corner reaches zero, because the inner radius is the outer one minus the inset.", "fr": "Sous le retrait, le coin du champ tombe à zéro, car le rayon intérieur est le rayon extérieur moins le retrait."}, compact: {"en": "At 6 px of inset the fields nearly touch; the figures need the row height more than the page needs the space.", "fr": "Avec 6 px de retrait, les champs se touchent presque ; les chiffres ont plus besoin de hauteur de ligne que la page d’espace."}},
    tok: {"en": {"surfaces": "surfaces", "ink": "ink and marks: greys only", "radius": "radius", "fieldRule": "field = sheet − inset, never below 0", "density": "density"}, "fr": {"surfaces": "surfaces", "ink": "encre et marques : gris seulement", "radius": "rayons", "fieldRule": "champ = feuille − retrait, jamais sous 0", "density": "densité"}},
  };
  const DENS = {"compact": {"inset": 6, "padField": "12px 16px", "row": 24, "gap": 6}, "regular": {"inset": 8, "padField": "16px 20px", "row": 28, "gap": 8}, "roomy": {"inset": 12, "padField": "20px 24px", "row": 32, "gap": 12}};
  const BLOCK = ":root {\n  /* surfaces, {d} */\n  --ground: {ground};  --sheet: {sheet};  --field: #FFFFFF;  --well: {well};\n  /* ink and marks: greys only */\n  --ink: #121923;  --ink2: #414B59;  --ink3: #5D6776;\n  --slate: #5A6676;  --slate2: #B7BFCA;  --line: #CBD2DC;  --line2: #98A2B1;\n  /* radius */\n  --r-sheet: {r}px;  --r-field: {ri}px;   /* field = sheet − inset, never below 0 */\n  /* density, {density} */\n  --inset: {inset}px;  --pad-field: {padField};  --row: {row}px;\n  --font: \"Instrument Sans\", system-ui, sans-serif;\n}";

  const DEF = { surface: 100, radius: 20, density: 'regular' };
  const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  // tone(base, t) = 255 − (255 − base) × t per channel: 100 % is the system, 0 % is white.
  const tone = (base, t) => hex(base.map((v) => Math.min(255, Math.max(0, 255 - (255 - v) * t))));
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
  const failed = { en: 'This figure needs the cover’s dashboard, which could not be drawn.', fr: 'Cette figure a besoin du tableau de bord de la couverture, qui n’a pas pu être dessiné.' };

  FIG.register('demo-tune', (root, F) => {
    if (typeof FIG.coverDashboard !== 'function') { root.innerHTML = `<p class="f2-status">${F.t(failed)}</p>`; return; }
    const t = F.t;
    const st = { ...DEF };
    const px = (v) => `${v}${NB}px`;
    const controls = `<div class="tn-ctl">
        <div class="tn-c">${F.slider('surface', { min: 0, max: 160, step: 5, value: st.surface, label: t(T.surface), aria: t(T.surfaceAria), out: F.pct(st.surface) })}</div>
        <div class="tn-c">${F.slider('radius', { min: 0, max: 28, step: 1, value: st.radius, label: t(T.radius), aria: t(T.radiusAria), out: px(st.radius) })}</div>
        <div class="tn-c tn-dens"><span class="tn-lab" aria-hidden="true">${t(T.density)}</span>${F.seg('density', t(T.dens), st.density, t(T.density))}</div>
      </div>`;
    root.innerHTML = `<section class="cv-sheet tn-sheet" aria-label="${F.esc(t(T.title))}">
        <header class="cv-head tn-head"><div class="tn-title"><h3>${t(T.title)}</h3><span>${t(T.hint)}</span></div>${F.button('reset', t(T.reset))}</header>
        ${controls}
        <div class="cv-dash"></div>
        <p class="f2-status tn-status" aria-live="polite"></p>
      </section>`;
    const dash = FIG.coverDashboard(F, root.querySelector('.cv-dash'), { rows: 'AB', uid: 'tn-' + (root.id || 'tune'), interactive: false });
    const pre = document.getElementById('tokens');

    const tokens = () => {
      const k = st.surface / 100, d = DENS[st.density];
      return {
        ground: tone([227, 231, 237], k), sheet: tone([241, 243, 247], k), well: tone([220, 225, 233], k),
        r: st.radius, ri: Math.max(st.radius - d.inset, 0), inset: d.inset, padField: d.padField, row: d.row,
      };
    };
    const block = (k) => {
      const c = t(T.tok);
      const tpl = BLOCK.replace('/* surfaces, {d} */', `/* ${c.surfaces}, {d} */`).replace('/* ink and marks: greys only */', `/* ${c.ink} */`)
        .replace('/* radius */', `/* ${c.radius} */`).replace('/* field = sheet − inset, never below 0 */', `/* ${c.fieldRule} */`)
        .replace('/* density, {density} */', `/* ${c.density}, {density} */`);
      return fill(tpl, { d: F.lang === 'fr' ? `${st.surface} %` : `${st.surface}%`, ground: k.ground, sheet: k.sheet, well: k.well, r: k.r, ri: k.ri, density: t(T.densWord)[st.density], inset: k.inset, padField: k.padField, row: k.row });
    };
    let rowNow = DENS[st.density].row, stopRow = () => {};
    function apply() {
      const k = tokens();
      const s = root.style;
      s.setProperty('--cv-sheet', k.sheet);
      s.setProperty('--cv-ground', k.ground);
      s.setProperty('--cv-well', k.well);
      s.setProperty('--cv-rs', k.r + 'px');
      s.setProperty('--cv-rf', k.ri + 'px');
      s.setProperty('--cv-inset', k.inset + 'px');
      s.setProperty('--cv-pad', k.padField);
      s.setProperty('--cv-pad-s', { compact: '12px', regular: '16px', roomy: '20px' }[st.density]);
      s.setProperty('--cv-pad-sk', { compact: '10px 12px', regular: '14px 16px', roomy: '18px 20px' }[st.density]);
      s.setProperty('--cv-row', k.row + 'px');
      if (k.row !== rowNow) {
        stopRow();
        const from = rowNow;
        rowNow = k.row;
        stopRow = F.tween(from, k.row, 250, (v) => dash.setRow(v));
      }
      if (pre) pre.textContent = block(k);
      const notes = [];
      if (st.surface <= 30) notes.push(t(T.notes.pale));
      else if (st.surface >= 135) notes.push(t(T.notes.deep));
      if (st.radius < k.inset) notes.push(t(T.notes.sharp));
      if (st.density === 'compact') notes.push(t(T.notes.compact));
      const isDef = st.surface === DEF.surface && st.radius === DEF.radius && st.density === DEF.density;
      const lead = fill(t(T.status), { d: F.pct(st.surface), r: px(k.r), ri: px(k.ri), density: t(T.densWord)[st.density] });
      F.status(root, F.fr(lead + (isDef ? t(T.def) : notes.join(' '))));
    }
    const sync = () => {
      root.querySelectorAll('.f2-range').forEach((r) => {
        r.value = st[r.closest('[data-sl]').dataset.sl];
        F.fillRange(r);
      });
      root.querySelector('[data-sl="surface"] output').textContent = F.pct(st.surface);
      root.querySelector('[data-sl="radius"] output').textContent = px(st.radius);
      root.querySelectorAll('[data-seg="density"] [data-v]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.density)));
    };
    F.bind(root, {
      sl: {
        surface: (v, input) => { st.surface = v; input.nextElementSibling.textContent = F.pct(v); apply(); },
        radius: (v, input) => { st.radius = v; input.nextElementSibling.textContent = px(v); apply(); },
      },
      seg: { density: (v) => { st.density = v; apply(); } },
      btn: { reset: () => { Object.assign(st, DEF); sync(); apply(); } },
    });
    apply();
  });
})();

FIG.start();
