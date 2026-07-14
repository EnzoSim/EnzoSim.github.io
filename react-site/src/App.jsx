import { useEffect, useRef } from 'react'
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
import { fdaLiveUrl, profileImage } from '@/content/shared'

const externalProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}

function currentRoute(pathname) {
  if (pathname.includes('fda-catalyst')) return '/work/'
  if (pathname.startsWith('/work')) return '/work/'
  if (pathname.startsWith('/reading')) return '/reading/'
  return '/'
}

function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      {t.a11y.skipToContent}
    </a>
  )
}

function SiteNav() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const activeRoute = currentRoute(pathname)

  return (
    <header className="site-header">
      <div className="site-nav-shell">
        <a className="nav-brand" href="/" aria-label="Enzo Simier, home">
          <span className="brand-mark" aria-hidden="true">ES</span>
          <span>Enzo Simier</span>
        </a>
        <nav className="primary-nav" aria-label={t.a11y.primaryNavigation}>
          {t.nav.items.map((item) => (
            <a
              aria-current={activeRoute === item.href ? 'page' : undefined}
              className="liquid-pill nav-link"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{t.footer.note}</span>
      <span aria-hidden="true">Montréal</span>
    </footer>
  )
}

function Shell({ children, className = '' }) {
  return (
    <>
      <SkipLink />
      <SiteNav />
      <main className={className} id="main">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}

function ExternalArrow() {
  return <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
}

function HomePage() {
  return (
    <Shell className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <figure className="portrait-column">
          <div className="portrait-lens">
            <img
              alt={t.a11y.portraitAlt}
              decoding="async"
              fetchPriority="high"
              height={profileImage.height}
              src={profileImage.src}
              width={profileImage.width}
            />
          </div>
          <figcaption className="portrait-caption">
            <Circle aria-hidden="true" fill="currentColor" strokeWidth={0} />
            <span>{t.home.portraitCaption}</span>
          </figcaption>
        </figure>

        <div className="home-copy">
          <p className="page-kicker">Applied economics · Montréal</p>
          <h1 id="home-title">{t.home.title}</h1>
          <p className="home-introduction">{t.home.introduction}</p>
          <p className="home-about">{t.home.about}</p>

          <div className="now-line">
            <span>{t.home.now.label}</span>
            <p>{t.home.now.text}</p>
          </div>

          <div className="contact-row" aria-label="Contact links">
            {t.home.contacts.map((contact, index) => (
              <Button
                asChild
                key={contact.label}
                variant={index === 0 ? 'default' : 'ghost'}
              >
                <a
                  href={contact.href}
                  {...(contact.external || contact.label === 'CV' ? externalProps : {})}
                >
                  {contact.label}
                  {contact.label !== 'Email' ? <ExternalArrow /> : null}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  )
}

function RouteHeading({ label, title, lede }) {
  return (
    <header className="route-heading">
      <p className="page-kicker">{label}</p>
      <h1>{title}</h1>
      <p>{lede}</p>
    </header>
  )
}

function ProjectActions({ project }) {
  if (!project.href) return null

  return (
    <div className="project-actions">
      <Button asChild size="sm" variant="ghost">
        <a
          href={project.href}
          {...(project.href.startsWith('http') ? externalProps : {})}
        >
          {project.cta}
          <ExternalArrow />
        </a>
      </Button>
      {project.slug === 'fda-catalyst' ? (
        <Button asChild size="sm" variant="ghost">
          <a href={fdaLiveUrl} {...externalProps}>
            Live calendar
            <ExternalArrow />
          </a>
        </Button>
      ) : null}
      {project.sourceHref ? (
        <Button asChild size="sm" variant="ghost">
          <a href={project.sourceHref} {...externalProps}>
            {project.sourceCta}
            <ExternalArrow />
          </a>
        </Button>
      ) : null}
    </div>
  )
}

function WorkObject({ project }) {
  return (
    <article
      className={`work-object work-object-${project.presentation}`}
      id={project.slug}
    >
      <div className="work-object-label">
        <span>{project.kind}</span>
        <span>{project.context}</span>
      </div>
      <div className="work-object-copy">
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>
      <div className="work-object-foot">
        <p>{project.detail}</p>
        <ProjectActions project={project} />
      </div>
    </article>
  )
}

function WorkPage() {
  return (
    <Shell className="route-page work-page">
      <RouteHeading label="Selected practice" title={t.work.title} lede={t.work.lede} />

      <section className="work-grid" aria-label="Featured research and projects">
        {t.work.featured.map((project) => (
          <WorkObject key={project.slug} project={project} />
        ))}
      </section>

      <section className="experience-section" aria-labelledby="experience-title">
        <div className="section-title-row">
          <h2 id="experience-title">{t.work.experience.title}</h2>
          <span>2024 to 2026</span>
        </div>
        <ol className="experience-list">
          {t.work.experience.items.map((item) => (
            <li key={`${item.company}-${item.date}`}>
              <div className="experience-role">
                <strong>{item.company}</strong>
                <span>{item.role}</span>
              </div>
              <p>{item.summary}</p>
              <time>{item.date}</time>
            </li>
          ))}
        </ol>
      </section>
    </Shell>
  )
}

function resetBookTilt(target) {
  target.style.setProperty('--tilt-x', '0deg')
  target.style.setProperty('--tilt-y', '0deg')
  target.style.setProperty('--glint-x', '50%')
}

function handleBookPointerMove(event) {
  if (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
  event.currentTarget.style.setProperty('--tilt-x', `${((0.5 - y) * 4).toFixed(2)}deg`)
  event.currentTarget.style.setProperty('--tilt-y', `${((x - 0.5) * 6).toFixed(2)}deg`)
  event.currentTarget.style.setProperty('--glint-x', `${(x * 100).toFixed(1)}%`)
}

function Book({ book }) {
  const linkRef = useRef(null)
  const ratio = book.cover.width / book.cover.height
  const width = Math.round(book.presentation.height * ratio)
  const tabletHeight = Math.round(book.presentation.height * 0.82)
  const tabletWidth = Math.round(tabletHeight * ratio)
  const mobileHeight = Math.min(238, book.presentation.height)
  const mobileWidth = Math.round(mobileHeight * ratio)
  const style = {
    '--book-height': `${book.presentation.height}px`,
    '--book-width': `${width}px`,
    '--book-tablet-height': `${tabletHeight}px`,
    '--book-tablet-width': `${tabletWidth}px`,
    '--book-mobile-height': `${mobileHeight}px`,
    '--book-mobile-width': `${mobileWidth}px`,
    '--book-depth': `${book.presentation.depth}px`,
    '--rest-angle': `${book.presentation.restAngle}deg`,
  }

  return (
    <li className="book-item" style={style}>
      <article className="book-card">
        <a
          aria-label={`Open ${book.title} by ${book.author}`}
          className="book-cover-link"
          href={book.href}
          onBlur={(event) => resetBookTilt(event.currentTarget)}
          onPointerLeave={(event) => resetBookTilt(event.currentTarget)}
          onPointerMove={handleBookPointerMove}
          ref={linkRef}
          {...externalProps}
        >
          <span className="book-volume" aria-hidden="true">
            <span className="book-face book-front">
              <img
                alt=""
                decoding="async"
                height={book.cover.height}
                loading="eager"
                src={book.cover.src}
                width={book.cover.width}
              />
              <span className="book-glint" />
            </span>
            <span className="book-face book-spine">
              <span>{book.title}</span>
            </span>
            <span className="book-face book-pages" />
            <span className="book-face book-top" />
            <span className="book-shadow" />
          </span>
        </a>

        <div className="book-caption">
          <a className="book-title-link" href={book.href} {...externalProps}>
            <strong>{book.title}</strong>
            <ExternalArrow />
          </a>
          <span className="book-meta">{book.author} · {book.year}</span>
          <p>{book.note}</p>
          <a className="cover-source" href={book.cover.sourceUrl} {...externalProps}>
            Cover source
          </a>
        </div>
      </article>
    </li>
  )
}

function Publications() {
  return (
    <section className="publications-section" aria-labelledby="publications-title">
      <div className="section-title-row">
        <h2 id="publications-title">{t.library.subscriptions.title}</h2>
        <span>Magazines + newsletters</span>
      </div>
      <div className="publication-grid">
        {t.library.subscriptions.groups.map((group) => (
          <section className="publication-group" key={group.label}>
            <h3>{group.label}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.name}>
                  <a href={item.url} {...externalProps}>
                    <span>{item.name}</span>
                    <ExternalArrow />
                  </a>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

function ReadingPage() {
  return (
    <Shell className="route-page reading-page">
      <RouteHeading label="A working shelf" title={t.library.title} lede={t.library.lede} />

      <section className="bookshelf-section" aria-label="Five books on Enzo Simier's shelf">
        <div className="bookshelf-viewport">
          <ol className="bookshelf-rail">
            {t.library.books.map((book) => <Book book={book} key={book.slug} />)}
          </ol>
          <div className="glass-shelf" aria-hidden="true">
            <span />
          </div>
        </div>
        <p className="shelf-hint">Swipe the shelf · Tap a cover to open</p>
      </section>

      <Publications />
    </Shell>
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

function ProjectSectionHeading({ label, title, children }) {
  return (
    <div className="project-section-heading">
      <p className="page-kicker">{label}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

function FdaCatalystPage() {
  return (
    <Shell className="project-page">
      <section className="project-page-hero" aria-labelledby="project-title">
        <div className="project-page-copy">
          <p className="page-kicker">{t.project.kicker}</p>
          <h1 id="project-title">{t.project.title}</h1>
          <p>{t.project.lede}</p>
          <div className="project-actions">
            <Button asChild size="lg">
              <a href={t.project.openHref} {...externalProps}>
                {t.project.openCta}
                <ExternalArrow />
              </a>
            </Button>
          </div>
        </div>
        <div className="project-snapshot">
          <p className="page-kicker">{t.project.snapshot.title}</p>
          <p className="snapshot-note">{t.project.snapshot.description}</p>
          <CatalystTable />
        </div>
      </section>

      <section className="project-content-section">
        <ProjectSectionHeading
          label={t.project.architecture.label}
          title={t.project.architecture.title}
        >
          {t.project.architecture.lede}
        </ProjectSectionHeading>
        <dl className="definition-list">
          {t.project.architecture.cards.map(([term, text]) => (
            <div className="definition-row" key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="project-content-section">
        <div className="two-column">
          <ProjectSectionHeading
            label={t.project.deployment.label}
            title={t.project.deployment.title}
          >
            {t.project.deployment.lede}
          </ProjectSectionHeading>
          <div className="status-list">
            {t.project.deployment.lines.map(([label, value], index) => (
              <div className="status-line" key={label}>
                <span>{label}</span>
                {index === 0 ? (
                  <a href={fdaLiveUrl} {...externalProps}>{value}</a>
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
    </Shell>
  )
}

function AppContent() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  let page = <HomePage />
  let meta = t.meta.home

  if (pathname.includes('fda-catalyst')) {
    page = <FdaCatalystPage />
    meta = t.meta.project
  } else if (pathname.startsWith('/work')) {
    page = <WorkPage />
    meta = t.meta.work
  } else if (pathname.startsWith('/reading')) {
    page = <ReadingPage />
    meta = t.meta.reading
  }

  useEffect(() => {
    document.title = meta.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', meta.description)

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1))
      if (target) window.requestAnimationFrame(() => target.scrollIntoView())
    }
  }, [meta])

  return page
}

export default function App() {
  return <AppContent />
}
