import { useEffect } from 'react'
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
import { en as t } from '@/content/en'
import { fdaLiveUrl, profileImage } from '@/content/shared'

const externalProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}

function routeForPathname(pathname) {
  const normalized = pathname.replace(/\/index\.html$/, '/')

  if (normalized === '/fda-catalyst.html') return 'fda-catalyst'
  if (normalized === '/projects' || normalized === '/projects/') return 'projects'
  if (normalized === '/reading' || normalized === '/reading/') return 'reading'
  return 'about'
}

function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      {t.a11y.skipToContent}
    </a>
  )
}

function SiteNav({ showMark = false }) {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const activeRoute = routeForPathname(pathname)

  const onNavClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (routeForPathname(event.currentTarget.getAttribute('href')) === activeRoute) {
      event.preventDefault()
    }
  }

  return (
    <header className="site-header">
      <div className="site-mast">
        {showMark ? (
          <a className="site-mark" href="/">
            {t.home.name}
          </a>
        ) : null}
        <nav
          aria-label={t.a11y.primaryNavigation}
          className={showMark ? 'primary-nav primary-nav-trail' : 'primary-nav'}
        >
          {t.nav.items.map((item) => (
            <a
              aria-current={activeRoute === routeForPathname(item.href) ? 'page' : undefined}
              className="nav-link"
              href={item.href}
              key={item.href}
              onClick={onNavClick}
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
    </footer>
  )
}

function Shell({ children, className = '', showMark = false }) {
  return (
    <>
      <SkipLink />
      <SiteNav showMark={showMark} />
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

function ContactLinks() {
  return (
    <p className="contact-line" aria-label="Contact links">
      {t.home.contacts.map((contact, index) => (
        <span key={contact.label}>
          {index > 0 ? <span aria-hidden="true"> · </span> : null}
          <a
            href={contact.href}
            {...(contact.external || contact.label === 'CV' ? externalProps : {})}
          >
            {contact.label}
          </a>
        </span>
      ))}
    </p>
  )
}

function RecordList({ items }) {
  return (
    <ul className="record-list">
      {items.map((item) => (
        <li key={`${item.role ?? item.degree}-${item.date}`}>
          <span className="record-date">{item.date}</span>
          <span className="record-body">
            <span className="record-role">{item.role ?? item.degree}</span>
            <span className="record-org">{item.org ?? item.school}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function QuietRecord() {
  return (
    <div className="home-record">
      <section aria-labelledby="experience-title" className="record-section" id="experience">
        <h2 className="page-kicker" id="experience-title">{t.experience.title}</h2>
        <RecordList items={t.experience.items} />
      </section>
      <section aria-labelledby="education-title" className="record-section" id="education">
        <h2 className="page-kicker" id="education-title">{t.education.title}</h2>
        <RecordList items={t.education.items} />
      </section>
    </div>
  )
}

function projectRowHref(project, { onHome }) {
  if (project.href) return project.href
  if (onHome) return `/projects/#${project.slug}`
  return null
}

function IndexRow({ project, showNotes = false, onHome = false }) {
  const href = projectRowHref(project, { onHome })
  const isExternal = Boolean(href && href.startsWith('http'))

  return (
    <article
      aria-labelledby={`${project.slug}-title`}
      className="index-row"
      id={project.slug}
    >
      <div className="index-id">
        <h2 className="index-name" id={`${project.slug}-title`}>
          {href ? (
            <a href={href} {...(isExternal ? externalProps : {})}>
              {project.title}
              {isExternal ? <ExternalArrow /> : null}
            </a>
          ) : (
            project.title
          )}
        </h2>
        {showNotes && project.note ? <p className="index-note">{project.note}</p> : null}
      </div>
      {onHome ? (
        <p className="index-meta">{`${project.field} · ${project.context}`}</p>
      ) : (
        <>
          <p className="index-field">{project.field}</p>
          <p className="index-context">{project.context}</p>
        </>
      )}
      {showNotes ? <ProjectTextActions project={project} /> : null}
    </article>
  )
}

function ProjectTextActions({ project }) {
  const extras = []
  if (project.slug === 'fda-catalyst') {
    extras.push({ href: fdaLiveUrl, label: project.liveCta, external: true })
  }
  if (project.sourceHref) {
    extras.push({ href: project.sourceHref, label: project.sourceCta, external: true })
  }
  if (!project.href && extras.length === 0) return null

  return (
    <p className="index-actions">
      {project.href ? (
        <a
          href={project.href}
          {...(project.href.startsWith('http') ? externalProps : {})}
        >
          {project.cta}
          <ExternalArrow />
        </a>
      ) : null}
      {extras.map((item) => (
        <a key={item.href} href={item.href} {...(item.external ? externalProps : {})}>
          {item.label}
          <ExternalArrow />
        </a>
      ))}
    </p>
  )
}

function ProjectIndex({ items, showNotes = false, onHome = false }) {
  return (
    <div className="index-list">
      {items.map((project) => (
        <IndexRow
          key={project.slug}
          onHome={onHome}
          project={project}
          showNotes={showNotes}
        />
      ))}
    </div>
  )
}

function AboutPage() {
  return (
    <Shell className="home-page">
      <div className="page-shell home-shell">
        <section className="home-identity" aria-labelledby="home-title">
          <div className="home-copy">
            <h1 className="home-name" id="home-title">{t.home.name}</h1>
            <p className="home-role">{t.home.role}</p>
            <ContactLinks />
          </div>
          <figure className="home-figure">
            <img
              alt={t.a11y.portraitAlt}
              className="home-stamp"
              decoding="async"
              fetchPriority="high"
              height={profileImage.height}
              src={profileImage.src}
              width={profileImage.width}
            />
            <figcaption className="portrait-caption">{t.home.portraitCaption}</figcaption>
          </figure>
        </section>

        <section className="now-tape" id="now" aria-labelledby="now-label">
          <h2 className="page-kicker" id="now-label">{t.home.now.label}</h2>
          <p>{t.home.now.text}</p>
        </section>

        <section className="home-index" aria-labelledby="home-index-label">
          <h2 className="page-kicker" id="home-index-label">{t.home.indexLabel}</h2>
          <ProjectIndex items={t.projects.items} onHome />
        </section>

        <p className="home-about">{t.home.personal}</p>
        <QuietRecord />
      </div>
    </Shell>
  )
}

function RouteHead({ id, title, lede }) {
  return (
    <header className="route-head">
      <h1 id={id}>{title}</h1>
      {lede ? <p>{lede}</p> : null}
    </header>
  )
}

function ProjectsPage() {
  return (
    <Shell className="route-page projects-page" showMark>
      <section className="page-shell route-shell" aria-labelledby="projects-title">
        <RouteHead id="projects-title" lede={t.projects.lede} title={t.projects.title} />
        <ProjectIndex items={t.projects.items} showNotes />
      </section>
    </Shell>
  )
}

function Book({ book }) {
  const width = book.presentation.spineWidth
  const height = book.presentation.height
  const style = {
    '--spine-height': `${height}px`,
    '--spine-width': `${width}px`,
    '--spine-mobile-height': `${Math.round(height * 0.76)}px`,
    '--spine-mobile-width': `${Math.max(44, Math.round(width * 0.72))}px`,
    '--book-spine': book.design.spine,
    '--book-ink': book.design.ink,
    '--book-accent': book.design.accent,
  }

  const leanClass = book.presentation.lean ? ' shelf-book-item-lean' : ''

  return (
    <li className={`shelf-book-item${leanClass}`} style={style}>
      <a
        aria-label={`Open ${book.title} by ${book.author}`}
        className="shelf-book-link"
        href={book.href}
        {...externalProps}
      >
        <span className="shelf-book" aria-hidden="true">
          <span className="shelf-book-spine">
            <span className="shelf-book-band shelf-book-band-top" />
            <span className="shelf-book-title">{book.spineTitle ?? book.title}</span>
            <span className="shelf-book-author">{book.spineAuthor ?? book.author}</span>
            <span className="shelf-book-band shelf-book-band-bottom" />
            <span className="shelf-book-glint" />
          </span>
        </span>
      </a>
    </li>
  )
}

function BookNotes() {
  return (
    <ul className="shelf-notes">
      {t.library.books.map((book) => (
        <li key={book.slug}>
          <span
            aria-hidden="true"
            className="shelf-note-dot"
            style={{ '--book-spine': book.design.spine }}
          />
          <div className="shelf-note-id">
            <b>{book.spineTitle ?? book.title}</b>
            <span>{`${book.spineAuthor ?? book.author} · ${book.year}`}</span>
          </div>
          <p>{book.note}</p>
        </li>
      ))}
    </ul>
  )
}

function Publications() {
  return (
    <section className="publications-section" id="publications" aria-labelledby="publications-title">
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
    <Shell className="route-page reading-page" showMark>
      <section className="page-shell route-shell" aria-labelledby="reading-title">
        <RouteHead id="reading-title" title={t.library.title} />

        <section className="bookshelf-section" id="books" aria-label="Five books on Enzo Simier's shelf">
          <div className="ledge-stage">
            <ul className="shelf-books">
              {t.library.books.map((book) => <Book book={book} key={book.slug} />)}
            </ul>
            <div className="ledge-plank" aria-hidden="true" />
            <div className="ledge-shadow" aria-hidden="true" />
          </div>
          <BookNotes />
        </section>

        <Publications />
      </section>
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
    <Shell className="project-page" showMark>
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
  const route = routeForPathname(pathname)
  let page = <AboutPage />
  let meta = t.meta.about

  if (route === 'fda-catalyst') {
    page = <FdaCatalystPage />
    meta = t.meta.project
  } else if (route === 'projects') {
    page = <ProjectsPage />
    meta = t.meta.projects
  } else if (route === 'reading') {
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
