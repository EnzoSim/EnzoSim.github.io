/* ============================================
   Enzo Simier — Bento Grid Interactions
   Vanilla JS · ~50 lines
   ============================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Scroll-Reveal ---------- */
  const cards = document.querySelectorAll('.bento-card');

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((card) => revealObserver.observe(card));
  } else {
    cards.forEach((card) => card.classList.add('visible'));
  }

  /* ---------- 2. Nav Active Section ---------- */
  const navLinks = document.querySelectorAll('.pill-nav a[href^="#"]');
  const sections = Array.from(navLinks).map((link) =>
    document.querySelector(link.getAttribute('href'))
  ).filter(Boolean);

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px' }
  );
  sections.forEach((section) => activeObserver.observe(section));

  /* ---------- 3. Smooth Scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- 4. Theme Toggle ---------- */
  const themeToggle = document.querySelector('.theme-toggle');

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update meta theme-color for mobile browsers
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0c0c0e' : '#f5f5f7';
    metaThemeColors.forEach((meta) => meta.setAttribute('content', color));
  }

  // On load: use stored preference or follow system
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    applyTheme(storedTheme);
  }
  // If no stored theme, let CSS @media handle it (no data-theme attribute)

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Determine current effective theme
      const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // Listen for system theme changes (only matters when no stored preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      // No manual override — CSS handles it, but update meta tag
      const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
      const color = e.matches ? '#0c0c0e' : '#f5f5f7';
      metaThemeColors.forEach((meta) => meta.setAttribute('content', color));
    }
  });

  /* ---------- 5. Auto-Hide Pill Nav ---------- */
  const nav = document.querySelector('.pill-nav');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 200) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
})();
