# Guide figures runtime

`guide.js` and `figures.css` draw the interactive figures of *Learn dashboard design with me*. They come from the live page
(`projects/dashboard-design-guide/index.html`). In English they produce the same markup, pixels and behaviour as that page.
`guide.js` is a plain browser script with no build step and no modules. It draws every figure whose root element is on the
page and skips the rest, so each chapter page can carry only its own figures.

```html
<html lang="fr">                      <!-- or "en"; see Language -->
<meta charset="utf-8">                <!-- guide.js holds French text: serve it as UTF-8 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&family=Geist+Mono:wght@400..600&family=Geist:wght@400;700&family=Archivo:wght@400;700&display=swap">
<link rel="stylesheet" href="figures.css">
<figure class="fig"><div class="stage" id="demo-xmr"></div><figcaption class="cap">…</figcaption></figure>
<script>window.GUIDE_DATA = { people: […], groups: […], sources: […] };</script>
<script src="guide.js"></script>
```

Instrument Sans sets every figure, Geist Mono the token block, and Geist and Archivo the type specimen of rule 9.
The script mounts on `DOMContentLoaded`, or at once if the page has already loaded. For roots added later, for
example by React, call `window.__guide.mount()`. It draws only the roots it has not drawn before.

## Figure roots

Each figure root is an empty `<div class="stage" id="…">` inside `<figure class="fig">`. The caption is page text.

| Root | What the script draws |
|---|---|
| `#board` | The worked example: four instrument cards, sales and stock by week, open-to-buy, stock value, the four decision switches and the tent markdown plot. The script creates the `#ex-*` children. |
| `#recon` | The board's `figcaption`: the sentence that reconciles the plan. |
| `#demo-people` | The people on a time axis, and the card of the selected person. Uses `GUIDE_DATA.people` and `groups`. |
| `#people-list` | The people in full, by group. |
| `#demo-programme` | Rule 1: the programme calculator. |
| `#grid-toggle`, `#gridlay` | Rule 1: the page's own switch (`role="switch"`) and the grid overlay it shows. Both are page markup; the script wires them. |
| `#demo-instrument` | Rule 2: the instrument builder. |
| `#demo-xmr` | Rule 3: signal or routine (limits of routine variation). |
| `#demo-bridge` | Rule 4: the open-to-buy identity with sliders. |
| `#demo-surfaces` | Rule 5: four small models of surface. |
| `#demo-notation`, `#fig-note` | Rule 6: hue against fill, and the legend of the marks (`<div class="legend" id="fig-note">`). |
| `#demo-axis` | Rule 7: one set of week columns, with rows that reorder. |
| `#demo-table` | Rule 8: five table rules on switches. |
| `#demo-type` | Rule 9: bold without a shift. |
| `#demo-uncertainty` | Rule 10: one distribution in three forms. |
| `#demo-control` | Rule 11: the markdown plot as a control (drag, or arrow keys). |
| `#demo-terms` | Rule 12: the words of the plan, computed from the example. |
| `#demo-tune`, `#tokens`, `#copy-tokens` | The system: three tokens restyle part of the example and rewrite the token block `<pre id="tokens">`. The button copies the block. |
| `#srclist` | The sources, grouped by rule. Uses `GUIDE_DATA.sources`. |

## GUIDE_DATA

The people, their groups and the sources are content, so the page provides them. If one is missing it counts as an
empty array: the time axis then has no marks and the lists stay empty, with no error.

```js
window.GUIDE_DATA = {
  people:  [{ id, g, y, n, l, w, u, r, d, img, learn, pr }],  // the people chapter: content/people.<lang>.json
  groups:  [[ name, shortName, description ]], // data/groups.en.json (a French page gives French groups)
  sources: [{ g, st, who, work, url, take }],  // data/sources.json
  rules:   { 1: 'Start from a grid that divides', … },  // rule titles, for the person card
  links:   { rule: '#r{n}', works: '#works' }  // optional, these are the defaults
};
```

* **people:** `id` is a key, and `gerstner` is selected first if present. `g` is the index of the person's group.
  `y` is the year that places the mark; before 1900 the mark goes in its own column. `n` is the name: in the
  tag, a team keeps its first name, split on `,` and ` and ` (` et ` in French). `l` is life and role, `w` the work,
  `u` its link, `r` the rule numbers (empty means it links to the works) and `d` the description.
  `img` is the portrait drawn as the person's face (initials when it is missing), `learn` the lesson and `pr` the first
  project ({title, year, what}) that the card under the axis shows.
* **groups:** in order, by index `g`. `name` heads the list and the person card, and `description` sits under the
  heading. The six row labels of the time axis are UI words, so they come from `STR.groupLabels`, not from here.
* **sources:** listed in order, with a heading each time `g` changes. `st: 'k'` adds the "cited from prior knowledge"
  circle. `url` may be empty.
* **links:** on chapter pages a rule can live on another page. `rule` is a pattern with `{n}`, or a function `n => href`.

## Language

`<html lang>` is read once, when `guide.js` runs: `fr` or `fr-*` gives French, anything else English. All the words are
in `const STR = { en, fr }` at the top of `guide.js`: titles, hints, labels, tick words, legends, button and switch labels,
`aria-label`s, status sentences, the time-axis group names, the terms of rule 12, units and date patterns.
A sentence that carries numbers is a function that receives them already formatted.

Numbers go through `Intl.NumberFormat` in the page language: `en-CA` gives 294.4, and `fr-FR` gives 294,4 and 1 120.
Rounding stays that of `toFixed`, so English is unchanged. The minus is a real minus (−) in both languages, and the
unit is `$K` in English and `k$` in French. The week dates come from `Intl.DateTimeFormat`, giving 28 Sep in English and
28 sept. in French. French spacing is a narrow no-break space (U+202F) before `; : ? %` and between thousands, and a
no-break space (U+00A0) inside dates and before units.

To add a language, add a block to `STR` with the same keys. Some slots are tight, so measure the words in
Instrument Sans:

| Slot | Room |
|---|---|
| weekly sheet column heads (`colTrend`, `colWeeks`), 14 px | 109 px |
| product names in the stock-value chart (`lines.*.name`), 14 px | 82 px |
| `onOrderTag` + `leftToBuy` side by side in the open-to-buy chart, 14 px | 146 px together |
| `afterBuy(…)`, 13 px | 112 px |
| table switches (`tbRules`), 15 px semibold | 200 px for one line |
| card references (`cLast4`, `cCurrent`, …) at 1180 px | about 154 px |
| decision signals (`sig*`) on a phone | about 220 px |

## CSS

`figures.css` copies the page's rules with their selectors unchanged. It opens with a `:root` that holds the figure
tokens and the page programme (`--col`, `--gut`, `--content`, `--span4`, `--span8`, narrowed below 1200 px). It also
carries `*{box-sizing:border-box}`, `:focus-visible`, the grid overlay and the `pre` of the token block.

The article stays with the page: `body`, `.wrap`, `.t`, the headings and the contents. So do the link colour, which the
person card's link inherits, and the list styles that `#people-list` and `#srclist` use: `.people`, `.refs`,
`h3.group` and `.gdesc`.

The figures own short generic class names, for example `.stage`, `.sheet`, `.field`, `.tbar`, `.key`, `.rail`, `.rng`,
`.two`, `.opt`, `.btn`, `.seg`, `.sw`, `.status`, `.cap`, `.legend`, `.md`, `.pairs`, `.who`, `.pick`, `.term`, `.tune`,
`.wk`, `.dec`, `.dot`, `.mini`, `.view` and `.pad`. Page styles must not reuse them: `page.css` calls its chapter rail `.chrail`, its two-column block `.sec-two` and the
people chapter's field sections `.pfield` for that reason.

## Checking a change

There is no test suite in the repository. After editing, build the guide with `node scripts/build-guide.mjs` from
`react-site/`, serve the site root, and open each chapter in both languages at desktop and phone widths: every figure
should draw, the console should stay clean, and nothing should scroll sideways. The French pages are the stricter test,
because their labels are longer.
