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
