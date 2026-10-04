import { rect, line, text, t } from './kit.mjs';

export default {
  // Capital, 1962: 58 units wide, 2-unit gutters, so 1 to 6 columns all fall on whole units.
  gerstner: {
    title: { en: 'One field, six column counts', fr: 'Un champ, six nombres de colonnes' },
    caption: {
      en: 'Capital’s page is 58 units wide with 2-unit gutters, so one, two, three, four, five or six columns all land on whole units.',
      fr: 'La page de Capital fait 58 unités de large avec des gouttières de 2, si bien qu’une à six colonnes tombent sur des unités entières.',
    },
    draw: (lang) => {
      const x0 = 44, u = 4.6, rows = [1, 2, 3, 4, 5, 6], widths = { 1: 58, 2: 28, 3: 18, 4: 13, 5: 10, 6: 8 };
      let s = text(x0, 22, t(lang, '58 units', '58 unités'), 't-ax') + line(x0, 28, x0 + 58 * u, 28, 's-rule') + line(x0, 24, x0, 32, 's-rule') + line(x0 + 58 * u, 24, x0 + 58 * u, 32, 's-rule');
      rows.forEach((k, i) => {
        const y = 40 + i * 25, w = widths[k];
        s += text(x0 - 12, y + 13, String(k), 't-ax', 'end');
        for (let c = 0; c < k; c++) s += rect(x0 + c * (w + 2) * u, y, w * u, 16, k === 4 ? 'i-ink' : 'i-slate', 2);
        s += text(x0 + 58 * u + 10, y + 13, String(w), k === 4 ? 't-val' : 't-ax');
      });
      return s + text(x0 + 58 * u + 10, 22, t(lang, 'each', 'chacune'), 't-ax');
    },
  },
  // Bullet Graph Design Specification, 2006: label, featured measure, comparative measure, qualitative ranges, scale.
  few: {
    title: { en: 'The bullet graph', fr: 'Le graphique à puces' },
    caption: {
      en: 'One bar on a linear scale, a tick for the comparator and bands for poor, fair and good replace a whole gauge.',
      fr: 'Une barre sur une échelle linéaire, un repère pour le comparateur et des bandes pour médiocre, moyen et bon remplacent un cadran entier.',
    },
    draw: (lang) => {
      const x0 = 28, x1 = 324, y = 84, sc = (v) => x0 + (v / 300) * (x1 - x0);
      let s = text(x0, 46, t(lang, 'Revenue', 'Chiffre d’affaires'), 't-val') + text(x0, 62, t(lang, 'thousands', 'milliers'), 't-ax');
      s += rect(sc(0), y, sc(150) - sc(0), 30, 'i-light') + rect(sc(150), y, sc(225) - sc(150), 30, 'i-well') + rect(sc(225), y, sc(300) - sc(225), 30, 'i-relief');
      s += rect(sc(0), y + 10, sc(270) - sc(0), 10, 'i-ink') + line(sc(250), y + 4, sc(250), y + 26, 's-ink', 2.5);
      [0, 50, 100, 150, 200, 250, 300].forEach((v) => { s += line(sc(v), y + 30, sc(v), y + 35, 's-rule') + text(sc(v), y + 48, String(v), 't-ax', 'middle'); });
      s += text(sc(270), y - 8, t(lang, 'measure', 'mesure'), 't-lab', 'end') + text(sc(250), y + 68, t(lang, 'target', 'objectif'), 't-lab', 'middle') + line(sc(250), y + 52, sc(250), y + 57, 's-rule');
      s += text(sc(75), y + 86, t(lang, 'poor', 'médiocre'), 't-ax', 'middle') + text(sc(187), y + 86, t(lang, 'fair', 'moyen'), 't-ax', 'middle') + text(sc(262), y + 86, t(lang, 'good', 'bon'), 't-ax', 'middle');
      return s;
    },
  },
};
