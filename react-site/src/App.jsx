import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LanguageProvider, useLanguage } from '@/lib/i18n'
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

function LangButton() {
  const { lang, setLang, t } = useLanguage()
  const next = lang === 'en' ? 'fr' : 'en'

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={t.a11y.langSwitch}
      onClick={() => setLang(next)}
    >
      <span className="text-xs font-semibold uppercase">{next}</span>
    </Button>
  )
}

function SiteNav({ projectPage = false }) {
  const { t } = useLanguage()
  const cafes = useCafes()
  const items = (projectPage ? t.nav.projectItems : t.nav.items).filter(
    ([, href]) => href !== '#cafes' || cafes.length > 0,
  )

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <a className="skip-link" href="#main">
        {t.a11y.skipToContent}
      </a>
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a className="nav-brand" href="/">
          Enzo Simier
        </a>
        <div className="desktop-nav">
          {items.map(([label, href]) => (
            <a className="nav-link" href={href} key={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <a className="nav-email" href={`mailto:${contactEmail}`}>
            {t.nav.email}
          </a>
          <LangButton />
        </div>
      </nav>
      <nav className="mobile-nav-row" aria-label={projectPage ? t.a11y.projectSections : t.a11y.pageSections}>
        {items.map(([label, href]) => (
          <a className="nav-link" href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
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
  const { t } = useLanguage()

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

function HomeHero() {
  const { t } = useLanguage()

  return (
    <section className="hero-shell" id="about">
      <div className="hero-copy">
        <p className="hero-kicker">{t.hero.kicker}</p>
        <h1>{t.hero.name}</h1>
        <p>{t.hero.lede}</p>
        <div className="hero-actions">
          <Button asChild size="lg">
            <a href={cvUrl} target="_blank" rel="noreferrer">
              {t.hero.cvLabel}
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </a>
          </Button>
          <a className="text-link" href={linkedinUrl} target="_blank" rel="noreferrer">
            {t.hero.linkedinLabel}
          </a>
          <a className="text-link" href={`mailto:${contactEmail}`}>
            {t.hero.emailLabel}
          </a>
        </div>
      </div>
      <div className="portrait-frame">
        <img
          alt={t.a11y.portraitAlt}
          decoding="async"
          fetchPriority="high"
          height={profileImage.height}
          src={profileImage.src}
          width={profileImage.width}
        />
      </div>
    </section>
  )
}

function AboutSection() {
  const { t } = useLanguage()

  return (
    <section className="content-section">
      <div className="two-column">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title}>
          {t.about.lead}
        </SectionHeading>
        <div className="copy-stack">
          {t.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const { t } = useLanguage()

  return (
    <section className="content-section" id="experience">
      <SectionHeading eyebrow={t.work.eyebrow} title={t.work.title} />
      <div className="entry-list">
        {t.work.items.map((item) => (
          <article className="entry" key={`${item.company}-${item.date}`}>
            <div className="entry-head">
              <h3>{item.company}</h3>
              <span className="entry-date">{item.date}</span>
            </div>
            <p className="entry-role">{item.role}</p>
            <ul className="entry-details">
              {item.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function EducationSection() {
  const { t } = useLanguage()

  return (
    <section className="content-section" id="education">
      <SectionHeading eyebrow={t.education.eyebrow} title={t.education.title} />
      <div className="entry-list">
        {t.education.items.map((item) => (
          <article className="entry" key={item.meta}>
            <div className="entry-head">
              <h3>{item.meta}</h3>
            </div>
            <p className="entry-note">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ResearchSection() {
  const { t } = useLanguage()

  return (
    <section className="content-section" id="research">
      <SectionHeading eyebrow={t.research.eyebrow} title={t.research.title}>
        {t.research.description}
      </SectionHeading>
      <div className="research-meta">
        <span>{t.research.lens}</span>
        <span>{t.research.supervisors}</span>
      </div>
    </section>
  )
}

function FdaProjectFeature() {
  const { t } = useLanguage()

  return (
    <section className="content-section" id="projects">
      <SectionHeading eyebrow={t.fda.eyebrow} title={t.fda.title}>
        {t.fda.lede}
      </SectionHeading>
      <MetricLine />
      <div className="hero-actions">
        <a className="text-link" href={fdaLiveUrl} target="_blank" rel="noreferrer">
          {t.fda.liveCta}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <a className="text-link" href="/fda-catalyst.html">
          {t.fda.caseCta}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

function LibrarySection() {
  const { t } = useLanguage()

  return (
    <section className="content-section library-section" id="reading">
      <SectionHeading eyebrow={t.library.eyebrow} title={t.library.title}>
        {t.library.lede}
      </SectionHeading>

      <div className="library-index">
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

        <div className="library-rail">
          <article className="wiki-note">
            <p className="group-label">{t.library.wiki.title}</p>
            <h3>
              <a href={wikiLiveUrl} rel="noreferrer" target="_blank">
                {t.library.wiki.name}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </h3>
            <p className="wiki-stack" translate="no">
              {t.library.wiki.stack}
            </p>
            <p className="wiki-note-copy">{t.library.wiki.note}</p>
            <div className="hero-actions mt-4">
              <a className="text-link" href={wikiLiveUrl} target="_blank" rel="noreferrer">
                {t.library.wiki.liveCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
              <a className="text-link" href={wikiRepoUrl} target="_blank" rel="noreferrer">
                {t.library.wiki.sourceCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </article>

          <div className="subscription-index">
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
      </div>
    </section>
  )
}

function CafesSection() {
  const { lang, t } = useLanguage()
  const cafes = useCafes()
  if (!cafes.length) return null

  return (
    <section className="content-section" id="cafes">
      <SectionHeading eyebrow={t.cafes.eyebrow} title={t.cafes.title}>
        {t.cafes.lede}
      </SectionHeading>
      <div className="entry-list">
        {cafes.map((item) => {
          const note = lang === 'fr' ? item.noteFr || item.note : item.note
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
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <span>{t.footer.location}</span>
      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      <a href={linkedinUrl} rel="noreferrer" target="_blank">
        {t.footer.linkedinLabel}
      </a>
    </footer>
  )
}

function HomePage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <HomeHero />
        <AboutSection />
        <ExperienceSection />
        <EducationSection />
        <ResearchSection />
        <FdaProjectFeature />
        <LibrarySection />
        <CafesSection />
      </main>
      <SiteFooter />
    </>
  )
}

function CatalystTable() {
  const { t } = useLanguage()

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
  const { t } = useLanguage()

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
  const { t } = useLanguage()

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
  const { t } = useLanguage()

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
  const { lang, t } = useLanguage()
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const isProjectPage = useMemo(() => pathname.includes('fda-catalyst'), [pathname])

  useEffect(() => {
    const meta = isProjectPage ? t.meta.project : t.meta.home
    document.title = meta.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', meta.description)
  }, [isProjectPage, lang, t])

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
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
