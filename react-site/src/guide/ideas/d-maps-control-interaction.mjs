import { rect, line, circle, path, area, raw, text, t, num } from './kit.mjs';

// Local shape helpers built only from the kit's primitives.
const box = (x, y, w, h, cls = 's-slate', sw = 1) => raw(`M${x} ${y}h${w}v${h}h${-w}Z`, cls, sw);
const head = (x, y, dir, cls = 'i-slate', s = 5) => {
  // a small filled arrowhead whose tip is at (x, y); dir: 'r' | 'l' | 'u' | 'd'
  const p = { r: [[x, y], [x - s * 1.4, y - s], [x - s * 1.4, y + s]], l: [[x, y], [x + s * 1.4, y - s], [x + s * 1.4, y + s]], u: [[x, y], [x - s, y + s * 1.4], [x + s, y + s * 1.4]], d: [[x, y], [x - s, y - s * 1.4], [x + s, y - s * 1.4]] }[dir];
  return area(p, cls);
};
const ring = (cx, cy, r, cls = 's-ink', sw = 1.5) => raw(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`, cls, sw);
// A deterministic scatter of points for drawings that need "many dots".
const lcg = (seed) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

export default {
  // The Look of Maps (1952) and Elements of Cartography: rank map elements into levels, one tone per level.
  robinson: {
    title: { en: 'Visual hierarchy', fr: 'La hiérarchie visuelle' },
    caption: {
      en: 'Each element is ranked into one of four levels, each level gets one tone, and the subject stands forward while reference recedes.',
      fr: 'Chaque élément est classé dans l’un de quatre niveaux, chaque niveau reçoit un ton, et le sujet avance tandis que les repères reculent.',
    },
    draw: (lang) => {
      const x0 = 16, y0 = 16, w = 196, h = 168;
      // 4 ground: land against water
      let s = rect(x0, y0, w, h, 'i-field');
      s += area([[x0, y0], [x0 + 150, y0], [x0 + 138, y0 + 30], [x0 + 156, y0 + 62], [x0 + 140, y0 + 96], [x0 + 166, y0 + 128], [x0 + 150, y0 + h], [x0, y0 + h]], 'i-well');
      // 3 reference: graticule
      [1, 2, 3].forEach((k) => { s += line(x0 + (k * w) / 4, y0, x0 + (k * w) / 4, y0 + h, 's-light', 0.75); s += line(x0, y0 + (k * h) / 4, x0 + w, y0 + (k * h) / 4, 's-light', 0.75); });
      s += box(x0, y0, w, h, 's-light', 1);
      // 2 detail: minor roads and towns
      s += path([[x0 + 10, y0 + 40], [x0 + 52, y0 + 52], [x0 + 70, y0 + 92], [x0 + 128, y0 + 104]], 's-slate', 1.25);
      s += path([[x0 + 30, y0 + 156], [x0 + 46, y0 + 120], [x0 + 70, y0 + 92]], 's-slate', 1.25);
      s += circle(x0 + 52, y0 + 52, 3, 'i-slate') + circle(x0 + 128, y0 + 104, 3, 'i-slate') + circle(x0 + 46, y0 + 120, 3, 'i-slate');
      // 1 subject: the route
      s += path([[x0 + 24, y0 + 22], [x0 + 60, y0 + 30], [x0 + 92, y0 + 66], [x0 + 104, y0 + 118], [x0 + 128, y0 + 148]], 's-ink', 3.5);
      s += circle(x0 + 24, y0 + 22, 5, 'i-ink') + circle(x0 + 128, y0 + 148, 5, 'i-ink');
      // the ladder of levels
      const lx = 232, rows = [
        [t(lang, 'subject', 'sujet'), (y) => line(lx, y, lx + 26, y, 's-ink', 3.5), 't-val'],
        [t(lang, 'detail', 'détail'), (y) => line(lx, y, lx + 26, y, 's-slate', 1.25), 't-lab'],
        [t(lang, 'reference', 'repères'), (y) => line(lx, y, lx + 26, y, 's-light', 0.75), 't-ax'],
        [t(lang, 'ground', 'fond'), (y) => rect(lx, y - 7, 26, 14, 'i-well'), 't-ax'],
      ];
      rows.forEach(([lab, mk, cls], i) => { const y = 46 + i * 38; s += text(lx - 8, y + 4, String(i + 1), 't-ax', 'end') + mk(y) + text(lx + 34, y + 4, lab, cls); });
      return s;
    },
  },

  // Imhof's rule for colour, quoted by Tufte: strong colour over large areas is loud; use it sparingly on quiet ground.
  imhof: {
    title: { en: 'Quiet ground, small strong marks', fr: 'Fond calme, petites marques fortes' },
    caption: {
      en: 'Strong tone spread over large areas drowns the one mark that matters; on quiet low-tone areas the same small mark stands out.',
      fr: 'Un ton fort étalé sur de grandes surfaces noie la seule marque qui compte ; sur des surfaces calmes et claires, la même petite marque ressort.',
    },
    draw: (lang) => {
      const panel = (x0, tones, label, labCls) => {
        const y0 = 22, w = 150, h = 130, X = (f) => x0 + f * w, Y = (f) => y0 + f * h;
        let s = rect(x0, y0, w, h, tones[0], 6);
        s += area([[X(0), Y(0.42)], [X(0.22), Y(0.34)], [X(0.46), Y(0.46)], [X(0.7), Y(0.3)], [X(1), Y(0.38)], [X(1), Y(1)], [X(0), Y(1)]], tones[1]);
        s += area([[X(0), Y(0.76)], [X(0.3), Y(0.66)], [X(0.52), Y(0.8)], [X(0.8), Y(0.64)], [X(1), Y(0.72)], [X(1), Y(1)], [X(0), Y(1)]], tones[2]);
        s += area([[X(0.62), Y(0)], [X(0.7), Y(0.1)], [X(0.88), Y(0.14)], [X(1), Y(0.08)], [X(1), Y(0)]], tones[3]);
        s += circle(X(0.6), Y(0.55), 5, 'i-ink');
        return s + text(x0 + w / 2, 176, label, labCls, 'middle');
      };
      return panel(18, ['i-slate', 'i-light', 'i-slate', 'i-ink'], t(lang, 'loud ground', 'fond bruyant'), 't-ax')
        + panel(184, ['i-field', 'i-relief', 'i-well', 'i-relief'], t(lang, 'quiet ground', 'fond calme'), 't-lab');
    },
  },

  // Semiology of Graphics (1967) and La Graphique (1977): permute rows and columns until the structure shows.
  bertin: {
    title: { en: 'The reorderable matrix', fr: 'La matrice ordonnable' },
    caption: {
      en: 'The same cells, with rows and columns permuted and no value changed, turn from a scatter into a diagonal band of groups.',
      fr: 'Les mêmes cases, lignes et colonnes permutées sans changer une valeur, passent d’un semis dispersé à une bande diagonale de groupes.',
    },
    draw: (lang) => {
      const N = 8, step = 15, c = 13;
      const B = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (Math.abs(i - j) <= 1 || (i === 2 && j === 4) || (i === 6 && j === 4) ? 1 : 0)));
      const p = [5, 2, 7, 0, 3, 6, 1, 4], q = [3, 6, 0, 5, 1, 7, 2, 4];
      const grid = (x0, y0, val, on) => { let s = ''; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) s += rect(x0 + j * step, y0 + i * step, c, c, val(i, j) ? on : 'i-well', 1.5); return s; };
      const y0 = 30, xa = 26, xb = 208;
      let s = grid(xa, y0, (i, j) => B[p[i]][q[j]], 'i-slate') + grid(xb, y0, (i, j) => B[i][j], 'i-ink');
      const ay = y0 + (N * step) / 2;
      s += line(xa + N * step + 10, ay, xb - 14, ay, 's-slate', 1.5) + head(xb - 8, ay, 'r', 'i-slate', 4.5);
      s += text(xa + (N * step - 2) / 2, 172, t(lang, 'as recorded', 'telle que relevée'), 't-ax', 'middle');
      s += text(xb + (N * step - 2) / 2, 172, t(lang, 'reordered', 'réordonnée'), 't-lab', 'middle');
      return s;
    },
  },

  // Visual momentum (1984): landmarks in fixed places across views, and an overview kept on the detail screen.
  woods: {
    title: { en: 'Visual momentum', fr: 'L’élan visuel' },
    caption: {
      en: 'From overview to detail, the total, filters and date axis stay in place, and a small overview shows where the detail sits.',
      fr: 'De la vue d’ensemble au détail, le total, les filtres et l’axe des dates restent en place, et une petite vue d’ensemble situe le détail.',
    },
    draw: (lang) => {
      const w = 148, h = 140, y0 = 36, xs = [16, 188];
      const lines3 = [[0.55, 0.62, 0.5, 0.7, 0.6, 0.78], [0.3, 0.36, 0.42, 0.34, 0.46, 0.5], [0.12, 0.2, 0.16, 0.24, 0.2, 0.26]];
      let s = text(xs[0], 26, t(lang, 'overview', 'vue d’ensemble'), 't-lab') + text(xs[1], 26, t(lang, 'detail', 'détail'), 't-lab');
      xs.forEach((x0, k) => {
        s += rect(x0, y0, w, h, 'i-field', 6);
        // landmarks, identical in both views: total, filters, date axis
        s += text(x0 + 10, y0 + 20, t(lang, 'Total', 'Total'), 't-val');
        s += rect(x0 + w - 62, y0 + 11, 24, 10, 'i-ink', 3) + rect(x0 + w - 34, y0 + 11, 24, 10, 'i-ink', 3);
        const ax = y0 + h - 22, px = (i) => x0 + 14 + i * ((w - 28) / 5);
        s += line(x0 + 10, ax, x0 + w - 10, ax, 's-ink', 1.5);
        for (let i = 0; i < 6; i++) s += line(px(i), ax, px(i), ax + 5, 's-ink', 1.5);
        const py = (v) => ax - 8 - v * 72;
        if (k === 0) {
          lines3.forEach((L, j) => { s += path(L.map((v, i) => [px(i), py(v)]), j === 1 ? 's-slate' : 's-light', 1.5); });
        } else {
          const dy = (v) => ax - 14 - (v - 0.3) * 200;
          s += path(lines3[1].map((v, i) => [px(i), dy(v)]), 's-slate', 2);
          lines3[1].forEach((v, i) => { s += circle(px(i), dy(v), 2.5, 'i-slate'); });
          // the overview, kept small on the detail screen
          const tx = x0 + 10, ty = y0 + 30, tw = 42, th = 26;
          s += rect(tx, ty, tw, th, 'i-relief', 2);
          lines3.forEach((L, j) => { s += path(L.map((v, i) => [tx + 3 + i * ((tw - 6) / 5), ty + th - 3 - v * 22]), j === 1 ? 's-ink' : 's-light', 1); });
        }
      });
      // guides showing the landmarks sit at the same height
      s += line(xs[0] + w + 2, y0 + 16, xs[1] - 2, y0 + 16, 's-slate i-dash', 1) + line(xs[0] + w + 2, y0 + h - 22, xs[1] - 2, y0 + h - 22, 's-slate i-dash', 1);
      return s;
    },
  },

  // Ecological interface design (1992): draw the domain's law as geometry so a broken constraint is a broken shape.
  rasmussen: {
    title: { en: 'The constraint as a shape', fr: 'La contrainte comme forme' },
    caption: {
      en: 'Opening stock plus receipts equals sales plus closing stock, so both columns end level and a broken identity shows as a step.',
      fr: 'Stock d’ouverture plus réceptions égale ventes plus stock de clôture, donc les deux colonnes finissent à niveau et une identité rompue fait une marche.',
    },
    draw: (lang) => {
      const base = 160, u = 1.0, bw = 34;
      const pair = (x, left, right) => {
        let s = '', y = base;
        left.forEach(([v, cls]) => { s += rect(x, y - v * u, bw, v * u, cls); y -= v * u; });
        const yl = y; y = base;
        right.forEach(([v, cls]) => { s += rect(x + bw + 4, y - v * u, bw, v * u, cls); y -= v * u; });
        return [s, yl, y];
      };
      // illustrative units: 60 + 50 = 40 + 70; then a closing figure that breaks it
      const [s1, l1] = pair(96, [[60, 'i-slate'], [50, 'i-light']], [[40, 'i-slate'], [70, 'i-light']]);
      const [s2, l2, r2] = pair(242, [[60, 'i-slate'], [50, 'i-light']], [[55, 'i-slate'], [70, 'i-light']]);
      let s = s1 + s2 + line(10 + 76, base, 96 + 2 * bw + 4 + 10, base, 's-rule') + line(232, base, 242 + 2 * bw + 4 + 10, base, 's-rule');
      s += line(90, l1, 96 + 2 * bw + 10, l1, 's-ink', 2.5);
      s += line(236, l2, 242 + 2 * bw + 10, l2, 's-ink', 2) + rect(242 + bw + 4, r2, bw, l2 - r2, 'i-ink');
      s += text(90, base - 26, t(lang, 'opening', 'ouverture'), 't-ax', 'end') + text(90, base - 82, t(lang, 'receipts', 'réceptions'), 't-ax', 'end');
      s += text(96 + 2 * bw + 12, base - 16, t(lang, 'closing', 'clôture'), 't-ax') + text(96 + 2 * bw + 12, base - 72, t(lang, 'sales', 'ventes'), 't-ax');
      s += text(96 + bw + 2, 180, t(lang, 'holds', 'tenue'), 't-lab', 'middle') + text(242 + bw + 2, 180, t(lang, 'broken', 'rompue'), 't-val', 'middle');
      return s;
    },
  },

  // The High Performance HMI Handbook (2008): analog indicators with the normal range shaded, emphasis only when abnormal.
  hollifield: {
    title: { en: 'Analog scales with a normal band', fr: 'Échelles analogiques à plage normale' },
    caption: {
      en: 'Each measure gets a short scale with its normal range in grey; the value outside its band shows before any number is read.',
      fr: 'Chaque mesure a une courte échelle avec sa plage normale en gris ; la valeur hors de sa bande se voit avant qu’on lise un chiffre.',
    },
    draw: (lang) => {
      const x0 = 104, x1 = 324, sc = (f) => x0 + f * (x1 - x0);
      const rows = [
        [t(lang, 'flow', 'débit'), 0.3, 0.7, 0.52],
        [t(lang, 'level', 'niveau'), 0.25, 0.65, 0.4],
        [t(lang, 'temperature', 'température'), 0.35, 0.72, 0.9],
        [t(lang, 'pressure', 'pression'), 0.2, 0.6, 0.47],
      ];
      let s = text(sc((rows[0][1] + rows[0][2]) / 2), 30, t(lang, 'normal range', 'plage normale'), 't-ax', 'middle');
      rows.forEach(([lab, lo, hi, v], i) => {
        const y = 56 + i * 36, out = v < lo || v > hi;
        s += text(x0 - 12, y + 4, lab, out ? 't-val' : 't-lab', 'end');
        s += rect(x0, y - 6, x1 - x0, 12, 'i-field', 2) + rect(sc(lo), y - 6, sc(hi) - sc(lo), 12, 'i-light');
        s += head(sc(v), y + 7, 'u', out ? 'i-ink' : 'i-slate', 5) + line(sc(v), y - 9, sc(v), y + 7, out ? 's-ink' : 's-slate', out ? 2.5 : 1.5);
      });
      return s;
    },
  },

  // Dynamic queries (1994): a range slider tied to the display, which follows as the handles move.
  shneiderman: {
    title: { en: 'Dynamic queries', fr: 'Les requêtes dynamiques' },
    caption: {
      en: 'Dragging either handle of the range slider filters the scatter at once, so a question is steered by hand instead of typed.',
      fr: 'Déplacer l’une ou l’autre poignée du curseur filtre aussitôt le nuage de points, si bien que la question se pilote à la main au lieu de s’écrire.',
    },
    draw: (lang) => {
      const x0 = 24, x1 = 328, y0 = 18, y1 = 128, lo = 128, hi = 238, r = lcg(7);
      let s = rect(x0, y0, x1 - x0, y1 - y0, 'i-field', 4);
      s += rect(lo, y0, hi - lo, y1 - y0, 'i-relief');
      s += line(lo, y0, lo, y1, 's-slate i-dash', 1) + line(hi, y0, hi, y1, 's-slate i-dash', 1);
      for (let i = 0; i < 46; i++) {
        const x = x0 + 10 + r() * (x1 - x0 - 20), y = y0 + 10 + (0.15 + 0.75 * r()) * (y1 - y0 - 20) * (0.6 + 0.4 * ((x - x0) / (x1 - x0)));
        s += circle(x, y1 - (y - y0), 3, x >= lo && x <= hi ? 'i-ink' : 'i-light');
      }
      const ty = 152;
      s += line(x0, ty, x1, ty, 's-light', 4) + line(lo, ty, hi, ty, 's-ink', 4);
      s += rect(lo - 5, ty - 9, 10, 18, 'i-ink', 2) + rect(hi - 5, ty - 9, 10, 18, 'i-ink', 2);
      s += head(hi + 22, ty, 'r', 'i-slate', 3.5) + line(hi + 12, ty - 0, hi + 18, ty, 's-slate', 1.5) + head(hi + 8, ty, 'l', 'i-slate', 0.01);
      s += text(x0, 182, t(lang, 'price', 'prix'), 't-lab');
      s += text(x1, 182, t(lang, 'the dots follow the handles', 'les points suivent les poignées'), 't-ax', 'end');
      return s;
    },
  },

  // Making supply meet demand in an uncertain world (1994): the spread of independent forecasts measures uncertainty.
  fisher: {
    title: { en: 'Forecast spread as uncertainty', fr: 'La dispersion des prévisions' },
    caption: {
      en: 'With several forecasts per style sorted by spread, the narrow styles are bought early and the wide ones wait for first sales.',
      fr: 'Avec plusieurs prévisions par modèle triées par dispersion, on achète tôt les modèles resserrés et on attend les premières ventes pour les larges.',
    },
    draw: (lang) => {
      const half = [7, 13, 21, 31, 43, 56], ctr = [112, 98, 124, 104, 120, 110];
      const pat = [[-1, -0.4, 0.1, 0.35, 0.7, 1], [-1, -0.7, -0.1, 0.3, 0.5, 1], [-1, -0.2, 0, 0.45, 0.6, 1], [-1, -0.55, -0.3, 0.2, 0.8, 1], [-1, -0.6, -0.1, 0.1, 0.4, 1], [-1, -0.8, -0.3, 0.25, 0.55, 1]];
      let s = text(20, 26, t(lang, 'six forecasts per style', 'six prévisions par modèle'), 't-ax');
      half.forEach((hw, i) => {
        const y = 44 + i * 21;
        s += line(ctr[i] - hw, y, ctr[i] + hw, y, 's-ink', 2.5);
        pat[i].forEach((f) => { s += circle(ctr[i] + f * hw, y, 3.5, 'i-slate'); });
      });
      s += line(20, 166, 186, 166, 's-rule') + text(186, 181, t(lang, 'units forecast', 'unités prévues'), 't-ax', 'end');
      const bx = 196, br = (ya, yb) => raw(`M${bx} ${ya}h6V${yb}h-6`, 's-slate', 1.25);
      s += br(36, 94) + br(99, 157);
      s += text(bx + 14, 61, t(lang, 'narrow', 'resserrées'), 't-ax') + text(bx + 14, 77, t(lang, 'buy early', 'acheter tôt'), 't-val');
      s += text(bx + 14, 124, t(lang, 'wide', 'larges'), 't-ax') + text(bx + 14, 140, t(lang, 'wait for sales', 'attendre les ventes'), 't-val');
      return s;
    },
  },

  // Effective forecasting and judgmental adjustments (2009): small adjustments tended to hurt, large ones to help.
  fildes: {
    title: { en: 'Checking judgmental adjustments', fr: 'Vérifier les ajustements manuels' },
    caption: {
      en: 'Each manual change to the system forecast is checked against actual sales; small changes tended to hurt accuracy, large ones to help.',
      fr: 'Chaque changement manuel de la prévision du système est confronté aux ventes réelles ; les petits ont eu tendance à nuire, les grands à aider.',
    },
    draw: (lang) => {
      const actual = 120, x0 = 24, x1 = 262;
      // legend
      let s = line(24, 22, 24, 34, 's-slate', 2) + text(32, 32, t(lang, 'system', 'système'), 't-ax');
      s += line(104, 22, 104, 34, 's-ink', 3) + text(112, 32, t(lang, 'adjusted', 'ajustée'), 't-ax');
      s += ring(190, 28, 5, 's-slate', 1.5) + text(201, 32, t(lang, 'actual', 'réel'), 't-ax');
      const row = (y, lab, sys, adj, verdict, vcls) => {
        let r = text(x0, y - 22, lab, 't-lab') + line(x0, y, x1, y, 's-rule');
        r += ring(actual, y, 6, 's-slate', 1.5);
        r += line(sys, y - 10, sys, y + 10, 's-slate', 2);
        const dir = adj > sys ? 'r' : 'l';
        r += line(sys, y, adj + (dir === 'r' ? -6 : 6), y, 's-ink', 2) + head(adj, y, dir, 'i-ink', 4);
        r += line(adj, y - 12, adj, y + 12, 's-ink', 3);
        // error after the change, against the actual
        r += raw(`M${actual} ${y + 18}v4H${adj}v-4`, 's-slate', 1);
        return r + text(x1 + 14, y + 4, verdict, vcls);
      };
      s += row(84, t(lang, 'small adjustment', 'petit ajustement'), 146, 166, t(lang, 'worse', 'pire'), 't-val');
      s += row(154, t(lang, 'large adjustment', 'grand ajustement'), 246, 134, t(lang, 'better', 'mieux'), 't-val');
      return s;
    },
  },

  // Explorable Explanations (2011): a number in the sentence the reader can drag, and the conclusion recomputing.
  victor: {
    title: { en: 'The reactive document', fr: 'Le document réactif' },
    caption: {
      en: 'The assumption sits in the sentence as a number the reader can drag, and the conclusion beside it recomputes as it moves.',
      fr: 'L’hypothèse est dans la phrase, sous forme d’un nombre que le lecteur peut faire glisser, et la conclusion se recalcule à mesure qu’il bouge.',
    },
    draw: (lang) => {
      // Widths measured for Instrument Sans 12 px; the boxes absorb small differences.
      const L = lang === 'fr'
        ? { a: 'Partant de 1 000, à', b: 'par an,', c: 'les ventes atteignent', d: 'en quatre ans.', wa: 113, wc: 122 }
        : { a: 'Growing from 1,000 by', b: 'a year,', c: 'sales reach', d: 'in four years.', wa: 131, wc: 64 };
      const x0 = 22;
      const block = (y, rate, live) => {
        const pct = lang === 'fr' ? `${rate} %` : `${rate}%`, res = num(lang, Math.round(1000 * (1 + rate / 100) ** 4));
        const bx = x0 + L.wa + 6, bw = 38, rx = x0 + L.wc + 6, rw = 44;
        let s = text(x0, y, L.a, 't-lab');
        s += rect(bx, y - 13, bw, 18, 'i-well', 4) + line(bx + 4, y + 4, bx + bw - 4, y + 4, 's-ink i-dash', 1.5) + text(bx + bw / 2, y, pct, 't-val', 'middle');
        s += text(bx + bw + 6, y, L.b, 't-lab');
        s += text(x0, y + 24, L.c, 't-lab');
        s += rect(rx, y + 24 - 13, rw, 18, 'i-relief', 4) + line(rx + 3, y + 28, rx + rw - 3, y + 28, live ? 's-ink' : 's-light', 2) + text(rx + rw / 2, y + 24, res, 't-val', 'middle');
        s += text(rx + rw + 6, y + 24, L.d, 't-lab');
        return [s, bx + bw / 2, rx + rw / 2];
      };
      const [s1, b1] = block(44, 4, false), [s2] = block(136, 6, true);
      // the drag, sideways on the number, between the two states
      const ay = 98;
      let s = s1 + s2 + line(b1 - 22, ay, b1 + 18, ay, 's-ink', 1.5) + head(b1 + 24, ay, 'r', 'i-ink', 4) + head(b1 - 28, ay, 'l', 'i-ink', 4);
      s += text(b1 + 36, ay + 4, t(lang, 'drag', 'glisser'), 't-ax');
      return s;
    },
  },

  // Interactive Dynamics for Visual Analysis (2012) and graphical histories: each state a named, revisitable step.
  heer: {
    title: { en: 'A visible analysis history', fr: 'Un historique d’analyse visible' },
    caption: {
      en: 'Each filter, selection and scenario becomes a named step with its own view, which the reader can revisit or undo.',
      fr: 'Chaque filtre, sélection et scénario devient une étape nommée avec sa propre vue, que le lecteur peut revoir ou annuler.',
    },
    draw: (lang) => {
      const cw = 68, gap = 14, x0 = 19, y0 = 60, ch = 72;
      const states = [
        [[0.5, 0.8, 0.35, 0.65, 0.45, 0.25], -1, false],
        [[0.5, 0.8, 0.65, 0.45], -1, false],
        [[0.5, 0.8, 0.65, 0.45], 1, false],
        [[0.5, 1.0, 0.65, 0.45], 1, true],
      ];
      const names = [t(lang, 'start', 'départ'), t(lang, 'filter', 'filtre'), t(lang, 'select', 'sélection'), t(lang, 'scenario', 'scénario')];
      let s = '';
      states.forEach(([bars, sel, undone], k) => {
        const x = x0 + k * (cw + gap), cur = k === 2;
        s += rect(x, y0, cw, ch, undone ? 'i-relief' : 'i-field', 5);
        s += box(x + 0.5, y0 + 0.5, cw - 1, ch - 1, cur ? 's-ink' : undone ? 's-light i-dash' : 's-light', cur ? 2 : 1);
        const n = bars.length, bw = (cw - 16 - (n - 1) * 3) / n;
        bars.forEach((v, i) => { s += rect(x + 8 + i * (bw + 3), y0 + ch - 8 - v * 48, bw, v * 48, undone ? 'i-light' : i === sel ? 'i-ink' : 'i-slate'); });
                s += text(x + cw / 2, y0 + ch + 18, `${k + 1} ${names[k]}`, cur ? 't-val' : undone ? 't-ax' : 't-lab', 'middle');
        if (k < 3) s += line(x + cw + 2, y0 + ch / 2, x + cw + gap - 2, y0 + ch / 2, 's-light', 1.5);
      });
      // undo: back from step 4 to step 3
      const xa = x0 + 3 * (cw + gap) + cw / 2, xb = x0 + 2 * (cw + gap) + cw / 2;
      s += raw(`M${xa} ${y0 - 4}C${xa} ${y0 - 30} ${xb} ${y0 - 30} ${xb + 1} ${y0 - 10}`, 's-ink', 1.75) + head(xb + 1, y0 - 4, 'd', 'i-ink', 4);
      s += text((xa + xb) / 2, y0 - 30, t(lang, 'undo', 'annuler'), 't-val', 'middle');
      return s;
    },
  },

  // Is It Better to Rent or Buy? (2014): each slider drawn over a chart of the outcome across its whole range.
  bostock: {
    title: { en: 'Sliders on their own consequences', fr: 'Des curseurs sur leurs conséquences' },
    caption: {
      en: 'Each slider sits on a chart of the result across its whole range, and a steep chart flags the assumption that matters.',
      fr: 'Chaque curseur repose sur un graphique du résultat sur toute sa plage, et une courbe raide signale l’hypothèse qui compte.',
    },
    draw: (lang) => {
      const x0 = 20, x1 = 332, ch = 26;
      const rows = [
        [t(lang, 'home price', 'prix du logement'), (f) => 0.08 + 0.86 * f, 0.42],
        [t(lang, 'mortgage rate', 'taux du prêt'), (f) => 0.18 + 0.6 * f ** 1.6, 0.55],
        [t(lang, 'years you stay', 'années sur place'), (f) => 0.22 + 0.7 * Math.exp(-4.5 * f), 0.3],
      ];
      let s = text(x1, 24, t(lang, 'curve = rent at which buying pays', 'courbe = loyer où l’achat devient rentable'), 't-ax', 'end');
      rows.forEach(([lab, fn, cur], i) => {
        const yb = 66 + i * 54, X = (f) => x0 + f * (x1 - x0), pts = [];
        for (let k = 0; k <= 40; k++) pts.push([X(k / 40), yb - fn(k / 40) * ch]);
        s += text(x0, yb - ch - 4, lab, 't-lab');
        s += area([[X(0), yb], ...pts, [X(1), yb]], 'i-well') + path(pts, 's-slate', 1.5);
        s += line(x0, yb + 8, x1, yb + 8, 's-light', 3);
        const cx = X(cur), cy = yb - fn(cur) * ch;
        s += line(cx, cy, cx, yb + 8, 's-ink', 1.5) + circle(cx, cy, 3, 'i-ink') + circle(cx, yb + 8, 6, 'i-ink');
      });
      return s;
    },
  },

  // Industrial Dynamics (1961): levels changed only by rates, with the decision rule reading the level.
  forrester: {
    title: { en: 'Stocks and flows', fr: 'Stocks et flux' },
    caption: {
      en: 'A stock changes only through its flows, receipts in and sales out, and the ordering rule driving receipts watches the stock.',
      fr: 'Un stock ne change que par ses flux, réceptions en entrée et ventes en sortie, et la règle de commande qui pilote les réceptions surveille le stock.',
    },
    draw: (lang) => {
      const cy = 116, tx = 126, tw = 100, ty = 82, th = 68;
      const cloud = (x, y) => raw(`M${x - 14} ${y + 8}a7 7 0 0 1 1 -13a8 8 0 0 1 14 -5a8 8 0 0 1 14 4a7 7 0 0 1 0 14Z`, 's-slate', 1.25);
      const pipe = (xa, xb) => line(xa, cy - 4, xb, cy - 4, 's-slate', 1.5) + line(xa, cy + 4, xb, cy + 4, 's-slate', 1.5);
      const valve = (x) => area([[x - 7, cy - 12], [x + 7, cy - 12], [x - 7, cy + 12], [x + 7, cy + 12]], 'i-slate') + line(x, cy - 12, x, cy - 20, 's-slate', 1.5) + circle(x, cy - 23, 4, 'i-slate');
      let s = cloud(32, cy) + pipe(47, tx - 8) + head(tx - 1, cy, 'r', 'i-slate', 6) + valve(84);
      s += rect(tx, ty, tw, th, 'i-field') + rect(tx, ty + 26, tw, th - 26, 'i-light') + box(tx, ty, tw, th, 's-ink', 2);
      s += text(tx + tw / 2, ty + 54, t(lang, 'stock', 'stock'), 't-val', 'middle');
      s += pipe(tx + tw, 296) + head(303, cy, 'r', 'i-slate', 6) + valve(264) + cloud(322, cy);
      s += text(84, cy + 34, t(lang, 'receipts', 'réceptions'), 't-lab', 'middle') + text(264, cy + 34, t(lang, 'sales', 'ventes'), 't-lab', 'middle');
      // the ordering rule reads the stock and sets the inflow
      s += raw(`M${tx + 40} ${ty}C${tx + 40} 46 ${84} 46 ${84} ${cy - 30}`, 's-ink i-dash', 1.5) + head(84, cy - 28, 'd', 'i-ink', 4);
      s += text(tx + 30, 44, t(lang, 'ordering rule', 'règle de commande'), 't-ax');
      return s;
    },
  },

  // When (ish) is My Bus? (2016): the quantile dotplot, twenty equally likely outcomes you can count.
  kay: {
    title: { en: 'The quantile dotplot', fr: 'Le diagramme de quantiles en points' },
    caption: {
      en: 'Twenty dots each carry a twentieth of the demand forecast; four past the stock line mean a one-in-five risk of running out.',
      fr: 'Vingt points portent chacun un vingtième de la prévision de demande ; quatre au-delà de la ligne du stock font un risque de rupture d’environ un sur cinq.',
    },
    draw: (lang) => {
      // 20 quantiles of an illustrative right-skewed (log-normal) demand forecast, stacked into columns.
      const z = [-1.96, -1.44, -1.15, -0.935, -0.755, -0.598, -0.454, -0.319, -0.189, -0.063, 0.063, 0.189, 0.319, 0.454, 0.598, 0.755, 0.935, 1.15, 1.44, 1.96];
      const d = 16, X = (v) => 104 + (v - 53) * 1.0;
      const xs = z.map((q) => X(100 * Math.exp(0.3 * q)));
      const cols = [];
      xs.forEach((x) => { const c = cols[cols.length - 1]; if (c && x - c.x0 < d) c.n++; else cols.push({ x0: x, n: 1 }); });
      const base = 160, stockAfter = 16;
      let s = '', k = 0, lineX = 0;
      cols.forEach((c, ci) => {
        const cx = c.x0 + d / 2 - 0.5;
        for (let j = 0; j < c.n; j++, k++) {
          if (k === stockAfter) lineX = (cols[ci - 1].x0 + d / 2 + cx) / 2;
          s += circle(cx, base - 8 - j * d, 7.5, k >= stockAfter ? 'i-ink' : 'i-slate');
        }
      });
      s += line(24, base + 2, 332, base + 2, 's-rule') + text(332, 180, t(lang, 'demand', 'demande'), 't-ax', 'end');
      s += line(lineX, 44, lineX, base + 8, 's-ink', 2) + text(lineX, 36, t(lang, 'stock', 'stock'), 't-lab', 'middle');
      s += text(lineX + 10, base - 44, t(lang, '4 of 20 run out', '4 sur 20 en rupture'), 't-val');
      return s;
    },
  },
};
