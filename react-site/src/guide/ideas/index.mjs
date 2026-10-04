// Gathers every idea drawing in this folder into IDEAS[id] = { title, caption, draw }.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { W, H } from './kit.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const IDEAS = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.mjs') && !['index.mjs', 'kit.mjs'].includes(x)).sort()) {
  Object.assign(IDEAS, (await import(pathToFileURL(path.join(dir, f)).href)).default);
}
// The figure for one person, or '' when no drawing exists yet.
export function ideaFigure(id, lang, esc) {
  const d = IDEAS[id];
  if (!d) return '';
  return `<figure class="idea"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title[lang] || d.title.en)}">${d.draw(lang)}</svg><figcaption><b>${esc(d.title[lang] || d.title.en)}</b>${esc(d.caption[lang] || d.caption.en)}</figcaption></figure>`;
}
