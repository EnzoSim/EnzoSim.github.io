/* Page behaviour shared by every chapter of the guide: reading progress, the chapter
   menu on narrow screens, chapters already opened, the chapter checklists, the rule
   filter on the works shelf, and the annotated dashboards. The figures live in guide.js. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var lang = doc.lang === 'fr' ? 'fr' : 'en';
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('ddg:' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('ddg:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  // Reading progress: the share of the main column scrolled past.
  var bar = document.querySelector('.progress i');
  if (bar) {
    var tick = false;
    var update = function () {
      tick = false;
      var h = doc.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, Math.max(0, (scrollY / h) * 100)) : 100) + '%';
    };
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // Chapters already opened are shaded in the rail.
  var here = document.body.getAttribute('data-chapter');
  var seen = store.get('seen') || [];
  if (here && seen.indexOf(here) < 0) { seen.push(here); store.set('seen', seen); }
  document.querySelectorAll('.chrail a.rc').forEach(function (a) {
    if (seen.indexOf(a.getAttribute('data-n')) >= 0 && a.getAttribute('aria-current') !== 'page') a.classList.add('seen');
  });

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

  // Chapter checklists, remembered per chapter in this browser only.
  document.querySelectorAll('.check').forEach(function (box) {
    var key = 'check:' + box.getAttribute('data-key');
    var saved = store.get(key) || {};
    var inputs = box.querySelectorAll('input[type=checkbox]');
    var count = box.querySelector('.count');
    var fmt = box.getAttribute('data-fmt') || '{k} of {n} checked';
    var refresh = function () {
      var k = 0;
      inputs.forEach(function (i) { if (i.checked) k++; });
      if (count) count.textContent = fmt.replace('{k}', k).replace('{n}', inputs.length);
    };
    inputs.forEach(function (i) {
      i.checked = !!saved[i.name];
      i.addEventListener('change', function () { saved[i.name] = i.checked; store.set(key, saved); refresh(); });
    });
    refresh();
  });

  // Works to open: filter the three shelves by rule.
  var filter = document.querySelector('.filter[data-for]');
  if (filter) {
    var works = document.querySelectorAll('.work[data-rules]');
    var shown = filter.querySelector('.shown');
    var fmtShown = filter.getAttribute('data-fmt') || '{n} works';
    filter.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var r = chip.getAttribute('data-rule');
      filter.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var n = 0;
      works.forEach(function (w) {
        var on = r === 'all' || (' ' + w.getAttribute('data-rules') + ' ').indexOf(' ' + r + ' ') >= 0;
        w.hidden = !on; if (on) n++;
      });
      document.querySelectorAll('.shelf').forEach(function (s) {
        s.hidden = !s.querySelector('.work:not([hidden])');
      });
      if (shown) shown.textContent = fmtShown.replace('{n}', n);
    });
  }

  // Annotated dashboards: a pin and its note light up together.
  document.querySelectorAll('.case').forEach(function (c) {
    var pins = c.querySelectorAll('[data-pin]');
    var set = function (n) {
      pins.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pin') === n); });
    };
    c.addEventListener('mouseover', function (e) { var p = e.target.closest('[data-pin]'); if (p) set(p.getAttribute('data-pin')); });
    c.addEventListener('focusin', function (e) { var p = e.target.closest('[data-pin]'); if (p) set(p.getAttribute('data-pin')); });
    c.addEventListener('mouseleave', function () { set(null); });
  });

  // Motion, once: blocks rise into place the first time they are seen, and the cover's counts count up.
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still && 'IntersectionObserver' in window) {
    doc.classList.add('js-motion');
    var blocks = document.querySelectorAll('main .sec, main .rule, main .fig, main .spread, main .pcard, main .case, main .rfield, main .opener, main .hero');
    var seenIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        seenIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (b) { b.classList.add('reveal'); seenIO.observe(b); });
    var counts = document.querySelectorAll('.stat b');
    var countIO = new IntersectionObserver(function (entries) {
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
    counts.forEach(function (c) { countIO.observe(c); });
  }

  // Old single-page anchors keep working: /#r7 goes to the chapter that now holds rule 7.
  var map = window.GUIDE_ANCHORS;
  if (map && location.hash) {
    var to = map[location.hash.slice(1)];
    if (to) location.replace(to);
  }
  void lang;
})();
