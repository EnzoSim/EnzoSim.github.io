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
