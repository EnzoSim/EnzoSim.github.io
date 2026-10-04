/* Page behaviour shared by every chapter of the guide: the chapters running on as one scroll,
   reading progress, the chapter menu on narrow screens, chapters already opened, the chapter
   checklists, the rule filter on the works shelf, and the annotated dashboards.
   The figures live in fig2/, guide.js and research.js. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var main = document.getElementById('main');
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('ddg:' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('ddg:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  var each = function (root, sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); };

  // The chapter menu on narrow screens.
  var btn = document.querySelector('.menu-btn');
  var sheet = document.getElementById('menu-sheet');
  if (btn && sheet) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      sheet.classList.toggle('open', open);
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  // Motion, once: blocks rise into place the first time they are seen, and the cover's counts count up.
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var moving = !still && 'IntersectionObserver' in window;
  var seenIO = null, countIO = null;
  if (moving) {
    doc.classList.add('js-motion');
    seenIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        seenIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        var el = e.target, to = parseInt(el.textContent, 10), t0 = null;
        if (!(to > 0)) return;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 900);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    });
  }

  // Everything a chapter block needs once it is on the page. Runs for the first chapter and for each one appended.
  function initChapter(root) {
    // Chapter checklists, remembered per chapter in this browser only.
    each(root, '.check', function (box) {
      var key = 'check:' + box.getAttribute('data-key');
      var saved = store.get(key) || {};
      var inputs = box.querySelectorAll('input[type=checkbox]');
      var count = box.querySelector('.count');
      var fmt = box.getAttribute('data-fmt') || '{k} of {n} checked';
      var refresh = function () {
        var k = 0;
        each(box, 'input[type=checkbox]', function (i) { if (i.checked) k++; });
        if (count) count.textContent = fmt.replace('{k}', k).replace('{n}', inputs.length);
      };
      each(box, 'input[type=checkbox]', function (i) {
        i.checked = !!saved[i.name];
        i.addEventListener('change', function () { saved[i.name] = i.checked; store.set(key, saved); refresh(); });
      });
      refresh();
    });

    // Works to open: filter the three shelves by rule.
    var filter = root.querySelector('.filter[data-for]');
    if (filter) {
      var shown = filter.querySelector('.shown');
      var fmtShown = filter.getAttribute('data-fmt') || '{n} works';
      filter.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        var r = chip.getAttribute('data-rule');
        each(filter, '.chip', function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var n = 0;
        each(root, '.work[data-rules]', function (w) {
          var on = r === 'all' || (' ' + w.getAttribute('data-rules') + ' ').indexOf(' ' + r + ' ') >= 0;
          w.hidden = !on; if (on) n++;
        });
        each(root, '.shelf', function (s) { s.hidden = !s.querySelector('.work:not([hidden])'); });
        if (shown) shown.textContent = fmtShown.replace('{n}', n);
      });
    }

    // Annotated dashboards: a pin and its note light up together.
    each(root, '.case', function (c) {
      var set = function (n) {
        each(c, '[data-pin]', function (p) { p.classList.toggle('on', p.getAttribute('data-pin') === n); });
      };
      c.addEventListener('mouseover', function (e) { var p = e.target.closest('[data-pin]'); if (p) set(p.getAttribute('data-pin')); });
      c.addEventListener('focusin', function (e) { var p = e.target.closest('[data-pin]'); if (p) set(p.getAttribute('data-pin')); });
      c.addEventListener('mouseleave', function () { set(null); });
    });

    if (moving) {
      each(root, '.sec, .rule, .fig, .spread, .pcard, .case, .rfield, .opener, .hero', function (b) { b.classList.add('reveal'); seenIO.observe(b); });
      each(root, '.stat b', function (c) { countIO.observe(c); });
    }
  }

  /* ---------- the chapters run on ----------
     Each page holds one chapter block (.chap) that names the next one. Near the end of the last block on the
     page, the next chapter's page is fetched and its block appended, with its data and figures. The address,
     the title, the chapter rail and the language switch follow the chapter being read, so a reload or a shared
     link opens that chapter. Without scripts, or if a fetch fails, the "next chapter" card still links on. */
  var seen = store.get('seen') || [];
  var current = null;
  var chaps = function () { return main ? main.querySelectorAll('.chap') : []; };
  var bar = document.querySelector('.progress i');

  function setCurrent(c, first) {
    if (c === current) return;
    current = c;
    var n = c.getAttribute('data-n'), url = c.getAttribute('data-url'), alt = c.getAttribute('data-alt');
    document.body.setAttribute('data-chapter', n);
    if (!first) {
      try { history.replaceState(history.state, '', url); } catch (e) { /* file: or sandboxed */ }
      document.title = c.getAttribute('data-title') || document.title;
    }
    if (n !== '0' && seen.indexOf(n) < 0) { seen.push(n); store.set('seen', seen); }
    each(document, '.chrail a.rc', function (a) {
      var on = a.getAttribute('data-n') === n;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      a.classList.toggle('seen', !on && seen.indexOf(a.getAttribute('data-n')) >= 0);
    });
    each(document, '.menu-sheet a', function (a) {
      if (a.getAttribute('href') === url) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    each(document, '.lang', function (g) {
      var links = g.querySelectorAll('a');
      if (links[0]) links[0].setAttribute('href', url);
      if (links[1] && alt) links[1].setAttribute('href', alt);
    });
  }

  // The chapter being read is the last one whose top has passed 40% of the window; progress is measured inside it.
  var tick = false;
  function onScroll() {
    tick = false;
    var list = chaps(), line = innerHeight * 0.4, at = list[0];
    for (var i = 0; i < list.length; i++) if (list[i].getBoundingClientRect().top <= line) at = list[i];
    if (!at) return;
    setCurrent(at, current === null);
    if (bar) {
      var r = at.getBoundingClientRect(), span = r.height - innerHeight;
      bar.style.width = (span > 0 ? Math.min(100, Math.max(0, (-r.top / span) * 100)) : 100) + '%';
    }
  }
  var queue = function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } };

  var loading = false, sentinel = null, nearEnd = null;
  function loadScript(src) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.body.appendChild(s);
    });
  }
  function mountFigures() {
    if (window.FIG && window.FIG.start) window.FIG.start();
    if (window.__guide && window.__guide.mount) window.__guide.mount();
    if (window.__research && window.__research.mount) window.__research.mount();
  }
  function appendNext() {
    var list = chaps(), last = list[list.length - 1];
    var url = last && last.getAttribute('data-next');
    if (loading || !url) return;
    loading = true;
    fetch(url, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then(function (html) {
        var next = new DOMParser().parseFromString(html, 'text/html').querySelector('.chap');
        if (!next) throw new Error('no chapter');
        next = document.importNode(next, true);
        var data = next.querySelector('.chap-data');
        if (data) {
          var links = (window.GUIDE_DATA || {}).links;
          window.GUIDE_DATA = Object.assign(window.GUIDE_DATA || {}, JSON.parse(data.textContent));
          if (links) window.GUIDE_DATA.links = links;
        }
        main.insertBefore(next, sentinel);
        last.classList.add('joined');
        initChapter(next);
        var scripts = (next.getAttribute('data-scripts') || '').split(' ').filter(Boolean);
        return Promise.all(scripts.map(loadScript)).then(mountFigures);
      })
      .then(function () {
        loading = false;
        queue();
        // Still near the end (a short chapter, or a tall window): look again.
        if (nearEnd) { nearEnd.unobserve(sentinel); nearEnd.observe(sentinel); }
      })
      .catch(function () {
        // Leave the "next chapter" card as the way on, and stop trying.
        if (nearEnd) nearEnd.disconnect();
      });
  }

  if (main) {
    each(main, '.chap', initChapter);
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    onScroll();
    if ('IntersectionObserver' in window && window.fetch && window.DOMParser && location.protocol !== 'file:') {
      sentinel = document.createElement('div');
      sentinel.className = 'chap-end';
      sentinel.setAttribute('aria-hidden', 'true');
      main.appendChild(sentinel);
      nearEnd = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) appendNext();
      }, { rootMargin: '0px 0px 1400px 0px' });
      nearEnd.observe(sentinel);
    }
  }

  // Old single-page anchors keep working: /#r7 goes to the chapter that now holds rule 7.
  var map = window.GUIDE_ANCHORS;
  if (map && location.hash) {
    var to = map[location.hash.slice(1)];
    if (to) location.replace(to);
  }
})();
