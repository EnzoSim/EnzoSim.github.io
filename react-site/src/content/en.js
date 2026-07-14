import caesarCover from '../assets/books/caesar-life-of-a-colossus.webp'
import chipWarCover from '../assets/books/chip-war.webp'
import churchillCover from '../assets/books/churchill-walking-with-destiny.webp'
import materialWorldCover from '../assets/books/material-world.webp'
import workingInPublicCover from '../assets/books/working-in-public.webp'
import {
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
    home: {
      title: 'Enzo Simier · Applied Economist',
      description:
        'Enzo Simier is an applied economist in Montréal working across competition, pricing, strategy, and public-interest research.',
    },
    work: {
      title: 'Work · Enzo Simier',
      description:
        'Research and products by Enzo Simier, including water pricing in Québec, FDA Catalyst, and Wiki Project.',
    },
    reading: {
      title: 'Reading · Enzo Simier',
      description:
        'Five books Enzo Simier returns to, plus a short list of magazines and newsletters.',
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
      { label: 'Home', href: '/' },
      { label: 'Work', href: '/work/' },
      { label: 'Reading', href: '/reading/' },
    ],
  },
  home: {
    title: 'Enzo Simier',
    introduction:
      'Applied economist in Montréal, interested in competition, pricing, strategy, and the practical tools that make complex decisions easier to examine.',
    about:
      'I spent ten years in Tahiti, then lived in Grenoble and Rennes before moving to Montréal. I studied pharmacy in Bordeaux for two years before turning to economics. Outside work, I care about good food, cafés, and golden retrievers.',
    portraitCaption: 'Montréal, 2026',
    now: {
      label: 'Now',
      text: 'Finishing my thesis on volumetric water pricing in Québec and exploring roles in competition, pricing, and strategy.',
    },
    contacts: [
      { label: 'CV', href: cvUrl, external: false },
      { label: 'LinkedIn', href: linkedinUrl, external: true },
      { label: 'Email', href: `mailto:${contactEmail}`, external: false },
    ],
  },
  work: {
    title: 'Work',
    lede: 'Research, products, and recent experience.',
    featured: [
      {
        slug: 'water-pricing',
        kind: 'Research',
        title: 'Volumetric water pricing in Québec',
        description:
          'My thesis estimates what municipalities gain when they price water by volume. It combines staggered difference-in-differences with municipal and household panels, then tests cost of service, avoided costs, and net present value across scenarios for Longueuil and Laval.',
        context: 'HEC Montréal · Réseau Environnement',
        detail: 'Industrial organization · Consumer surplus · Cost of service',
        href: null,
        cta: null,
        presentation: 'lead',
      },
      {
        slug: 'fda-catalyst',
        kind: 'Product',
        title: 'FDA Catalyst',
        description:
          'A live biotech catalyst calendar that turns structured records into dated events with filters, source links, and company-level context.',
        context: 'FastAPI · Railway Postgres · React',
        detail: `${fdaSnapshot.events} events across ${fdaSnapshot.companies} companies in the current 90-day view.`,
        href: '/fda-catalyst.html',
        cta: 'View the case study',
        presentation: 'standard',
      },
      {
        slug: 'wiki-project',
        kind: 'Product',
        title: 'Wiki Project',
        description:
          'A public working library for vocabulary, reading notes, and project fragments, built to make ideas easier to revisit and connect.',
        context: 'Next.js · Railway · Supabase',
        detail: 'A living system for notes that are useful before they become polished essays.',
        href: wikiLiveUrl,
        sourceHref: wikiRepoUrl,
        cta: 'Open the wiki',
        sourceCta: 'View source',
        presentation: 'offset',
      },
    ],
    experience: {
      title: 'Selected experience',
      items: [
        {
          company: 'Desjardins',
          role: 'Analyst, Corporate Business Analysis',
          date: 'Apr to Jul 2026',
          summary: 'Tracked Canada’s retail-banking market and translated competitive changes for senior management.',
        },
        {
          company: 'Competition Bureau',
          role: 'Intern, Mergers Directorate',
          date: 'Summer 2025',
          summary: 'Supported merger reviews through market definition, concentration, entry, and decision-file analysis.',
        },
        {
          company: 'KPMG Canada',
          role: 'Intern, Economic Consulting & Strategy',
          date: 'Summer 2024',
          summary: 'Built impact, feasibility, risk, and sensitivity analyses for port and public-health mandates.',
        },
      ],
    },
  },
  library: {
    title: 'Reading',
    lede: 'Five books I return to, followed by a short list of publications I read.',
    books: [
      {
        slug: 'chip-war',
        title: 'Chip War',
        author: 'Chris Miller',
        year: 2022,
        note: 'How a handful of firms came to control the world’s chip supply.',
        href: 'https://www.simonandschuster.com/books/Chip-War/Chris-Miller/9781982172015',
        cover: {
          src: chipWarCover,
          width: 788,
          height: 1200,
          alt: 'Cover of Chip War by Chris Miller',
          sourceUrl: 'https://www.simonandschuster.com/books/Chip-War/Chris-Miller/9781982172015',
        },
        presentation: { height: 296, depth: 24, restAngle: -3.5 },
      },
      {
        slug: 'material-world',
        title: 'Material World',
        author: 'Ed Conway',
        year: 2023,
        note: 'The physical inputs behind growth: sand, copper, and oil.',
        href: 'https://www.penguinrandomhouse.com/books/703268/material-world-by-ed-conway/',
        cover: {
          src: materialWorldCover,
          width: 304,
          height: 450,
          alt: 'Cover of Material World by Ed Conway',
          sourceUrl: 'https://www.penguinrandomhouse.com/books/703268/material-world-by-ed-conway/',
        },
        presentation: { height: 282, depth: 21, restAngle: 2.5 },
      },
      {
        slug: 'working-in-public',
        title: 'Working in Public',
        author: 'Nadia Eghbal',
        year: 2020,
        note: 'The clearest book on incentives and maintenance in open source.',
        href: 'https://press.stripe.com/working-in-public',
        cover: {
          src: workingInPublicCover,
          width: 600,
          height: 934,
          alt: 'Cover of Working in Public by Nadia Eghbal',
          sourceUrl: 'https://press.stripe.com/working-in-public',
        },
        presentation: { height: 288, depth: 22, restAngle: -1 },
      },
      {
        slug: 'churchill-walking-with-destiny',
        title: 'Churchill: Walking with Destiny',
        author: 'Andrew Roberts',
        year: 2018,
        note: 'The decades of work behind Churchill’s judgment.',
        href: 'https://www.penguinrandomhouse.com/books/533764/churchill-by-andrew-roberts/9781101980996/',
        cover: {
          src: churchillCover,
          width: 296,
          height: 450,
          alt: 'Cover of Churchill: Walking with Destiny by Andrew Roberts',
          sourceUrl: 'https://www.penguinrandomhouse.com/books/533764/churchill-by-andrew-roberts/9781101980996/',
        },
        presentation: { height: 306, depth: 27, restAngle: 3.75 },
      },
      {
        slug: 'caesar-life-of-a-colossus',
        title: 'Caesar: Life of a Colossus',
        author: 'Adrian Goldsworthy',
        year: 2006,
        note: 'Coalition-building and timing in the late Republic.',
        href: 'https://yalebooks.yale.edu/book/9780300126891/caesar/',
        cover: {
          src: caesarCover,
          width: 794,
          height: 1200,
          alt: 'Cover of Caesar: Life of a Colossus by Adrian Goldsworthy',
          sourceUrl: 'https://yalebooks.yale.edu/book/9780300126891/caesar/',
        },
        presentation: { height: 292, depth: 25, restAngle: -2.25 },
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
