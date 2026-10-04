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
