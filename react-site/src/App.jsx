import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Circle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { en as t } from '@/content/en'
import {
  bookLinks,
  contactEmail,
  cvUrl,
  fdaLiveUrl,
  fdaMetricValues,
  linkedinUrl,
  profileImage,
  wikiLiveUrl,
  wikiRepoUrl,
} from '@/content/shared'

// Cafés load at runtime from /cafes.json (repo root, updated by the
// add-cafe GitHub Action) so new entries go live without a rebuild.
let cafesCache = null
let cafesPromise = null

function useCafes() {
  const [items, setItems] = useState(cafesCache ?? [])

  useEffect(() => {
    if (cafesCache) return undefined
    cafesPromise ??= fetch('/cafes.json')
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .catch(() => ({ items: [] }))
    let alive = true
    cafesPromise.then((data) => {
      cafesCache = Array.isArray(data.items) ? data.items : []
      if (alive) setItems(cafesCache)
    })
    return () => {
      alive = false
    }
  }, [])

  return items
}

function useActiveSection(items) {
  const sectionItems = useMemo(
    () => items.filter(([, href]) => href.startsWith('#')),
    [items],
  )
  const [activeHref, setActiveHref] = useState(sectionItems[0]?.[1] ?? '')

  useEffect(() => {
    const targets = sectionItems
      .map(([, href]) => document.getElementById(href.slice(1)))
      .filter(Boolean)

    if (!targets.length) return undefined

    let frameId = null

    const updateActiveSection = () => {
      frameId = null
      const marker = Math.min(window.innerHeight * 0.24, 240)
      let activeTarget = targets[0]

      for (const target of targets) {
        if (target.getBoundingClientRect().top <= marker) activeTarget = target
        else break
      }

      setActiveHref(`#${activeTarget.id}`)
    }

    const scheduleUpdate = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateActiveSection)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [sectionItems])

  return activeHref
}

function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      {t.a11y.skipToContent}
    </a>
  )
}

function SiteNav({ projectPage = false }) {
  const cafes = useCafes()
  const items = useMemo(
    () => (projectPage ? t.nav.projectItems : t.nav.items).filter(
      ([, href]) => href !== '#cafes' || cafes.length > 0,
    ),
    [cafes.length, projectPage],
  )
  const activeHref = useActiveSection(items)
  const mobileNavRef = useRef(null)

  useEffect(() => {
    const rail = mobileNavRef.current
    const activeLink = [...(rail?.querySelectorAll('a') ?? [])]
      .find((link) => link.getAttribute('href') === activeHref)

    if (!rail || !activeLink) return

    const left = activeLink.offsetLeft - ((rail.clientWidth - activeLink.offsetWidth) / 2)
    rail.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [activeHref])

  return (
    <header className="site-header">
      <div className="site-nav-primary">
        <a className="nav-brand" href="/">
          Enzo Simier
        </a>
        <nav
          className="desktop-nav"
          aria-label={projectPage ? t.a11y.projectSections : t.a11y.pageSections}
        >
          {items.map(([label, href]) => (
            <a
              aria-current={activeHref === href ? 'location' : undefined}
              className="liquid-pill nav-link"
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>
        <nav
          className="mobile-nav-row"
          aria-label={projectPage ? t.a11y.projectSections : t.a11y.pageSections}
          ref={mobileNavRef}
        >
          {items.map(([label, href]) => (
            <a
              aria-current={activeHref === href ? 'location' : undefined}
              className="liquid-pill nav-link"
              href={href}
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

function MetricLine() {
  return (
    <p className="metric-line">
      {fdaMetricValues.map((value, index) => (
        <span key={t.fda.metricLabels[index]}>
          <strong>{value}</strong> {t.fda.metricLabels[index]}
        </span>
      ))}
    </p>
  )
}

function IntroSection() {
  return (
    <section className="home-intro" id="about" aria-labelledby="about-title">
      <span className="hash-alias" id="personal" aria-hidden="true" />
      <div className="intro-portrait-frame">
        <img
          alt={t.a11y.portraitAlt}
          decoding="async"
          fetchPriority="high"
          height={profileImage.height}
          src={profileImage.src}
          width={profileImage.width}
        />
        <div className="intro-portrait-caption">
          <Circle aria-hidden="true" fill="currentColor" strokeWidth={0} />
          <span>Economist · Montréal</span>
        </div>
      </div>

      <div className="intro-copy">
        <p className="intro-eyebrow">
          <span aria-hidden="true">01 / </span>
          {t.about.eyebrow}
        </p>
        <h1 id="about-title">{t.about.title}</h1>
        <p className="intro-body">{t.about.body}</p>
        <div className="intro-actions">
          <Button asChild>
            <a href={cvUrl} target="_blank" rel="noreferrer">
              {t.hero.cvLabel}
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              {t.hero.linkedinLabel}
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={`mailto:${contactEmail}`}>{t.hero.emailLabel}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

function NowSection() {
  return (
    <section className="content-section" id="now">
      <SectionHeading eyebrow={t.now.eyebrow} title={t.now.title}>
        {t.now.body}
      </SectionHeading>
    </section>
  )
}

function SelectedPathSection() {
  return (
    <section className="content-section" id="path">
      <span className="hash-alias" id="experience" aria-hidden="true" />
      <SectionHeading eyebrow={t.work.eyebrow} title={t.work.title} />
      <div className="path-list">
        {t.work.items.slice(0, 3).map((item, index) => (
          <article className="path-item" key={`${item.company}-${item.date}`}>
            <span className="path-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="path-copy">
              <div className="path-head">
                <h3>{item.company}</h3>
                <span className="entry-date">{item.date}</span>
              </div>
              <p className="entry-role">{item.role}</p>
              <p className="path-summary">{item.details.join(' ')}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="path-earlier">{t.work.earlier}</p>
      <div className="path-education" id="education">
        <p className="group-label">{t.education.eyebrow}</p>
        <div className="path-education-list">
          {t.education.items.map((item) => (
            <article className="path-education-item" key={item.meta}>
              <h3>{item.meta}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResearchSection() {
  return (
    <section className="content-section" id="research">
      <SectionHeading eyebrow={t.research.eyebrow} title={t.research.title}>
        {t.research.description}
      </SectionHeading>
      <div className="research-meta">
        <span className="research-context">{t.research.partners}</span>
        <span className="research-tags">
          {t.research.lens.replace(/\.$/, '').split(', ').map((tag) => (
            <span className="liquid-tag" key={tag}>{tag}</span>
          ))}
        </span>
        <span className="research-context">{t.research.supervisors}</span>
      </div>
    </section>
  )
}

function BuiltSection() {
  return (
    <section className="content-section" id="built">
      <span className="hash-alias" id="projects" aria-hidden="true" />
      <SectionHeading eyebrow={t.built.eyebrow} title={t.built.title}>
        {t.built.lede}
      </SectionHeading>

      <div className="built-ledger">
        <article className="built-entry">
          <div className="built-heading">
            <span className="built-index" aria-hidden="true">01</span>
            <div>
              <h3>{t.fda.title}</h3>
              <p className="built-stack" translate="no">
                {t.fda.stack.split(' · ').map((tag) => (
                  <span className="liquid-tag" key={tag}>{tag}</span>
                ))}
              </p>
            </div>
          </div>
          <p className="built-copy">{t.fda.lede}</p>
          <MetricLine />
          <div className="hero-actions">
            <Button asChild className="project-action-pill" size="sm" variant="ghost">
              <a href={fdaLiveUrl} target="_blank" rel="noreferrer">
                {t.fda.liveCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild className="project-action-pill" size="sm" variant="ghost">
              <a href="/fda-catalyst.html">
                {t.fda.caseCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </article>

        <article className="built-entry">
          <div className="built-heading">
            <span className="built-index" aria-hidden="true">02</span>
            <div>
              <h3>{t.built.wiki.name}</h3>
              <p className="built-stack" translate="no">
                {t.built.wiki.stack.split(' · ').map((tag) => (
                  <span className="liquid-tag" key={tag}>{tag}</span>
                ))}
              </p>
            </div>
          </div>
          <p className="built-copy">{t.built.wiki.note}</p>
          <div className="hero-actions">
            <Button asChild className="project-action-pill" size="sm" variant="ghost">
              <a href={wikiLiveUrl} target="_blank" rel="noreferrer">
                {t.built.wiki.liveCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild className="project-action-pill" size="sm" variant="ghost">
              <a href={wikiRepoUrl} target="_blank" rel="noreferrer">
                {t.built.wiki.sourceCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </article>
      </div>
    </section>
  )
}

function LibrarySection() {
  return (
    <section className="content-section library-section" id="reading">
      <SectionHeading eyebrow={t.library.eyebrow} title={t.library.title}>
        {t.library.lede}
      </SectionHeading>

      <div className="reading-layout">
        <div className="book-index-column">
          <div className="library-column-head">
            <h3 className="group-label">{t.library.booksTitle}</h3>
            <span className="library-count">{String(t.library.books.length).padStart(2, '0')}</span>
          </div>

          <ol className="book-index">
            {t.library.books.map((book, index) => (
              <li className="book-index-item" key={book.title}>
                <a
                  className="book-index-link"
                  href={bookLinks[index]}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="book-index-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="book-index-copy">
                    <span className="book-index-title">
                      {book.title}
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                    <span className="book-index-note">{book.note}</span>
                  </span>
                  <span className="book-index-meta">{book.author}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="periodical-grid">
          {t.library.subscriptions.groups.map((group) => (
            <section className="subscription-group" key={group.label}>
              <h3 className="group-label">{group.label}</h3>
              <ul className="subscription-list">
                {group.items.map((item) => (
                  <li className="subscription-item" key={item.name}>
                    <a
                      className="subscription-link"
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="subscription-name">
                        {item.name}
                        <ArrowUpRight aria-hidden="true" />
                      </span>
                      <span className="subscription-note">{item.note}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

function CafesSection() {
  const cafes = useCafes()
  if (!cafes.length) return null

  return (
    <section className="content-section" id="cafes">
      <SectionHeading eyebrow={t.cafes.eyebrow} title={t.cafes.title}>
        {t.cafes.lede}
      </SectionHeading>
      <div className="entry-list">
        {cafes.map((item) => {
          const note = item.note
          return (
            <article className="entry" key={item.name}>
              <div className="entry-head">
                <h3>
                  {item.url ? (
                    <a href={item.url} rel="noreferrer" target="_blank">
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </h3>
                <span className="entry-date">{item.area}</span>
              </div>
              {note ? <p className="entry-note">{note}</p> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{t.footer.note}</span>
    </footer>
  )
}

function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteNav />
      <main className="home-main" id="main">
        <IntroSection />
        <div className="portfolio-content">
          <NowSection />
          <SelectedPathSection />
          <ResearchSection />
          <BuiltSection />
          <LibrarySection />
          <CafesSection />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function CatalystTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {t.project.table.headers.map((header, index) => (
            <TableHead className={index === 3 ? 'text-right' : undefined} key={header}>
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {t.project.table.rows.map((row) => (
          <TableRow key={row.ticker}>
            <TableCell className="font-mono text-xs font-medium">{row.ticker}</TableCell>
            <TableCell>{row.event}</TableCell>
            <TableCell>{row.window}</TableCell>
            <TableCell className="text-right">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ProjectHero() {
  return (
    <section className="project-page-hero" id="overview">
      <div className="project-page-copy">
        <p className="hero-kicker">{t.project.kicker}</p>
        <h1>{t.project.title}</h1>
        <p>{t.project.lede}</p>
        <div className="hero-actions">
          <Button asChild size="lg">
            <a href={fdaLiveUrl} target="_blank" rel="noreferrer">
              {t.project.openCta}
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
      <div className="project-snapshot">
        <p className="section-eyebrow">{t.project.snapshot.title}</p>
        <p className="snapshot-note">{t.project.snapshot.description}</p>
        <CatalystTable />
      </div>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section className="content-section" id="architecture">
      <SectionHeading eyebrow={t.project.architecture.eyebrow} title={t.project.architecture.title}>
        {t.project.architecture.lede}
      </SectionHeading>
      <dl className="definition-list">
        {t.project.architecture.cards.map(([term, text]) => (
          <div className="definition-row" key={term}>
            <dt>{term}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function DeploymentSection() {
  return (
    <section className="content-section" id="deployment">
      <div className="two-column">
        <SectionHeading eyebrow={t.project.deployment.eyebrow} title={t.project.deployment.title}>
          {t.project.deployment.lede}
        </SectionHeading>
        <div className="status-list">
          {t.project.deployment.lines.map(([label, value], index) => (
            <div className="status-line" key={label}>
              <span>{label}</span>
              {index === 0 ? (
                <a href={fdaLiveUrl} rel="noreferrer" target="_blank">
                  {value}
                </a>
              ) : (
                <strong>{value}</strong>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="check-block">
        <h3>{t.project.deployment.check.title}</h3>
        <p>{t.project.deployment.check.description}</p>
      </div>
    </section>
  )
}

function FdaCatalystPage() {
  return (
    <>
      <SkipLink />
      <SiteNav projectPage />
      <main id="main">
        <ProjectHero />
        <ArchitectureSection />
        <DeploymentSection />
      </main>
      <SiteFooter />
    </>
  )
}

function AppContent() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const isProjectPage = useMemo(() => pathname.includes('fda-catalyst'), [pathname])

  useEffect(() => {
    const meta = isProjectPage ? t.meta.project : t.meta.home
    document.title = meta.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', meta.description)
  }, [isProjectPage])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return

    const id = window.location.hash.slice(1)
    const target = document.getElementById(id)

    if (target) {
      window.requestAnimationFrame(() => target.scrollIntoView())
    }
  }, [isProjectPage])

  return isProjectPage ? <FdaCatalystPage /> : <HomePage />
}

function App() {
  return <AppContent />
}

export default App
