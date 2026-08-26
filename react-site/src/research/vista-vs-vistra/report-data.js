export const vista = '#226653'
export const vistaWash = '#eaf3ef'
export const vistra = '#1e4bb2'
export const vistraWash = '#eef3fc'

export const navItems = [
  ['01', 'View', 'top'],
  ['02', 'Systems', 'systems'],
  ['03', 'Exposure', 'exposure'],
  ['04', 'Economics', 'economics'],
  ['05', 'Valuation', 'valuation'],
  ['06', 'Risk', 'monitoring'],
  ['07', 'Appendix', 'appendix'],
]

export const quickFacts = {
  vista: [
    ['Listing', 'NYSE'],
    ['Price', '$68.37'],
    ['Q2 production', '156.1k boe/d'],
    ['2026E EV / EBITDA', '3.5x'],
  ],
  vistra: [
    ['Listing', 'NYSE'],
    ['Price', '$139.02'],
    ['2026E EBITDA', '$7.2bn'],
    ['2026E EV / EBITDA', '9.6x'],
  ],
}

export const vistaSystem = [
  { label: 'Resource', title: 'Vaca Muerta WI', detail: 'Long-life shale inventory', evidence: 'Qualified' },
  { label: 'Develop', title: 'Drill + complete', detail: '$1.8–1.9bn / year · 2026–28', evidence: 'Guidance' },
  { label: 'Produce', title: 'Lift + tie-in', detail: '156.1k boe/d · Q2 2026', evidence: 'Reported' },
  { label: 'Move', title: 'Gather + export', detail: 'Takeaway remains a dependency', evidence: 'Risk gate' },
  { label: 'Realize', title: 'Brent-linked barrels', detail: '$89.4/bbl · $4.50/boe lifting', evidence: 'Reported' },
  { label: 'Convert', title: 'FCF excl. Equinor', detail: '$491m · Q2 2026', evidence: 'Reported' },
]

export const dependencyRows = [
  { risk: 'Oil price', vista: 'direct', vistra: 'secondary' },
  { risk: 'Argentina policy', vista: 'direct', vistra: 'none' },
  { risk: 'Takeaway / export', vista: 'direct', vistra: 'none' },
  { risk: 'Fleet availability', vista: 'none', vistra: 'direct' },
  { risk: 'Power price', vista: 'none', vistra: 'secondary' },
  { risk: 'Large-load contracting', vista: 'none', vistra: 'direct' },
  { risk: 'Capital funding', vista: 'direct', vistra: 'direct' },
]

export const exposureRows = [
  ['Core exposure', 'Vaca Muerta shale oil, Argentina policy and global crude.', 'U.S. generation, retail, nuclear, gas and large-load demand.'],
  ['Growth engine', 'Inventory, drilling pace, working interests and takeaway.', 'Realizations, capacity, PPAs, acquisitions and buybacks.'],
  ['Cash visibility', 'Moderate: oil-linked revenue with high organic capex.', 'High near term: about 100% of 2026 and 94% of 2027 generation hedged.'],
  ['Shared gate', 'Financing discipline after acquisition funding.', 'Financing discipline before growth and capital returns.'],
]

export const vistaProduction = [
  { period: "Q2 '25", production: 118.0 },
  { period: "Q1 '26", production: 134.7 },
  { period: "Q2 '26", production: 156.1 },
]

export const vistaFinancial = [
  { period: "Q2 '25", revenue: 610.5, ebitda: 404.5 },
  { period: "Q1 '26", revenue: 694.3, ebitda: 451.0 },
  { period: "Q2 '26", revenue: 1154.4, ebitda: 805.2 },
]

export const vistaPlan = [
  { year: '2026E', production: 158, ebitda: 3.0, fcf: 0.8 },
  { year: '2027F', production: 185, ebitda: 3.3, fcf: 0.9 },
  { year: '2028F', production: 208, ebitda: 3.6, fcf: 1.1 },
  { year: '2030 vision', production: 250, ebitda: null, fcf: null },
]

export const vistraSegments = [
  { period: "Q2 '24", retail: 789, generation: 623 },
  { period: "Q2 '25", retail: 756, generation: 593 },
  { period: "Q2 '26", retail: 773, generation: 994 },
]

export const vistraHedge = [
  { year: '2026', coverage: 100 },
  { year: '2027', coverage: 94 },
  { year: '2028', coverage: 72 },
]

export const vistraFramework = [
  { year: '2025A', ebitda: 5.912, fcfbg: 3.592 },
  { year: '2026E', ebitda: 7.2, fcfbg: 4.325 },
  { year: '2027 opportunity', ebitda: 7.6, fcfbg: null },
]

export const delivery = {
  vista: {
    name: 'Vista Energy', ticker: 'VIST', source: 11,
    eps: [
      { period: "Q2 '25", consensus: 2.15, reported: 0.55 },
      { period: "Q3 '25", consensus: 1.24, reported: 1.48 },
      { period: "Q4 '25", consensus: 1.12, reported: 0.49 },
      { period: "Q1 '26", consensus: 1.42, reported: 0.89 },
      { period: "Q2 '26", consensus: 3.15, reported: 2.38 },
    ],
    revenue: [
      { period: "Q2 '25", consensus: 0.57, reported: 0.61 },
      { period: "Q3 '25", consensus: 0.64, reported: 0.71 },
      { period: "Q4 '25", consensus: 0.68, reported: 0.72 },
      { period: "Q1 '26", consensus: 0.71, reported: 0.87 },
      { period: "Q2 '26", consensus: 1.19, reported: 1.23 },
    ],
  },
  vistra: {
    name: 'Vistra', ticker: 'VST', source: 12,
    eps: [
      { period: "Q2 '25", consensus: 1.63, reported: 1.01 },
      { period: "Q3 '25", consensus: 2.21, reported: 2.18 },
      { period: "Q4 '25", consensus: 3.14, reported: 2.87 },
      { period: "Q1 '26", consensus: 0.20, reported: 1.75 },
      { period: "Q2 '26", consensus: 1.61, reported: 0.76 },
    ],
    revenue: [
      { period: "Q2 '25", consensus: 5.12, reported: 4.25 },
      { period: "Q3 '25", consensus: 6.11, reported: 4.58 },
      { period: "Q4 '25", consensus: 6.21, reported: 4.97 },
      { period: "Q1 '26", consensus: 5.22, reported: 5.64 },
      { period: "Q2 '26", consensus: 5.46, reported: 4.02 },
    ],
  },
}

export const decisionRows = [
  {
    test: 'Case',
    vista: 'Wider rerating range. Production growth, $4.50/boe lifting cost and a 3.5x entry multiple create torque.',
    vistra: 'Risk-adjusted preference. Hedging, retail, nuclear and contracted-load options make earnings more visible.',
    conclusion: 'Pay more for the business with fewer simultaneous failure modes.',
  },
  {
    test: 'Must prove',
    vista: 'Post-acquisition free cash flow compounds while takeaway holds and leverage trends toward 1.0x.',
    vistra: 'Scarce generation becomes durable contracted cash without growth funding crowding out returns.',
    conclusion: 'Financing discipline is the shared gate.',
  },
  {
    test: 'Breaks',
    vista: 'Oil, Argentina policy, takeaway, capex and leverage move against equity together.',
    vistra: 'Load delays, outages, regulation or weak acquisition returns erode the cash framework.',
    conclusion: 'Vista has the larger upside and the wider failure surface.',
  },
]

export const scenarioRows = [
  { company: 'Vista Energy', current: '$68.37', color: vista, values: [-32.9, 26.2, 91.3], prices: ['$45.9', '$86.3', '$130.8'] },
  { company: 'Vistra', current: '$139.02', color: vistra, values: [-30.7, 13.1, 52.9], prices: ['$96.4', '$157.2', '$212.5'] },
]

export const vistaSensitivity = {
  rows: ['$2.5bn', '$2.9bn', '$3.3bn', '$3.7bn'],
  columns: ['3.0x', '3.5x', '4.0x', '4.5x'],
  values: [[50.5, 62.0, 73.5, 84.9], [61.5, 74.8, 88.1, 101.5], [72.5, 87.7, 102.8, 118.0], [83.6, 100.5, 117.5, 134.5]],
}

export const vistraSensitivity = {
  rows: ['$3.6bn', '$4.0bn', '$4.4bn', '$4.8bn', '$5.2bn'],
  columns: ['9.0x', '10.5x', '12.0x', '13.5x', '15.0x'],
  values: [[96.4, 112.5, 128.6, 144.7, 160.7], [107.2, 125.0, 142.9, 160.7, 178.6], [117.9, 137.5, 157.2, 176.8, 196.5], [128.6, 150.0, 171.4, 192.9, 214.3], [139.3, 162.5, 185.7, 209.0, 232.2]],
  base: [2, 2],
}

export const monitoringRows = [
  ['Vista', 'Production and tie-ins', 'Credible path toward 158k boe/d in 2026 and 185k in 2027.', 'Repeated misses, slower tie-ins or weaker well productivity.'],
  ['Vista', 'Costs and free cash flow', 'Lifting cost stays controlled; FCF grows after acquisition payments normalize.', 'Capex rises faster than production or FCF stays weak at high realized prices.'],
  ['Vista', 'Leverage', "Net leverage approaches management's 1.0x year-end 2026 objective.", 'Net leverage stays above roughly 1.5x without a temporary explanation.'],
  ['Vista', 'Policy and exports', 'Export access, repatriation and market-oriented policy continue.', 'Capital controls, export intervention or heavier fiscal extraction.'],
  ['Vistra', '2026 guidance', 'EBITDA remains inside $6.8–$7.6bn with cash conversion near framework.', 'A miss caused by operating or retail weakness rather than timing.'],
  ['Vistra', 'Large-load contracts', 'Meta, AWS and Helix progress toward firm energization and economics.', 'Material delays, cancellations or regulatory restrictions.'],
  ['Vistra', 'Cogentrix integration', 'Closing and integration preserve announced return and leverage framework.', 'Cost overruns, delayed synergies or weak acquired-asset performance.'],
  ['Vistra', 'Capital allocation', 'Buybacks continue without compromising investment-grade goals.', 'Growth spending crowds out repurchases while leverage remains elevated.'],
]

export const sources = [
  { id: 1, title: 'Vista Energy · Q2 2026 results', href: 'https://www.sec.gov/Archives/edgar/data/1762506/000119312526306139/d151775dex1.htm', note: 'SEC-filed exhibit: production, realized pricing, adjusted EBITDA, free cash flow, debt, leverage and acquisition payments.', meta: 'Primary · high' },
  { id: 2, title: 'Vista Energy · Updated 2026–2028 guidance and 2030 vision', href: 'https://vista-energy.cdn.prismic.io/vista-energy/agG2D6YofJOwHEBC_Vista-Updateto2026-2028guidanceand2030vision.pdf', note: 'Production, capex, revenue, adjusted EBITDA, free cash flow and oil-price assumptions.', meta: 'Primary · high' },
  { id: 3, title: 'Vista Energy · Investor relations', href: 'https://www.vistaenergy.com/en/investors', note: 'Issuer document index for company filings and presentations.', meta: 'Primary · high' },
  { id: 4, title: 'Vistra · Q2 2026 results', href: 'https://investor.vistracorp.com/2026-08-07-Vistra-Reports-Second-Quarter-2026-Results', note: 'Adjusted EBITDA, guidance, hedge coverage, repurchases, share count and liquidity.', meta: 'Primary · high' },
  { id: 5, title: 'Vistra · Q2 2026 results presentation', href: 'https://investor.vistracorp.com/image/Q2_2026_Results_Presentation_vFinal.pdf', note: 'Segment bridge, 2027 opportunity, capital allocation, fleet and market framing.', meta: 'Primary · high' },
  { id: 6, title: 'Vistra · Q2 2026 Form 10-Q', href: 'https://investor.vistracorp.com/image/VST_10-Q_2026-08-10.pdf', note: 'Debt, cash, preferred stock, common shares and financing obligations.', meta: 'Filed · high' },
  { id: 7, title: 'Vistra and Meta · Nuclear PPAs', href: 'https://investor.vistracorp.com/2026-01-09-Vistra-and-Meta-Announce-Agreements-to-Support-Nuclear-Plants-in-PJM-and-Add-New-Nuclear-Generation-to-the-Grid', note: 'Twenty-year agreements for more than 2,600 MW, including 433 MW of planned uprates.', meta: 'Company claim · high' },
  { id: 8, title: 'Vistra · Cogentrix acquisition', href: 'https://investor.vistracorp.com/2026-01-05-Vistra-Adds-to-its-Industry-Leading-Generation-Portfolio-with-Acquisition-of-Cogentrix', note: 'About 5,500 MW of gas generation and roughly $4.0bn announced net purchase price.', meta: 'Company claim · high' },
  { id: 9, title: 'Vistra · Full-year 2025 results', href: 'https://investor.vistracorp.com/2026-02-26-Vistra-Reports-Fourth-Quarter-and-Full-Year-2025-Results', note: 'Historical adjusted EBITDA, adjusted FCFbG and AWS agreement context.', meta: 'Primary · high' },
  { id: 10, title: 'Market data · OpenAI finance feed', note: 'Retrieved August 25, 2026 near 4:02 p.m. ET. No durable source URL was exposed.', meta: 'Market · medium' },
  { id: 11, title: 'MarketBeat · Vista earnings history', href: 'https://www.marketbeat.com/stocks/NYSE/VIST/earnings/', note: 'Quarterly analyst EPS and revenue consensus versus reported results; underlying history attributed to Fiscal.ai.', meta: 'Secondary · medium' },
  { id: 12, title: 'MarketBeat · Vistra earnings history', href: 'https://www.marketbeat.com/stocks/NYSE/VST/earnings/', note: 'Quarterly analyst EPS and revenue consensus versus reported results; underlying history attributed to Fiscal.ai.', meta: 'Secondary · medium' },
]
