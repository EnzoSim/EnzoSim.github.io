import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
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

function SiteNav() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const activeRoute = routeForPathname(pathname)
  const navRef = useRef(null)
  const lensRef = useRef(null)

  const moveLens = useCallback((target) => {
    const nav = navRef.current
    const lens = lensRef.current
    if (!nav || !lens) return
    if (!target) {
      lens.style.opacity = '0'
      return
    }
    const navBox = nav.getBoundingClientRect()
    const box = target.getBoundingClientRect()
    lens.style.opacity = '1'
    lens.style.setProperty('--x', `${box.left - navBox.left}px`)
    lens.style.setProperty('--w', `${box.width}px`)
  }, [])

  const placeLens = useCallback(() => {
    moveLens(navRef.current?.querySelector('[aria-current="page"]'))
  }, [moveLens])

  // The lens must sit on the active tab before first paint so cross-document
  // view transitions snapshot it in place.
  useLayoutEffect(() => {
    placeLens()
  }, [placeLens])

  useEffect(() => {
    const ready = () => {
      placeLens()
      window.requestAnimationFrame(() => {
        if (lensRef.current) lensRef.current.dataset.ready = 'true'
      })
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(ready)
    } else {
      ready()
    }
    window.addEventListener('resize', placeLens)
    return () => window.removeEventListener('resize', placeLens)
  }, [placeLens])

  const dragState = useRef(null)
  const suppressClick = useRef(false)

  const onNavClick = (event) => {
    if (suppressClick.current) {
      suppressClick.current = false
      event.preventDefault()
      return
    }
    moveLens(event.currentTarget)
  }

  const onNavPointerDown = (event) => {
    const nav = navRef.current
    const lens = lensRef.current
    if (!nav || !lens || event.button !== 0) return
    if (lens.style.opacity === '0') return
    const navBox = nav.getBoundingClientRect()
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: lens.getBoundingClientRect().left - navBox.left,
      latest: null,
      navBox,
      dragging: false,
    }
  }

  const onNavPointerMove = (event) => {
    const state = dragState.current
    const nav = navRef.current
    const lens = lensRef.current
    if (!state || !nav || !lens) return
    const delta = event.clientX - state.startX
    if (!state.dragging) {
      if (Math.abs(delta) < 5) return
      state.dragging = true
      lens.dataset.dragging = 'true'
      nav.setPointerCapture(state.pointerId)
    }
    const links = Array.from(nav.querySelectorAll('.nav-link'))
    const first = links[0].getBoundingClientRect()
    const last = links[links.length - 1].getBoundingClientRect()
    const min = first.left - state.navBox.left
    const max = last.right - state.navBox.left - lens.offsetWidth
    state.latest = Math.min(max, Math.max(min, state.startLeft + delta))
    lens.style.setProperty('--x', `${state.latest}px`)
  }

  const onNavPointerUp = () => {
    const state = dragState.current
    dragState.current = null
    const nav = navRef.current
    const lens = lensRef.current
    if (!state || !state.dragging || state.latest === null || !nav || !lens) return
    lens.dataset.dragging = 'false'
    suppressClick.current = true
    const links = Array.from(nav.querySelectorAll('.nav-link'))
    const center = state.navBox.left + state.latest + lens.offsetWidth / 2
    let nearest = links[0]
    let best = Infinity
    for (const link of links) {
      const box = link.getBoundingClientRect()
      const distance = Math.abs(box.left + box.width / 2 - center)
      if (distance < best) {
        best = distance
        nearest = link
      }
    }
    moveLens(nearest)
    if (routeForPathname(nearest.getAttribute('href')) !== activeRoute) {
      window.setTimeout(() => {
        window.location.href = nearest.href
      }, 160)
    }
  }

  return (
    <header className="site-header">
      <div className="site-nav-shell">
        <nav
          aria-label={t.a11y.primaryNavigation}
          className="primary-nav"
          onPointerCancel={onNavPointerUp}
          onPointerDown={onNavPointerDown}
          onPointerMove={onNavPointerMove}
          onPointerUp={onNavPointerUp}
          ref={navRef}
        >
          <span aria-hidden="true" className="nav-lens" ref={lensRef} />
          {t.nav.items.map((item) => (
            <a
              aria-current={activeRoute === routeForPathname(item.href) ? 'page' : undefined}
              className="liquid-pill nav-link"
              draggable={false}
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

function PageIndex({ label, items }) {
  return (
    <aside className="editorial-index" aria-label={`${label} index`}>
      <p>{label}</p>
      <nav>
        {items.map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>
    </aside>
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

function AmbientBubbles() {
  return (
    <div className="ambient-bubbles" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <span className={`ambient-bubble ambient-bubble-${index + 1}`} key={index} />
      ))}
    </div>
  )
}

function AboutPage() {
  return (
    <Shell className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <AmbientBubbles />
        <div className="home-hero-content">
          <figure className="portrait-column home-portrait">
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
            <h1 id="home-title">{t.home.title}</h1>
            <p className="home-introduction">{t.home.introduction}</p>
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
            <div className="home-details">
              <div className="now-line" id="now">
                <span>{t.home.now.label}</span>
                <p>{t.home.now.text}</p>
                <Button asChild size="sm" variant="ghost">
                  <a href={t.home.now.action.href} {...externalProps}>
                    {t.home.now.action.label}
                    <ExternalArrow />
                  </a>
                </Button>
              </div>
              <p className="home-about">{t.home.personal}</p>
            </div>
          </div>
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

function ProjectsPage() {
  return (
    <Shell className="route-page projects-page">
      <div className="editorial-layout projects-record">
        <PageIndex
          label="Projects"
          items={t.projects.items.map((project) => ({
            label: project.kind,
            href: `#${project.slug}`,
          }))}
        />
        <section className="projects-stage" aria-labelledby="projects-title">
          <header className="projects-stage-heading">
            <h1 id="projects-title">{t.projects.title}</h1>
            <p>{t.projects.lede}</p>
          </header>
          <div className="work-grid">
            {t.projects.items.map((project) => (
              <WorkObject key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </div>
    </Shell>
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

function ProjectObject({ slug }) {
  if (slug === 'water-pricing') {
    return (
      <div className="project-object" aria-hidden="true">
        <div className="object-steps-wrap">
          <div className="object-steps">
            <i />
            <i />
            <i />
          </div>
          <p className="object-caption">$ / m³</p>
        </div>
      </div>
    )
  }

  if (slug === 'fda-catalyst') {
    return (
      <div className="project-object" aria-hidden="true">
        <div className="object-cal">
          <p className="object-cal-head">90 days</p>
          <div className="object-cal-grid">
            {Array.from({ length: 15 }, (_, index) => (
              <i className={index === 6 || index === 13 ? 'hot' : undefined} key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="project-object" aria-hidden="true">
      <div className="object-cards">
        <span className="object-card object-card-back" />
        <span className="object-card object-card-front">
          <span className="object-card-title" />
          <span className="object-card-line" />
          <span className="object-card-line" />
        </span>
      </div>
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
      <ProjectObject slug={project.slug} />
      <div className="work-object-copy">
        <h2 id={`${project.slug}-title`}>{project.title}</h2>
        <p>{project.description}</p>
        <p className="work-object-context">{project.context}</p>
        <ProjectActions project={project} />
      </div>
    </article>
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
    <Shell className="route-page reading-page">
      <div className="editorial-layout reading-record">
        <PageIndex
          label="Reading"
          items={[
            { label: 'Books', href: '#books' },
            { label: 'Publications', href: '#publications' },
          ]}
        />
        <div className="reading-column">
          <RouteHeading title={t.library.title} lede={t.library.lede} />

          <section className="bookshelf-section" id="books" aria-label="Five books on Enzo Simier's shelf">
            <div className="ledge-composition">
              <div className="ledge-stage">
                <ul className="shelf-books">
                  {t.library.books.map((book) => <Book book={book} key={book.slug} />)}
                </ul>
                <div className="ledge-plank" aria-hidden="true" />
              </div>
              <BookNotes />
            </div>
          </section>

          <Publications />
        </div>
      </div>
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
