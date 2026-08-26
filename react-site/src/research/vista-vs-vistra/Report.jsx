import { useEffect, useState } from 'react'
import { ArrowUpRight, Printer } from 'lucide-react'

import {
  CapitalClaimsChart,
  CashBridgeChart,
  Cite,
  CompanyThesis,
  DependencyMatrix,
  EvidenceStamp,
  FigureFrame,
  FinancialDelivery,
  HedgeChart,
  MetricBars,
  ProductionChart,
  ScenarioRange,
  SectionHeader,
  SegmentChart,
  SensitivityHeatmap,
  SnapshotStrip,
  VistaFinancialChart,
  VistaPlanChart,
  VistaSystemDiagram,
  VistraFrameworkChart,
  VistraSystemDiagram,
} from './components'
import {
  decisionRows,
  exposureRows,
  monitoringRows,
  navItems,
  quickFacts,
  sources,
  vista,
  vistra,
} from './report-data'

const mapPath = (name) => `/research/vista-vs-vistra/assets/${name}`

function useReportState() {
  const [active, setActive] = useState('top')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    document.title = 'Vista Energy vs Vistra — Capital & Asset Dossier'
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', 'A compact, source-led comparative equity research dossier on Vista Energy and Vistra.')

    const sections = navItems.map(([, , id]) => document.getElementById(id)).filter(Boolean)
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0)
      const marker = window.scrollY + 150
      const current = [...sections].reverse().find((section) => section.offsetTop <= marker)
      if (current) setActive(current.id)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return { active, progress }
}

function ReportNav({ active, progress }) {
  return (
    <>
      <div className="rr-progress" style={{ transform: `scaleX(${progress})` }} />
      <nav className="rr-topbar" aria-label="Report navigation">
        <a className="rr-wordmark" href="#top">V / V</a>
        <div className="rr-toplinks">
          {navItems.map(([index, label, id]) => <a href={`#${id}`} key={id} aria-current={active === id ? 'location' : undefined}><span>{index}</span>{label}</a>)}
        </div>
        <div className="rr-top-actions"><span>25 AUG 2026</span><span>USD</span><button type="button" onClick={() => window.print()}><Printer size={14} aria-hidden="true" />Print / PDF</button></div>
      </nav>
    </>
  )
}

function ResearchRail({ active }) {
  return (
    <aside className="rr-rail">
      <div>
        <p className="rr-eyebrow">Preliminary initiation</p>
        <strong className="rr-rail-title">VIST / VST</strong>
      </div>
      <ol>
        {navItems.map(([index, label, id]) => <li key={id}><a href={`#${id}`} aria-current={active === id ? 'location' : undefined}><span>{index}</span>{label}</a></li>)}
      </ol>
      <div className="rr-rail-facts">
        <p className="rr-eyebrow">Quick facts</p>
        <QuickFacts title="Vista Energy · VIST" color={vista} rows={quickFacts.vista} />
        <QuickFacts title="Vistra · VST" color={vistra} rows={quickFacts.vistra} />
        <p className="rr-rail-note">All figures as of 25 Aug 2026. USD unless noted. Evidence classifications and sources appear in the appendix.</p>
      </div>
    </aside>
  )
}

function QuickFacts({ title, color, rows }) {
  return <div className="rr-quick-facts"><strong style={{ color }}>{title}</strong><dl>{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></div>
}

function Hero() {
  return (
    <header className="rr-hero" id="top">
      <div className="rr-hero-main">
        <div>
          <p className="rr-eyebrow">Comparative equity research · Capital & asset dossier</p>
          <h1>Two kinds of scarcity</h1>
          <p className="rr-hero-deck"><strong>Vista converts Vaca Muerta resource scarcity into export-linked cash.</strong> Vistra converts constrained U.S. power markets into hedged generation, retail margin and contracted load. These are not peers; they are two different underwrites of physical scarcity.</p>
        </div>
        <div className="rr-relative-calls">
          <article>
            <EvidenceStamp company="vistra" type="Modeled" />
            <h2 style={{ color: vistra }}>Vistra · risk-adjusted preference</h2>
            <p>Visible cash flows, a flexible capital base and embedded large-load optionality make the earnings path easier to underwrite across more outcomes.</p>
          </article>
          <article>
            <EvidenceStamp company="vista" type="Modeled" />
            <h2 style={{ color: vista }}>Vista · wider rerating range</h2>
            <p>Operating leverage and a low entry multiple create more torque, but oil, policy, infrastructure, capex and leverage can move together.</p>
          </article>
        </div>
      </div>
      <div className="rr-meta-strip"><span>25 AUG 2026</span><span>CUT-OFF 4:02 P.M. ET</span><span>USD</span><span>VIST / VST</span><span>PRELIMINARY INITIATION</span></div>
    </header>
  )
}

function SystemsSection() {
  return (
    <section className="rr-section" id="systems" aria-labelledby="systems-title">
      <SectionHeader index="02" eyebrow="Corporate systems" title="From scarce asset to common equity." copy="The operating diagrams are native React structures: physical flow, cash conversion, capital decisions and the gates that can interrupt the path to shareholders." />

      <div className="rr-system-row">
        <FigureFrame company="vista" source={1} kicker="Vista Energy · oil value chain" title="Barrel → cash" subtitle="Operating rail · Q2 cash bridge · explicit underwrite gates" className="rr-system-figure">
          <VistaSystemDiagram />
        </FigureFrame>
        <MapPanel company="vista" title="Asset footprint · Vaca Muerta" subtitle="Neuquén Basin · western Argentina" src={mapPath('map-vaca-muerta.png')} alt="Regional map highlighting Neuquén and the Vaca Muerta core alongside Mendoza, La Pampa and Río Negro." />
      </div>

      <div className="rr-system-row">
        <FigureFrame company="vistra" source={4} kicker="Vistra · power value chain" title="Fleet → contracted cash" subtitle="Branched operating network · hedge overlay · future optionality · capital claims" className="rr-system-figure">
          <VistraSystemDiagram />
        </FigureFrame>
        <MapPanel company="vistra" title="Asset footprint · U.S. power markets" subtitle="ERCOT · PJM · CAISO schematic exposure" src={mapPath('map-us-markets.png')} alt="Map of the continental United States with schematic exposure to ERCOT, PJM and CAISO highlighted." />
      </div>

      <SnapshotStrip />
      <EvidenceKey />
    </section>
  )
}

function MapPanel({ company, title, subtitle, src, alt }) {
  return (
    <figure className="rr-map-panel">
      <figcaption><EvidenceStamp company={company} type="Reported" /><h3>{title}</h3><p>{subtitle}</p></figcaption>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  )
}

function EvidenceKey() {
  return <div className="rr-evidence-key"><div><EvidenceStamp company="vista" type="Reported" /><p>Operating results, production, hedge positions, capital allocation and balance sheet.</p></div><div><EvidenceStamp company="vistra" type="Modeled" /><p>Enterprise values, cash yields, sensitivity ranges and forward scenarios.</p></div><div><EvidenceStamp type="Unresolved" /><p>Policy timing, infrastructure execution, commodity prices and large-load contracting.</p></div></div>
}

function ExecutiveSection() {
  return (
    <section className="rr-section" id="view" aria-labelledby="view-title">
      <SectionHeader index="01" eyebrow="Investment view" title="The cleaner underwrite is not the cheaper stock." copy="Vista offers more rerating torque; Vistra offers the narrower path to disappointment. The choice is proof of cash conversion—not a superficial multiple comparison." />
      <div className="rr-status-strip"><div><span>Research posture</span><strong>Preliminary initiation</strong></div><div><span>Relative view</span><strong>Vistra preferred</strong></div><div><span>Evidence confidence</span><strong>High / medium</strong></div><div><span>Status</span><strong>Watchlist-ready</strong></div></div>
      <div className="rr-table-wrap rr-decision-table">
        <table>
          <thead><tr><th>Decision test</th><th style={{ color: vista }}>Vista Energy · VIST</th><th style={{ color: vistra }}>Vistra · VST</th><th>Relative conclusion</th></tr></thead>
          <tbody>{decisionRows.map((row) => <tr key={row.test}><th>{row.test}</th><td>{row.vista}</td><td>{row.vistra}</td><td><strong>{row.conclusion}</strong></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function ExposureSection() {
  return (
    <section className="rr-section" id="exposure" aria-labelledby="exposure-title">
      <SectionHeader index="03" eyebrow="Exposure map" title="Different assets. Different ways to be wrong." copy="The operating risks barely overlap. Capital funding is the one direct dependency both equities share." />
      <div className="rr-exposure-grid">
        <FigureFrame type="Modeled" kicker="Risk coupling · analyst-classified" title="Direct dependencies by underwrite" subtitle="Filled marks are direct; rings are mitigated or secondary. Classification, not probability." note={<>Analyst synthesis; not company guidance. <Cite>1</Cite><Cite>4</Cite><Cite>8</Cite></>}>
          <DependencyMatrix />
        </FigureFrame>
        <div className="rr-comparison-ledger">
          {exposureRows.map(([dimension, vistaText, vistraText]) => <article key={dimension}><h3>{dimension}</h3><div><span style={{ color: vista }}>Vista</span><p>{vistaText}</p></div><div><span style={{ color: vistra }}>Vistra</span><p>{vistraText}</p></div></article>)}
        </div>
      </div>
    </section>
  )
}

function EconomicsSection() {
  return (
    <section className="rr-section" id="economics" aria-labelledby="economics-title">
      <SectionHeader index="04" eyebrow="Operating economics" title="Two operating models on one research spread." copy="Reported performance, expectations, forward frameworks, cash conversion and falsifiers sit on common rows so the comparison stays dense without becoming a dashboard." />

      <div className="rr-company-summaries">
        <CompanySummary company="vista" ticker="VIST · Vista Energy" title="High-growth barrels at a country and commodity discount." badge="Speculative positive" copy="Strong operating evidence and a low entry multiple; less complete proof that acquisition-funded growth converts into equity cash." facts={[['Price', '$68.37'], ['Q2 output', '156.1k'], ['Lifting cost', '$4.50'], ['2026E EV / EBITDA', '3.5x']]} />
        <CompanySummary company="vistra" ticker="VST · Vistra" title="Scarce power assets with a contracted-cash option." badge="Preferred" copy="A higher multiple buys near-term cash visibility plus several routes to monetize dispatchable generation." facts={[['Price', '$139.02'], ['2026E EBITDA', '$7.2bn'], ['2026 hedged', '100%'], ['2026E EV / EBITDA', '9.6x']]} />
      </div>

      <div className="rr-subsection-head"><div><p className="rr-eyebrow">Market expectations · secondary evidence</p><h3>Quarterly delivery versus consensus.</h3></div><p>Five reported quarters. Open rings are consensus, filled dots are reported; values stay in the readout rather than colliding with marks.</p></div>
      <FinancialDelivery />

      <div className="rr-chart-grid two">
        <FigureFrame company="vista" source={1} kicker="Operating momentum" title="Total production" subtitle="Quarterly average · thousand boe/d. Q2 growth was 20% organic and 12% from consolidated acquired interests." note={<>Source: Vista Q2 2026 results. <Cite>1</Cite></>}><ProductionChart /></FigureFrame>
        <FigureFrame company="vista" source={1} kicker="Operating leverage" title="Revenue and adjusted EBITDA" subtitle="USD millions. Q2 realized oil price of $89.4/bbl helped adjusted EBITDA margin reach about 70%." note={<>Source: Vista Q2 2026 results. <Cite>1</Cite></>}><VistaFinancialChart /></FigureFrame>
      </div>

      <div className="rr-chart-grid two">
        <FigureFrame company="vista" source={2} kicker="Vista · forward framework" title="Production, EBITDA and free-cash-flow plan" subtitle="Company guidance and vision. The 2030 production figure is strategic vision, not formal guidance." note={<>Vista updated 2026–2028 guidance and 2030 vision. <Cite>2</Cite></>}><VistaPlanChart /></FigureFrame>
        <FigureFrame company="vistra" source={4} kicker="Vistra · forward framework" title="Adjusted EBITDA and FCFbG" subtitle="USD billions. The 2027 EBITDA opportunity excludes Cogentrix and announced Meta PPAs." note={<>Vistra FY 2025 and Q2 2026 results. <Cite>4</Cite><Cite>9</Cite></>}><VistraFrameworkChart /></FigureFrame>
      </div>

      <div className="rr-chart-grid three">
        <FigureFrame company="vistra" source={5} kicker="Segment mix" title="Q2 adjusted EBITDA" subtitle="USD millions. Retail stayed stable; generation drove the 2026 step-up." note={<>Source: Q2 2026 presentation. <Cite>5</Cite></>}><SegmentChart /></FigureFrame>
        <FigureFrame company="vistra" source={4} kicker="Cash visibility" title="Expected generation hedged" subtitle="As of August 3, 2026. Hedging reduces spot exposure and defers some price upside." note={<>Source: Vistra Q2 2026 results. <Cite>4</Cite></>}><HedgeChart /></FigureFrame>
        <FigureFrame company="vista" source={1} kicker="Cash conversion" title="Acquisition funding absorbed 80% of Q2 FCF" subtitle="$392m bridges $491m before acquisition payments to $99m reported." note={<>Reported / derived from Vista Q2 2026 results. <Cite>1</Cite></>}><CashBridgeChart /></FigureFrame>
      </div>

      <div className="rr-optionality">
        <div><EvidenceStamp company="vistra" type="Reported" source={7} /><p className="rr-eyebrow">Vistra · portfolio optionality</p><h3>The assets are scarce. The timing is not guaranteed.</h3></div>
        <div><p><strong>Contracted load:</strong> 20-year Meta PPAs cover more than 2,600 MW from three PJM nuclear plants, including 433 MW of planned uprates; AWS agreements are tied to Comanche Peak. <Cite>7</Cite></p><p><strong>Acquisition:</strong> Cogentrix adds about 5,500 MW of gas generation for an announced net purchase price of roughly $4.0bn. The risk is paying today for load that arrives later. <Cite>8</Cite></p></div>
      </div>

      <div className="rr-thesis-grid">
        <CompanyThesis company="Vista" works={['Resource scale and production compounding.', '$4.50/boe lifting-cost cushion.', '208k boe/d and $1.1bn FCF plan by 2028.', 'Low multiple leaves room for rerating.']} breaks={['A lower long-run Brent deck.', 'Argentina policy and fiscal leakage.', '$1.8–$1.9bn annual capex execution.', 'Acquisition funding and leverage.']} />
        <CompanyThesis company="Vistra" works={['Near-term hedge visibility.', 'Nuclear and gas scarcity value.', 'Retail and generation diversification.', 'Contracted-load and buyback optionality.']} breaks={['Load timing and energization delays.', 'Fleet outages or retail weakness.', 'Regulatory cost reallocation.', 'Cogentrix returns below underwriting.']} />
      </div>
    </section>
  )
}

function CompanySummary({ company, ticker, title, badge, copy, facts }) {
  const color = company === 'vista' ? vista : vistra
  return <article className="rr-company-summary"><header><div><p className="rr-ticker" style={{ color }}>{ticker}</p><h3>{title}</h3></div><span style={{ color, borderColor: color }}>{badge}</span></header><p>{copy}</p><dl>{facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></article>
}

function ValuationSection() {
  return (
    <section className="rr-section" id="valuation" aria-labelledby="valuation-title">
      <SectionHeader index="05" eyebrow="Valuation frame" title="Vista is cheaper. Vistra is more financeable." copy="The multiple gap is real but incomplete. Vista needs a lower multiple to work; Vistra's cash is more visible, yet debt, preferred capital, acquisition funding and growth spend precede distributable cash." />

      <div className="rr-valuation-grid">
        <ValuationBridge company="vista" title="Vista valuation bridge" rows={[['Latest price', '$68.37'], ['Q2 weighted-average shares', '108.9m'], ['Diluted-equivalent equity value', '$7.45bn'], ['Net debt', '$3.06bn'], ['Adjusted enterprise value', '$10.51bn', true], ['EV / pro forma LTM EBITDA', '4.3x'], ['EV / 2026E EBITDA', '3.5x']]} note="The market-data feed reports a $6.64bn market cap, below the $7.45bn equity value implied by the company share count. This report uses the company count for internal consistency." />
        <ValuationBridge company="vistra" title="Vistra valuation bridge" rows={[['Latest price', '$139.02'], ['June 30 common shares', '336.0m'], ['Common equity value', '$46.71bn'], ['Debt and financing items', '$20.51bn'], ['Preferred stock', '$2.48bn'], ['Cash', '($0.43bn)'], ['Adjusted enterprise value', '$69.27bn', true], ['EV / 2026E EBITDA', '9.6x'], ['Equity / 2026E FCFbG', '10.8x']]} note="The bridge includes preferred stock and selected financing obligations to avoid understating the capital supporting the assets." />
        <FigureFrame type="Modeled" kicker="Capital stack" title="29% vs 33% of adjusted EV sits ahead of common equity" subtitle="$3.06bn at Vista; $22.56bn at Vistra. Net financing plus preferred stock." note={<>Sources: filings and market inputs. <Cite>1</Cite><Cite>6</Cite><Cite>10</Cite></>}><CapitalClaimsChart /></FigureFrame>
      </div>

      <MetricBars />

      <FigureFrame type="Modeled" kicker="Scenario range" title="Illustrative return from current price" subtitle="Bear / base / bull values use company frameworks with analyst-selected multiples and balance-sheet assumptions." note="Scenarios are analyst assumptions—not company guidance or personalized recommendations.">
        <ScenarioRange />
      </FigureFrame>

      <div className="rr-chart-grid two">
        <FigureFrame company="vista" type="Modeled" kicker="Sensitivity · Vista" title="2027 value per share" subtitle="Rows: adjusted EBITDA. Columns: EV / EBITDA. USD per share; net debt fixed at $2.0bn." note="The matrix isolates EBITDA and multiple; it does not separately model oil, taxes, working capital or share count."><SensitivityHeatmap company="vista" /></FigureFrame>
        <FigureFrame company="vistra" type="Modeled" kicker="Sensitivity · Vistra" title="Value per share from FCFbG" subtitle="Rows: annual adjusted FCFbG. Columns: equity value / FCFbG. USD per share." note="The outlined cell is the base framework. FCFbG is before growth; funding can reduce distributable cash."><SensitivityHeatmap company="vistra" /></FigureFrame>
      </div>
    </section>
  )
}

function ValuationBridge({ company, title, rows, note }) {
  const color = company === 'vista' ? vista : vistra
  return <article className="rr-valuation-bridge"><header><h3 style={{ color }}>{title}</h3><span>USD · 25 AUG 2026</span></header><dl>{rows.map(([term, value, total]) => <div className={total ? 'is-total' : ''} key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl><p>{note}</p></article>
}

function MonitoringSection() {
  return (
    <section className="rr-section" id="monitoring" aria-labelledby="monitoring-title">
      <SectionHeader index="06" eyebrow="Risks & tests" title="The thesis earns its way forward—or gets killed." copy="These are observable proof points. They matter more than repeating a static rating after the operating and financing facts change." />
      <div className="rr-table-wrap rr-monitoring-table">
        <table>
          <thead><tr><th>Company</th><th>KPI or event</th><th>Constructive evidence</th><th>Disconfirming evidence</th></tr></thead>
          <tbody>{monitoringRows.map(([company, kpi, good, bad]) => <tr key={`${company}-${kpi}`}><th><span style={{ color: company === 'Vista' ? vista : vistra }}>{company}</span></th><td><strong>{kpi}</strong></td><td>{good}</td><td>{bad}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="rr-next-grid">
        <article><p className="rr-eyebrow">Recommended next step</p><h3>Wait for proof, then re-underwrite.</h3><ol><li>Refresh scenarios after the next production, cash-conversion and leverage disclosures.</li><li>Tie Cogentrix and large-load funding into a pro forma Vistra cash bridge.</li><li>Add a full forward consensus surface and estimate-revision history before setting target prices.</li></ol></article>
        <article><p className="rr-eyebrow">Open questions</p><h3>What would complete the underwrite?</h3><ul><li>How much Vista FCF survives a materially lower Brent path after capex and fiscal leakage?</li><li>What fully funded return does Vistra earn on Cogentrix, Meta, AWS and Helix?</li><li>How do forward revisions, positioning, ownership and short interest change variant perception?</li><li>Which company preserves capital returns when the scarcity narrative de-rates?</li></ul></article>
      </div>
    </section>
  )
}

function AppendixSection() {
  return (
    <section className="rr-section rr-appendix" id="appendix" aria-labelledby="appendix-title">
      <SectionHeader index="07" eyebrow="Evidence & methods" title="What is known, modeled and still missing." copy="Methodology, evidence posture and the twelve-source register remain attached to the report and expand automatically for print." />
      <details open>
        <summary>Methodology and limitations <span>13 evidence notes · 12 sources</span></summary>
        <div className="rr-method-grid">
          <article><h3>Methodology and limitations</h3><ul><li><strong>Status:</strong> preliminary comparative initiation. No transcript archive, full forward consensus set, revision history or three-statement model was available.</li><li><strong>Market prices:</strong> latest trades near the August 25 close, not a guaranteed official closing record.</li><li><strong>Vista equity value:</strong> current price multiplied by Q2 weighted-average ordinary shares because the market-cap feed conflicts with the reported count.</li><li><strong>Vistra adjusted EV:</strong> common equity plus debt, financing, forward repurchase obligation and preferred stock, less cash.</li><li><strong>Non-GAAP:</strong> adjusted EBITDA, Vista FCF and Vistra FCFbG follow company definitions; FCFbG is before growth.</li><li><strong>Scenarios:</strong> omit several tax, FX, timing, dilution, buyback and acquisition path effects.</li></ul></article>
          <article><h3>Evidence posture</h3><ul><li><strong>High confidence:</strong> company-reported operating figures, published guidance, hedge coverage, transaction terms and capital returns.</li><li><strong>Medium confidence:</strong> normalized enterprise-value bridges and secondary quarterly consensus history.</li><li><strong>Medium-low confidence:</strong> valuation scenarios, which isolate selected drivers without a complete model.</li><li><strong>Unresolved:</strong> Vista market capitalization from the finance feed is below the equity value implied by the Q2 share count.</li><li><strong>Missing:</strong> full forward consensus, revisions, ownership, short interest, factor exposure and a funded-growth cash bridge.</li><li><strong>Implication:</strong> evidence supports a relative preference and watchlist posture—not personalized advice.</li></ul></article>
        </div>
      </details>
      <SourceLedger />
      <p className="rr-disclaimer">This research report is for informational and analytical purposes. It is not personalized investment advice, an offer or a solicitation. Relative views, valuation bridges and scenarios require human review before investment, compliance or publication use.</p>
    </section>
  )
}

function SourceLedger() {
  return (
    <div className="rr-sources">
      <header><h3>Source register</h3><span>Accessed 25–26 AUG 2026</span></header>
      <ol>{sources.map((source) => <li id={`source-${source.id}`} key={source.id}><span>{String(source.id).padStart(2, '0')}</span><div><strong>{source.href ? <a href={source.href} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /></a> : source.title}</strong><p>{source.note}</p></div><em>{source.meta}</em></li>)}</ol>
    </div>
  )
}

export default function Report() {
  const { active, progress } = useReportState()
  return (
    <div className="research-report">
      <a href="#report-main" className="rr-skip-link">Skip to report</a>
      <ReportNav active={active} progress={progress} />
      <div className="rr-shell">
        <ResearchRail active={active} />
        <main id="report-main">
          <Hero />
          <ExecutiveSection />
          <SystemsSection />
          <ExposureSection />
          <EconomicsSection />
          <ValuationSection />
          <MonitoringSection />
          <AppendixSection />
        </main>
      </div>
      <footer className="rr-footer"><span>Enzo Simier · Montréal · 2026 · Comparative equity research</span><nav><a href="/projects/">Projects</a><a href="#top">Back to top</a></nav></footer>
    </div>
  )
}

