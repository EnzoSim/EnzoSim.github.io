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
