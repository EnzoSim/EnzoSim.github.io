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
