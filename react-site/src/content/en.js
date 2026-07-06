// EN copy dictionary. Shape is the contract — strings only, never keys.
// Copy converged through the voice-guide judge pipeline (Thiel-declarative register).
export const en = {
  meta: {
    home: {
      title: 'Enzo Simier · Applied Economics & Industrial Organization',
      description:
        'Enzo Simier, analyst at Desjardins in Montréal. Merger screening at the Competition Bureau, water pricing at HEC Montréal, and a live biotech catalyst calendar.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description:
        'A live biotech catalyst calendar: 128 events, 101 companies, 23 PDUFA decisions. FastAPI, Railway Postgres, React. Built by Enzo Simier.',
    },
  },
  a11y: {
    themeToLight: 'Use light theme',
    themeToDark: 'Use dark theme',
    langSwitch: 'Passer au français',
    pageSections: 'Page sections',
    projectSections: 'Project sections',
    portraitAlt: 'Portrait of Enzo Simier',
    skipToContent: 'Skip to content',
  },
  nav: {
    items: [
      ['About', '#about'],
      ['Work', '#experience'],
      ['Education', '#education'],
      ['Research', '#research'],
      ['Projects', '#projects'],
      ['Library', '#reading'],
    ],
    projectItems: [
      ['Home', '/'],
      ['Overview', '#overview'],
      ['Architecture', '#architecture'],
      ['Deployment', '#deployment'],
    ],
    email: 'Email',
  },
  hero: {
    kicker: 'Applied Economics · Industrial Organization',
    name: 'Enzo Simier',
    lede: 'Analyst at Desjardins, tracking how Canada’s retail banks compete. I build my own tools with AI agents: MCP servers, data pipelines, a live biotech calendar. My thesis measures what water pricing is worth in Québec.',
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Email',
  },
  about: {
    eyebrow: 'About',
    title: 'Competition economics',
    lead: 'I measure markets.',
    paragraphs: [
      'At the Competition Bureau I screened mergers: market shares, HHIs, diversion ratios. At KPMG I built economic-impact models for ports and public health. At Desjardins I track retail banking across Canada and write recommendations for senior management.',
      'I work AI-native: LLM agents, MCP servers, Python pipelines. The thesis model and the FDA calendar below came out of that stack.',
      'I finish my M.Sc. in Applied Economics at HEC Montréal in Summer 2026, specialized in industrial organization. I am open to opportunities in competition, pricing, and strategy. Email me.',
    ],
  },
  work: {
    eyebrow: 'Work',
    title: 'Experience',
    items: [
      {
        company: 'Desjardins',
        role: 'Analyst, Corporate Business Analysis',
        date: 'Apr 2026 to present',
        details: [
          'I track retail-banking competition across Canada: competitors, customer behavior, market signals.',
          'I write recommendations, synthesis notes, and executive presentations for senior management.',
        ],
      },
      {
        company: 'Competition Bureau',
        role: 'Intern, Mergers Directorate',
        date: 'Summer 2025',
        details: [
          'In merger reviews I defined markets and measured shares, HHIs, entry barriers, diversion ratios.',
          'I wrote memos for Advance Ruling Certificate and No Action Letter files, under supervision.',
        ],
      },
      {
        company: 'KPMG Canada',
        role: 'Intern, Economic Consulting & Strategy',
        date: 'Summer 2024',
        details: [
          'I ran economic impact assessments in the port sector, including Port de Magog, and in public health.',
          'I built scenario models for both sectors — feasibility, risks, sensitivities — and wrote the executive summaries.',
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
    title: 'HEC Montréal',
    items: [
      {
        school: 'HEC Montréal',
        meta: 'M.Sc. Applied Economics · 2024 to 2026',
        text: 'I specialize in industrial organization. My thesis measures what volumetric water pricing is worth in Québec, with Réseau Environnement.',
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
    title: 'What volumetric water pricing is worth in Québec.',
    description:
      'My thesis measures what a municipality gains when it prices water by volume. I use difference-in-differences with staggered adoption, on municipal and household panel data — Longueuil and Laval are the cases. I model cost of service, avoided costs, and net present value under sensitivity scenarios. HEC Montréal and Réseau Environnement back the work.',
    lens: 'Industrial organization, consumer surplus, cost of service.',
    supervisors: 'Supervisors: Justin Leroux and Jean-Luc Martel.',
  },
  fda: {
    eyebrow: 'Projects',
    title: 'FDA Catalyst Research',
    lede: 'I built a live calendar of biotech catalysts. BPIQ records land in Railway Postgres; FastAPI serves them; React renders the page.',
    metricLabels: ['events', 'companies', 'PDUFA decisions', 'readouts'],
    liveCta: 'Live calendar',
    caseCta: 'Case study',
  },
  library: {
    eyebrow: 'Library',
    title: 'Books I return to',
    lede: 'Five books on how industries concentrate, how institutions hold, and how people decide under pressure.',
    books: [
      {
        title: 'Chip War',
        author: 'Chris Miller · 2022',
        note: 'Market power made literal: a handful of firms decide who gets the fastest chips.',
      },
      {
        title: 'Material World',
        author: 'Ed Conway · 2023',
        note: 'Growth is physical before it is financial; sand, copper, and oil set the terms.',
      },
      {
        title: 'Working in Public',
        author: 'Nadia Eghbal · Stripe Press',
        note: 'Open source runs on unpaid maintainers; Eghbal explains why the model holds anyway.',
      },
      {
        title: 'Churchill',
        author: 'Andrew Roberts · 2018',
        note: 'Roberts tracks the decades of office, error, and reading that built one indispensable judgment.',
      },
      {
        title: 'Caesar',
        author: 'Adrian Goldsworthy · 2006',
        note: 'Caesar built a coalition, timed every move, and broke the republic that trained him.',
      },
    ],
    subscriptions: {
      title: 'Subscriptions',
      groups: [
        {
          label: 'Magazines',
          items: [
            {
              name: 'Arena Magazine',
              url: 'https://arenamag.com',
              note: 'Max Meyer’s quarterly on tech, capitalism, and the American project — openly on their side.',
            },
            {
              name: 'Colossus Review',
              url: 'https://joincolossus.com',
              note: 'Patrick O’Shaughnessy’s print journal: long profiles of investors and founders at the top of their craft.',
            },
            {
              name: 'Works in Progress',
              url: 'https://worksinprogress.co',
              note: 'The Stripe-backed magazine of progress studies: what made the world richer, and what could again.',
            },
          ],
        },
        {
          label: 'Substacks',
          items: [
            {
              name: 'Crémieux',
              url: 'https://www.cremieux.xyz',
              note: 'Data-dense essays on economics, statistics, and social science. Every claim arrives with a chart.',
            },
            {
              name: 'Campbell Ramble',
              url: 'https://www.campbellramble.ai',
              note: 'Alexander Campbell, ex-Bridgewater, on markets, macro, and power.',
            },
          ],
        },
      ],
    },
  },
  footer: {
    location: 'Montréal, QC',
    linkedinLabel: 'LinkedIn',
  },
  project: {
    kicker: 'FDA Catalyst Research',
    title: 'A biotech catalyst calendar, live on Railway.',
    lede: 'The calendar tracks dated catalysts for 101 biotech companies. It converts BPIQ records into events with filters, source links, and TradingView links. Right now it holds 128 events; 23 are PDUFA decisions.',
    openCta: 'Open the live calendar',
    snapshot: {
      title: 'Production snapshot',
      description: 'Four metrics from the live production build.',
    },
    table: {
      headers: ['Metric', 'Count', 'Source', 'Status'],
      rows: [
        { ticker: 'Events', event: '128', window: 'BPIQ', status: 'Live' },
        { ticker: 'Companies', event: '101', window: 'BPIQ', status: 'Live' },
        { ticker: 'PDUFA decisions', event: '23', window: 'BPIQ', status: 'Live' },
        { ticker: 'Readouts', event: '100', window: 'BPIQ', status: 'Live' },
      ],
    },
    architecture: {
      eyebrow: 'Architecture',
      title: 'The stack',
      lede: 'Three pieces run the product: a FastAPI service, Railway Postgres, and a React calendar.',
      cards: [
        ['API', 'A FastAPI service exposes calendar, health, source, catalyst, scanner, watchlist, backtest, and IV-study endpoints.'],
        ['Data', 'BPIQ records flow into Railway Postgres. That store holds the 128 events the calendar shows.'],
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
        description: 'The live calendar loads 128 events across 101 companies. Anyone can open it.',
      },
    },
  },
}
