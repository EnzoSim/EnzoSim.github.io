// EN copy dictionary. Shape is the contract — strings only, never keys.
// Copy converged through the voice-guide judge pipeline (Thiel-declarative register).
export const en = {
  meta: {
    home: {
      title: 'Enzo Simier · Applied Economics & Industrial Organization',
      description:
        'Enzo Simier, economist in Montréal. Competition work at Desjardins and the Competition Bureau, water pricing at HEC Montréal, and public tools.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description:
        'A live biotech catalyst calendar: 128 events, 101 companies, 23 PDUFA decisions. FastAPI, Railway Postgres, React. Built by Enzo Simier.',
    },
  },
  a11y: {
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
      ['Reading', '#reading'],
      ['Cafés', '#cafes'],
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
    lede: 'French economist in Montréal. I work on competition and pricing, write a thesis on water pricing in Québec, and build small research and data tools.',
    cvLabel: 'CV',
    linkedinLabel: 'LinkedIn',
    emailLabel: 'Email',
  },
  about: {
    eyebrow: 'About',
    title: 'Competition economics',
    lead: 'I work on competition, pricing, and applied economic research.',
    paragraphs: [
      'I’m French. I grew up in Tahiti (ten years), then in Grenoble and Rennes. After two years of pharmacy in Bordeaux I switched to economics and moved to Montréal in 2021 for HEC. I’m a permanent resident now.',
      'At the Competition Bureau, I worked on merger reviews. At KPMG, I worked in economic consulting. At Desjardins, I followed retail-banking competition. I also build research tools in Python, including the thesis model and the FDA calendar below.',
      'Off hours: food, unique cafés, and golden retrievers.',
      'I finish my M.Sc. in Applied Economics at HEC Montréal in Summer 2026, specialized in industrial organization. I am open to opportunities in competition, pricing, and strategy.',
    ],
  },
  work: {
    eyebrow: 'Work',
    title: 'Experience',
    items: [
      {
        company: 'Desjardins',
        role: 'Analyst, Corporate Business Analysis',
        date: 'Apr to Jul 2026',
        details: [
          'I tracked retail-banking competition across Canada: competitors, customer behavior, and market signals.',
          'I wrote recommendations, synthesis notes, and executive presentations for senior management.',
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
          'I built scenario models for both sectors (feasibility, risks, sensitivities) and wrote the executive summaries.',
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
        text: 'Specialization in industrial organization. Thesis on volumetric water pricing, with Réseau Environnement.',
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
    title: 'Volumetric water pricing in Québec.',
    description:
      'I estimate what municipalities gain when they price water by volume. Difference-in-differences with staggered adoption, on municipal and household panel data; Longueuil and Laval are the cases. I model cost of service, avoided costs, and net present value under sensitivity scenarios. With HEC Montréal and Réseau Environnement.',
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
    eyebrow: 'Reading',
    title: 'Books, notes & subscriptions',
    lede: 'Things I read, return to, and maintain.',
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
    wiki: {
      title: 'Public wiki',
      name: 'Wiki Project',
      stack: 'Next.js · Railway · Supabase',
      note: 'I keep a public wiki for vocabulary, reading notes, and project fragments.',
      liveCta: 'Open the wiki',
      sourceCta: 'GitHub',
    },
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
