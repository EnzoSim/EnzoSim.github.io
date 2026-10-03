import {
  contactEmail,
  cvUrl,
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
        'Applied economist in Montréal: pricing, demand and decision tools. M.Sc. at HEC Montréal, research on water pricing with Réseau Environnement.',
    },
    reading: {
      title: 'Reading · Enzo Simier',
      description:
        'Books, magazines, and newsletters I return to.',
    },
    projects: {
      title: 'Projects · Enzo Simier',
      description:
        'Applied-economics research, comparative equity work, a biotech catalyst calendar, and a public working library.',
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
    title: 'Enzo Simier',
    name: 'Enzo Simier',
    role: 'Applied economist, Montréal',
    personal:
      'I spent ten years in Tahiti, then lived in Grenoble and Rennes. I have been a Montrealer since 2021 and a Canadian permanent resident since 2025. I studied pharmacy in Bordeaux for two years before turning to economics. I care about good food, cafés, and golden retrievers.',
    // One instrument line under the portrait: where Enzo is based, as data.
    place: {
      city: 'Montréal',
      coords: '45.50°N 73.57°W',
    },
    // What Enzo is doing now, one line each. The last line is the availability recruiters look for.
    now: {
      label: 'Now',
      items: [
        { label: 'Studying', text: 'M.Sc. in applied economics at HEC Montréal, finishing in December 2026.' },
        { label: 'Research', text: 'Water pricing and metering for Réseau Environnement, with the cities of Laval and Longueuil.' },
        { label: 'Open to', text: 'Pricing, demand planning and revenue management roles in Montréal, from airlines to retail.' },
      ],
    },
    aboutTitle: 'About me',
    contacts: [
      { label: 'CV', href: cvUrl, external: false },
      { label: 'LinkedIn', href: linkedinUrl, external: true },
      { label: 'Email', href: `mailto:${contactEmail}`, external: false },
    ],
  },
  projects: {
    title: 'Projects',
    lede: 'Research, markets, and useful public tools.',
    items: [
      {
        slug: 'water-pricing',
        field: 'Public finance',
        title: 'Water pricing',
        context: 'HEC Montréal · Réseau Environnement',
        note: 'Does volumetric pricing change water use, cost recovery, and welfare across Québec municipalities?',
        href: null,
        cta: null,
      },
      {
        slug: 'energy-scarcity',
        field: 'Equity research',
        title: 'Two kinds of scarcity',
        context: 'Vista Energy / Vistra · Dashboard',
        note: 'Shale barrels against scarce power: prices, scenario ranges, value sensitivity and what has to hold for each company.',
        href: '/research/vista-vs-vistra/',
        cta: 'Open the dashboard',
      },
      {
        slug: 'dashboard-design-guide',
        field: 'Design research',
        title: 'Learn dashboard design with me',
        context: 'A study guide · nine chapters · English and French',
        note: 'The people behind the rules, with their faces and what to learn from each; twelve rules with a model to play with for every one; what neighbouring fields have found, charted from published results; and seven dashboards we made, opened up and annotated.',
        href: '/projects/dashboard-design-guide/',
        cta: 'Read the guide',
      },
      {
        slug: 'paper-guide',
        field: 'Design research',
        title: 'Learn Paper with me',
        context: 'A field guide · 52 videos, with a PDF',
        note: 'Paper, the design tool, learned from all 52 videos on its channel: seven chapters, a reference, a searchable video library, and a plan fitted to how I work with Claude Code.',
        href: '/projects/paper-guide/',
        cta: 'Read the guide',
      },
      {
        slug: 'fda-catalyst',
        field: 'Markets',
        title: 'FDA Catalyst',
        context: 'Dashboard · BPIQ data, FastAPI, Railway',
        note: 'FDA decisions and trial readouts for the next 90 days: which ones have an exact date, by stage, by company size, with flags.',
        href: '/fda-catalyst.html',
        cta: 'Open the dashboard',
        liveCta: 'Open the calendar',
      },
      {
        slug: 'wiki-project',
        field: 'Knowledge',
        title: 'Wiki',
        context: 'Next.js, Railway, Supabase',
        note: 'A searchable glossary of terms from economics, geopolitics and reading, sorted by theme.',
        home: false,
        href: wikiLiveUrl,
        sourceHref: wikiRepoUrl,
        cta: 'Open the wiki',
        sourceCta: 'Source',
      },
    ],
  },
  library: {
    title: 'Reading',
    lede: 'Books, magazines, and newsletters I return to.',
    books: [
      {
        slug: 'chip-war',
        title: 'Chip War',
        spineTitle: 'Chip War',
        author: 'Chris Miller',
        spineAuthor: 'Miller',
        year: 2022,
        note: 'Concentrated chip supply, and the bottlenecks that follow.',
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
        note: 'Sand, copper, oil: the physical inputs behind growth.',
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
        note: 'Who pays to keep notes and software public.',
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
        note: 'Judgment built over decades, with incomplete information.',
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
        note: 'Coalitions and timing as a sequence of constraints.',
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
  // Quiet record on the homepage. Roles and degrees come from the CV in this repo.
  experience: {
    title: 'Experience',
    items: [
      {
        role: 'Applied Economics Researcher',
        org: 'Réseau Environnement',
        date: 'Since Jun 2025',
      },
      {
        role: 'Intern, Regulated Industries',
        org: 'Competition Bureau',
        date: 'May–Aug 2025',
      },
      {
        role: 'Intern, Economic Consulting & Strategy',
        org: 'KPMG Canada',
        date: 'May–Aug 2024',
      },
      {
        role: 'Intern, Business Development',
        org: 'National Bank Accelerator',
        date: 'May–Aug 2023',
      },
    ],
  },
  education: {
    title: 'Education',
    items: [
      {
        school: 'HEC Montréal',
        degree: 'M.Sc. Applied Economics',
        date: '2024–2026',
        detail: 'Specialization in industrial organization.',
      },
      {
        school: 'HEC Montréal',
        degree: 'B.B.A. Economics and Finance',
        date: '2020–2024',
        detail: 'Mention d’excellence for a top 5% cumulative GPA.',
      },
    ],
  },
  footer: {
    note: '© 2026 Enzo Simier',
  },
}
