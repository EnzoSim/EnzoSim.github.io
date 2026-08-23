import {
  bookingUrl,
  contactEmail,
  cvUrl,
  fdaLiveUrl,
  fdaSnapshot,
  linkedinUrl,
  wikiLiveUrl,
  wikiRepoUrl,
} from './shared'

// Route-oriented English copy. Public facts have a single canonical location.
export const en = {
  meta: {
    about: {
      title: 'Enzo Simier · Applied Economist',
      description:
        'Applied economist in Montréal. Current question: how volumetric prices change water use, cost recovery, and welfare in Québec.',
    },
    reading: {
      title: 'Reading · Enzo Simier',
      description:
        'Annotations on five books that bear on the work, plus magazines and newsletters.',
    },
    projects: {
      title: 'Projects · Enzo Simier',
      description:
        'Briefs on volumetric water pricing, a biotech catalyst calendar, and a public working library.',
    },
    project: {
      title: 'FDA Catalyst · Enzo Simier',
      description: `A live 90-day biotech catalyst view: ${fdaSnapshot.events} events, ${fdaSnapshot.companies} companies, and ${fdaSnapshot.pdufa} PDUFA decisions.`,
    },
  },
  a11y: {
    primaryNavigation: 'Primary navigation',
    portraitAlt: 'Portrait of Enzo Simier',
    skipToContent: 'Skip to content',
  },
  nav: {
    items: [
      { label: 'About', href: '/' },
      { label: 'Projects', href: '/projects/' },
      { label: 'Reading', href: '/reading/' },
    ],
  },
  home: {
    title:
      'Does volumetric pricing change water use, cost recovery, and welfare across Québec municipalities?',
    name: 'Enzo Simier',
    role: 'Applied economist, Montréal',
    personal:
      'I spent ten years in Tahiti, then lived in Grenoble and Rennes before moving to Montréal. I studied pharmacy in Bordeaux for two years before turning to economics. Outside work, I care about good food, cafés, and golden retrievers.',
    portraitCaption: 'Montréal, 2026',
    now: {
      label: 'Now',
      text: 'Finishing the thesis on volumetric water pricing in Québec. Looking at roles in competition, pricing, and strategy.',
      action: { label: 'Book a call', href: bookingUrl },
    },
    contacts: [
      { label: 'CV', href: cvUrl, external: false },
      { label: 'LinkedIn', href: linkedinUrl, external: true },
      { label: 'Email', href: `mailto:${contactEmail}`, external: false },
    ],
  },
  projects: {
    title: 'Projects',
    lede: 'A pricing thesis, a catalyst calendar, and a working library.',
    items: [
      {
        slug: 'water-pricing',
        field: 'Public finance',
        title: 'Does volumetric pricing change water use, cost recovery, and welfare across Québec municipalities?',
        description:
          'The thesis estimates those effects across municipalities. The setup is industrial organization: consumer surplus and cost of service.',
        context: 'HEC Montréal · Réseau Environnement',
        href: null,
        cta: null,
        presentation: 'lead',
      },
      {
        slug: 'fda-catalyst',
        field: 'Markets',
        title: 'Can dated biotech catalysts be read as one filterable calendar?',
        description:
          'FDA Catalyst converts BPIQ records into dated events with filters, source links, and company-level context. The live view is a 90-day calendar of those events.',
        context: 'FastAPI, Railway Postgres, React',
        href: '/fda-catalyst.html',
        cta: 'View the case study',
        presentation: 'standard',
      },
      {
        slug: 'wiki-project',
        field: 'Knowledge',
        title: 'Can vocabulary, notes, and fragments stay connected enough to reuse?',
        description:
          'A public working library for vocabulary, reading notes, and project fragments. Built so those pieces can be revisited and connected.',
        context: 'Next.js, Railway, Supabase',
        href: wikiLiveUrl,
        sourceHref: wikiRepoUrl,
        cta: 'Open the wiki',
        sourceCta: 'View source',
        presentation: 'offset',
      },
    ],
  },
  library: {
    title: 'Reading',
    lede: 'Notes on five books that bear on the work, then magazines and newsletters.',
    books: [
      {
        slug: 'chip-war',
        title: 'Chip War',
        spineTitle: 'Chip War',
        author: 'Chris Miller',
        spineAuthor: 'Miller',
        year: 2022,
        note: 'Concentrated capacity: a few firms set the constraint for everyone else. Useful when the object of study is a bottleneck, not a market with many substitutes.',
        href: 'https://www.simonandschuster.com/books/Chip-War/Chris-Miller/9781982172015',
        design: {
          spine: '#172a22',
          ink: '#f5f2e8',
          accent: '#aebfb5',
        },
        presentation: { spineWidth: 58, height: 288 },
      },
      {
        slug: 'material-world',
        title: 'Material World',
        spineTitle: 'Material World',
        author: 'Ed Conway',
        spineAuthor: 'Conway',
        year: 2023,
        note: 'Growth still runs through sand, copper, and oil. A reminder that pricing problems start from physical limits, including water.',
        href: 'https://www.penguinrandomhouse.com/books/703268/material-world-by-ed-conway/',
        design: {
          spine: '#754231',
          ink: '#fff6e8',
          accent: '#e1b890',
        },
        presentation: { spineWidth: 62, height: 272 },
      },
      {
        slug: 'working-in-public',
        title: 'Working in Public',
        spineTitle: 'Working in Public',
        author: 'Nadia Eghbal',
        spineAuthor: 'Eghbal',
        year: 2020,
        note: 'Maintenance is the scarce input in open work. The incentive problem is why a public library of notes does not stay public without someone paying the cost.',
        href: 'https://press.stripe.com/working-in-public',
        design: {
          spine: '#aaa18f',
          ink: '#20231f',
          accent: '#486354',
        },
        presentation: { spineWidth: 56, height: 282 },
      },
      {
        slug: 'churchill-walking-with-destiny',
        title: 'Churchill: Walking with Destiny',
        spineTitle: 'Churchill',
        author: 'Andrew Roberts',
        spineAuthor: 'Roberts',
        year: 2018,
        note: 'A long record of judgment under incomplete information. The useful part is the wait, not the speeches.',
        href: 'https://www.penguinrandomhouse.com/books/533764/churchill-by-andrew-roberts/9781101980996/',
        design: {
          spine: '#171713',
          ink: '#f1eadb',
          accent: '#b79d67',
        },
        presentation: { spineWidth: 70, height: 302 },
      },
      {
        slug: 'caesar-life-of-a-colossus',
        title: 'Caesar: Life of a Colossus',
        spineTitle: 'Caesar',
        author: 'Adrian Goldsworthy',
        spineAuthor: 'Goldsworthy',
        year: 2006,
        note: 'Coalition and timing in a system with no idle capacity. Strategy as a sequence of binding constraints, not a single choice.',
        href: 'https://yalebooks.yale.edu/book/9780300126891/caesar/',
        design: {
          spine: '#49231f',
          ink: '#f7efe1',
          accent: '#c7a66c',
        },
        presentation: { spineWidth: 64, height: 290, lean: true },
      },
    ],
    subscriptions: {
      title: 'Publications',
      groups: [
        {
          label: 'Magazines',
          items: [
            {
              name: 'Arena Magazine',
              url: 'https://arenamag.com',
              note: 'Max Meyer’s quarterly on technology and capitalism.',
            },
            {
              name: 'Colossus Review',
              url: 'https://joincolossus.com',
              note: 'Patrick O’Shaughnessy’s print journal with long profiles of investors and founders.',
            },
            {
              name: 'Works in Progress',
              url: 'https://worksinprogress.co',
              note: 'A magazine about scientific and economic progress.',
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
              note: 'Alexander Campbell on markets, macroeconomics, and geopolitics.',
            },
          ],
        },
      ],
    },
  },
  // Retained as a factual source record for the CV. The compact site does not render it.
  education: [
    {
      school: 'HEC Montréal',
      degree: 'M.Sc. Applied Economics',
      date: '2024 to 2026',
      detail: 'Specialization in industrial organization.',
    },
    {
      school: 'HEC Montréal',
      degree: 'B.B.A. Economics and Finance',
      date: '2020 to 2024',
      detail: 'Mention d’excellence for a top 5% cumulative GPA.',
    },
  ],
  footer: {
    note: '© 2026 Enzo Simier',
  },
  project: {
    kicker: 'FDA Catalyst',
    title: 'A biotech catalyst calendar, live on Railway.',
    lede: `The current 90-day view tracks ${fdaSnapshot.events} dated catalysts across ${fdaSnapshot.companies} biotech companies. It converts BPIQ records into events with filters, source links, and TradingView links. ${fdaSnapshot.pdufa} are PDUFA decisions.`,
    openCta: 'Open the live calendar',
    openHref: fdaLiveUrl,
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
      label: 'Architecture',
      title: 'The stack',
      lede: 'Three pieces run the product: a FastAPI service, Railway Postgres, and a React calendar.',
      cards: [
        ['API', 'A FastAPI service exposes calendar, health, source, catalyst, scanner, watchlist, backtest, and IV-study endpoints.'],
        ['Data', `BPIQ records flow into Railway Postgres. The current 90-day view returns ${fdaSnapshot.events} events.`],
        ['UI', 'The calendar page shows dated catalysts with filters, source links, and TradingView links.'],
      ],
    },
    deployment: {
      label: 'Deployment',
      title: 'Production status',
      lede: 'The calendar and its Railway Postgres data store are live.',
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
