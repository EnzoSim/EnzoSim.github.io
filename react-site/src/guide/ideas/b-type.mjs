// Idea drawings for the type and typography people of chapter 1: what each one proposed, drawn as a grey specimen.
import { rect, line, circle, path, area, raw, text, t, num } from './kit.mjs';

// Advance widths of Instrument Sans with tabular figures, as a share of the font size (measured in the browser).
const ADV = { d: 0.6, p: 0.275, s: 0.6 };
const adv = (ch, size) => (/[0-9]/.test(ch) ? ADV.d : /[.,]/.test(ch) ? ADV.p : ADV.s) * size;
const width = (str, size) => [...str].reduce((a, ch) => a + adv(ch, size), 0);
// Set a string one character at a time from a left edge, each character centred in its advance plus `track` px.
const setChars = (x, y, str, cls, size, track = 0) => {
  let s = '', cx = x;
  for (const ch of str) { const w = /[A-Z]/.test(ch) ? CAPS[ch] || 8 : adv(ch, size); s += text(cx + w / 2, y, ch, cls, 'middle'); cx += w + track; }
  return { s, end: cx - track };
};
// Capital widths at 12 px, weight 600 (t-val).
const CAPS = { A: 8.8, C: 8.5, E: 7.6, I: 3.1, L: 7.1, N: 8.7, R: 8, S: 7.7, T: 8, U: 8.5, V: 8.8 };
// A small bracket under a gap, from x1 to x2.
const under = (x1, x2, y, cls = 's-ink') => raw(`M${x1} ${y - 3}V${y}H${x2}V${y - 3}`, cls, 1.5);
// A rectangle outline (rect() is filled; this one is a stroke only).
const box = (x, y, w, h, cls = 's-ink', sw = 1.5) => raw(`M${x} ${y}H${x + w}V${y + h}H${x}Z`, cls, sw);

export default {
  // Univers, 1957: 21 faces, the first digit gives the weight (3 light to 8 heavy), the second the width (3 extended to 9 condensed, even = oblique).
  frutiger: {
    title: { en: 'The Univers number grid', fr: 'La grille des numéros d’Univers' },
    caption: {
      en: 'In Univers the first digit gives a face’s weight and the second its width, placing every face around 55, the regular.',
      fr: 'Dans Univers, le premier chiffre donne la graisse d’un style et le second sa largeur, ce qui place chaque style autour de 55, le romain.',
    },
    draw: (lang) => {
      const faces = [39, 45, 46, 47, 48, 49, 53, 55, 56, 57, 58, 59, 63, 65, 66, 67, 68, 73, 75, 76, 83];
      const cols = [3, 5, 6, 7, 8, 9], x0 = 100, cw = 38, y0 = 42, rh = 24;
      let s = '';
      for (const f of faces) {
        const r = Math.floor(f / 10) - 3, c = cols.indexOf(f % 10), x = x0 + c * cw, y = y0 + r * rh;
        s += rect(x + 2, y + 2, cw - 4, rh - 4, f === 55 ? 'i-field' : 'i-relief', 3);
        s += text(x + cw / 2, y + rh / 2 + 4, String(f), f === 55 ? 't-val' : f % 2 ? 't-lab' : 't-ax', 'middle');
      }
      s += box(x0 + cw + 1, y0 + 2 * rh + 1, cw - 2, rh - 2, 's-ink', 2);
      // width runs across, weight runs down
      const ax = x0 + 6 * cw;
      s += text(x0 + 2, 26, t(lang, 'wide', 'large'), 't-ax') + text(ax - 2, 26, t(lang, 'narrow', 'étroit'), 't-ax', 'end');
      s += raw(`M${x0 + 40} 22H${ax - 52}M${ax - 56} 19L${ax - 52} 22L${ax - 56} 25`, 's-rule', 1.2);
      s += text(x0 - 12, y0 + 16, t(lang, 'light', 'maigre'), 't-ax', 'end') + text(x0 - 12, y0 + 5 * rh + 16, t(lang, 'heavy', 'gras'), 't-ax', 'end');
      s += raw(`M${x0 - 26} ${y0 + 26}V${y0 + 5 * rh - 4}M${x0 - 29} ${y0 + 5 * rh - 8}L${x0 - 26} ${y0 + 5 * rh - 4}L${x0 - 23} ${y0 + 5 * rh - 8}`, 's-rule', 1.2);
      return s;
    },
  },

  // Typographie, 1967: the white space around and inside letters is material; here, the gaps around figures as fixed tokens.
  ruder: {
    title: { en: 'Fixed spaces around figures', fr: 'Des espaces fixes autour des chiffres' },
    caption: {
      en: 'One fixed gap between sign and digits and one between value and unit keep a column even; varied gaps look ragged.',
      fr: 'Un écart fixe entre signe et chiffres et un autre entre valeur et unité gardent la colonne nette ; des écarts au hasard la rendent inégale.',
    },
    draw: (lang) => {
      const rows = [['+', 4.2], ['−', 12.8], ['+', 0.6], ['−', 3.5]], F = 22, G = 5;
      const odd = { sign: [0, 11, 3, 8], unit: [10, 1, 6, 13] };
      let s = text(24, 30, t(lang, 'varied gaps', 'écarts variés'), 't-ax') + text(196, 30, t(lang, 'fixed gaps', 'écarts fixes'), 't-val');
      s += line(176, 42, 176, 182, 's-light');
      const panel = (xd, gapS, gapU, ink) => {
        let p = '';
        rows.forEach(([sg, v], i) => {
          const y = 68 + i * 32, digits = num(lang, v, 1), wd = width(digits, F), xs = xd - wd - gapS[i], xu = xd + gapU[i];
          p += text(xs, y, sg, 't-big', 'end') + text(xd, y, digits, 't-big', 'end') + text(xu, y, '%', 't-big');
          const cls = ink ? 'i-ink' : 'i-light';
          p += rect(xs, y + 6, Math.max(1.5, gapS[i]), 3, cls) + rect(xd, y + 6, Math.max(1.5, gapU[i]), 3, cls);
        });
        return p;
      };
      s += panel(96, odd.sign, odd.unit, false);
      s += panel(272, [G, G, G, G], [G, G, G, G], true);
      return s;
    },
  },

  // Munich 1972: one sheet that cross-indexes every sport (by pictogram) against one shared row of dates. Marks are illustrative.
  aicher: {
    title: { en: 'One date axis for every sport', fr: 'Un axe des dates pour tous les sports' },
    caption: {
      en: 'The Munich 1972 schedule ran one date axis across every sport’s row, so any event is found by pictogram and day.',
      fr: 'Le programme de Munich 1972 tendait un même axe des dates sur la ligne de chaque sport : une épreuve se trouve par pictogramme et par jour.',
    },
    draw: (lang) => {
      const x0 = 66, cw = 17, n = 16, y0 = 50, rh = 18, hot = 9;
      const days = [
        [7, 8, 9, 10, 11, 12, 13, 14, 15], [2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7], [1, 3, 4, 5, 9, 10],
        [1, 2, 3, 4, 5, 6, 9, 10], [0, 2, 4, 6, 8, 10, 12, 14, 15], [3, 4, 5, 6, 7, 8, 9, 10],
      ];
      const P = 's-slate', pw = 1.6;
      const pict = [
        (x, y) => circle(x + 2, y - 5.5, 1.9) + path([[x + 1, y - 3], [x - 1.5, y + 1.5]], P, pw) + path([[x - 3.5, y - 1.5], [x - 0.5, y - 3], [x + 2.5, y - 0.5]], P, pw) + path([[x - 4.5, y + 5.5], [x - 1.5, y + 1.5], [x + 2, y + 3.5], [x + 2, y + 7]], P, pw),
        (x, y) => circle(x - 4.5, y - 0.5, 1.9) + path([[x - 2.5, y + 0.5], [x + 5, y + 0.5]], P, pw) + path([[x - 1, y + 0.5], [x + 1.5, y - 3], [x + 4.5, y - 3]], P, pw) + path([[x - 7, y + 4.5], [x + 7, y + 4.5]], P, 1),
        (x, y) => circle(x + 1.5, y - 5, 1.9) + path([[x - 1, y + 3], [x + 1, y - 2.5]], P, pw) + path([[x - 5, y - 1.5], [x + 5.5, y + 6.5]], P, 1.2) + path([[x - 7, y + 4.5], [x + 7, y + 4.5]], P, pw),
        (x, y) => raw(`M${x - 7} ${y + 4}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M${x + 1} ${y + 4}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`, P, 1.1) + circle(x + 2.5, y - 5.5, 1.9) + path([[x - 4, y + 4], [x - 1, y - 1], [x + 2.5, y - 3.5], [x + 4, y + 0.5]], P, pw),
        (x, y) => circle(x, y - 4.5, 1.9) + path([[x - 3.5, y - 7.5], [x, y - 2], [x + 3.5, y - 7.5]], P, pw) + path([[x, y - 2], [x, y + 2.5]], P, pw) + path([[x - 2.5, y + 7], [x, y + 2.5], [x + 2.5, y + 7]], P, pw),
        (x, y) => circle(x - 0.5, y - 5.5, 1.9) + path([[x - 0.5, y - 3], [x - 1.5, y + 1]], P, pw) + path([[x - 4, y - 2], [x - 0.5, y - 2.5], [x + 2.5, y - 1]], P, pw) + path([[x - 4, y + 6.5], [x - 1.5, y + 1], [x + 2.5, y + 4]], P, pw) + circle(x + 5, y + 5, 1.7),
        (x, y) => area([[x - 0.5, y - 7.5], [x - 0.5, y + 2.5], [x + 5.5, y + 2.5]], 'i-slate') + path([[x - 6, y + 4.5], [x + 6, y + 4.5], [x + 4.5, y + 6.5], [x - 4.5, y + 6.5], [x - 6, y + 4.5]], P, 1.2),
      ];
      let s = rect(x0 + hot * cw, y0 - 6, cw, days.length * rh + 6, 'i-well');
      // the shared date axis
      s += line(x0, y0 - 6, x0 + n * cw, y0 - 6, 's-ink', 1.5);
      for (let i = 0; i <= n; i++) s += line(x0 + i * cw, y0 - 10, x0 + i * cw, y0 - 6, 's-ink', 1);
      s += text(x0, 32, t(lang, 'Aug 26', '26 août'), 't-ax') + text(x0 + n * cw, 32, t(lang, 'Sep 10', '10 sept.'), 't-ax', 'end');
      s += text(x0 + (hot + 0.5) * cw, 32, t(lang, 'Sep 4', '4 sept.'), 't-val', 'middle');
      days.forEach((ds, r) => {
        const y = y0 + r * rh;
        s += pict[r](40, y + rh / 2 - 1);
        s += line(x0, y + rh, x0 + n * cw, y + rh, 's-light', 0.75);
        for (const d of ds) s += rect(x0 + d * cw + 2.5, y + 5, cw - 5, rh - 10, r === 0 && d === hot ? 'i-ink' : 'i-slate', 1.5);
      });
      return s;
    },
  },

  // Dutch telephone directory, 1977 (with Jolijn van de Wouw): lower case, number before name, so no leader dots. Names and numbers are illustrative.
  crouwel: {
    title: { en: 'The number before the name', fr: 'Le numéro avant le nom' },
    caption: {
      en: 'Setting each number right before its name, in lower case, joined the two fields and removed the need for leader dots.',
      fr: 'Placer chaque numéro juste avant son nom, en bas de casse, réunit les deux champs et supprime les points de conduite.',
    },
    draw: (lang) => {
      const names = [['Bakker J.', 'bakker j'], ['de Boer A.', 'de boer a'], ['Dekker M.', 'dekker m'], ['Jansen P.', 'jansen p'], ['Smit H.', 'smit h'], ['Visser K.', 'visser k']];
      const nums = ['241307', '386512', '170948', '522063', '613275', '458190'];
      let s = text(24, 34, t(lang, 'name first', 'nom d’abord'), 't-ax') + text(196, 34, t(lang, 'number first', 'numéro d’abord'), 't-val');
      s += line(176, 44, 176, 182, 's-light');
      names.forEach(([full, low], i) => {
        const y = 62 + i * 22, nameEnd = 24 + full.length * 6.9 + 7, numStart = 164 - 6 * 7.2 - 5;
        s += text(24, y, full, 't-lab') + text(164, y, nums[i], 't-ax', 'end');
        for (let x = nameEnd; x <= numStart; x += 4.5) s += circle(x, y - 1, 0.9, 'i-slate');
        s += text(196, y, nums[i], 't-val') + text(196 + 6 * 7.2 + 8, y, low, 't-lab');
      });
      return s;
    },
  },

  // Unigrid, 1977: one sheet system for the National Park Service, a black title band over modular panels, any size.
  vignelli: {
    title: { en: 'The Unigrid sheet', fr: 'La feuille Unigrid' },
    caption: {
      en: 'Every park brochure is built on the same black title band and modular panel grid, whatever its size or content.',
      fr: 'Chaque brochure de parc repose sur le même bandeau titre noir et la même grille de volets, quels que soient son format et son contenu.',
    },
    draw: (lang) => {
      const top = 46, bot = 166, band = 14, pw = 48, mh = (bot - top - band - 4 * 4) / 4;
      const sheet = (x, panels, blocks) => {
        let s = rect(x, top, panels * pw, bot - top, 'i-field') + rect(x, top, panels * pw, band, 'i-ink');
        s += rect(x + 5, top + 5, Math.min(64, panels * pw - 10), 4, 'i-field');
        for (let k = 1; k < panels; k++) s += line(x + k * pw, top + band, x + k * pw, bot, 's-light i-dash', 1);
        for (const [c, r, w, h, kind] of blocks) {
          const bx = x + c * pw + 4, by = top + band + 4 + r * (mh + 4), bw = w * pw - 8, bh = h * (mh + 4) - 4;
          if (kind === 'photo') s += rect(bx, by, bw, bh, 'i-light');
          else if (kind === 'map') {
            const pts = [[0.08, 0.85], [0.2, 0.55], [0.38, 0.7], [0.5, 0.35], [0.7, 0.5], [0.92, 0.15]].map(([a, b]) => [bx + a * bw, by + b * bh]);
            s += rect(bx, by, bw, bh, 'i-well') + area([[bx + bw * 0.55, by + bh], [bx + bw * 0.62, by + bh * 0.72], [bx + bw * 0.8, by + bh * 0.8], [bx + bw, by + bh * 0.62], [bx + bw, by + bh]], 'i-light') + path(pts, 's-slate', 1.2) + circle(pts[1][0], pts[1][1], 2.2) + circle(pts[4][0], pts[4][1], 2.2);
          }
          else for (let ly = by + 3; ly < by + bh; ly += 5) s += line(bx, ly, bx + bw, ly, 's-light', 1.5);
        }
        return s;
      };
      let s = sheet(24, 2, [[0, 0, 1, 2, 'photo'], [1, 0, 1, 4, 'text'], [0, 2, 1, 2, 'map']]);
      s += sheet(144, 4, [[0, 0, 2, 2, 'photo'], [2, 0, 1, 2, 'text'], [3, 0, 1, 4, 'text'], [0, 2, 3, 2, 'map']]);
      s += text(24, 30, t(lang, 'black title band', 'bandeau titre noir'), 't-val') + line(60, 35, 60, top - 1, 's-ink', 1);
      s += text(72, 184, t(lang, '2 panels', '2 volets'), 't-ax', 'middle') + text(240, 184, t(lang, '4 panels, same parts', '4 volets, mêmes éléments'), 't-ax', 'middle');
      return s;
    },
  },

  // Bell Centennial, 1975 to 1978: notches cut into tight joins so that ink spreading on fast-printed newsprint fills them.
  carter: {
    title: { en: 'Ink traps', fr: 'Les pièges à encre' },
    caption: {
      en: 'Bell Centennial cuts notches into tight joins, so ink spreading on newsprint fills them instead of clogging the letter.',
      fr: 'Bell Centennial creuse des encoches dans les jonctions serrées : l’encre qui s’étale sur le papier journal les remplit au lieu d’empâter la lettre.',
    },
    draw: (lang) => {
      // A "v": stroke 14 wide at the top, the inner crotch C where the two inner edges meet. Spread = ink gain of 2 px all round.
      // Printing is modelled as an even ink gain all round (a stroke of twice the spread), which fills acute inside corners first.
      const W = 46, H = 58, T = 15, B = 8, k = (W / 2 - T) / (W / 2 - B / 2), cy = H * k, slope = (W / 2 - T) / cy, spread = 3;
      const plain = [[0, 0], [T, 0], [W / 2, cy], [W - T, 0], [W, 0], [W / 2 + B / 2, H], [W / 2 - B / 2, H]];
      // the trap: a slot a little wider than the ink gain, reaching one spread below the intended crotch
      const hw = spread + 1, yTop = (W / 2 - hw - T) / slope, yBot = cy + spread + 0.5;
      const trapped = [[0, 0], [T, 0], [W / 2 - hw, yTop], [W / 2 - hw, yBot], [W / 2 + hw, yBot], [W / 2 + hw, yTop], [W - T, 0], [W, 0], [W / 2 + B / 2, H], [W / 2 - B / 2, H]];
      const at = (pts, x, y) => pts.map(([a, b]) => [x + a, y + b]);
      const drawn = (pts, x, y) => area(at(pts, x, y), 'i-slate');
      const printed = (pts, x, y) => { const p = at(pts, x, y); return area(p, 'i-ink') + path([...p, p[0]], 's-ink', spread * 2); };
      const cx1 = 124, cx2 = 222, r1 = 44, r2 = 120;
      let s = text(cx1 + W / 2, 30, t(lang, 'drawn', 'dessiné'), 't-ax', 'middle') + text(cx2 + W / 2, 30, t(lang, 'printed', 'imprimé'), 't-ax', 'middle');
      s += text(20, r1 + 33, t(lang, 'no trap', 'sans piège'), 't-ax') + text(20, r2 + 33, t(lang, 'ink trap', 'piège à encre'), 't-val');
      s += drawn(plain, cx1, r1) + printed(plain, cx2, r1) + drawn(trapped, cx1, r2) + printed(trapped, cx2, r2);
      for (const r of [r1, r2]) s += raw(`M${cx1 + W + 14} ${r + H / 2}H${cx2 - 14}M${cx2 - 18} ${r + H / 2 - 3}L${cx2 - 14} ${r + H / 2}L${cx2 - 18} ${r + H / 2 + 3}`, 's-rule', 1.2);
      s += text(cx2 + W + 14, r1 + 33, t(lang, 'clogged', 'empâté'), 't-ax') + text(cx2 + W + 14, r2 + 33, t(lang, 'clean', 'net'), 't-val');
      return s;
    },
  },

  // Grid Systems in Graphic Design, 1981: fields built from the line spacing of the text, so every field is a whole number of lines.
  mb: {
    title: { en: 'Rows in whole lines', fr: 'Des rangées en lignes entières' },
    caption: {
      en: 'Each field is a whole number of text lines, with one empty line between fields, so text and charts keep one rhythm.',
      fr: 'Chaque champ compte un nombre entier de lignes de texte, avec une ligne vide entre les champs : texte et graphiques gardent un même rythme.',
    },
    draw: (lang) => {
      const L = 12, b0 = 46, nl = 12, bl = (k) => b0 + k * L, cap = 5;
      let s = '';
      for (let k = 0; k < nl; k++) s += line(24, bl(k), 316, bl(k), 's-light', 0.75);
      const lens = [80, 76, 82, 48, 0, 80, 74, 81, 77, 80, 78, 52];
      lens.forEach((w, k) => { if (w) s += rect(24, bl(k) - 5, w, 5, 'i-slate', 1); });
      // field 1: lines 0 to 3 in two columns; one empty line; field 2: lines 5 to 11
      const f1t = bl(0) - cap, f1b = bl(3), f2t = bl(5) - cap, f2b = bl(11);
      s += rect(124, f1t, 92, f1b - f1t, 'i-field', 2) + rect(224, f1t, 92, f1b - f1t, 'i-field', 2) + rect(124, f2t, 192, f2b - f2t, 'i-field', 2);
      [12, 20, 15, 24, 18, 26].forEach((h, i) => { s += rect(134 + i * 12, bl(3) - h, 7, h, 'i-light'); });
      s += text(232, bl(3), num(lang, 1284), 't-big') + text(232, bl(0) + 4, t(lang, '4 lines', '4 lignes'), 't-ax');
      s += text(132, bl(5) + 4, t(lang, '7 lines', '7 lignes'), 't-ax');
      s += path([[134, bl(11) - 4], [160, bl(10)], [184, bl(10) - 4], [210, bl(8)], [236, bl(9)], [262, bl(8) - 3], [306, bl(7)]], 's-slate', 1.5);
      // the ruler: one tick per text line, fields end on ticks
      s += line(328, bl(0) - cap, 328, bl(nl - 1), 's-ink', 1.5);
      for (let k = 0; k < nl; k++) s += line(323, bl(k), 333, bl(k), 's-ink', 1.5);
      s += text(24, 26, t(lang, 'text lines', 'lignes de texte'), 't-ax') + text(328, 26, t(lang, 'one line = one unit', 'une ligne = une unité'), 't-val', 'end');
      return s;
    },
  },

  // The rhetoric of neutrality, 1985: a calm, exact layout persuades; so each board says what kind of numbers it holds.
  kinross: {
    title: { en: 'Say what the numbers are', fr: 'Dire ce que sont les chiffres' },
    caption: {
      en: 'A neutral layout lends any figure authority, so one line on each board says if it is actual, plan, sample or model.',
      fr: 'Une mise en page neutre donne de l’autorité à tout chiffre : une ligne sur chaque tableau dit s’il est réel, prévu, échantillonné ou modélisé.',
    },
    draw: (lang) => {
      const kinds = [t(lang, 'Actual', 'Réel'), t(lang, 'Plan', 'Prévu'), t(lang, 'Sample', 'Échantillon'), t(lang, 'Model', 'Modèle')];
      const spark = [[0, 18], [8, 14], [16, 16], [24, 9], [32, 11], [40, 4], [48, 6]];
      let s = '';
      kinds.forEach((k, i) => {
        const x = 20 + (i % 2) * 162, y = 20 + Math.floor(i / 2) * 84, w = 150, h = 74;
        s += rect(x, y, w, h, 'i-field', 6);
        s += rect(x + 12, y + 11, 7, 7, 'i-ink', 1) + text(x + 25, y + 18, k, 't-val');
        s += line(x + 12, y + 26, x + w - 12, y + 26, 's-light', 0.75);
        s += text(x + 12, y + 56, num(lang, 1240), 't-big');
        s += path(spark.map(([a, b]) => [x + 90 + a, y + 38 + b]), 's-slate', 1.5);
      });
      return s;
    },
  },

  // Detail in Typography, 1987: spacing set for the job; capitals and small sizes open up, large sizes close up.
  hochuli: {
    title: { en: 'Spacing set by role', fr: 'Un espacement selon le rôle' },
    caption: {
      en: 'Small capital labels get a little extra space between letters, table figures keep their own spacing and large figures close up slightly.',
      fr: 'Les étiquettes en petites capitales sont un peu espacées, les chiffres de tableau gardent leur approche et les grands chiffres se resserrent légèrement.',
    },
    draw: (lang) => {
      let s = '';
      const xs = 146, rows = [52, 104, 164];
      // role names on the left, spacing on the right
      s += text(24, rows[0], t(lang, 'label', 'étiquette'), 't-ax') + text(24, rows[1], t(lang, 'table figures', 'chiffres de tableau'), 't-ax') + text(24, rows[2] - 6, t(lang, 'large figure', 'grand chiffre'), 't-ax');
      s += line(134, 30, 134, 180, 's-light');
      // 1. small capitals, tracked open
      const word = t(lang, 'REVENUE', 'RECETTES');
      const a = setChars(xs, rows[0], word, 't-val', 12, 2.2);
      s += a.s;
      // 2. table figures, as drawn
      s += text(xs + 60, rows[1] - 14, num(lang, 1284.5, 2), 't-lab', 'end') + text(xs + 60, rows[1] + 2, num(lang, 312.75, 2), 't-lab', 'end');
      // 3. a large figure, closed up
      const big = num(lang, 12.8, 1);
      let cx = xs;
      for (const ch of big) { const w = adv(ch, 22) - 1.4; s += text(cx + w / 2, rows[2], ch, 't-big', 'middle'); cx += w; }
      s += text(cx + (lang === 'fr' ? 4 : 0.5), rows[2], '%', 't-big');
      // the spacing applied, as a sign and a word
      const mark = (y, sign, en, fr) => text(328, y, `${sign} ${t(lang, en, fr)}`, 't-val', 'end');
      s += mark(rows[0], '+', 'open', 'ouvert') + mark(rows[1] - 6, '0', 'as drawn', 'd’origine') + mark(rows[2] - 6, '−', 'tight', 'serré');
      return s;
    },
  },

  // Retina, 1999 (Wall Street Journal stock listings): every weight keeps the same widths, so a bold figure takes a regular one's space.
  frerejones: {
    title: { en: 'Bold the width of regular', fr: 'Un gras de la chasse du normal' },
    caption: {
      en: 'In Retina a bold figure takes the space of a regular one, so a row turns bold without shifting the column.',
      fr: 'Dans Retina, un chiffre gras occupe la place d’un chiffre normal : une ligne passe en gras sans décaler la colonne.',
    },
    draw: (lang) => {
      const vals = [48216, 9315.5, 12062, 30774, 8150], hot = 3;
      const fmt = (v) => num(lang, v, 0);
      const panel = (x0, xr, boldPitch) => {
        let s = '';
        // guides at the digit centres of the regular rows
        const reg = fmt(vals[0]);
        let gx = xr;
        const centres = [];
        for (const ch of [...reg].reverse()) { const w = /[0-9]/.test(ch) ? 7.2 : 3.4; if (/[0-9]/.test(ch)) centres.push(gx - w / 2); gx -= w; }
        vals.forEach((v, i) => {
          const y = 66 + i * 24, b = i === hot, str = fmt(v);
          if (b) { s += rect(x0, y - 15, xr - x0 + 8, 22, 'i-well', 3); for (const c of centres) s += line(c, y - 19, c, y - 15, 's-ink', 1.2) + line(c, y + 7, c, y + 11, 's-ink', 1.2); }
          s += rect(x0 + 8, y - 6, 30, 5, b ? 'i-slate' : 'i-light', 1);
          let cx = xr;
          for (const ch of [...str].reverse()) {
            const w = (/[0-9]/.test(ch) ? 7.2 : 3.4) * (b ? boldPitch : 1);
            s += text(cx - w / 2, y, ch, b ? 't-val' : 't-lab', 'middle'); cx -= w;
          }
        });
        return s;
      };
      let s = text(24, 30, t(lang, 'ordinary bold, wider', 'gras ordinaire, plus large'), 't-ax') + text(196, 30, t(lang, 'Retina bold, same width', 'gras Retina, même chasse'), 't-val');
      s += line(176, 42, 176, 182, 's-light');
      s += panel(24, 156, 1.14) + panel(196, 328, 1);
      return s;
    },
  },

  // Typographische Gestaltung, 1935 (Asymmetric Typography): no rules where possible; space separates the columns.
  tschichold: {
    title: { en: 'Space instead of rules', fr: 'De l’espace plutôt que des filets' },
    caption: {
      en: 'Take the vertical rules out of a table and widen the gaps between columns; the space alone keeps the columns apart.',
      fr: 'Retirer les filets verticaux d’un tableau et élargir l’espace entre les colonnes : l’espace seul suffit à les séparer.',
    },
    draw: (lang) => {
      const data = [[30, 22, 24, 18], [24, 16, 26, 20], [28, 24, 14, 22], [20, 18, 22, 26], [26, 26, 20, 16]];
      const y0 = 46, rh = 22, nr = 6;
      // the ruled table: every cell boxed, columns tight
      const lx = 20, lw = 32;
      let s = text(lx, 30, t(lang, 'ruled', 'filets partout'), 't-ax') + text(180, 30, t(lang, 'spaced', 'espacé'), 't-val');
      for (let c = 0; c <= 4; c++) s += line(lx + c * lw, y0, lx + c * lw, y0 + nr * rh, 's-rule', 1);
      for (let r = 0; r <= nr; r++) s += line(lx, y0 + r * rh, lx + 4 * lw, y0 + r * rh, 's-rule', 1);
      const cells = (colX, colW) => {
        let p = '';
        for (let c = 0; c < 4; c++) p += rect(c ? colX[c] + colW - 26 : colX[c], y0 + rh / 2 - 3, 26, 6, 'i-slate', 1);
        data.forEach((row, r) => row.forEach((w, c) => { const y = y0 + (r + 1) * rh + rh / 2 - 2.5; p += rect(c ? colX[c] + colW - w : colX[c], y, w, 5, 'i-light', 1); }));
        return p;
      };
      s += cells([0, 1, 2, 3].map((c) => lx + c * lw + 3), lw - 6);
      // the spaced table: same cells, no vertical rules, wide gaps, one rule under the head
      const rx = 180, gap = 16, cw = 26, colX = [0, 1, 2, 3].map((c) => rx + c * (cw + gap));
      s += cells(colX, cw);
      s += line(rx, y0 + rh, colX[3] + cw, y0 + rh, 's-rule', 1);
      for (let c = 0; c < 3; c++) s += under(colX[c] + cw + 2, colX[c + 1] - 2, y0 + nr * rh + 8);
      return s;
    },
  },

  // The Elements of Typographic Style, 1992: join a number to its unit with a space that cannot break.
  bringhurst: {
    title: { en: 'Value and unit, unbroken', fr: 'Valeur et unité insécables' },
    caption: {
      en: 'A no-break space ties each value to its unit, so 42 and km always move to a new line together.',
      fr: 'Une espace insécable lie chaque valeur à son unité : 42 et km passent toujours ensemble à la ligne.',
    },
    draw: (lang) => {
      const ys = [70, 94, 118, 142], sp = 5, wv = 2 * 7.3, wu = 18;
      const words = (x, y, ws) => { let p = '', cx = x; for (const w of ws) { p += rect(cx, y - 6, w, 6, 'i-light', 1); cx += w + sp; } return { p, end: cx }; };
      const block = (x, right, tied) => {
        let p = line(right, 46, right, 160, 's-rule i-dash', 1);
        const l1 = words(x, ys[0], [34, 24, 36]);
        p += l1.p;
        if (!tied) {
          p += text(l1.end, ys[0], '42', 't-val');
          p += text(x, ys[1], 'km', 't-val') + words(x + wu + sp, ys[1], [28, 40, 18]).p;
        } else {
          p += text(x, ys[1], '42', 't-val') + text(x + wv + 6, ys[1], 'km', 't-val');
          p += under(x + wv + 0.5, x + wv + 5.5, ys[1] + 6);
          p += words(x + wv + 6 + wu + sp, ys[1], [28, 40]).p;
        }
        p += words(x, ys[2], [44, 30, 38]).p + words(x, ys[3], [52, 26]).p;
        return p;
      };
      let s = text(24, 30, t(lang, 'ordinary space', 'espace ordinaire'), 't-ax') + text(196, 30, t(lang, 'no-break space', 'espace insécable'), 't-val');
      s += line(176, 42, 176, 170, 's-light');
      s += block(24, 160, false) + block(196, 332, true);
      return s;
    },
  },
};
