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
  if (pathname.includes('fda-catalyst')) return null
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

      <section className="home-projects" id="projects" aria-labelledby="projects-title">
        <div className="section-title-row heading-with-line">
          <h2 id="projects-title">{t.projects.title}</h2>
        </div>
        <div className="work-grid">
          {t.projects.items.map((project) => (
            <WorkObject key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </Shell>
  )
}

function RouteHeading({ title, lede }) {
  return (
    <header className="route-heading">
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
      aria-labelledby={`${project.slug}-title`}
      className={`work-object work-object-${project.presentation}`}
      id={project.slug}
    >
      <div className="work-object-label">
        <span>{project.kind}</span>
        <span>{project.context}</span>
      </div>
      <div className="work-object-copy">
        <h3 id={`${project.slug}-title`}>{project.title}</h3>
        <p>{project.description}</p>
      </div>
      <div className="work-object-foot">
        <p>{project.detail}</p>
        <ProjectActions project={project} />
      </div>
    </article>
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
  const width = book.presentation.width
  const tabletHeight = Math.round(book.presentation.height * 0.82)
  const tabletWidth = Math.round(width * 0.82)
  const mobileHeight = Math.min(238, book.presentation.height)
  const mobileWidth = Math.round(width * (mobileHeight / book.presentation.height))
  const style = {
    '--book-height': `${book.presentation.height}px`,
    '--book-width': `${width}px`,
    '--book-tablet-height': `${tabletHeight}px`,
    '--book-tablet-width': `${tabletWidth}px`,
    '--book-mobile-height': `${mobileHeight}px`,
    '--book-mobile-width': `${mobileWidth}px`,
    '--book-depth': `${book.presentation.depth}px`,
    '--rest-angle': `${book.presentation.restAngle}deg`,
    '--rest-yaw': `${book.presentation.restYaw}deg`,
    '--book-cover': book.design.cover,
    '--book-spine': book.design.spine,
    '--book-ink': book.design.ink,
    '--book-accent': book.design.accent,
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
              <span className="book-cover-frame" />
              <span className="book-cover-ornament" />
              <span className="book-cover-copy">
                <span className="book-cover-title">{book.title}</span>
                <span className="book-cover-author">{book.author}</span>
              </span>
              <span className="book-glint" />
            </span>
            <span className="book-face book-spine">
              <span className="book-spine-title">{book.title}</span>
              <span className="book-spine-author">{book.author}</span>
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
      <RouteHeading title={t.library.title} lede={t.library.lede} />

      <section className="bookshelf-section" aria-label="Five books on Enzo Simier's shelf">
        <div className="bookshelf-viewport">
          <ol className="bookshelf-rail">
            {t.library.books.map((book) => <Book book={book} key={book.slug} />)}
          </ol>
          <div className="glass-shelf" aria-hidden="true">
            <span />
          </div>
        </div>
        <p className="shelf-hint">Swipe the shelf · Tap a book to open</p>
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
