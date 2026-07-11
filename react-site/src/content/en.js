import { fdaSnapshot } from './shared'

// EN copy dictionary. Shape is the contract: strings only, never keys.
// Copy converged through the voice-guide judge pipeline (Thiel-declarative register).
export const en = {
  meta: {
    home: {
      title: 'Enzo Simier · Applied Economics & Industrial Organization',
      description:
        'Enzo Simier, economist in Montréal. Competition work at Desjardins and the Competition Bureau, water pricing at HEC Montréal, and public projects.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description:
        `A live 90-day biotech catalyst view: ${fdaSnapshot.events} events, ${fdaSnapshot.companies} companies, ${fdaSnapshot.pdufa} PDUFA decisions. FastAPI, Railway Postgres, React. Built by Enzo Simier.`,
    },
  },
  a11y: {
    pageSections: 'Page sections',
    projectSections: 'Project sections',
    portraitAlt: 'Portrait of Enzo Simier',
    skipToContent: 'Skip to content',
  },
  nav: {
    items: [
      ['About', '#about'],
      ['Now', '#now'],
      ['Path', '#path'],
      ['Research', '#research'],
      ['Built', '#built'],
      ['Reading', '#reading'],
      ['Cafés', '#cafes'],
    ],
    projectItems: [
      ['Home', '/'],
      ['Overview', '#overview'],
      ['Architecture', '#architecture'],
      ['Deployment', '#deployment'],
    ],
  },
  hero: {
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Email',
  },
  about: {
    eyebrow: 'About',
    title: 'A little background.',
    body: 'I spent ten years in Tahiti, then lived in Grenoble and Rennes. Before economics, I studied pharmacy in Bordeaux for two years. I am now a Canadian permanent resident. Outside work: good food, cafés, and golden retrievers.',
  },
  now: {
    eyebrow: 'Now',
    title: 'Summer 2026',
    body: 'I am finishing my thesis and remain open to opportunities in competition, pricing, and strategy.',
  },
  work: {
    eyebrow: 'Path',
    title: 'Selected experience',
    earlier: 'Earlier experience: HEC Montréal, National Bank Accelerator, and Front Row Ventures.',
    items: [
      {
        company: 'Desjardins',
        role: 'Analyst, Corporate Business Analysis',
        date: 'Apr to Jul 2026',
        details: [
          'I tracked Canada’s retail-banking market and summarized changes in competitors, customers, and market conditions for senior management.',
        ],
      },
      {
        company: 'Competition Bureau',
        role: 'Intern, Mergers Directorate',
        date: 'Summer 2025',
        details: [
          'I worked on merger reviews: defining markets, testing concentration and entry, then preparing decision files under supervision.',
        ],
      },
      {
        company: 'KPMG Canada',
        role: 'Intern, Economic Consulting & Strategy',
        date: 'Summer 2024',
        details: [
          'I conducted impact, feasibility, risk, and sensitivity analyses across port and public-health mandates, then distilled the results into executive summaries.',
        ],
      },
      {
        company: 'HEC Montréal',
        role: 'Teaching Assistant, Macroeconomics',
        date: 'Fall 2023',
        details: [
          'Ran weekly review sessions: growth, business cycles, monetary policy.',
          'Problem sets covered IS-LM, the Phillips curve, and the Solow model.',
        ],
      },
      {
        company: 'National Bank Accelerator',
        role: 'Business Development Intern',
        date: 'Summer 2023',
        details: [
          'Wrote go-to-market plans and KPI frameworks for 10+ startups.',
          'Ran market sizing and competitor scans for the same 10+ startups.',
        ],
      },
      {
        company: 'Front Row Ventures',
        role: 'Business Development Analyst',
        date: '2021 to 2022',
        details: [
          'Designed the Airtable CRM tracking 50+ VC funds.',
          'Screened startups and wrote investment memos.',
        ],
      },
    ],
  },
  education: {
    eyebrow: 'Education',
    items: [
      {
        school: 'HEC Montréal',
        meta: 'M.Sc. Applied Economics · 2024 to 2026',
        text: 'Specialization in industrial organization.',
      },
      {
        school: 'HEC Montréal',
        meta: 'B.B.A. Economics and Finance · 2020 to 2024',
        text: 'Graduated with the Mention d’excellence: top 5% cumulative GPA.',
      },
    ],
  },
  research: {
    eyebrow: 'Research',
    title: 'Volumetric water pricing in Québec',
    description:
      'I estimate what municipalities gain when they price water by volume. The research uses staggered difference-in-differences on municipal and household panels, with Longueuil and Laval as cases. I model cost of service, avoided costs, and net present value under sensitivity scenarios.',
    partners: 'HEC Montréal · Réseau Environnement',
    lens: 'Industrial organization, consumer surplus, cost of service.',
    supervisors: 'Supervisors: Justin Leroux and Jean-Luc Martel.',
  },
  fda: {
    title: 'FDA Catalyst Research',
    stack: 'FastAPI · Railway Postgres · React',
    lede: 'A live calendar for biotech catalysts, built around structured BPIQ records and case-level verification.',
    metricLabels: ['events', 'companies', 'PDUFA decisions', 'readouts'],
    liveCta: 'Live calendar',
    caseCta: 'Case study',
  },
  built: {
    eyebrow: 'Built',
    title: 'Tools I maintain',
    lede: '',
    wiki: {
      name: 'Wiki Project',
      stack: 'Next.js · Railway · Supabase',
      note: 'A public wiki for vocabulary, reading notes, and project fragments.',
      liveCta: 'Open the wiki',
      sourceCta: 'GitHub',
    },
  },
  library: {
    eyebrow: 'Reading',
    title: 'Books and publications',
    lede: 'Books I return to and publications I follow.',
    booksTitle: 'Books',
    books: [
      {
        title: 'Chip War',
        author: 'Chris Miller · 2022',
        note: 'How a handful of firms came to control the world’s chip supply.',
      },
      {
        title: 'Material World',
        author: 'Ed Conway · 2023',
        note: 'The physical inputs behind growth: sand, copper, oil.',
      },
      {
        title: 'Working in Public',
        author: 'Nadia Eghbal · Stripe Press',
        note: 'The clearest book on incentives and maintenance in open source.',
      },
      {
        title: 'Churchill',
        author: 'Andrew Roberts · 2018',
        note: 'Roberts on the decades of work behind Churchill’s judgment.',
      },
      {
        title: 'Caesar',
        author: 'Adrian Goldsworthy · 2006',
        note: 'Coalition-building and timing in the late Republic.',
      },
    ],
    subscriptions: {
      groups: [
        {
          label: 'Magazines',
          items: [
            {
              name: 'Arena Magazine',
              url: 'https://arenamag.com',
              note: 'Max Meyer’s quarterly on tech and capitalism.',
            },
            {
              name: 'Colossus Review',
              url: 'https://joincolossus.com',
              note: 'Patrick O’Shaughnessy’s print journal: long profiles of investors and founders.',
            },
            {
              name: 'Works in Progress',
              url: 'https://worksinprogress.co',
              note: 'Stripe-backed magazine on scientific and economic progress.',
            },
          ],
        },
        {
          label: 'Newsletters',
          items: [
            {
              name: 'Crémieux',
              url: 'https://www.cremieux.xyz',
              note: 'Data-dense essays on economics, statistics, and social science.',
            },
            {
              name: 'Campbell Ramble',
              url: 'https://www.campbellramble.ai',
              note: 'Alexander Campbell, ex-Bridgewater, on markets, macro, and geopolitics.',
            },
          ],
        },
      ],
    },
  },
  // Café DATA lives in /cafes.json at the repo root (fetched at runtime,
  // updated by the add-cafe GitHub Action). Only the labels live here.
  cafes: {
    eyebrow: 'Cafés',
    title: 'Montréal cafés',
    lede: 'A running list.',
  },
  footer: {
    note: '© 2026 Enzo Simier',
  },
  project: {
    kicker: 'FDA Catalyst Research',
    title: 'A biotech catalyst calendar, live on Railway.',
    lede: `The current 90-day view tracks ${fdaSnapshot.events} dated catalysts across ${fdaSnapshot.companies} biotech companies. It converts BPIQ records into events with filters, source links, and TradingView links. ${fdaSnapshot.pdufa} are PDUFA decisions.`,
    openCta: 'Open the live calendar',
    snapshot: {
      title: 'Production snapshot',
      description: `Live 90-day API view as of ${fdaSnapshot.asOf}.`,
    },
    table: {
      headers: ['Metric', 'Count', 'Source', 'Status'],
      rows: [
        { ticker: 'Events', event: fdaSnapshot.events, window: 'BPIQ · 90d', status: 'Live' },
        { ticker: 'Companies', event: fdaSnapshot.companies, window: 'BPIQ · 90d', status: 'Live' },
        { ticker: 'PDUFA decisions', event: fdaSnapshot.pdufa, window: 'BPIQ · 90d', status: 'Live' },
        { ticker: 'Readouts', event: fdaSnapshot.readouts, window: 'BPIQ · 90d', status: 'Live' },
      ],
    },
    architecture: {
      eyebrow: 'Architecture',
      title: 'The stack',
      lede: 'Three pieces run the product: a FastAPI service, Railway Postgres, and a React calendar.',
      cards: [
        ['API', 'A FastAPI service exposes calendar, health, source, catalyst, scanner, watchlist, backtest, and IV-study endpoints.'],
        ['Data', `BPIQ records flow into Railway Postgres. The current 90-day view returns ${fdaSnapshot.events} events.`],
        ['UI', 'The calendar page shows dated catalysts with filters, source links, and TradingView links.'],
      ],
    },
    deployment: {
      eyebrow: 'Deployment',
      title: 'Production status',
      lede: 'The calendar is live at a public Railway URL. The data sits in Railway Postgres.',
      lines: [
        ['Web calendar', 'Live'],
        ['API', 'FastAPI'],
        ['Data store', 'Railway Postgres'],
        ['Data feed', 'BPIQ'],
      ],
      check: {
        title: 'Verification',
        description: `The public API returned ${fdaSnapshot.events} events across ${fdaSnapshot.companies} companies on ${fdaSnapshot.asOf}.`,
      },
    },
  },
}
