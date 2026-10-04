import { rect, line, circle, path, area, raw, text, t, num } from './kit.mjs';

// Fills the kit's rect cannot carry on its own: an outline with a white body, and the page's slate hatch.
const outlined = (x, y, w, h, cls = 'i-field s-slate') => rect(x, y, w, h, cls).replace('<rect ', '<rect stroke-width="1.5" ');
const hatched = (x, y, w, h) => rect(x, y, w, h, 'i-field') + rect(x, y, w, h, 's-slate').replace('<rect ', '<rect fill="url(#i-hatch)" stroke-width="1.5" ');
const struck = (x, y, s, cls) => text(x, y, s, cls).replace('<text ', '<text text-decoration="line-through" ');
// A small arrowhead pointing right, ending at (x, y).
const arrow = (x1, x2, y, cls = 's-slate') => line(x1, y, x2, y, cls, 1.5) + raw(`M${x2 - 5} ${y - 4}L${x2} ${y}L${x2 - 5} ${y + 4}`, cls, 1.5);

export default {
  // The Commercial and Political Atlas, 1786: imports and exports as two lines, the balance of trade tinted between them.
  playfair: {
    title: { en: 'The balance as an area', fr: 'Le solde comme surface' },
    caption: {
      en: 'Imports and exports on one scale, with the space between the two lines tinted as the balance of trade, for or against.',
      fr: 'Importations et exportations sur une même échelle, l’espace entre les deux lignes teinté comme solde commercial, favorable ou défavorable.',
    },
    draw: (lang) => {
      // Illustrative curves only: imports rise gently, exports overtake them about half way.
      const x0 = 24, x1 = 252, y0 = 172, k = 0.68, N = 48;
      const imp = (u) => 74 + 28 * u, exp = (u) => 22 + 40 * u + 135 * u * u;
      const X = (u) => x0 + u * (x1 - x0), Y = (v) => y0 - v * k;
      const us = Array.from({ length: N + 1 }, (_, i) => i / N);
      let cross = 0.5; for (let i = 0; i < N; i++) { const a = exp(us[i]) - imp(us[i]), b = exp(us[i + 1]) - imp(us[i + 1]); if (a <= 0 && b > 0) cross = us[i] + (us[i + 1] - us[i]) * (-a / (b - a)); }
      const band = (from, to) => { const u = us.filter((v) => v > from && v < to), seg = [from, ...u, to]; return [...seg.map((v) => [X(v), Y(exp(v))]), ...seg.reverse().map((v) => [X(v), Y(imp(v))])]; };
      let s = '';
      for (let i = 0; i <= 8; i++) s += line(X(i / 8), 30, X(i / 8), y0, 's-light', 0.75);
      s += area(band(0, cross), 'i-well') + area(band(cross, 1), 'i-light');
      s += line(x0, y0, x1, y0, 's-rule');
      s += path(us.map((u) => [X(u), Y(imp(u))]), 's-slate', 2) + path(us.map((u) => [X(u), Y(exp(u))]), 's-ink', 2, true);
      s += text(x1 + 8, Y(exp(1)) + 4, t(lang, 'Exports', 'Exportations'), 't-val') + text(x1 + 8, Y(imp(1)) + 4, t(lang, 'Imports', 'Importations'), 't-lab');
      s += text(X(0.98), Y(imp(0.74)) - 7, t(lang, 'in favour', 'favorable'), 't-val', 'end');
      s += text(x0 + 6, Y(imp(0.1)) + 15, t(lang, 'against', 'défavorable'), 't-ax');
      s += text(x0, 22, t(lang, 'Balance of trade, shaded', 'Solde commercial, en teinte'), 't-ax');
      return s;
    },
  },

  // La Méthode graphique, 1878: Ibry's Paris to Lyon schedule, stations down the side by distance, hours across.
  marey: {
    title: { en: 'The train graph', fr: 'Le graphique des trains' },
    caption: {
      en: 'Stations sit down the side by distance and hours run across, so each train is a line whose slope is its speed.',
      fr: 'Gares placées selon leur distance, heures en largeur, chaque train devient une ligne dont la pente donne la vitesse.',
    },
    draw: (lang) => {
      // Station positions follow the line's distances (Paris 0, Dijon 315, Lyon 512 km); the trains are schematic.
      const x0 = 66, x1 = 322, yT = 38, yB = 182, h0 = 4, h1 = 24;
      const X = (h) => x0 + ((h - h0) / (h1 - h0)) * (x1 - x0), Y = (km) => yT + (km / 512) * (yB - yT);
      let s = '';
      for (let h = h0; h <= h1; h++) s += line(X(h), yT, X(h), yB, 's-light', h % 6 ? 0.5 : 1);
      [155, 197, 245, 380, 441].forEach((km) => { s += line(x0, Y(km), x1, Y(km), 's-light', 0.5); });
      [['Paris', 0], ['Dijon', 315], ['Lyon', 512]].forEach(([nm, km]) => { s += line(x0, Y(km), x1, Y(km), 's-rule', 1) + text(x0 - 8, Y(km) + 4, nm, 't-lab', 'end'); });
      [6, 12, 18, 24].forEach((h) => { s += text(X(h), yT - 10, lang === 'fr' ? `${h} h` : `${h}:00`, 't-ax', 'middle'); });
      // [hour, km] stops; a flat step is a stop, a steeper line a faster train.
      const trains = [
        [[5, 0], [8.2, 245], [9.4, 315], [9.9, 315], [12.3, 512]],
        [[9, 0], [13.5, 197], [14, 197], [17.5, 380], [18, 380], [21.5, 512]],
        [[14, 0], [16.5, 197], [18.2, 315], [18.6, 315], [21, 512]],
        [[19, 0], [23.5, 315]],
        [[4, 380], [5.6, 512]],
        [[6, 512], [8.5, 315], [9, 315], [13.5, 0]],
        [[11, 512], [14, 380], [14.4, 380], [18.5, 155], [19.8, 0]],
        [[17, 512], [19.7, 315], [20.1, 315], [24, 0]],
      ];
      trains.forEach((tr, i) => { s += path(tr.map(([h, km]) => [X(h), Y(km)]), i === 0 ? 's-ink' : 's-slate', i === 0 ? 2.25 : 1.25, i === 0); });
      return s;
    },
  },

  // Joint Committee on Standards for Graphic Presentation, 1915: lengths rather than areas, and a zero line set apart from the grid.
  brinton: {
    title: { en: 'Lengths and a heavy zero', fr: 'Longueurs et zéro appuyé' },
    caption: {
      en: 'The same two quantities as areas, then as lengths on a common scale whose zero line is heavier than the grid.',
      fr: 'Les deux mêmes quantités en surfaces, puis en longueurs sur une échelle commune au zéro plus appuyé que la grille.',
    },
    draw: (lang) => {
      // Two illustrative values in the ratio 2 to 1: circles of area 2:1, bars of length 2:1.
      const x0 = 210, base = 150, top = 46, Y = (v) => base - (v / 100) * (base - top);
      let s = circle(58, base - 34, 34, 'i-light') + circle(58 + 34 + 4 + 24, base - 24, 24, 'i-light');
      s += text(20, 24, t(lang, 'as areas', 'en surfaces'), 't-lab');
      s += line(158, 14, 158, 186, 's-rule');
      [25, 50, 75, 100].forEach((v) => { s += line(x0 - 4, Y(v), 334, Y(v), 's-light', 1); });
      [0, 50, 100].forEach((v) => { s += text(x0 - 10, Y(v) + 4, String(v), 't-ax', 'end'); });
      s += rect(x0 + 18, Y(80), 40, base - Y(80), 'i-slate') + rect(x0 + 76, Y(40), 40, base - Y(40), 'i-slate');
      s += line(x0 - 4, base, 334, base, 's-ink', 3);
      s += text(176, 24, t(lang, 'as lengths', 'en longueurs'), 't-lab');
      s += text(334, 172, t(lang, 'zero line heavier', 'zéro plus appuyé'), 't-val', 'end');
      return s;
    },
  },

  // Shewhart's control chart, 1924, as Wheeler's chart of individual values: average ± 2.66 average moving ranges.
  shewhart: {
    title: { en: 'Natural process limits', fr: 'Les limites naturelles du processus' },
    caption: {
      en: 'Limits at the average plus and minus 2.66 average moving ranges, from past values; only the point beyond them is a signal.',
      fr: 'Limites à la moyenne plus ou moins 2,66 étendues mobiles moyennes, tirées du passé ; seul le point au-delà est un signal.',
    },
    draw: (lang) => {
      // Illustrative values; the limits are computed from the first 16 (the baseline), as the method prescribes.
      const v = [52, 47, 55, 50, 44, 53, 49, 57, 51, 46, 54, 48, 50, 53, 45, 51, 49, 52, 71, 50, 47, 53];
      const base = v.slice(0, 16), avg = base.reduce((a, b) => a + b, 0) / base.length;
      const mr = base.slice(1).map((x, i) => Math.abs(x - base[i])), mrBar = mr.reduce((a, b) => a + b, 0) / mr.length;
      const up = avg + 2.66 * mrBar, lo = avg - 2.66 * mrBar;
      const x0 = 20, x1 = 254, X = (i) => x0 + (i / (v.length - 1)) * (x1 - x0), Y = (val) => 182 - (val - 30) * 3.1;
      let s = text(x0, 22, t(lang, 'average ± 2.66 × average moving range', 'moyenne ± 2,66 × étendue mobile moyenne'), 't-ax');
      s += line(x0, Y(up), x1 + 8, Y(up), 's-slate i-dash', 1.25) + line(x0, Y(lo), x1 + 8, Y(lo), 's-slate i-dash', 1.25) + line(x0, Y(avg), x1 + 8, Y(avg), 's-rule', 1.25);
      s += text(x1 + 14, Y(up) + 4, t(lang, 'upper limit', 'limite haute'), 't-lab') + text(x1 + 14, Y(avg) + 4, t(lang, 'average', 'moyenne'), 't-ax') + text(x1 + 14, Y(lo) + 4, t(lang, 'lower limit', 'limite basse'), 't-lab');
      s += path(v.map((x, i) => [X(i), Y(x)]), 's-light', 1.25);
      v.forEach((x, i) => { s += x > up || x < lo ? circle(X(i), Y(x), 4.5, 'i-ink') : circle(X(i), Y(x), 2.5, 'i-slate'); });
      const io = v.findIndex((x) => x > up);
      s += text(X(io) + 9, Y(v[io]) + 4, t(lang, 'signal', 'signal'), 't-val');
      return s;
    },
  },

  // Isotype: each sign worth a fixed amount, repeated for more; a bigger sign is never used for a bigger number.
  neurath: {
    title: { en: 'More signs, never bigger ones', fr: 'Répéter le signe, sans l’agrandir' },
    caption: {
      en: 'Each sign is worth the same amount, so a larger quantity gets more signs to count, never a bigger sign.',
      fr: 'Chaque signe vaut la même quantité ; une quantité plus grande reçoit plus de signes à compter, jamais un signe plus grand.',
    },
    draw: (lang) => {
      // A plain figure: a round head over a rounded body, 22 px tall at scale 1, standing on y.
      const sign = (cx, y, cls, k = 1) => circle(cx, y - 18 * k, 4 * k, cls) + rect(cx - 6 * k, y - 12.5 * k, 12 * k, 12.5 * k, cls, 3 * k);
      let s = '';
      const rows = [['A', 3, 'i-slate', 64], ['B', 7, 'i-ink', 112]];
      rows.forEach(([lab, n, cls, y]) => {
        s += text(20, y - 4, lab, 't-lab');
        for (let i = 0; i < n; i++) s += sign(48 + i * 20, y, cls);
        s += text(48 + n * 20 + 2, y - 4, String(n * 10), 't-val');
      });
      s += sign(28, 166, 'i-slate') + text(40, 162, t(lang, '= 10 each', '= 10 chacun'), 't-ax');
      s += line(214, 26, 214, 182, 's-rule');
      s += text(276, 40, t(lang, 'not this', 'pas ceci'), 't-lab', 'middle');
      s += sign(240, 150, 'i-light') + sign(290, 150, 'i-light', 70 / 30);
      s += line(226, 160, 330, 62, 's-slate', 1.5);
      s += text(240, 166, '30', 't-ax', 'middle') + text(290, 166, '70', 't-ax', 'middle');
      return s;
    },
  },

  // Plain Words, 1948: the padded official phrase replaced by the short word, the same test for a dashboard label.
  gowers: {
    title: { en: 'The plain word', fr: 'Le mot simple' },
    caption: {
      en: 'Padded phrases struck out for the short word a reader would say, the same test applied here to a dashboard label.',
      fr: 'Des tournures gonflées barrées pour le mot court que dirait un lecteur, même test appliqué ici à l’étiquette d’un indicateur.',
    },
    draw: (lang) => {
      const rows = [
        [t(lang, 'in the event of', 'dans l’éventualité où'), t(lang, 'if', 'si')],
        [t(lang, 'prior to', 'préalablement à'), t(lang, 'before', 'avant')],
        [t(lang, 'unfilled demand quantity', 'quantité demandée non servie'), t(lang, 'lost sales', 'ventes perdues')],
      ];
      let s = text(20, 30, t(lang, 'official', 'administratif'), 't-ax') + text(236, 30, t(lang, 'plain', 'simple'), 't-ax');
      s += line(20, 40, 332, 40, 's-rule');
      rows.forEach(([a, b], i) => {
        const y = 72 + i * 44;
        s += struck(20, y, a, 't-lab') + arrow(210, 226, y - 4, 's-rule') + text(236, y, b, 't-val');
        if (i === 1) s += line(20, y + 22, 332, y + 22, 's-light', 1);
      });
      return s;
    },
  },

  // Charting Statistics, 1952: the range bar, a forerunner of the box plot.
  spear: {
    title: { en: 'The range bar', fr: 'La barre d’étendue' },
    caption: {
      en: 'A line from lowest to highest, a box for the middle half and a tick for the median, all on one scale.',
      fr: 'Un trait du minimum au maximum, une boîte pour la moitié centrale, une marque pour la médiane, sur une échelle commune.',
    },
    draw: (lang) => {
      // Illustrative spreads: [lowest, lower quartile, median, upper quartile, highest] on 0 to 100.
      const x0 = 28, x1 = 324, X = (v) => x0 + (v / 100) * (x1 - x0);
      const rows = [[12, 34, 46, 62, 88], [24, 40, 52, 60, 74], [6, 18, 27, 38, 58]];
      let s = '';
      [0, 25, 50, 75, 100].forEach((v) => { s += line(X(v), 30, X(v), 166, 's-light', v % 50 ? 0.5 : 1); });
      [0, 50, 100].forEach((v) => { s += text(X(v), 182, String(v), 't-ax', 'middle'); });
      rows.forEach(([a, q1, m, q3, b], i) => {
        const y = [62, 120, 150][i], first = i === 0;
        s += line(X(a), y, X(b), y, first ? 's-ink' : 's-slate', first ? 2 : 1.5);
        s += rect(X(q1), y - 7, X(q3) - X(q1), 14, first ? 'i-light' : 'i-well');
        s += rect(X(m) - 1.25, y - 11, 2.5, 22, first ? 'i-ink' : 'i-slate');
        if (first) {
          s += text(X(a), y - 16, t(lang, 'lowest', 'plus bas'), 't-ax', 'middle') + text(X(b), y - 16, t(lang, 'highest', 'plus haut'), 't-ax', 'middle');
          s += text(X(m), y - 16, t(lang, 'median', 'médiane'), 't-val', 'middle');
          s += text((X(q1) + X(q3)) / 2, y + 26, t(lang, 'middle half', 'moitié centrale'), 't-lab', 'middle');
        }
      });
      return s;
    },
  },

  // Rudiments of numeracy, 1977: round to two effective digits, order by size, compare down a column, add an average.
  ehrenberg: {
    title: { en: 'Round, order, compare down', fr: 'Arrondir, ordonner, comparer' },
    caption: {
      en: 'The same figures rounded to the two digits that vary, ordered by size in one column, with the average as a reference.',
      fr: 'Les mêmes chiffres arrondis aux deux chiffres qui varient, rangés par taille dans une colonne, avec la moyenne pour repère.',
    },
    draw: (lang) => {
      // Illustrative figures.
      const raw4 = [['A', 1247.36], ['B', 3981.02], ['C', 1862.5], ['D', 2710.77]];
      const avg = raw4.reduce((a, r) => a + r[1], 0) / raw4.length;
      const sorted = [...raw4].sort((p, q) => q[1] - p[1]);
      let s = text(20, 28, t(lang, 'Before', 'Avant'), 't-lab') + text(204, 28, t(lang, 'After, in hundreds', 'Après, en centaines'), 't-lab');
      s += line(20, 38, 148, 38, 's-rule') + line(204, 38, 332, 38, 's-rule');
      raw4.forEach(([k, v], i) => { const y = 62 + i * 24; s += text(20, y, k, 't-ax') + text(148, y, num(lang, v, 2), 't-lab', 'end'); });
      sorted.forEach(([k, v], i) => { const y = 62 + i * 24; s += text(204, y, k, 't-ax') + text(290, y, String(Math.round(v / 100)), 't-val', 'end'); });
      s += line(204, 146, 296, 146, 's-rule') + text(204, 164, t(lang, 'Average', 'Moyenne'), 't-ax') + text(290, 164, String(Math.round(avg / 100)), 't-lab', 'end');
      s += arrow(160, 190, 98, 's-rule');
      return s;
    },
  },

  // Beautiful Evidence, 2006: sparklines, word-sized graphics set beside the figure, with a band for the normal range.
  tufte: {
    title: { en: 'Word-sized sparklines', fr: 'Sparklines à taille de mot' },
    caption: {
      en: 'Each figure carries a line the height of a word showing its recent history, over a grey band for the normal range.',
      fr: 'Chaque chiffre porte une ligne haute comme un mot qui retrace son passé récent, sur une bande grise pour la plage normale.',
    },
    draw: (lang) => {
      // Illustrative series of 24 periods, each scaled 0 to 1 inside its row; the band is the normal range.
      const series = [
        [0.42, 0.5, 0.46, 0.55, 0.52, 0.6, 0.57, 0.49, 0.53, 0.62, 0.58, 0.66, 0.61, 0.57, 0.64, 0.7, 0.66, 0.72, 0.68, 0.75, 0.71, 0.78, 0.74, 0.8],
        [0.5, 0.46, 0.52, 0.48, 0.44, 0.5, 0.47, 0.53, 0.49, 0.45, 0.51, 0.48, 0.55, 0.52, 0.6, 0.66, 0.63, 0.7, 0.76, 0.73, 0.82, 0.86, 0.9, 0.95],
        [0.55, 0.62, 0.48, 0.58, 0.66, 0.52, 0.6, 0.7, 0.56, 0.5, 0.64, 0.58, 0.46, 0.6, 0.68, 0.54, 0.62, 0.5, 0.58, 0.66, 0.6, 0.52, 0.62, 0.56],
      ];
      const bands = [[0.4, 0.7], [0.38, 0.62], [0.42, 0.72]];
      const rows = [
        [t(lang, 'Orders', 'Commandes'), num(lang, 1284)],
        [t(lang, 'Returns', 'Retours'), lang === 'fr' ? '3,1 %' : '3.1%'],
        [t(lang, 'Visits', 'Visites'), num(lang, 18400)],
      ];
      const sx0 = 196, sx1 = 316, hh = 17;
      let s = text(sx0, 26, t(lang, 'normal range', 'plage normale'), 't-ax');
      rows.forEach(([lab, val], i) => {
        const lo = Math.min(...series[i], bands[i][0]), hi = Math.max(...series[i], bands[i][1]);
        const yb = 68 + i * 48, Y = (u) => yb + 2 - ((u - lo) / (hi - lo)) * hh, X = (j) => sx0 + (j / 23) * (sx1 - sx0);
        s += text(20, yb, lab, 't-lab') + text(170, yb, val, 't-val', 'end');
        s += rect(sx0, Y(bands[i][1]), sx1 - sx0, Y(bands[i][0]) - Y(bands[i][1]), 'i-well');
        s += path(series[i].map((u, j) => [X(j), Y(u)]), 's-slate', 1.25);
        s += circle(X(23), Y(series[i][23]), 2.5, 'i-ink');
        if (i === 0) s += line(sx0 + 6, 31, sx0 + 6, Y(bands[0][1]), 's-rule');
      });
      return s;
    },
  },

  // International Business Communication Standards: one fill per scenario, solid actual, outlined plan, hatched forecast.
  hichert: {
    title: { en: 'Solid, outlined, hatched', fr: 'Plein, contour, hachure' },
    caption: {
      en: 'One fill per scenario in every report, solid for actual, outlined for plan and hatched for forecast, so hue stays free.',
      fr: 'Un remplissage par scénario, plein pour le réel, contour pour le plan, hachure pour la prévision ; la teinte reste libre.',
    },
    draw: (lang) => {
      // Illustrative monthly values: seven months actual, five forecast, plan behind every month.
      const plan = [60, 62, 65, 66, 68, 70, 70, 72, 74, 75, 78, 80];
      const val = [58, 66, 61, 70, 72, 64, 75, 74, 76, 77, 79, 83];
      const base = 176, k = 1.55, x0 = 24, step = 26, w = 14;
      let s = '';
      const keys = [[rect(20, 18, 12, 12, 'i-ink'), t(lang, 'actual', 'réel')], [outlined(110, 18, 12, 12), t(lang, 'plan', 'plan')], [hatched(186, 18, 12, 12), t(lang, 'forecast', 'prévision')]];
      keys.forEach(([k2, lab], i) => { s += k2 + text([38, 128, 204][i], 28, lab, 't-lab'); });
      plan.forEach((p, i) => { s += outlined(x0 + i * step + 6, base - p * k, w, p * k); });
      val.forEach((v, i) => { const x = x0 + i * step; s += i < 7 ? rect(x, base - v * k, w, v * k, 'i-ink') : hatched(x, base - v * k, w, v * k); });
      s += line(16, base, 336, base, 's-slate', 1.5);
      return s;
    },
  },

  // Why I stopped using bullet graphs, 2022: action dots, shown only where a measure crosses a threshold that calls for action.
  desbarats: {
    title: { en: 'Action dots', fr: 'Les points d’action' },
    caption: {
      en: 'A mark appears only beside a measure that has crossed a threshold calling for action; the others carry no colour at all.',
      fr: 'Une marque n’apparaît qu’à côté d’une mesure qui a franchi un seuil appelant une action ; les autres ne portent aucune couleur.',
    },
    draw: (lang) => {
      // Illustrative measures; only Returns has crossed its (illustrative) action threshold.
      const fr = lang === 'fr';
      const rows = [
        [t(lang, 'Orders', 'Commandes'), num(lang, 1284)],
        [t(lang, 'On time', 'À l’heure'), fr ? '96 %' : '96%'],
        [t(lang, 'Returns', 'Retours'), fr ? '7,8 %' : '7.8%'],
        [t(lang, 'Margin', 'Marge'), fr ? '31 %' : '31%'],
        [t(lang, 'Backlog', 'En attente'), '120'],
      ];
      let s = '';
      rows.forEach(([lab, val], i) => {
        const y = 40 + i * 30, hit = i === 2;
        s += text(44, y, lab, hit ? 't-val' : 't-lab') + text(180, y, val, hit ? 't-val' : 't-lab', 'end');
        if (hit) s += circle(26, y - 4, 6, 'i-ink');
        if (i < rows.length - 1) s += line(20, y + 13, 192, y + 13, 's-light', 0.75);
      });
      s += text(206, 100, t(lang, 'above its 6% threshold', 'au-dessus de son seuil'), 't-val') + (fr ? text(206, 116, 'de 6 %', 't-val') : '');
      s += text(20, 183, t(lang, 'No dot where a measure stays inside its thresholds', 'Aucun point quand la mesure reste dans ses seuils'), 't-ax');
      return s;
    },
  },
};
