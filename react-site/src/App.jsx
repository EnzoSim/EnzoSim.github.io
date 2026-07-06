import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Moon, Sun } from 'lucide-react'

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
} from '@/content/shared'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme]
}

function ThemeButton() {
  const { t } = useLanguage()
  const [theme, setTheme] = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={isDark ? t.a11y.themeToLight : t.a11y.themeToDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
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
  const items = projectPage ? t.nav.projectItems : t.nav.items

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
          <ThemeButton />
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
              <ArrowUpRight data-icon="inline-end" />
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
    <section className="content-section" id="reading">
      <SectionHeading eyebrow={t.library.eyebrow} title={t.library.title}>
        {t.library.lede}
      </SectionHeading>
      <div className="entry-list">
        {t.library.books.map((book, index) => (
          <article className="entry" key={book.title}>
            <div className="entry-head">
              <h3>
                <a href={bookLinks[index]} rel="noreferrer" target="_blank">
                  {book.title}
                </a>
              </h3>
              <span className="entry-date">{book.author}</span>
            </div>
            <p className="entry-note">{book.note}</p>
          </article>
        ))}
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
              <ArrowUpRight data-icon="inline-end" />
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
