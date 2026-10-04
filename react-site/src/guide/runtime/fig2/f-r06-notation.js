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
