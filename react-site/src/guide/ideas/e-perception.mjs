import { rect, line, circle, path, area, raw, text, t } from './kit.mjs';

// A rounded-rectangle outline (no fill), for frames and regions drawn as strokes.
const box = (x, y, w, h, r, cls, sw = 1) =>
  raw(`M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`, cls, sw);
// A thin band following a polyline, so a 1 px "line" can take a fill class.
const band = (pts, wd, cls) => area([...pts, ...pts.slice().reverse().map(([x, y]) => [x, y + wd])], cls);
// A right-pointing arrow along y.
const arrow = (x1, x2, y, cls = 's-rule') => line(x1, y, x2, y, cls, 1.25) + raw(`M${x2 - 5} ${y - 4}L${x2} ${y}L${x2 - 5} ${y + 4}`, cls, 1.25);

export default {
  // Interaction of Color, 1963: one colour made to look like two by changing its ground.
  albers: {
    title: { en: 'One grey looks like two', fr: 'Un gris qui en paraît deux' },
    caption: {
      en: 'The two small squares are the same grey, yet it reads lighter on the dark ground and darker on the light one.',
      fr: 'Les deux carrés sont du même gris, qui paraît plus clair sur le fond sombre et plus foncé sur le fond clair.',
    },
    draw: (lang) => {
      let s = rect(20, 16, 150, 126, 'i-ink', 6) + rect(182, 16, 150, 126, 'i-field', 6);
      // literally the same class on both grounds
      s += rect(95 - 22, 79 - 22, 44, 44, 'i-slate') + rect(257 - 22, 79 - 22, 44, 44, 'i-slate');
      s += line(95, 150, 95, 158, 's-rule') + line(257, 150, 257, 158, 's-rule') + line(95, 158, 257, 158, 's-rule');
      return s + text(176, 178, t(lang, 'the same grey', 'le même gris'), 't-lab', 'middle');
    },
  },
  // Cleveland and McGill, Graphical perception, 1984: elementary perceptual tasks ranked by accuracy.
  cleveland: {
    title: { en: 'Ranking the elementary tasks', fr: 'Le classement des tâches élémentaires' },
    caption: {
      en: 'With McGill he found that readers judge position on a common scale most accurately, then length, angle, area and, last, shading.',
      fr: 'Avec McGill, il a montré qu’on lit le plus exactement une position sur une échelle commune, puis longueur, angle, aire, ombrage.',
    },
    draw: (lang) => {
      const cx = [44, 110, 176, 242, 308];
      let s = '';
      // 1 position on a common scale: two dots read against one axis
      const a = cx[0] - 20;
      s += line(a, 30, a, 114, 's-rule');
      [30, 51, 72, 93, 114].forEach((y) => { s += line(a - 4, y, a, y, 's-rule'); });
      s += circle(cx[0] - 4, 72, 5, 'i-ink') + circle(cx[0] + 14, 46, 5, 'i-ink');
      // 2 length: two bars that do not share a baseline
      s += rect(cx[1] - 15, 66, 11, 40, 'i-slate') + rect(cx[1] + 4, 38, 11, 58, 'i-slate');
      // 3 angle: a pie split in two
      const pc = [cx[2], 72], r = 27, end = 0.36 * 2 * Math.PI, pts = [pc];
      for (let k = 0; k <= 24; k++) { const th = -Math.PI / 2 + (end * k) / 24; pts.push([pc[0] + r * Math.cos(th), pc[1] + r * Math.sin(th)]); }
      s += circle(pc[0], pc[1], r, 'i-light') + area(pts, 'i-slate');
      // 4 area: two circles
      s += circle(cx[3] - 15, 90, 9, 'i-slate') + circle(cx[3] + 10, 84, 15, 'i-slate');
      // 5 shading: two patches of different darkness
      s += rect(cx[4] - 25, 61, 22, 22, 'i-light') + rect(cx[4] + 3, 61, 22, 22, 'i-slate');
      const labs = [['position', 'position'], ['length', 'longueur'], ['angle', 'angle'], ['area', 'aire'], ['shading', 'ombrage']];
      labs.forEach(([en, fr], i) => { s += text(cx[i], 138, t(lang, en, fr), i === 0 ? 't-val' : 't-lab', 'middle'); });
      const left = t(lang, 'more accurate', 'plus précis'), right = t(lang, 'less accurate', 'moins précis');
      s += text(16, 174, left, 't-ax') + text(336, 174, right, 't-ax', 'end');
      return s + arrow(lang === 'fr' ? 86 : 100, lang === 'fr' ? 262 : 252, 170);
    },
  },
  // Common region, 1992: elements inside one boundary group together, even against proximity.
  palmer: {
    title: { en: 'Common region', fr: 'La région commune' },
    caption: {
      en: 'The same dots pair up by nearness, then regroup as soon as a shared region encloses neighbours that are farther apart.',
      fr: 'Les mêmes points se groupent par proximité, puis se regroupent dès qu’une région commune entoure des voisins plus éloignés.',
    },
    draw: (lang) => {
      const xs = [40, 66, 122, 148, 204, 230, 286, 312], y1 = 70, y2 = 148;
      let s = text(176, 42, t(lang, 'grouped by nearness', 'groupés par proximité'), 't-lab', 'middle');
      xs.forEach((x) => { s += circle(x, y1, 5, 'i-slate'); });
      s += text(176, 116, t(lang, 'regrouped by a shared region', 'regroupés par une région commune'), 't-lab', 'middle');
      [[1, 2], [3, 4], [5, 6]].forEach(([i, j]) => {
        const x = xs[i] - 12, w = xs[j] - xs[i] + 24;
        s += rect(x, y2 - 14, w, 28, 'i-well', 14) + box(x, y2 - 14, w, 28, 14, 's-ink', 1.5);
      });
      xs.forEach((x) => { s += circle(x, y2, 5, 'i-slate'); });
      return s;
    },
  },
  // Information Visualization: Perception for Design, 2000: brushing a selection across linked views.
  ware: {
    title: { en: 'Brushing and linking', fr: 'Brossage et liaison' },
    caption: {
      en: 'Items selected in one chart light up in the other, while the rest stay in view instead of being filtered away.',
      fr: 'Les éléments sélectionnés dans un graphique s’allument dans l’autre, et le reste demeure visible au lieu d’être filtré.',
    },
    draw: (lang) => {
      // illustrative items: [x, y] in the first view, [x, y] in the second
      const items = [
        [[0.08, 0.2], [0.7, 0.15]], [[0.18, 0.42], [0.2, 0.55]], [[0.26, 0.15], [0.5, 0.35]], [[0.33, 0.6], [0.9, 0.6]],
        [[0.4, 0.33], [0.35, 0.8]], [[0.48, 0.5], [0.62, 0.9]], [[0.55, 0.22], [0.1, 0.3]], [[0.62, 0.68], [0.25, 0.2]],
        [[0.7, 0.8], [0.78, 0.45]], [[0.75, 0.62], [0.42, 0.62]], [[0.84, 0.74], [0.58, 0.12]], [[0.9, 0.4], [0.88, 0.85]],
        [[0.12, 0.78], [0.05, 0.75]], [[0.95, 0.9], [0.15, 0.9]],
      ];
      const B = { x0: 0.58, x1: 0.99, y0: 0.56, y1: 0.95 }, sel = ([[x, y]]) => x >= B.x0 && x <= B.x1 && y >= B.y0 && y <= B.y1;
      const views = [16, 188], W = 148, top = 18, H = 124;
      const px = (v, i) => views[i] + 12 + v * (W - 22), py = (v) => top + H - 10 - v * (H - 22);
      let s = '';
      views.forEach((x) => { s += rect(x, top, W, H, 'i-field', 6) + line(x + 8, top + H - 6, x + W - 8, top + H - 6, 's-rule') + line(x + 8, top + 8, x + 8, top + H - 6, 's-rule'); });
      const bx = px(B.x0, 0) - 6, by = py(B.y1) - 6, bw = px(B.x1, 0) - px(B.x0, 0) + 12, bh = py(B.y0) - py(B.y1) + 12;
      s += rect(bx, by, bw, bh, 'i-well', 3) + box(bx, by, bw, bh, 3, 's-ink i-dash', 1.25);
      items.forEach((it) => { const on = sel(it); s += circle(px(it[0][0], 0), py(it[0][1]), on ? 4.5 : 3.5, on ? 'i-ink' : 'i-light'); });
      items.forEach((it) => { const on = sel(it); s += circle(px(it[1][0], 1), py(it[1][1]), on ? 4.5 : 3.5, on ? 'i-ink' : 'i-light'); });
      s += arrow(168, 184, top + H / 2, 's-slate');
      return s + text(views[0] + W / 2, 166, t(lang, 'selected here', 'sélectionnés ici'), 't-lab', 'middle') + text(views[1] + W / 2, 166, t(lang, 'highlighted here', 'mis en évidence ici'), 't-lab', 'middle');
    },
  },
  // Visualization Analysis and Design, 2014: "eyes beat memory".
  munzner: {
    title: { en: 'Eyes beat memory', fr: 'L’œil bat la mémoire' },
    caption: {
      en: 'Two series on one axis are compared by eye; shown one after the other, the first must be held in memory.',
      fr: 'Deux séries sur un même axe se comparent d’un coup d’œil ; montrées l’une après l’autre, la première doit rester en mémoire.',
    },
    draw: (lang) => {
      const A = [0.62, 0.44, 0.8, 0.52], Bv = [0.5, 0.58, 0.66, 0.3];
      let s = '';
      // side by side on one axis
      const L = { x: 16, y: 34, w: 150, h: 104 }, base = L.y + L.h - 10, hh = L.h - 22;
      s += rect(L.x, L.y, L.w, L.h, 'i-field', 6) + line(L.x + 10, base, L.x + L.w - 10, base, 's-rule');
      A.forEach((v, i) => { const x = L.x + 20 + i * 33; s += rect(x, base - v * hh, 11, v * hh, 'i-ink') + rect(x + 12, base - Bv[i] * hh, 11, Bv[i] * hh, 'i-slate'); });
      // one after the other: the first frame is gone, only remembered
      const F = [{ x: 190, on: false, v: A }, { x: 270, on: true, v: Bv }], fw = 66;
      F.forEach((f) => {
        s += f.on ? rect(f.x, L.y, fw, L.h, 'i-field', 6) : box(f.x, L.y, fw, L.h, 6, 's-light i-dash', 1.25);
        s += line(f.x + 6, base, f.x + fw - 6, base, f.on ? 's-rule' : 's-light');
        f.v.forEach((v, i) => {
          const x = f.x + 10 + i * 13, y = base - v * hh;
          s += f.on ? rect(x, y, 9, v * hh, 'i-slate') : box(x, y, 9, v * hh, 0.5, 's-light i-dash', 1);
        });
      });
      s += arrow(259, 266, L.y + L.h / 2, 's-slate');
      s += text(F[0].x + fw / 2, 26, t(lang, 'remembered', 'en mémoire'), 't-ax', 'middle') + text(F[1].x + fw / 2, 26, t(lang, 'on screen', 'à l’écran'), 't-ax', 'middle');
      return s + text(L.x + L.w / 2, 162, t(lang, 'side by side, one axis', 'côte à côte, un seul axe'), 't-lab', 'middle') + text(263, 162, t(lang, 'one after the other', 'l’une après l’autre'), 't-lab', 'middle');
    },
  },
  // Visual comparison for information visualization, 2011: juxtaposition, superposition, explicit encoding.
  gleicher: {
    title: { en: 'Three ways to compare', fr: 'Trois façons de comparer' },
    caption: {
      en: 'Two series can be set side by side, overlaid on one axis, or replaced by their difference, drawn directly.',
      fr: 'Deux séries peuvent être placées côte à côte, superposées sur un même axe, ou remplacées par leur différence, tracée directement.',
    },
    draw: (lang) => {
      const A = [30, 42, 36, 55, 48, 62, 57, 70], Bv = [36, 38, 46, 48, 57, 53, 66, 61];
      const P = [12, 126, 240], pw = 100, top = 18, ph = 112;
      const series = (vals, x0, x1, y0, y1) => vals.map((v, i) => [x0 + (i * (x1 - x0)) / (vals.length - 1), y1 - ((v - 20) / 55) * (y1 - y0)]);
      let s = '';
      P.forEach((x) => { s += rect(x, top, pw, ph, 'i-field', 6); });
      // juxtaposition: two small charts, each with its own frame
      const yb = top + ph - 12, yt = top + 14;
      [[P[0] + 8, P[0] + 46, A, 's-ink'], [P[0] + 54, P[0] + 92, Bv, 's-slate']].forEach(([x0, x1, v, c]) => {
        s += line(x0, yb, x1, yb, 's-rule') + path(series(v, x0, x1, yt, yb), c, 1.75);
      });
      // superposition: both on one axis
      s += line(P[1] + 8, yb, P[1] + 92, yb, 's-rule') + path(series(Bv, P[1] + 10, P[1] + 90, yt, yb), 's-slate', 1.75) + path(series(A, P[1] + 10, P[1] + 90, yt, yb), 's-ink', 1.75);
      // explicit encoding: the difference A minus B as bars around zero
      const z = top + ph / 2, k = 3.2;
      s += line(P[2] + 8, z, P[2] + 92, z, 's-rule');
      A.forEach((v, i) => { const d = v - Bv[i], x = P[2] + 12 + i * 10; s += rect(x, d > 0 ? z - d * k : z, 7, Math.abs(d) * k, 'i-ink'); });
      const labs = [['side by side', 'côte à côte', 'juxtaposition', 'juxtaposition'], ['overlaid', 'superposées', 'superposition', 'superposition'], ['difference', 'différence', 'explicit encoding', 'codage explicite']];
      labs.forEach(([en, fr, en2, fr2], i) => { s += text(P[i] + pw / 2, 152, t(lang, en, fr), 't-lab', 'middle') + text(P[i] + pw / 2, 168, t(lang, en2, fr2), 't-ax', 'middle'); });
      return s;
    },
  },
  // Untidy data: the unreasonable effectiveness of tables, 2022: the table as a visualization in its own right.
  tory: {
    title: { en: 'The table is a visualization', fr: 'Le tableau est une visualisation' },
    caption: {
      en: 'A sorted grid of aligned figures, with a small bar in each row, is where many analysts check and reshape their data.',
      fr: 'Une grille triée de chiffres alignés, avec une petite barre par ligne, est l’endroit où beaucoup d’analystes vérifient et remanient leurs données.',
    },
    draw: (lang) => {
      const vals = [84, 67, 51, 38, 22], names = [62, 46, 70, 40, 54], x0 = 24, xv = 178, xb = 194, bw = 130, rh = 24, y0 = 50;
      let s = text(x0, 38, t(lang, 'Item', 'Article'), 't-lab') + text(xv - 12, 38, t(lang, 'Value', 'Valeur'), 't-lab', 'end');
      s += area([[xv - 8, 31], [xv, 31], [xv - 4, 37]], 'i-slate'); // sorted, largest first
      s += line(x0, y0, x0 + 304, y0, 's-rule', 1.25);
      vals.forEach((v, i) => {
        const yc = y0 + i * rh + rh / 2;
        s += rect(x0, yc - 3, names[i], 6, 'i-light', 3) + text(xv, yc + 4, String(v), 't-val', 'end') + rect(xb, yc - 5, (v / 100) * bw, 10, 'i-ink');
        s += line(x0, y0 + (i + 1) * rh, x0 + 304, y0 + (i + 1) * rh, 's-light');
      });
      return s;
    },
  },
  // In Color Perception, Size Matters, 2012: the smaller the mark, the larger the colour difference it needs.
  stone: {
    title: { en: 'Size matters for colour', fr: 'La taille compte pour la couleur' },
    caption: {
      en: 'The same two tints that separate clearly as large areas become hard to tell apart as thin lines or small dots.',
      fr: 'Les deux mêmes teintes, bien distinctes en grandes surfaces, deviennent difficiles à séparer en traits fins ou en petits points.',
    },
    draw: (lang) => {
      const P = [16, 128, 240], pw = 96, top = 18, ph = 104;
      let s = '';
      P.forEach((x) => { s += rect(x, top, pw, ph, 'i-field', 6); });
      // large areas
      s += rect(P[0] + 14, top + 18, 34, 68, 'i-light') + rect(P[0] + 48, top + 18, 34, 68, 'i-well');
      // thin lines: the same two tints at 1 px
      const la = [[P[1] + 10, top + 76], [P[1] + 30, top + 40], [P[1] + 50, top + 62], [P[1] + 70, top + 26], [P[1] + 86, top + 48]];
      const lb = [[P[1] + 10, top + 34], [P[1] + 30, top + 66], [P[1] + 50, top + 44], [P[1] + 70, top + 80], [P[1] + 86, top + 58]];
      s += band(la, 1.25, 'i-light') + band(lb, 1.25, 'i-well');
      // small dots
      const dots = [[14, 30], [30, 70], [44, 44], [58, 82], [72, 26], [82, 60], [22, 52], [38, 22], [52, 64], [66, 40], [78, 84], [24, 84]];
      dots.forEach(([dx, dy], i) => { s += circle(P[2] + dx, top + dy, 2, i % 2 ? 'i-well' : 'i-light'); });
      const labs = [['large areas', 'grandes surfaces', 'told apart', 'distinctes'], ['thin lines', 'traits fins', 'blur together', 'se confondent'], ['small dots', 'petits points', 'blur together', 'se confondent']];
      labs.forEach(([en, fr, en2, fr2], i) => { s += text(P[i] + pw / 2, 144, t(lang, en, fr), 't-lab', 'middle') + text(P[i] + pw / 2, 162, t(lang, en2, fr2), 't-ax', 'middle'); });
      return s;
    },
  },
};
