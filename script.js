(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
  const revealItems = document.querySelectorAll(".reveal");
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function systemTheme() {
    return colorSchemeQuery.matches ? "dark" : "light";
  }

  function setThemeColorMeta(theme) {
    const themeMetas = document.querySelectorAll("meta[name='theme-color']");
    const color = theme === "dark" ? "#12161a" : "#f4efe7";
    themeMetas.forEach((meta) => meta.setAttribute("content", color));
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    setThemeColorMeta(theme);
  }

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    setThemeColorMeta(systemTheme());
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || systemTheme();
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
    });
  }

  colorSchemeQuery.addEventListener("change", (event) => {
    if (!localStorage.getItem("theme")) {
      setThemeColorMeta(event.matches ? "dark" : "light");
    }
  });

  function setMenuState(isOpen) {
    body.classList.toggle("nav-open", isOpen);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      setMenuState(!body.classList.contains("nav-open"));
    });

    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) {
        return;
      }

      const target = event.target;
      if (
        target instanceof Node &&
        !mobileMenu.contains(target) &&
        !menuToggle.contains(target)
      ) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) {
        setMenuState(false);
      }
    });
  }

  function scrollToTarget(target) {
    const headerOffset = header ? header.offsetHeight + 20 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({
      top,
      behavior: reducedMotionQuery.matches ? "auto" : "smooth",
    });
  }

  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      scrollToTarget(target);
      history.replaceState(null, "", href);
      setMenuState(false);
    });
  });

  const observedSections = navLinks
    .map((link) => {
      const selector = link.getAttribute("href");
      return selector ? document.querySelector(selector) : null;
    })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (observedSections.length) {
    function updateActiveSection() {
      const offset = (header ? header.offsetHeight : 0) + window.innerHeight * 0.35;
      let currentSection = observedSections[0];

      observedSections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - offset) {
          currentSection = section;
        }
      });

      if (currentSection && currentSection.id) {
        setActiveLink(currentSection.id);
      }
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
  }

  function updateProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    const normalizedProgress = window.scrollY < 4 ? 0 : progress;
    root.style.setProperty("--scroll-progress", normalizedProgress.toFixed(2) + "%");
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  if (reducedMotionQuery.matches) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (reducedMotionQuery.matches) {
    body.classList.add("is-ready");
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.add("is-ready");
      });
    });
  }
})();
