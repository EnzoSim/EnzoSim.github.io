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
