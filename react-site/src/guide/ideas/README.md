# Idea drawings (chapter 1)

One small grey drawing per person in `content/people.*.json`, showing the idea of theirs this guide uses,
in place of biography. `index.mjs` gathers the files here into `IDEAS[id]`; `build-extra.mjs` puts the drawing
in the person's profile or card with its caption.

Each file exports `default` = an object keyed by person id:

```js
import { rect, line, text, path, t, num } from './kit.mjs';
export default {
  few: {
    title: { en: 'The bullet graph', fr: 'Le graphique à puces' },        // 2 to 5 words: the idea's name
    caption: { en: 'One bar on a linear scale …', fr: '…' },               // one sentence, at most 22 words: what the drawing shows
    draw: (lang) => rect(…) + line(…) + text(…),                           // inner SVG for viewBox 0 0 352 200
  },
};
```

Rules for a drawing
- It shows the person's own idea as their book or paper states it, not a generic chart. If the idea has a known
  specimen (Capital's 58-unit grid, Univers's two-digit numbers, Marey's train graph, the bullet graph's parts),
  draw that specimen. Do not invent historical data; where numbers are needed, use plainly illustrative ones.
- Greys only, through the kit's classes. Ink (`i-ink` / `s-ink`) marks the one thing the idea is about; slate
  carries the rest; light and well are context. No hex colours, no inline styles, no `<style>`, no `<defs>`.
- 352 × 200, keep 12 px clear on every side. At most about six short text labels, 11 to 12 px, both languages
  through `t(lang, en, fr)`; French typography (narrow no-break space U+202F before : ; ? ! %, decimal comma via `num`).
- It must read at a glance without its caption, and still make sense printed in grey.
- Plain shapes: `rect`, `line`, `circle`, `path`, `area`, `raw`, `text`. One or two lines may draw themselves
  in (`path(pts, cls, w, true)`); nothing else moves.
- Caption and title: plain words, no jargon the guide has not defined, no colon-led labels, no em dashes.
