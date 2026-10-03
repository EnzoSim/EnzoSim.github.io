// Chapter templates that depend on larger data files: the people, the wider research
// and the dashboards we made. Loaded by scripts/build-guide.mjs.
import fs from 'node:fs';
import path from 'node:path';

// A capture saved beside its double-resolution twin (name@2x.jpg) is offered to sharp screens.
const srcset2x = ({ OUT, ASSETS }, src) => {
  const two = src.replace(/(\.[a-z]+)$/, '@2x$1');
  return OUT && src.startsWith(ASSETS) && fs.existsSync(path.join(OUT, 'assets', two.slice(ASSETS.length))) ? ` srcset="${src} 1x, ${two} 2x"` : '';
};

const ruleTitle = (readJSON, L, n) => (readJSON(`content/rules.${L.lang}.json`) || {})[n]?.title || '';

function ruleLinks({ L, urlFor, esc, readJSON }, rules) {
  return (rules || [])
    .map((n) => {
      const ch = L.chapters.find((c) => c.rules && c.rules.includes(n));
      return ch ? `<a href="${urlFor(L, ch)}#r${n}">${esc(L.ui.rule(n))} · ${esc(ruleTitle(readJSON, L, n))}</a>` : '';
    })
    .join('');
}

// ---------- 1 · The people ----------
export function people(ctx) {
  const { L, LANGS, ch, shell, opener, chapterFoot, esc, byName, readJSON, ASSETS } = ctx;
  const prof = readJSON(`content/people.${L.lang}.json`) || readJSON('data/people-profiles.json');
  if (!prof) return null;
  const groups = L.groups;
  const all = [...prof.people, ...(prof.additions || [])];
  const featuredIds = prof.featured_ids || all.filter((p) => p.featured).map((p) => p.id);
  const featured = featuredIds.map((id) => all.find((p) => p.id === id)).filter(Boolean);
  const rest = all.filter((p) => !featuredIds.includes(p.id));
  // Names stay as in English in the data (they are keys); French pages join them with « et ».
  const nm = (n) => (L.lang === 'fr' ? n.replace(/ and co-authors$/, ' et coauteurs').replace(/ and /g, ' et ') : n);
  const individualsOf = (p) =>
    p.individuals && p.individuals.length
      ? p.individuals.map((x) => ({ ...byName(x.name), life: x.life }))
      : [{ ...byName(p.n), life: p.l }];
  const photoBlock = (p, size) => {
    const ind = individualsOf(p);
    const cls = ind.length > 1 ? ` team t${Math.min(ind.length, 4)}` : '';
    return `<div class="ph${cls}">${ind
      .slice(0, 4)
      .map((i) => (i.photo ? `<img src="${i.photo}" alt="${esc(L.ui.portraitOf(i.name))}" loading="lazy" decoding="async" width="${size}" height="${size}">` : `<span class="ini" role="img" aria-label="${esc(L.ui.initialsOf(i.name))}">${esc(i.ini)}<small>${esc(L.ui.noPhoto)}</small></span>`))
      .join('')}</div>`;
  };
  const projects = (p) =>
    (p.projects || [])
      .map((x) => `<li><b class="tnum">${esc(x.year)}</b><span><strong>${esc(x.title)}</strong> ${esc(x.what)}</span></li>`)
      .join('');
  const spread = (p, i) => `<article class="spread${i % 2 ? ' flip' : ''}" id="p-${p.id}" aria-labelledby="p-${p.id}-h">
  ${photoBlock(p, 704)}
  <div class="sp-text">
    <span class="kicker">${esc(groups[p.g]?.[1] || '')} · ${esc(p.y)}</span>
    <h2 id="p-${p.id}-h">${esc(nm(p.n))}</h2>
    <p class="life">${esc(p.l)}</p>
    ${p.pull ? `<p class="pull">${esc(p.pull)}</p>` : ''}
    <div class="sp-cols">
      <div><span class="kicker">${esc(L.ui.projectsLabel)}</span><ol class="projects">${projects(p)}</ol></div>
      <div><span class="kicker">${esc(L.ui.broughtLabel)}</span><p class="brought">${esc(p.brought)}</p></div>
    </div>
    <div class="learn"><span class="kicker">${esc(L.ui.learnLabel)}</span><p>${esc(p.learn)}</p></div>
    <div class="in-guide"><span class="kicker">${esc(L.ui.inThisGuide)}</span>${ruleLinks(ctx, p.r)}${p.u ? `<a class="ext" href="${esc(p.u)}" rel="noopener">${esc(p.w)} ↗</a>` : ''}</div>
  </div>
</article>`;
  const card = (p) => `<li class="pcard" id="p-${p.id}">
  ${photoBlock(p, 160)}
  <div class="pc-text"><h3>${esc(nm(p.n))}</h3><p class="life">${esc(p.l)}</p>
    <p class="made"><b class="tnum">${esc((p.projects && p.projects[0] && p.projects[0].year) || p.y)}</b> ${esc((p.projects && p.projects[0] && p.projects[0].title) || p.w)}</p>
    <p class="brought">${esc(p.brought || p.d)}</p>
    ${p.learn ? `<p class="learn-s"><span class="kicker">${esc(L.ui.learnLabel)}</span>${esc(p.learn)}</p>` : ''}
    <div class="in-guide">${ruleLinks(ctx, p.r)}</div>
  </div>
</li>`;
  const fieldSections = groups
    .map((g, gi) => {
      const members = rest.filter((p) => p.g === gi).sort((a, b) => a.y - b.y);
      if (!members.length) return '';
      return `<section class="sec pfield" id="f-${gi}" aria-labelledby="f-${gi}-h">
  <div class="sec-head"><div><h2 class="big" id="f-${gi}-h">${esc(g[0])}</h2><span class="note">${esc(g[2])}</span></div><span class="count">${esc(L.ui.nPeople(all.filter((p) => p.g === gi).length))}</span></div>
  <ul class="pcards">${members.map(card).join('')}</ul>
</section>`;
    })
    .join('\n');
  const head = opener(L, ch, {
    indexLabel: L.ui.sixFields,
    index: groups.map((g, gi) => ({ n: all.filter((p) => p.g === gi).length, title: g[0], href: '#f-' + gi })),
    facesLabel: L.ui.featuredLabel,
    faces: featured.slice(0, 8).map((p) => individualsOf(p)[0].name),
    facesNames: featured.map((p) => p.n.split(' and ')[0].split(' ').slice(-1)[0]).join(', '),
  });
  // Only what the timeline draws and its card shows; the profiles stay in the page itself.
  const timelineData = all.map((p) => ({ id: p.id, g: p.g, y: p.y, n: nm(p.n), l: p.l, d: p.d, u: p.u, w: p.w, r: p.r, img: individualsOf(p)[0].photo || null, learn: p.learn || '', pr: (p.projects || [])[0] || null }));
  // The card under the time axis links the first rule a person informs, by its title.
  const ruleTitles = Object.fromEntries(Object.entries(readJSON(`content/rules.${L.lang}.json`) || {}).map(([n, r]) => [n, String(r.title || '').replace(/<[^>]+>/g, '')]));
  const body = `${head}
<section class="sec" id="timeline" aria-labelledby="tl-h">
  <div class="sec-head"><div><h2 class="big" id="tl-h">${esc(L.ui.timelineTitle)}</h2><span class="note">${esc(L.ui.timelineNote)}</span></div></div>
  <figure class="fig"><div class="stage" id="demo-people"></div><figcaption class="cap">${L.ui.timelineCaption}</figcaption></figure>
</section>
<section class="sec featured" aria-labelledby="ft-h">
  <div class="sec-head"><div><h2 class="big" id="ft-h">${esc(L.ui.featuredTitle)}</h2><span class="note">${esc(L.ui.featuredNote)}</span></div></div>
  ${featured.map(spread).join('\n')}
</section>
${fieldSections}
${chapterFoot(L, ch)}`;
  return shell({
    L, LANGS, ch,
    title: L.meta.chapterTitle(ch.title),
    description: ch.standfirst,
    body,
    data: { people: timelineData, groups: groups.map((g) => [g[0], g[1], g[2]]), rules: ruleTitles },
    bodyClass: 'ch-people',
  });
}

// ---------- 7 · Dashboards we made ----------
export function dashboards(ctx) {
  const { L, LANGS, ch, shell, opener, chapterFoot, esc, readJSON, ASSETS, urlFor } = ctx;
  const D = readJSON(`content/dashboards.${L.lang}.json`);
  if (!D || !D.cases) return null;
  const cases = D.cases;
  const nNotes = cases.reduce((s, c) => s + (c.annotations || []).length, 0);
  const ruleCh = (n) => L.chapters.find((c) => c.rules && c.rules.includes(n));
  const kase = (c, ci) => {
    const img = ASSETS + 'img/dashboards/' + c.image;
    const pins = (c.annotations || [])
      .map((a) => `<a class="pin" data-pin="${a.n}" href="#${c.slug}-n${a.n}" style="left:${(a.x * 100).toFixed(2)}%;top:${(a.y * 100).toFixed(2)}%" aria-label="${esc(L.ui.noteN(a.n))}">${a.n}</a>`)
      .join('');
    const notes = (c.annotations || [])
      .map((a) => {
        const rc = ruleCh(a.rule);
        return `<li data-pin="${a.n}" id="${c.slug}-n${a.n}"><span class="pin-n">${a.n}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p>${rc ? `<a href="${urlFor(L, rc)}#r${a.rule}">${esc(L.ui.rule(a.rule))} · ${esc(ruleTitle(readJSON, L, a.rule))}</a>` : ''}</div></li>`;
      })
      .join('');
    return `<section class="sec case" id="${c.slug}" aria-labelledby="${c.slug}-h">
  <div class="case-head">
    <div><span class="kicker">${esc(String(ci + 1).padStart(2, '0'))} · ${esc(c.kind)}</span><h2 id="${c.slug}-h">${esc(c.title)}</h2><p class="q">${esc(c.question)}</p></div>
    <dl class="case-meta"><div><dt>${esc(L.ui.reader)}</dt><dd>${esc(c.reader)}</dd></div><div><dt>${esc(L.ui.decision)}</dt><dd>${esc(c.decision)}</dd></div><div><dt>${esc(L.ui.builtWith)}</dt><dd>${esc(c.built_with)}</dd></div>${c.link ? `<div><dt>${esc(L.ui.openIt)}</dt><dd><a href="${esc(c.link)}">${esc(L.ui.openDashboard)}</a></dd></div>` : `<div><dt>${esc(L.ui.access)}</dt><dd>${esc(L.ui.privateCase)}</dd></div>`}</dl>
  </div>
  <figure class="shot"><div class="shot-in"><div class="shot-canvas"><img src="${img}"${srcset2x(ctx, img)} alt="${esc(c.alt || c.title)}" loading="lazy" decoding="async" width="${c.width || 1440}" height="${c.height || 900}">${pins}</div></div></figure>
  <ol class="case-notes">${notes}</ol>
  ${c.next && c.next.length ? `<div class="case-next"><span class="kicker">${esc(L.ui.stillChange)}</span><ul>${c.next.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
</section>`;
  };
  const head = opener(L, ch, {
    indexLabel: L.ui.inThisChapter,
    index: cases.map((c, i) => ({ n: i + 1, title: c.title, href: '#' + c.slug })),
    facesLabel: L.ui.atAGlance,
    faces: [],
    facesNames: L.ui.dashNote(cases.length, nNotes),
  });
  const body = `${head}
${cases.map(kase).join('\n')}
${chapterFoot(L, ch)}`;
  return shell({ L, LANGS, ch: { ...ch, standfirst: ch.standfirst || D.standfirst }, title: L.meta.chapterTitle(ch.title), description: D.standfirst || ch.desc, body, bodyClass: 'ch-dash' });
}

// ---------- 6 · What neighbouring fields know ----------
export function research(ctx) {
  const { L, LANGS, ch, shell, opener, chapterFoot, esc, readJSON, ASSETS } = ctx;
  const R = readJSON(`content/research.${L.lang}.json`);
  if (!R) return null;
  // The charts read only these published values; the rest of figure-data.json records where each one comes from.
  const fd = readJSON('data/figure-data.json') || {};
  const vals = (k) => (fd[k] && fd[k].values) || {};
  const figData = {
    A: { values: { rows: vals('A').rows } },
    B: { values: { accuracy_by_size_quartile_fig2: vals('B').accuracy_by_size_quartile_fig2 } },
    C: { values: { clusters: vals('C').clusters } },
    D: { values: Object.fromEntries(Object.entries(vals('D')).filter(([k]) => ['groups_final_version', 'dashboards_analysed', 'patterns_stated_in_text'].includes(k) || k.startsWith('arxiv_v'))) },
  };
  const T = L.research || {};
  const fig = (g) => `<figure class="fig"><div class="stage" id="fig-${g.id}"></div><figcaption class="cap"><b>${esc(g.title)}.</b> ${esc(g.caption)}</figcaption></figure>`;
  const refs = (f) =>
    f.refs && f.refs.length
      ? `<div class="refs"><span class="kicker">${esc(T.readFurther)}</span><ul>${f.refs
          .map((r) => `<li><a href="${esc(r.url)}" rel="noopener">${esc(r.who)}</a><span class="rw">${esc(r.work)}${r.venue ? ', ' + esc(r.venue) : ''}${r.year ? ', ' + esc(r.year) : ''}</span><span class="rt">${esc(r.take)}</span></li>`)
          .join('')}</ul></div>`
      : '';
  const fields = R.fields
    .map(
      (f, i) => `<section class="rfield" id="field-${f.id}" aria-labelledby="field-${f.id}-h">
  <div class="rf-head"><div><span class="kicker">${ch.n}.${i + 1} · ${esc(T.fieldN(i + 1, R.fields.length))}</span><h2 id="field-${f.id}-h">${esc(f.title)}</h2><p class="rf-sf">${esc(f.standfirst)}</p></div></div>
  <div class="tb"><div class="prose">${f.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div><aside class="takeaways"><span class="kicker">${esc(T.changes)}</span><ol>${f.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></aside></div>
  ${f.figures.map(fig).join('\n  ')}
  ${refs(f)}
</section>`,
    )
    .join('\n');
  const head = opener(L, { ...ch, standfirst: R.standfirst || R.intro[0], kickerExtra: T.kicker }, {
    indexLabel: T.eightFields,
    index: R.fields.map((f, i) => ({ n: i + 1, title: f.title, href: '#field-' + f.id })),
    facesLabel: T.facesLabel,
    faces: ['Matthew Kay', 'Jessica Hullman', 'Robert Fildes', 'William Cleveland', 'Jeffrey Heer', 'Jacques Bertin', 'Kim Vicente', 'Melanie Tory'],
    facesNames: T.facesNames,
  });
  const intro = (R.standfirst ? R.intro : R.intro.slice(1)).map((p) => `<p>${esc(p)}</p>`).join('');
  const body = `${head}
<section class="sec" aria-label="${esc(T.introLabel)}">
  <div class="tb"><div class="prose">${intro}</div><aside class="notes"><ul><li class="about"><b>${esc(T.howToRead)}</b>${esc(T.howToReadText)}</li></ul></aside></div>
  <figure class="fig" style="margin-top:32px"><div class="stage" id="fig-F0"></div><figcaption class="cap"><b>${esc(T.f0Title)}.</b> ${esc(T.f0Caption)}</figcaption></figure>
</section>
${fields}
${chapterFoot(L, ch)}`;
  return shell({
    L, LANGS, ch,
    title: L.meta.chapterTitle(ch.title),
    description: R.standfirst || R.intro[0],
    body,
    data: { research: { overview: R.overview_points, fields: R.fields.map((f) => ({ id: f.id, title: f.title })), typeTest: R.type_test }, figureData: figData },
    extraScripts: `\n<script src="${ASSETS}research.js?v=${ctx.BUILD}" defer></script>`,
    bodyClass: 'ch-research',
  });
}
