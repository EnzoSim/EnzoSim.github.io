import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react'
import { FaEnvelope, FaLinkedinIn } from 'react-icons/fa6'

import { en as t } from '@/content/en'
import {
  fdaLiveUrl,
  portrait,
  poseidonDashboardUrl,
  poseidonNoteFilename,
  poseidonNoteUrl,
  poseidonRepoUrl,
} from '@/content/shared'

const externalProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}

function routeForPathname(pathname) {
  const normalized = pathname.replace(/\/index\.html$/, '/')

  if (normalized === '/fda-catalyst.html') return 'fda-catalyst'
  if (normalized === '/poseidon' || normalized === '/poseidon/') return 'poseidon'
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

function ExternalArrow() {
  return <ArrowUpRight aria-hidden="true" data-icon="external" />
}

function ContactIcon({ label }) {
  if (label === 'LinkedIn') return <FaLinkedinIn aria-hidden="true" data-icon="contact" />
  if (label === 'Email') return <FaEnvelope aria-hidden="true" data-icon="contact" />
  return null
}

function ProfileRail({ activeRoute }) {
  const contacts = [...t.home.contacts].sort((a, b) => {
    const order = ['LinkedIn', 'CV', 'Email']
    return order.indexOf(a.label) - order.indexOf(b.label)
  })

  return (
    <aside className="profile-rail">
      <a className="profile-name" href="/">{t.home.name}</a>

      <figure className="profile-figure">
        <picture>
          <img
            alt={t.a11y.portraitAlt}
            className="profile-photo"
            decoding="async"
            fetchPriority="high"
            height={portrait.height}
            sizes="(min-width: 61rem) 20rem, (min-width: 36rem) 22rem, calc(100vw - 2.5rem)"
            src={portrait.src}
            srcSet={portrait.srcSet}
            width={portrait.width}
          />
        </picture>
        <figcaption>Hiking in Tremblant.</figcaption>
      </figure>

      <p className="profile-role">{t.home.role}</p>

      <div className="profile-links" aria-label="Contact links">
        {contacts.map((contact) => {
          const isIconContact = contact.label === 'LinkedIn' || contact.label === 'Email'

          return (
            <a
              aria-label={isIconContact ? contact.label : undefined}
              className={`profile-link profile-link-glass ${isIconContact ? 'profile-link-icon' : 'profile-link-text'}`}
              href={contact.href}
              key={contact.label}
              title={isIconContact ? contact.label : undefined}
              {...(contact.external || contact.label === 'CV' ? externalProps : {})}
            >
              {isIconContact ? (
                <ContactIcon label={contact.label} />
              ) : (
                <>
                  <span>{contact.label}</span>
                  <ExternalArrow />
                </>
              )}
            </a>
          )
        })}
      </div>

      <nav aria-label={t.a11y.primaryNavigation} className="profile-nav">
        {t.nav.items.map((item) => {
          const itemRoute = routeForPathname(item.href)
          const isProjectPage = activeRoute === 'fda-catalyst' || activeRoute === 'poseidon'
          const isActive = activeRoute === itemRoute || (isProjectPage && itemRoute === 'projects')
          return (
            <a aria-current={isActive ? 'page' : undefined} href={item.href} key={item.href}>
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026</span>
      <span>Built in Montréal</span>
    </footer>
  )
}

function Shell({ activeRoute, children, wide = null }) {
  if (wide) {
    // Wide pages keep the rail and intro side by side, then give one block
    // (an embedded app) the full layout width underneath. Both stay in <main>.
    return (
      <>
        <SkipLink />
        <div className="profile-layout profile-layout-wide">
          <ProfileRail activeRoute={activeRoute} />
          <main className="wide-main" id="main">
            <div className="wide-main-intro">{children}</div>
            <div className="wide-main-full">{wide}</div>
          </main>
          <SiteFooter />
        </div>
      </>
    )
  }

  return (
    <>
      <SkipLink />
      <div className="profile-layout">
        <ProfileRail activeRoute={activeRoute} />
        <div className="content-column">
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </>
  )
}

function ProjectLinks({ project }) {
  const links = []

  if (project.href) {
    links.push({
      href: project.href,
      label: project.cta,
      external: project.href.startsWith('http'),
    })
  }
  if (project.slug === 'fda-catalyst') {
    links.push({ href: fdaLiveUrl, label: project.liveCta, external: true })
  }
  if (project.sourceHref) {
    links.push({ href: project.sourceHref, label: project.sourceCta, external: true })
  }

  if (links.length === 0) return null

  return (
    <span className="inline-links">
      {links.map((link) => (
        <a href={link.href} key={`${project.slug}-${link.label}`} {...(link.external ? externalProps : {})}>
          {link.label}
          <ExternalArrow />
        </a>
      ))}
    </span>
  )
}

function ProjectItem({ project, showContext = false }) {
  const titleHref = project.href ?? (project.slug === 'water-pricing' ? null : undefined)
  const isExternal = Boolean(titleHref?.startsWith('http'))

  return (
    <article className="prose-item" id={project.slug}>
      <h3>
        {titleHref ? (
          <a href={titleHref} {...(isExternal ? externalProps : {})}>{project.title}</a>
        ) : project.title}
      </h3>
      {showContext ? <p className="item-context">{`${project.field} · ${project.context}`}</p> : null}
      <p>{project.note}</p>
      <ProjectLinks project={project} />
    </article>
  )
}

function RecordList({ items }) {
  return (
    <ul className="plain-list record-list">
      {items.map((item) => (
        <li key={`${item.role ?? item.degree}-${item.date}`}>
          <span className="record-main">
            <strong>{item.role ?? item.degree}</strong>, <em>{item.org ?? item.school}</em>
          </span>
          <span className="record-date">{item.date}</span>
        </li>
      ))}
    </ul>
  )
}

function AboutPage() {
  return (
    <Shell activeRoute="about">
      <section className="content-section" aria-labelledby="about-title">
        <h1 id="about-title">About me</h1>
        <p>{t.home.personal}</p>
      </section>

      <section className="content-section" aria-labelledby="now-title">
        <h2 id="now-title">{t.home.now.label}</h2>
        <p>{t.home.now.text}</p>
        <p className="now-availability">{t.home.now.availability}</p>
      </section>

      <section className="content-section" aria-labelledby="selected-title">
        <h2 id="selected-title">Selected projects</h2>
        <div className="prose-list">
          {t.projects.items.map((project) => (
            <ProjectItem key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="content-section" id="experience" aria-labelledby="experience-title">
        <h2 id="experience-title">{t.experience.title}</h2>
        <RecordList items={t.experience.items} />
      </section>

      <section className="content-section" id="education" aria-labelledby="education-title">
        <h2 id="education-title">{t.education.title}</h2>
        <RecordList items={t.education.items} />
      </section>
    </Shell>
  )
}

function PageIntro({ id, lede, title }) {
  return (
    <header className="page-intro">
      <h1 id={id}>{title}</h1>
      {lede ? <p>{lede}</p> : null}
    </header>
  )
}

function ProjectsPage() {
  return (
    <Shell activeRoute="projects">
      <PageIntro id="projects-title" lede={t.projects.lede} title={t.projects.title} />
      <section className="content-section" aria-labelledby="projects-title">
        <div className="prose-list prose-list-roomy">
          {t.projects.items.map((project) => (
            <ProjectItem key={project.slug} project={project} showContext />
          ))}
        </div>
      </section>
    </Shell>
  )
}

function BookList() {
  return (
    <div className="prose-list prose-list-roomy">
      {t.library.books.map((book) => (
        <article className="prose-item" key={book.slug}>
          <h3>
            <a href={book.href} {...externalProps}>{book.title}</a>
          </h3>
          <p className="item-context">{`${book.author} · ${book.year}`}</p>
          <p>{book.note}</p>
        </article>
      ))}
    </div>
  )
}

function Publications() {
  return (
    <section className="content-section" aria-labelledby="publications-title">
      <h2 id="publications-title">{t.library.subscriptions.title}</h2>
      {t.library.subscriptions.groups.map((group) => (
        <section className="publication-group" key={group.label}>
          <h3>{group.label}</h3>
          <div className="prose-list">
            {group.items.map((item) => (
              <article className="prose-item" key={item.name}>
                <h4><a href={item.url} {...externalProps}>{item.name}</a></h4>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

function ReadingPage() {
  return (
    <Shell activeRoute="reading">
      <PageIntro id="reading-title" lede={t.library.lede} title={t.library.title} />
      <section className="content-section" aria-labelledby="reading-title">
        <BookList />
      </section>
      <Publications />
    </Shell>
  )
}

function CatalystTable() {
  return (
    <div className="data-table-wrap">
      <table>
        <thead>
          <tr>
            {t.project.table.headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {t.project.table.rows.map((row) => (
            <tr key={row.ticker}>
              <th scope="row">{row.ticker}</th>
              <td>{row.event}</td>
              <td>{row.window}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FdaCatalystPage() {
  return (
    <Shell activeRoute="fda-catalyst">
      <PageIntro id="project-title" lede={t.project.lede} title={t.project.title} />

      <p className="detail-action">
        <a className="blue-glass-button" href={t.project.openHref} {...externalProps}>
          {t.project.openCta}
          <ExternalArrow />
        </a>
      </p>

      <section className="content-section" aria-labelledby="snapshot-title">
        <h2 id="snapshot-title">{t.project.snapshot.title}</h2>
        <p>{t.project.snapshot.description}</p>
        <CatalystTable />
      </section>

      <section className="content-section" aria-labelledby="architecture-title">
        <h2 id="architecture-title">{t.project.architecture.title}</h2>
        <p>{t.project.architecture.lede}</p>
        <dl className="definition-list">
          {t.project.architecture.cards.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="content-section" aria-labelledby="deployment-title">
        <h2 id="deployment-title">{t.project.deployment.title}</h2>
        <p>{t.project.deployment.lede}</p>
        <dl className="definition-list status-list">
          {t.project.deployment.lines.map(([label, value], index) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {index === 0 ? (
                  <a href={fdaLiveUrl} {...externalProps}>{value}<ExternalArrow /></a>
                ) : value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </Shell>
  )
}

// A scenario link such as /poseidon/?market=nunavik&price_pct=85 is passed on to
// the dashboard, both in the embed and in the full-screen link.
function dashboardQuery() {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  params.delete('embed')
  return params.toString()
}

// The dashboard draws its board to the frame's width and reports the board's
// height, so the frame grows to fit and the page keeps a single scroll.
function useDashboardHeight() {
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== poseidonDashboardUrl) return
      const data = event.data
      if (data && data.type === 'poseidon:height' && Number.isFinite(data.height) && data.height > 0) {
        setHeight(Math.min(Math.round(data.height), 20000))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return height
}

function PoseidonDashboard() {
  const { dashboard } = t.poseidon
  const query = dashboardQuery()
  const embedSrc = query ? `${poseidonDashboardUrl}/?${query}` : `${poseidonDashboardUrl}/`
  const fullScreenHref = embedSrc
  const height = useDashboardHeight()

  return (
    <section className="dashboard-embed" aria-labelledby="dashboard-title">
      <div className="dashboard-embed-header">
        <h2 id="dashboard-title">{dashboard.title}</h2>
        <a className="text-action" href={fullScreenHref} {...externalProps}>
          {dashboard.openCta}
          <ExternalArrow />
        </a>
      </div>
      <div className="dashboard-frame">
        <iframe
          allow="clipboard-write"
          src={embedSrc}
          style={height ? { height: `${height}px`, aspectRatio: 'auto' } : undefined}
          title={dashboard.frameTitle}
        />
      </div>
    </section>
  )
}

function PoseidonPage() {
  const page = t.poseidon

  return (
    <Shell activeRoute="poseidon" wide={<PoseidonDashboard />}>
      <PageIntro id="poseidon-title" lede={page.lede} title={page.title} />

      <p className="detail-action detail-actions">
        <a className="blue-glass-button" download={poseidonNoteFilename} href={poseidonNoteUrl}>
          {page.noteCta}
          <ArrowDownToLine aria-hidden="true" data-icon="download" />
        </a>
        {poseidonRepoUrl ? (
          <a className="text-action" href={poseidonRepoUrl} {...externalProps}>
            {page.sourceCta}
            <ExternalArrow />
          </a>
        ) : null}
      </p>

      <section className="content-section" aria-labelledby="model-title">
        <h2 id="model-title">{page.model.title}</h2>
        <dl className="definition-list">
          {page.model.rows.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
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
  } else if (route === 'poseidon') {
    page = <PoseidonPage />
    meta = t.meta.poseidon
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
