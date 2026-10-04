// Builds the dashboard design guide: ten static pages per language under
// /projects/dashboard-design-guide/ (English) and /projects/dashboard-design-guide/fr/ (French).
// Run from react-site/: node scripts/build-guide.mjs
// Sources: src/guide/content/*.{js,json} (copy), src/guide/data/*.json (shared data),
// src/guide/runtime/* (styles and scripts). Images are committed under the output's assets/img/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, '../src/guide');
const OUT = process.env.GUIDE_OUT || path.join(here, '../../projects/dashboard-design-guide');
const ROOT_URL = '/projects/dashboard-design-guide/';
const ASSETS = ROOT_URL + 'assets/';
const SITE = 'https://enzosimier.com';

const readJSON = (p, fallback = null) => {
  const f = path.join(SRC, p);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback;
};
const load = async (p) => {
  const f = path.join(SRC, p);
  return fs.existsSync(f) ? (await import(pathToFileURL(f).href)).default : null;
};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const write = (rel, html) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
};

// ---------- shared data ----------
const people = readJSON('data/people-base.json', []);
const portraits = readJSON('data/portraits.json', []);
const sources = readJSON('data/sources.json', []);

// Every individual, with their entry id, year and portrait (or initials).
// Everyone in the people chapter: the original entries plus the additions, if the profiles exist.
const profiles = readJSON('content/people.en.json');
const roster = profiles ? [...profiles.people, ...(profiles.additions || [])] : people;
// First and last initials: Mary Eleanor Spear is MS, not ME.
const initials = (name) => {
  const ws = name.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w));
  return ws.length ? ws[0][0] + (ws.length > 1 ? ws[ws.length - 1][0] : '') : name.slice(0, 2);
};
function individuals() {
  const out = [];
  for (const p of roster) {
    const names = p.individuals && p.individuals.length
      ? p.individuals.map((x) => x.name)
      : p.n.replace(' and co-authors', '').split(/, | and /).map((s) => s.trim()).filter(Boolean);
    for (const name of names) {
      let ph = portraits.find((r) => norm(r.name) === norm(name)) || null;
      if (!ph) {
        // Before the credits file exists, find the photograph by its file name.
        const sur = norm(name.split(/\s+/).slice(-1)[0]);
        const f = [p.id + '.jpg', p.id + '-' + sur + '.jpg', sur + '.jpg'].find((x) => fs.existsSync(path.join(OUT, 'assets/img/people', x)));
        if (f) ph = { name, file: 'assets/people/' + f };
      }
      const ini = initials(name);
      out.push({ id: p.id, name, year: p.y, work: p.w, rules: p.r, group: p.g, photo: ph && ph.file ? ASSETS + 'img/people/' + path.basename(ph.file) : null, credit: ph, ini });
    }
  }
  return out.sort((a, b) => a.year - b.year);
}
const INDIV = individuals();
const byName = (name) => INDIV.find((i) => norm(i.name) === norm(name)) || { name, ini: initials(name), photo: null };

const face = (i, L, cls = '') =>
  i.photo
    ? `<img src="${i.photo}" alt="${esc(L.ui.portraitOf(i.name))}" loading="lazy" decoding="async" width="160" height="160"${cls ? ` class="${cls}"` : ''}>`
    : `<span class="ini" aria-label="${esc(L.ui.initialsOf(i.name))}">${esc(i.ini)}</span>`;

// Strings of the second design pass, read from the language's ui block.
const v2 = (L, k) => L.ui[k];

// ---------- page shell ----------
function urlFor(L, ch) {
  const base = L.lang === 'en' ? ROOT_URL : ROOT_URL + 'fr/';
  return ch ? base + ch.slug + '/' : base;
}
function otherLang(L, LANGS) {
  return Object.values(LANGS).find((x) => x.lang !== L.lang) || null;
}

function header(L, ch, LANGS) {
  const O = otherLang(L, LANGS);
  const counterpart = O ? (ch ? urlFor(O, O.chapters.find((c) => c.n === ch.n)) : urlFor(O, null)) : null;
  const rail = L.chapters
    .map((c) => `<a class="rc" data-n="${c.n}" href="${urlFor(L, c)}"${ch && ch.n === c.n ? ' aria-current="page"' : ''}>${c.n}<span class="tip">${esc(c.title)}</span></a>`)
    .join('');
  const lang = O
    ? `<span class="lang" role="group" aria-label="${esc(L.ui.langLabel)}"><a href="${urlFor(L, ch)}" hreflang="${L.lang}" lang="${L.lang}" aria-current="true">${L.lang.toUpperCase()}</a><a href="${counterpart}" hreflang="${O.lang}" lang="${O.lang}">${O.lang.toUpperCase()}</a></span>`
    : '';
  const menu = L.chapters
    .map((c) => `<a href="${urlFor(L, c)}"${ch && ch.n === c.n ? ' aria-current="page"' : ''}><span>${c.n}</span>${esc(c.title)}</a>`)
    .join('');
  return `<header class="g-head">
  <div class="wrap g-head-in">
    <nav class="crumb" aria-label="${esc(L.ui.site)}"><a href="/">${esc(L.ui.site)}</a><span class="mid">/</span><a class="mid" href="/projects/">${esc(L.ui.projects)}</a><span>/</span><a class="here" href="${urlFor(L, null)}"><span class="long">${esc(L.ui.guide)}</span><span class="short">${esc(L.ui.guideShort || "Guide")}</span></a></nav>
    <nav class="chrail" aria-label="${esc(L.ui.chapters)}"><span class="kicker">${esc(L.ui.chapters)}</span>${rail}${lang}</nav>
    <div class="head-r">${lang ? lang.replace('class="lang"', 'class="lang lang-m"') : ''}<button type="button" class="menu-btn" aria-expanded="false" aria-controls="menu-sheet">${esc(L.ui.menu)}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>
  </div>
  <div class="progress" aria-hidden="true"><i></i></div>
  <nav class="menu-sheet" id="menu-sheet" aria-label="${esc(L.ui.chapters)}"><a href="${urlFor(L, null)}"${ch ? '' : ' aria-current="page"'}><span>·</span>${esc(L.ui.contents)}</a>${menu}</nav>
</header>`;
}

// The figures link a rule by number; on chapter pages each rule lives on its own chapter's page.
function figureLinks(L) {
  const rule = {};
  for (const c of L.chapters) for (const n of c.rules || []) rule[n] = urlFor(L, c) + '#r' + n;
  const works = L.chapters.find((c) => c.key === 'works');
  return `window.GUIDE_DATA.links={rule:function(n){return (${JSON.stringify(rule)})[n]||'#r'+n},works:${JSON.stringify(works ? urlFor(L, works) : '#works')}};`;
}

function shell({ L, LANGS, ch, title, description, body, data, extraScripts = '', anchors = null, bodyClass = '' }) {
  const O = otherLang(L, LANGS);
  const url = SITE + urlFor(L, ch);
  const alt = O ? SITE + (ch ? urlFor(O, O.chapters.find((c) => c.n === ch.n)) : urlFor(O, null)) : null;
  // Chapters run on: each page names the chapter that follows it, and page.js appends it when the reader gets near the end.
  const nextCh = L.chapters[(ch ? L.chapters.findIndex((c) => c.n === ch.n) : -1) + 1] || null;
  const extraSrc = [...extraScripts.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  return `<!doctype html>
<html lang="${L.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#ffffff">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${L.lang}" href="${url}">${alt ? `\n<link rel="alternate" hreflang="${O.lang}" href="${alt}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${L.locale}">
<meta property="og:image" content="${SITE}${ASSETS}${L.lang === 'fr' ? 'og-fr.png' : 'og.png'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<!-- Generated by react-site/scripts/build-guide.mjs from react-site/src/guide. Edit the sources, not this file. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400..600&family=Geist+Mono:wght@400..600&family=Geist:wght@400;700&family=Archivo:wght@400;700&display=swap">
<link rel="stylesheet" href="${ASSETS}guide.css?v=${BUILD}">
</head>
<body data-chapter="${ch ? ch.n : 0}">
<a class="skip" href="#main">${esc(L.ui.skip)}</a>
${header(L, ch, LANGS)}
<main id="main" class="wrap">
<div class="chap${bodyClass ? ' ' + bodyClass : ''}" data-n="${ch ? ch.n : 0}" data-url="${urlFor(L, ch)}" data-title="${esc(title)}"${alt ? ` data-alt="${alt.slice(SITE.length)}"` : ''}${nextCh ? ` data-next="${urlFor(L, nextCh)}"` : ''}${extraSrc.length ? ` data-scripts="${extraSrc.join(' ')}"` : ''}>
${body}
<script type="application/json" class="chap-data">${JSON.stringify(data || {}).replace(/</g, '\\u003c')}</script>
</div>
</main>
<script>window.GUIDE_DATA=JSON.parse(document.querySelector('.chap-data').textContent);${figureLinks(L)}</script>${anchors ? `<script>window.GUIDE_ANCHORS=${JSON.stringify(anchors)};</script>` : ''}
<script src="${ASSETS}fig2.js?v=${BUILD}" defer></script>
<script src="${ASSETS}figures.js?v=${BUILD}" defer></script>
<script src="${ASSETS}page.js?v=${BUILD}" defer></script>${extraScripts}
</body>
</html>
`;
}

function chapterFoot(L, ch) {
  const i = ch ? L.chapters.findIndex((c) => c.n === ch.n) : -1;
  const next = L.chapters[i + 1];
  const prev = i > 0 ? L.chapters[i - 1] : null;
  const nextBlock = next
    ? `<a class="next" href="${urlFor(L, next)}"><span><span class="kicker">${esc(ch ? `${L.ui.next} · ${L.ui.chapterN(next.n)}${next.rules ? ' · ' + L.ui.rulesRange(next.rules[0], next.rules[next.rules.length - 1]) : ''}` : `${L.ui.startReading} · ${L.ui.chapterN(next.n)}`)}</span><b>${esc(next.title)}</b></span><span class="arr" aria-hidden="true">→</span></a>`
    : `<a class="next" href="${urlFor(L, null)}"><span><span class="kicker">${esc(L.ui.backToStart)}</span><b>${esc(L.ui.backToStartTitle)}</b></span><span class="arr" aria-hidden="true">→</span></a>`;
  const prevLink = ch
    ? `<a class="prev" href="${prev ? urlFor(L, prev) : urlFor(L, null)}"><span aria-hidden="true">←</span><span>${esc(L.ui.previous)}</span><b>${esc(prev ? `${L.ui.chapterN(prev.n)} · ${prev.title}` : L.ui.contents)}</b></a>`
    : '';
  return `<nav class="ch-foot" aria-label="${esc(L.ui.chapters)}">${nextBlock}${prevLink}<div class="colophon"><span>${esc(L.ui.colophon)}</span><a href="/">enzosimier.com</a></div></nav>`;
}

// ---------- chapter opener ----------
function opener(L, ch, { indexLabel, index, facesLabel, faces, facesNames, swatches }) {
  const list = index.map((x) => `<li><a href="${x.href}"><span>${esc(x.n)}</span>${esc(x.title)}</a></li>`).join('');
  const right = swatches
    ? `<div class="swatches">${swatches.map((c) => `<i style="background:${c}${c === 'var(--page)' ? ';box-shadow:inset 0 0 0 1px var(--rule)' : ''}"></i>`).join('')}</div>`
    : `<div class="minis">${faces.map(byName).filter((i) => i.photo).slice(0, 8).map((i) => `<span class="m" title="${esc(i.name)}">${face(i, L)}</span>`).join('')}</div>`;
  return `<section class="opener">
  <div class="numeral" aria-hidden="true">${ch.n}</div>
  <div class="op-text">
    <h1>${esc(ch.title)}</h1>
    <p class="standfirst">${esc(ch.standfirst || '')}</p>
    <div class="op-index">
      <div class="op-list"><span class="kicker">${esc(indexLabel)}</span><ol>${list}</ol></div>
      <div class="op-faces"><span class="kicker">${esc(facesLabel)}</span>${right}<p>${esc(facesNames)}</p></div>
    </div>
  </div>
</section>`;
}

// ---------- cover ----------
function cover(L, LANGS) {
  const C = L.cover;
  const nPeople = INDIV.length;
  const nDash = (readJSON(`content/dashboards.${L.lang}.json`, { cases: [] }).cases || []).length || 7;
  const statN = (s) => (s.n === 'people' ? nPeople : s.n === 'dashboards' ? nDash : s.n);
  const stats = C.stats
    .map((s) => `<a class="stat" href="${urlFor(L, L.chapters.find((c) => c.n === s.ch))}"><b>${statN(s)}</b><span><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></span></a>`)
    .join('');
  const peopleCh = L.chapters.find((c) => c.key === 'people');
  // The tooltip names the work in the page language.
  const PL = readJSON(`content/people.${L.lang}.json`);
  const workOf = Object.fromEntries(PL ? [...PL.people, ...(PL.additions || [])].map((p) => [p.id, p.w]) : []);
  // The strip: everyone a rule cites who has a free photograph, in order of the work this guide draws on.
  const cited = new Set(Object.values(L.ruleExtras).flatMap((x) => x.faces || []));
  const strip = INDIV.filter((i) => i.photo && cited.has(i.name));
  const stripItem = (i, dup) => `<li${dup ? ' aria-hidden="true"' : ''}><a href="${urlFor(L, peopleCh)}#p-${i.id}"${dup ? ' tabindex="-1"' : ''}><img src="${i.photo}" alt="${dup ? '' : esc(L.ui.portraitOf(i.name))}" loading="lazy" decoding="async" width="160" height="160"><span class="nm">${esc(i.name)}</span><span class="yr">${i.year} · ${esc(String(workOf[i.id] || i.work).replace(/,\s*(?:c\.\s*)?\d{4}.*$/, ''))}</span></a></li>`;
  const faces = strip.map((i) => stripItem(i, false)).join('') + strip.map((i) => stripItem(i, true)).join('');
  const contents = L.chapters
    .map((c) => {
      const inside = c.rules ? L.ui.rules(c.rules) : c.inside ? c.inside(nPeople, 0) : '';
      return `<li><a href="${urlFor(L, c)}"><span class="num">${c.n}</span><span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></span><span class="in"><span class="kicker">${esc(C.insideCol)}</span><span>${esc(c.key === 'dashboards' ? c.inside(nDash, readJSON(`content/dashboards.${L.lang}.json`, { cases: [] }).cases.reduce((s, x) => s + (x.annotations || []).length, 0)) : inside)}</span></span></a></li>`;
    })
    .join('');
  const body = `<section class="hero">
  <h1 class="display">${esc(C.title)}</h1>
  <div class="hero-row">
    <div><p class="lede">${esc(C.lede[0])}</p><p class="lede2">${esc(C.lede[1])}</p></div>
    <nav class="inside" aria-label="${esc(C.insideLabel)}"><span class="kicker">${esc(C.insideLabel)}</span>${stats}</nav>
  </div>
</section>
<section class="sec cast" aria-labelledby="cast-h">
  <div class="sec-head"><div><h2 id="cast-h">${esc(C.castTitle)}</h2><span class="note">${esc(v2(L, 'castNote'))}</span></div><a class="act" href="${urlFor(L, peopleCh)}">${esc(v2(L, 'castCta')(nPeople))}</a></div>
  <div class="strip" role="region" aria-label="${esc(v2(L, 'stripLabel'))}"><ul class="strip-track">${faces}</ul></div>
</section>
<section class="sec" id="example" aria-labelledby="ex-h">
  <div class="sec-head"><div><h2 id="ex-h">${esc(C.exampleTitle)}</h2><span class="note">${esc(C.exampleNote)}</span></div></div>
  <div class="tb"><div class="prose"><p>${esc(C.example)}</p></div><aside class="notes"><ul><li class="about"><b>${esc(C.aboutTitle)}</b>${esc(C.about)}</li></ul></aside></div>
  <figure class="fig" style="margin-top:28px"><div class="stage" id="board"></div><figcaption class="cap">${C.boardCaption || ''}</figcaption></figure>
</section>
<section class="sec" aria-labelledby="contents-h">
  <div class="sec-head"><div><h2 id="contents-h">${esc(L.ui.contents)}</h2><span class="note">${esc(C.contentsNote)}</span></div></div>
  <ol class="chapters">${contents}</ol>
</section>
${chapterFoot(L, null)}`;
  // Old single-page anchors, kept working from the cover.
  const anchors = {};
  for (const c of L.chapters) if (c.rules) for (const r of c.rules) anchors['r' + r] = urlFor(L, c) + '#r' + r;
  const chap = (k) => urlFor(L, L.chapters.find((c) => c.key === k));
  Object.assign(anchors, { people: chap('people'), rules: chap('frame'), works: chap('works'), system: chap('system'), sources: chap('system') + '#sources' });
  for (const p of roster) anchors['p-' + p.id] = chap('people') + '#p-' + p.id;
  return shell({ L, LANGS, ch: null, title: L.meta.title, description: L.meta.description, body, anchors });
}

// ---------- rule chapters ----------
function ruleSection(L, n, R, X0, chapterKey) {
  let X = X0;
  const from = X.faces.map(byName);
  const fromPh = from.filter((i) => i.photo);
  const names = from.map((i) => i.name.split(' ').slice(-1)[0]).join(', ');
  const blocks = R.blocks
    .map((b, bi) => {
      const notes = b.notes.length ? `<ul>${b.notes.map((x) => `<li>${x}</li>`).join('')}</ul>` : '';
      const grid = b.gridopt ? `<div class="grid-opt"><button type="button" class="opt inline" id="grid-toggle" role="switch" aria-checked="false"><i class="sw"></i><span>${esc(L.ui.showGrid)}</span></button></div>` : '';
      return `<div class="tb"><div class="prose">${b.p.map((p) => `<p>${p}</p>`).join('')}</div><aside class="notes">${notes}${grid}</aside></div>`;
    })
    .join('');
  // The callout is one annotated note from chapter 7, cropped from its screenshot.
  const pick = (readJSON('data/callouts.json') || {})[n];
  const D = readJSON(`content/dashboards.${L.lang}.json`);
  const dashCh = L.chapters.find((c) => c.key === 'dashboards');
  if (pick && D) {
    const c = D.cases.find((x) => x.slug === pick.slug);
    const a = c && c.annotations.find((x) => x.n === pick.n);
    if (a) X = { ...X, seen: { title: c.title, n: a.n, notYet: !!pick.notYet, href: urlFor(L, dashCh) + '#' + c.slug + '-n' + a.n }, callout: { kicker: c.title, title: (X.calloutNote && X.calloutNote.title) || a.title, text: (X.calloutNote && X.calloutNote.text) || a.text, href: urlFor(L, dashCh) + '#' + c.slug + '-n' + a.n, img: ASSETS + 'img/dashboards/' + pick.img, pin: pick.pin, pinN: a.n } };
  }
  // Rules are general; our own dashboards stay in chapter 7, one line away.
  const seenLine = X.seen ? v2(L, X.seen.notYet ? 'notYetIn' : 'seenIn')('\u0000', X.seen.n).split('\u0000') : null;
  const seen = seenLine ? `<p class="seen-in">${esc(seenLine[0])}<a href="${X.seen.href}">${esc(X.seen.title)}</a>${esc(seenLine[1] || '')}</p>` : '';
  const callout = false && X.callout
    ? `<div class="callout"><div class="co-text"><div><span class="kicker">${esc(L.ui.inOurDashboards)}${X.callout.kicker ? ' · ' + esc(X.callout.kicker) : ''}</span><h3>${esc(X.callout.title)}</h3><p>${esc(X.callout.text)}</p></div><a href="${X.callout.href}">${esc(L.ui.openCase)}</a></div><a class="co-img" href="${X.callout.href}" tabindex="-1" aria-hidden="true"><img src="${X.callout.img}" alt="" loading="lazy" decoding="async" width="800" height="450">${X.callout.pin ? `<span class="pin" style="left:${X.callout.pin[0]}%;top:${X.callout.pin[1]}%">${X.callout.pinN}</span>` : ''}</a></div>`
    : '';
  return `<section class="rule" id="r${n}" aria-labelledby="r${n}-h">
  <div class="rule-head">
    <div><div class="rh-meta"><span class="badge">${n}</span><span class="kicker">${esc(L.ui.ruleOf(n))}</span></div><h2 id="r${n}-h">${R.title}</h2></div>
    <div class="rh-from"><span class="kicker">${esc(L.ui.from)}</span>${fromPh.length ? `<div class="from-faces">${fromPh.map((i) => `<span class="m" title="${esc(i.name)}">${face(i, L)}</span>`).join('')}</div>` : ''}<p>${esc(names)}</p></div>
  </div>
  <div class="body">${blocks}</div>
  <figure class="fig"><div class="stage" id="${R.stage}"></div><figcaption class="cap">${R.caption}</figcaption></figure>${R.after ? '\n  ' + R.after : ''}
  ${seen}
  <div class="oneline"><div class="ol-main"><span class="kicker">${esc(L.ui.oneLine)}</span><p>${esc(X.oneLine)}</p></div><div class="ol-try"><span class="kicker">${esc(L.ui.tryIt)}</span><p>${esc(X.tryIt)}</p></div></div>
</section>`;
}

function ruleChapter(L, LANGS, ch) {
  const RULES = readJSON(`content/rules.${L.lang}.json`);
  const faces = [...new Set(ch.rules.flatMap((n) => L.ruleExtras[n].faces))];
  const surnames = faces.map((n) => n.split(' ').slice(-1)[0]);
  const names = surnames.length > 1 ? surnames.slice(0, -1).join(', ') + (L.lang === 'fr' ? ' et ' : ' and ') + surnames[surnames.length - 1] : surnames[0];
  const head = opener(L, ch, {
    indexLabel: L.ui.inThisChapter,
    index: ch.rules.map((n) => ({ n, title: RULES[n].title, href: '#r' + n })),
    facesLabel: L.ui.drawnFrom,
    faces,
    facesNames: names,
  });
  const sections = ch.rules.map((n) => ruleSection(L, n, RULES[n], L.ruleExtras[n], ch.key)).join('\n');
  const checks = ch.rules
    .map((n) => `<li><label><input type="checkbox" name="r${n}"><span class="rn">${esc(L.ui.rule(n))}</span><span class="ct">${esc(L.ruleExtras[n].check)}</span></label></li>`)
    .join('');
  const fmt = L.ui.checked('{k}', '{n}');
  const body = `${head}
${sections}
<section class="sec check" data-key="${ch.key}" data-fmt="${esc(fmt)}" aria-labelledby="check-h-${ch.n}">
  <div class="sec-head"><div><h2 id="check-h-${ch.n}">${esc(L.ui.beforeMoveOn)}</h2><span class="note">${esc(L.ui.beforeNote)}</span></div><span class="count">${esc(L.ui.checked(0, ch.rules.length))}</span></div>
  <ul>${checks}</ul>
</section>
${chapterFoot(L, ch)}
${ch.rules.includes(1) ? '<div id="gridlay" aria-hidden="true" hidden><div>' + '<i></i>'.repeat(12) + '</div></div>' : ''}`;
  return shell({ L, LANGS, ch, title: L.meta.chapterTitle(ch.title), description: ch.standfirst, body });
}

// ---------- works ----------
function worksChapter(L, LANGS, ch) {
  const W = readJSON(`content/works.${L.lang}.json`);
  const all = W.groups.flatMap((g) => g.items);
  const head = opener(L, ch, {
    indexLabel: L.ui.shelves || 'Three shelves',
    index: W.groups.map((g, i) => ({ n: g.items.length, title: g.title, href: '#shelf-' + (i + 1) })),
    facesLabel: L.ui.madeBy || 'Made by',
    faces: ['Otl Aicher', 'Massimo Vignelli', 'Otto Neurath', 'Gerd Arntz', 'Edward Tufte', 'Mike Bostock', 'Shan Carter', 'Bret Victor'],
    facesNames: L.ui.madeByNames || '',
  });
  const chips = ['all', ...Array.from({ length: 12 }, (_, i) => String(i + 1))]
    .map((r) => `<button type="button" class="chip" data-rule="${r}" aria-pressed="${r === 'all'}">${r === 'all' ? esc(L.ui.allRules || 'All rules') : r}</button>`)
    .join('');
  const shelves = W.groups
    .map(
      (g, gi) => `<section class="shelf" id="shelf-${gi + 1}" aria-labelledby="shelf-${gi + 1}-h">
  <div class="sec-head"><div><h2 class="big" id="shelf-${gi + 1}-h">${esc(g.title)}</h2><span class="note">${esc(g.note)}</span></div></div>
  <ul class="works">${g.items
    .map(
      (w) => `<li class="work" data-rules="${w.rules.join(' ')}"><div class="top"><span class="yr">${esc(w.mark)}</span><span class="rl">${esc(L.ui.rulesShort(w.rules))}</span></div><h3>${esc(w.title)}</h3><span class="by">${esc(w.by)}</span><p>${esc(w.take)}</p><a href="${esc(w.url)}" rel="noopener">${esc(L.ui.open)}</a></li>`,
    )
    .join('')}</ul>
</section>`,
    )
    .join('\n');
  const body = `${head}
<div class="filter" data-for="works" data-fmt="${esc(L.ui.worksShown ? L.ui.worksShown('{n}') : '{n} works')}"><div class="chips"><span class="kicker">${esc(L.ui.showWorksFor || 'Show works for')}</span>${chips}</div><span class="shown">${esc(L.ui.worksShown ? L.ui.worksShown(all.length) : all.length + ' works')}</span></div>
${shelves}
${chapterFoot(L, ch)}`;
  return shell({ L, LANGS, ch, title: L.meta.chapterTitle(ch.title), description: ch.standfirst, body });
}

// ---------- system ----------
// The credit lines in data/portraits.json are in English; the French pages say the same in French.
const CREDIT_FR = [
  [/^Photo: /, 'Photo : '], [/^Still from /, 'Image extraite de '], [/unknown photographer, courtesy /, 'photographe inconnu, avec l’accord de '],
  [/public domain/g, 'domaine public'], [/\(Brazil\)/, '(Brésil)'], [/August 1926/, 'août 1926'], [/2 October 1920/, '2 octobre 1920'],
  [/National Library of Israel \(Schwadron collection\)/, 'Bibliothèque nationale d’Israël (collection Schwadron)'], [/Library of Congress/, 'Bibliothèque du Congrès'],
  [/Moravian Library in Brno/, 'Bibliothèque morave de Brno'], [/National Institute of Standards and Technology/, 'National Institute of Standards and Technology (États-Unis)'],
  [/c\. (\d{4})/, 'vers $1'], [/'([^']+)'/g, '« $1 »'],
];
const creditLine = (L, s) => (L.lang === 'fr' ? CREDIT_FR.reduce((t, [a, b]) => t.replace(a, b), s) : s);

function systemChapter(L, LANGS, ch) {
  const S = L.system;
  const head = opener(L, ch, {
    indexLabel: L.ui.inThisChapter,
    index: [
      { n: 6, title: S.decisionsTitle, href: '#decisions' },
      { n: 3, title: S.tuneTitle, href: '#tune' },
      { n: '—', title: S.sourcesIndex, href: '#sources' },
    ],
    facesLabel: S.paletteLabel,
    swatches: ['var(--relief)', 'var(--sheet)', 'var(--page)', 'var(--well)', 'var(--slate)', 'var(--ink)', 'var(--tint)', 'var(--cobalt)'],
    facesNames: S.paletteNote,
  });
  const spec = {
    grid: `<div class="spec grid" aria-hidden="true">${'<i></i>'.repeat(12)}</div>`,
    surfaces: `<div class="spec surf" aria-hidden="true"><i><b></b><u></u></i></div>`,
    type: `<div class="spec type" aria-hidden="true"><b>${L.lang === 'fr' ? '294,4' : '294.4'}</b><span>${L.lang === 'fr' ? 'k$' : '$K'}</span></div>`,
    figures: `<div class="spec fig" aria-hidden="true"><div><b>${L.lang === 'fr' ? '−17,6' : '−17.6'}</b><span>${esc(S.lostSales)}</span></div><div><b>${L.lang === 'fr' ? '57,0' : '57.0'}</b><span>${esc(S.leftToBuy)}</span></div></div>`,
    colour: `<div class="spec col" aria-hidden="true"><i style="height:30px;background:var(--slate)"></i><i style="height:44px;background:var(--ink)"></i><i style="height:36px;background:var(--slate2)"></i><i style="height:22px;border:1.5px dashed var(--slate)"></i><i style="height:14px;background:repeating-linear-gradient(45deg,var(--slate) 0 1.5px,#fff 1.5px 5px)"></i></div>`,
    interaction: `<div class="spec int" aria-hidden="true"><svg width="100%" height="60" viewBox="0 0 280 60" preserveAspectRatio="none"><path d="M6 52 C 90 50, 160 44, 210 26 S 262 6, 274 4" fill="none" stroke="#5A6676" stroke-width="2"/><line x1="6" y1="30" x2="274" y2="30" stroke="#CBD2DC" stroke-dasharray="3 3"/><circle cx="196" cy="31" r="9" fill="#FFFFFF" stroke="#121923" stroke-width="2"/><circle cx="196" cy="31" r="3.5" fill="#121923"/></svg></div>`,
  };
  const decisions = S.decisions.map((d) => `<div class="decision"><span class="kicker">${esc(d.label)}</span>${spec[d.key]}<p>${esc(d.text)}</p></div>`).join('');
  // Sources, grouped as in the rules.
  const groups = [];
  for (const s of sources) {
    let g = groups.find((x) => x.g === s.g);
    if (!g) groups.push((g = { g: s.g, items: [] }));
    g.items.push(s);
  }
  // French sources: group titles and the work and take of each item, in the same order as sources.json.
  const SF = readJSON(`content/sources.${L.lang}.json`);
  const SRC_T = {};
  if (SF) {
    let k = 0;
    for (const g of groups) SRC_T[g.g] = { title: (SF.groups || {})[g.g], works: [], takes: [] };
    for (const s of sources) { const t = SRC_T[s.g]; const it = (SF.items || [])[k++] || {}; t.works.push(it.work); t.takes.push(it.take); }
  }
  const srcHTML = groups
    .map((g) => {
      const t = SRC_T[g.g] || {};
      return `<div class="srcgroup"><div><h3>${esc(t.title || g.g)}</h3><p class="meta">${esc(L.ui.nSources(g.items.length))}</p></div><ul>${g.items
        .map((s, i) => `<li><i class="${s.st === 'k' ? 'k' : ''}" title="${esc(s.st === 'k' ? S.keyKnown : S.keyChecked)}"></i><span>${s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.who)}</a>` : `<b>${esc(s.who)}</b>`}, ${esc((t.works && t.works[i]) || s.work)}</span><span class="tk">${esc((t.takes && t.takes[i]) || s.take)}</span></li>`)
        .join('')}</ul></div>`;
    })
    .join('');
  const credits = INDIV.filter((i) => i.photo && i.credit)
    .map((i) => `<li><img src="${i.photo}" alt="" loading="lazy" decoding="async"><span><b>${esc(i.name)}</b>${esc(creditLine(L, i.credit.credit || ''))}${i.credit.source_page ? ` · <a href="${esc(i.credit.source_page)}" rel="noopener">${esc(S.source)}</a>` : ''}</span></li>`)
    .join('');
  const noPhoto = INDIV.filter((i) => !i.photo).map((i) => i.name);
  const body = `${head}
<section class="sec" id="decisions" aria-labelledby="dec-h">
  <div class="sec-head"><div><h2 class="big" id="dec-h">${esc(S.decisionsTitle)}</h2><span class="note">${esc(S.decisionsNote)}</span></div></div>
  <div class="decisions">${decisions}</div>
</section>
<section class="sec" id="tune" aria-labelledby="tune-h">
  <div class="sec-head"><div><h2 class="big" id="tune-h">${esc(S.tuneTitle)}</h2><span class="note">${esc(S.tuneNote)}</span></div></div>
  <figure class="fig"><div class="stage" id="demo-tune"></div><figcaption class="cap">${S.tuneCaption}</figcaption></figure>
  <div class="tokens-block" style="margin-top:28px"><div class="tb-head"><span class="kicker">${esc(S.tokensLabel)}</span><button type="button" id="copy-tokens">${esc(S.copy)}</button></div><pre id="tokens"></pre></div>
</section>
<section class="sec" id="sources" aria-labelledby="src-h">
  <div class="sec-head"><div><h2 class="big" id="src-h">${esc(S.sourcesTitle)}</h2><span class="note">${esc(S.sourcesNote(sources.length, groups.length))}</span></div><div class="srckey"><span><i></i>${esc(S.keyChecked)}</span><span><i class="k"></i>${esc(S.keyKnown)}</span></div></div>
  <div class="srcgroups">${srcHTML}</div>
</section>
<section class="sec sec-two" aria-label="${esc(S.editionsTitle)}">
  <div class="editions"><h2>${esc(S.editionsTitle)}</h2><ol>${S.editions.map((e, i, a) => `<li${i === a.length - 1 ? ' class="now"' : ''}><b>${esc(e[0])}</b><span>${esc(e[1])}</span></li>`).join('')}</ol></div>
  <div class="credits" id="credits"><h2>${esc(S.creditsTitle)}</h2><p>${esc(S.creditsNote)}${noPhoto.length ? ' ' + esc(S.noPhoto(noPhoto)) : ''}</p></div>
</section>
<section class="sec credit-list" aria-label="${esc(S.creditsTitle)}"><ul>${credits}</ul></section>
${chapterFoot(L, ch)}`;
  return shell({ L, LANGS, ch, title: L.meta.chapterTitle(ch.title), description: ch.standfirst, body });
}

// ---------- the other chapters are added by their own modules when their data exists ----------
const extraPath = path.join(SRC, 'build-extra.mjs');
const extra = fs.existsSync(extraPath) ? await import(pathToFileURL(extraPath).href) : null;

// ---------- build ----------
const BUILD = Date.now().toString(36);
const LANGS = {};
// A language is built only when every chapter has its text, so no page links to a missing one.
const NEEDS = ['rules', 'works', 'people', 'dashboards', 'research'];
for (const lg of ['en', 'fr']) {
  const L = await load(`content/${lg}.js`);
  const missing = NEEDS.filter((f) => !fs.existsSync(path.join(SRC, `content/${f}.${lg}.json`)));
  if (L && !missing.length) LANGS[lg] = L;
  else if (L) console.log(`Skipped ${lg}: no ${missing.join(', ')} yet`);
}
for (const L of Object.values(LANGS)) {
  const base = L.lang === 'en' ? '' : 'fr/';
  write(base + 'index.html', cover(L, LANGS));
  for (const ch of L.chapters) {
    let html = null;
    if (ch.rules) html = ruleChapter(L, LANGS, ch);
    else if (ch.key === 'works') html = worksChapter(L, LANGS, ch);
    else if (ch.key === 'system' && L.system) html = systemChapter(L, LANGS, ch);
    else if (extra && extra[ch.key]) html = extra[ch.key]({ L, LANGS, ch, shell, opener, chapterFoot, urlFor, esc, face, byName, INDIV, people, portraits, readJSON, ASSETS, BUILD, OUT });
    if (html) write(base + ch.slug + '/index.html', html);
  }
}
// Styles and scripts.
const cat = (...files) => files.map((f) => { const p = path.join(SRC, 'runtime', f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }).join('\n');
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
// The second edition's figures: the core, then each figure file in name order, then start.
const fig2Dir = path.join(SRC, 'runtime', 'fig2');
const fig2Files = (ext) => (fs.existsSync(fig2Dir) ? fs.readdirSync(fig2Dir).filter((f) => f.endsWith(ext) && f !== 'core' + ext).sort() : []);
const catFig2 = (ext) => ['core' + ext, ...fig2Files(ext)].map((f) => { const p = path.join(fig2Dir, f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }).join('\n');
fs.writeFileSync(path.join(OUT, 'assets/guide.css'), cat('figures.css', 'page.css', 'research.css') + '\n' + catFig2('.css'));
fs.writeFileSync(path.join(OUT, 'assets/fig2.js'), catFig2('.js') + '\nFIG.start();\n');
fs.writeFileSync(path.join(OUT, 'assets/research.js'), cat('research.js'));
fs.writeFileSync(path.join(OUT, 'assets/figures.js'), cat('guide.js'));
fs.writeFileSync(path.join(OUT, 'assets/page.js'), cat('page.js'));
console.log('Built', Object.keys(LANGS).join(' + '), 'into', path.relative(process.cwd(), OUT));
