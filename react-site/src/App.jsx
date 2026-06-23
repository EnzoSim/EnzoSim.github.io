import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  Moon,
  Search,
  Sun,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
const linkedinUrl = 'https://linkedin.com/in/enzo-simier'

const navItems = [
  ['About', '#about'],
  ['Work', '#experience'],
  ['Skills', '#skills'],
  ['Education', '#education'],
  ['Research', '#research'],
  ['Projects', '#projects'],
  ['Library', '#reading'],
]

const projectNavItems = [
  ['Home', '/'],
  ['Overview', '#overview'],
  ['Architecture', '#architecture'],
  ['Deployment', '#deployment'],
]

const workItems = [
  {
    company: 'Competition Bureau',
    role: 'Intern, Mergers Directorate',
    date: 'Summer 2025',
    details: [
      'Analyzed candidate markets using shares, HHIs, diversion logic, and first-pass unilateral-effects screens.',
      'Drafted technical notes translating economic evidence on concentration and substitution for senior economists.',
    ],
  },
  {
    company: 'KPMG Canada',
    role: 'Intern, Economic Consulting & Strategy',
    date: 'Summer 2024',
    details: [
      'Built economic-impact and cost-benefit models for public projects, quantifying GDP, employment, and fiscal effects.',
      'Produced executive briefings that translated technical analysis into clear recommendations for public-sector clients.',
    ],
  },
  {
    company: 'HEC Montreal',
    role: 'Teaching Assistant, Macroeconomics',
    date: 'Fall 2023',
    details: [
      'Led weekly review sessions on growth, business cycles, and monetary policy for undergraduate students.',
      'Prepared and graded problem sets on IS-LM, the Phillips curve, and the Solow model.',
    ],
  },
  {
    company: 'National Bank Accelerator',
    role: 'Business Development Intern',
    date: 'Summer 2023',
    details: [
      'Designed go-to-market and KPI frameworks for early-stage startups in the accelerator portfolio.',
      'Completed market sizing and competitor scans to support strategic decision-making for founding teams.',
    ],
  },
  {
    company: 'Front Row Ventures',
    role: 'Business Development Analyst',
    date: '2021 to 2022',
    details: [
      'Built a fund CRM to systematize deal flow and portfolio tracking.',
      'Screened startups and prepared concise investment memos for the team.',
    ],
  },
]

const skills = [
  ['Behavioral & IO', 'Market structure, pricing, screening, and behavioral policy design.'],
  ['Quant Tools', 'Python, pandas, statsmodels, R, Stata, advanced Excel, and LaTeX.'],
  ['Communication', 'Executive briefs, data visualization, stakeholder synthesis, and bilingual EN/FR work.'],
  ['Domain Context', 'Water systems, municipal policy, competition questions, and public-sector strategy.'],
]

const education = [
  {
    school: 'HEC Montreal',
    meta: 'M.Sc. in Applied Economics - 2024 to 2026 expected',
    text: 'Thesis on residential water metering, pricing design, and household response in Quebec.',
  },
  {
    school: 'HEC Montreal',
    meta: 'B.B.A. in Economics and Finance - 2020 to 2024',
    text: 'Graduated with distinction. Bilingual profile in English and French.',
  },
]

const fdaMetrics = [
  ['128', 'events'],
  ['101', 'companies'],
  ['23', 'PDUFA'],
  ['100', 'readouts'],
]

const catalystRows = [
  { ticker: 'VSTM', company: 'Verastem', event: 'Data readout', window: 'Near term', status: 'Live' },
  { ticker: 'ARQT', company: 'Arcutis', event: 'PDUFA', window: '90d', status: 'Filed' },
  { ticker: 'LNTH', company: 'Lantheus', event: 'PDUFA', window: '90d', status: 'Review' },
  { ticker: 'UNCY', company: 'Unicycive', event: 'FDA decision', window: '90d', status: 'Tracked' },
]

const books = [
  {
    title: 'Chip War',
    author: 'Chris Miller - 2022',
    href: 'https://www.simonandschuster.com/books/Chip-War/Chris-Miller/9781982172015',
    img: 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781982172015/chip-war-9781982172015_hr.jpg',
    alt: 'Chip War by Chris Miller cover',
    note: 'A sharp reminder that industrial policy, supply chains, and market power are never abstract.',
  },
  {
    title: 'Material World',
    author: 'Ed Conway - 2023',
    href: 'https://www.penguinrandomhouse.com/books/703268/material-world-by-ed-conway/',
    img: 'https://images1.penguinrandomhouse.com/cover/9780593467428',
    alt: 'Material World by Ed Conway cover',
    note: 'Useful for staying grounded in the physical systems underneath modern growth stories.',
  },
  {
    title: 'Working in Public',
    author: 'Nadia Eghbal - Stripe Press',
    href: 'https://press.stripe.com/working-in-public',
    img: null,
    alt: 'Working in Public by Nadia Eghbal cover',
    coverLabel: 'WORKING IN PUBLIC',
    coverTone: 'light',
    note: 'Still one of the clearest books on incentives, maintenance, and coordination in open systems.',
  },
  {
    title: 'Churchill',
    author: 'Andrew Roberts - 2018',
    href: 'https://en.wikipedia.org/wiki/Churchill:_Walking_with_Destiny',
    img: null,
    alt: 'Churchill: Walking with Destiny cover',
    coverLabel: 'CHURCHILL',
    note: 'A useful study in leadership, timing, and decision-making under extreme constraint.',
  },
  {
    title: 'Caesar',
    author: 'Adrian Goldsworthy - 2006',
    href: 'https://en.wikipedia.org/wiki/Caesar,_Life_of_a_Colossus',
    img: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Life_of_a_Colossus%2C_Goldsworthy.png',
    alt: 'Caesar: Life of a Colossus cover',
    note: 'A study in ambition, institutions, coalition-building, and political timing.',
  },
]

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
  const [theme, setTheme] = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}

function SiteNav({ projectPage = false }) {
  const items = projectPage ? projectNavItems : navItems

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a className="nav-brand" href="/">
          Enzo Simier
        </a>
        <div className="desktop-nav">
          {items.map(([label, href]) => (
            <a className="nav-link" href={href} key={label}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="sm:hidden" aria-label="Email">
            <a href="mailto:enzo.simier@hec.ca">
              <Mail />
            </a>
          </Button>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <a href="mailto:enzo.simier@hec.ca">
              <Mail data-icon="inline-start" />
              Email
            </a>
          </Button>
          <ThemeButton />
        </div>
      </nav>
      <nav className="mobile-nav-row" aria-label={projectPage ? 'Project sections' : 'Page sections'}>
        {items.map(([label, href]) => (
          <a className="nav-link" href={href} key={label}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function SectionHeading({ icon: Icon, eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <div className="section-eyebrow">
        {Icon ? <Icon aria-hidden="true" /> : null}
        <span>{eyebrow}</span>
      </div>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

function HomeHero() {
  return (
    <section className="hero-shell" id="about">
      <div className="hero-copy">
        <Badge variant="outline">Applied Economics - Industrial Organization</Badge>
        <h1>Enzo Simier</h1>
        <p>
          M.Sc. candidate at HEC Montreal studying how pricing, information, and metering change household
          behavior in Quebec.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <a href="/Enzo_Simier_CV.pdf" target="_blank" rel="noreferrer">
              CV
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href="mailto:enzo.simier@hec.ca">Email</a>
          </Button>
        </div>
      </div>
      <div className="portrait-panel">
        <img
          alt="Portrait of Enzo Simier"
          decoding="async"
          fetchPriority="high"
          height="800"
          src="/profile.jpg"
          width="715"
        />
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="content-section">
      <div className="two-column">
        <SectionHeading eyebrow="About" title="Economics with product instincts">
          I am interested in questions where microeconomic theory meets institutional reality.
        </SectionHeading>
        <div className="copy-stack">
          <p>
            My work spans residential water metering in Quebec, merger review at Canada&apos;s Competition
            Bureau, and economic consulting at KPMG.
          </p>
          <p>
            I am looking for roles where applied economics helps shape strategy, policy, or product decisions.
          </p>
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  return (
    <section className="content-section" id="experience">
      <SectionHeading icon={BriefcaseBusiness} eyebrow="Work" title="Applied work across policy and strategy" />
      <div className="experience-grid">
        {workItems.map((item) => (
          <Card className="rounded-lg" key={`${item.company}-${item.date}`}>
            <CardHeader>
              <CardTitle>{item.company}</CardTitle>
              <CardDescription>{item.role}</CardDescription>
              <CardAction>
                <Badge variant="secondary">{item.date}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="bullet-list">
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function SkillsEducationSection() {
  return (
    <section className="content-section split-section" id="skills">
      <div>
        <SectionHeading icon={Activity} eyebrow="Skills" title="Analysis stack" />
        <div className="skill-grid">
          {skills.map(([title, text]) => (
            <Card className="rounded-lg" key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <div id="education">
        <SectionHeading icon={GraduationCap} eyebrow="Education" title="HEC Montreal" />
        <div className="education-list">
          {education.map((item) => (
            <Card className="rounded-lg" key={item.meta}>
              <CardHeader>
                <CardTitle>{item.school}</CardTitle>
                <CardDescription>{item.meta}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResearchSection() {
  return (
    <section className="content-section" id="research">
      <Card className="research-card rounded-lg">
        <CardHeader>
          <Badge className="w-fit" variant="outline">
            Thesis in progress
          </Badge>
          <CardTitle>Water metering, pricing, and household response in Quebec.</CardTitle>
          <CardDescription>
            Studying whether residential water metering materially changes consumption, and when price or
            informational cues are strong enough to move household behavior.
          </CardDescription>
        </CardHeader>
        <CardFooter className="research-footer">
          <span>Lens: public economics, behavioral response, infrastructure pricing.</span>
          <span>Supervisors: Justin Leroux and Jean-Luc Martel.</span>
        </CardFooter>
      </Card>
    </section>
  )
}

function CatalystTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Window</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {catalystRows.map((row) => (
          <TableRow key={row.ticker}>
            <TableCell className="font-medium">{row.ticker}</TableCell>
            <TableCell>{row.event}</TableCell>
            <TableCell>{row.window}</TableCell>
            <TableCell className="text-right">
              <Badge variant="outline">{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FdaSnapshotStrip() {
  return (
    <div className="snapshot-strip" aria-label="FDA catalyst calendar snapshot">
      {fdaMetrics.map(([value, label]) => (
        <span className="snapshot-item" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </span>
      ))}
    </div>
  )
}

function FdaProjectFeature() {
  return (
    <section className="content-section" id="projects">
      <SectionHeading icon={CalendarDays} eyebrow="Projects" title="FDA Catalyst Research">
        Biotech catalyst calendar for near-term FDA and clinical events, backed by BPIQ snapshot data and a live
        Railway deployment.
      </SectionHeading>
      <Card className="project-feature-card rounded-lg">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Live product</Badge>
              <Badge variant="secondary">BPIQ data</Badge>
              <Badge variant="outline">Railway</Badge>
            </div>
            <CardTitle>Calendar, event filters, company rows, and direct chart links.</CardTitle>
            <CardDescription>
              The public build turns stored catalyst records into a compact research surface for screening
              near-term FDA and clinical milestones.
            </CardDescription>
          </div>
          <CardAction className="project-actions">
            <Button asChild>
              <a href={fdaLiveUrl} target="_blank" rel="noreferrer">
                Live calendar
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/fda-catalyst.html">
                Case page
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="project-dashboard">
            <div className="project-snapshot-panel">
              <span className="snapshot-kicker">Current 90d snapshot</span>
              <p>
                <strong>128 events</strong> across 101 public biopharma companies, with PDUFA decisions and
                clinical readouts separated for quick screening.
              </p>
              <FdaSnapshotStrip />
            </div>
            <div className="table-panel" aria-label="Sample FDA catalyst rows">
              <CatalystTable />
            </div>
          </div>
        </CardContent>
        <CardFooter className="project-footer">
          <span>Production smoke: 128 visible rows, live status badge, PDUFA rows, mobile overflow clean.</span>
        </CardFooter>
      </Card>
    </section>
  )
}

function BookCover({ book }) {
  const placeholderClass =
    book.coverTone === 'light'
      ? 'book-cover-placeholder book-cover-placeholder-light'
      : 'book-cover-placeholder'

  return (
    <span className="book-stage" aria-hidden="true">
      <span className="book-object">
        <span className="book-front">
          {book.img ? (
            <img alt="" decoding="async" height="520" loading="eager" src={book.img} width="340" />
          ) : (
            <span className={placeholderClass}>
              <strong>{book.coverLabel}</strong>
              <small>{book.author}</small>
            </span>
          )}
        </span>
        <span className="book-pages" />
        <span className="book-spine" />
      </span>
    </span>
  )
}

function LibrarySection() {
  return (
    <section className="content-section" id="reading">
      <SectionHeading icon={BookOpen} eyebrow="Library" title="Books I return to">
        Industry, institutions, strategy, maintenance, and decision-making under constraint.
      </SectionHeading>
      <div className="book-grid">
        {books.map((book) => (
          <a className="book-card" href={book.href} key={book.title} rel="noreferrer" target="_blank">
            <BookCover book={book} />
            <span className="book-title">{book.title}</span>
            <span className="book-author">{book.author}</span>
            <span className="book-note">{book.note}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Montreal, QC</span>
      <a href="mailto:enzo.simier@hec.ca">enzo.simier@hec.ca</a>
      <a href={linkedinUrl} rel="noreferrer" target="_blank">
        LinkedIn
      </a>
    </footer>
  )
}

function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <HomeHero />
        <AboutSection />
        <ExperienceSection />
        <SkillsEducationSection />
        <ResearchSection />
        <FdaProjectFeature />
        <LibrarySection />
      </main>
      <SiteFooter />
    </>
  )
}

function ProjectHero() {
  return (
    <section className="project-page-hero" id="overview">
      <div className="project-page-copy">
        <Badge variant="outline">FDA Catalyst Research</Badge>
        <h1>Biotech catalyst calendar, live on Railway.</h1>
        <p>
          A research product for tracking biotech and pharma companies with near-term FDA or clinical
          catalysts. The hosted build converts BPIQ records into a compact calendar with filters, source
          links, event context, and TradingView links.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <a href={fdaLiveUrl} target="_blank" rel="noreferrer">
              Open live calendar
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </div>
      <Card className="project-page-panel rounded-lg">
        <CardHeader>
          <CardTitle>90d calendar snapshot</CardTitle>
          <CardDescription>Current production payload summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="metric-grid">
            {fdaMetrics.map(([value, label]) => (
              <div className="metric-tile" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <Separator />
          <CatalystTable />
        </CardContent>
      </Card>
    </section>
  )
}

function ArchitectureSection() {
  const cards = [
    ['API', 'FastAPI service exposing calendar, health, source, catalyst, scanner, watchlist, backtest, and IV study endpoints.'],
    ['Data', 'BPIQ API responses stored as raw records locally, then copied into Railway Postgres for the hosted calendar.'],
    ['UI', 'Calendar page with dated catalysts, filters, source links, TradingView links, and a next-events rail.'],
  ]

  return (
    <section className="content-section" id="architecture">
      <SectionHeading icon={Search} eyebrow="Architecture" title="What exists now">
        The app has the core product surface live: Python API, Postgres-backed records, and a web calendar.
      </SectionHeading>
      <div className="feature-grid">
        {cards.map(([title, text]) => (
          <Card className="rounded-lg" key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

function DeploymentSection() {
  const lines = [
    ['Web app', 'Live calendar', fdaLiveUrl],
    ['API', 'Service online', null],
    ['Data store', 'Railway Postgres', null],
    ['Custom domains', 'Pending DNS', null],
  ]

  return (
    <section className="content-section" id="deployment">
      <div className="two-column">
        <SectionHeading icon={CheckCircle2} eyebrow="Deployment" title="Production status">
          Two Railway services are live today: Python API and React/Next web calendar.
        </SectionHeading>
        <Card className="rounded-lg">
          <CardContent className="status-list">
            {lines.map(([label, value, href]) => (
              <div className="status-line" key={label}>
                <span>{label}</span>
                {href ? (
                  <a href={href} rel="noreferrer" target="_blank">
                    {value}
                  </a>
                ) : (
                  <strong>{value}</strong>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Production check</CardTitle>
          <CardDescription>
            The smoke test loaded the live calendar with 128 visible rows, an API connection badge, PDUFA
            rows, no console errors, and no mobile horizontal overflow.
          </CardDescription>
        </CardHeader>
        <CardFooter className="project-footer">
          <span>Next: attach catalysts.enzosimier.com and api-catalysts.enzosimier.com after DNS is ready.</span>
        </CardFooter>
      </Card>
    </section>
  )
}

function FdaCatalystPage() {
  return (
    <>
      <SiteNav projectPage />
      <main>
        <ProjectHero />
        <ArchitectureSection />
        <DeploymentSection />
      </main>
      <SiteFooter />
    </>
  )
}

function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname
  const isProjectPage = useMemo(() => pathname.includes('fda-catalyst'), [pathname])

  useEffect(() => {
    document.title = isProjectPage
      ? 'FDA Catalyst Research · Enzo Simier'
      : 'Enzo Simier · Applied Economics & IO'
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

export default App
