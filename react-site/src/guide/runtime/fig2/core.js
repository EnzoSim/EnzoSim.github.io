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
