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
