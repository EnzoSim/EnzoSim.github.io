import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  delivery,
  dependencyRows,
  scenarioRows,
  vista,
  vistaFinancial,
  vistaPlan,
  vistaProduction,
  vistaSensitivity,
  vistaSystem,
  vistaWash,
  vistra,
  vistraFramework,
  vistraHedge,
  vistraSegments,
  vistraSensitivity,
} from './report-data'

const ink = '#111318'
const muted = '#66707c'
const paleRule = '#e9ecf0'

const axis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: muted, fontSize: 10 },
}

export function Cite({ children }) {
  return <a className="rr-cite" href={`#source-${children}`} aria-label={`Source ${children}`}>{children}</a>
}

export function EvidenceStamp({ company, type = 'Reported', source }) {
  const color = company === 'vista' ? vista : company === 'vistra' ? vistra : '#858b94'
  return (
    <span className="rr-stamp">
      <span className={`rr-mark ${type === 'Modeled' ? 'is-ring' : type === 'Unresolved' ? 'is-dash' : ''}`} style={{ '--mark': color }} />
      <span>{type}{source ? ` · S${String(source).padStart(2, '0')}` : ''}</span>
    </span>
  )
}

export function SectionHeader({ index, eyebrow, title, copy, aside }) {
  return (
    <header className="rr-section-head">
      <div className="rr-section-code">{index}</div>
      <div>
        <p className="rr-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {copy ? <p className="rr-section-copy">{copy}</p> : aside}
    </header>
  )
}

export function FigureFrame({ company, type = 'Reported', source, kicker, title, subtitle, children, note, className = '' }) {
  return (
    <figure className={`rr-figure ${className}`}>
      <figcaption className="rr-figure-head">
        <EvidenceStamp company={company} type={type} source={source} />
        <p className="rr-figure-kicker">{kicker}</p>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </figcaption>
      {children}
      {note ? <p className="rr-source-note">{note}</p> : null}
    </figure>
  )
}

function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rr-tooltip">
      <strong>{label}</strong>
      {payload.filter((item) => item.value != null).map((item) => (
        <span key={item.dataKey}><i style={{ background: item.color }} />{item.name}: {unit === '$bn' ? `$${Number(item.value).toFixed(2)}bn` : `${Number(item.value).toLocaleString()}${unit}`}</span>
      ))}
    </div>
  )
}

const ValueLabel = ({ x, y, width, value, suffix = '' }) => (
  <text x={x + width / 2} y={y - 7} textAnchor="middle" fill={ink} fontSize="10" fontWeight="650">
    {Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}
  </text>
)

export function ProductionChart({ compact = false }) {
  return (
    <div className={compact ? 'rr-chart h-[180px]' : 'rr-chart h-[230px]'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vistaProduction} margin={{ top: 24, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={paleRule} vertical={false} />
          <XAxis dataKey="period" {...axis} />
          <YAxis {...axis} domain={[0, 180]} ticks={[0, 60, 120, 180]} />
          <Tooltip content={<ChartTooltip unit="k" />} cursor={{ fill: vistaWash }} />
          <Bar dataKey="production" name="Production" fill={vista} maxBarSize={54} radius={[1, 1, 0, 0]}>
            <LabelList content={<ValueLabel suffix="k" />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function VistaFinancialChart() {
  return (
    <div className="rr-chart h-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vistaFinancial} margin={{ top: 24, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={paleRule} vertical={false} />
          <XAxis dataKey="period" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f6f7f9' }} />
          <Bar dataKey="revenue" name="Revenue" fill="#b6cfc5" maxBarSize={34} />
          <Bar dataKey="ebitda" name="Adjusted EBITDA" fill={vista} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
      <ChartKey items={[[vista, 'Adjusted EBITDA'], ['#b6cfc5', 'Revenue']]} />
    </div>
  )
}

export function VistaPlanChart() {
  return (
    <div className="rr-plan-chart">
      <div className="rr-plan-slope">
        <div className="rr-chart h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vistaPlan} margin={{ top: 20, right: 22, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={paleRule} vertical={false} />
              <XAxis dataKey="year" {...axis} interval={0} />
              <YAxis {...axis} domain={[120, 270]} ticks={[150, 200, 250]} />
              <Tooltip content={<ChartTooltip unit="k boe/d" />} />
              <Line type="linear" dataKey="production" name="Production" stroke={vista} strokeWidth={2} dot={{ r: 4, fill: vista, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="rr-mini-label">Production · thousand boe/d</p>
      </div>
      <div className="rr-plan-table" role="table" aria-label="Vista forward financial framework">
        <div className="rr-plan-row is-head" role="row"><span>USD bn</span>{vistaPlan.map((d) => <span key={d.year}>{d.year}</span>)}</div>
        <div className="rr-plan-row" role="row"><strong>Adj. EBITDA</strong>{vistaPlan.map((d) => <span key={d.year}>{d.ebitda == null ? '—' : `$${d.ebitda.toFixed(1)}`}</span>)}</div>
        <div className="rr-plan-row" role="row"><strong>Free cash flow</strong>{vistaPlan.map((d) => <span key={d.year}>{d.fcf == null ? '—' : `$${d.fcf.toFixed(1)}`}</span>)}</div>
      </div>
    </div>
  )
}

export function SegmentChart() {
  return (
    <div className="rr-chart h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vistraSegments} layout="vertical" margin={{ top: 8, right: 18, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={paleRule} horizontal={false} />
          <XAxis type="number" {...axis} />
          <YAxis type="category" dataKey="period" width={50} {...axis} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f6f7f9' }} />
          <Bar dataKey="retail" name="Retail" stackId="a" fill="#aec1e7" maxBarSize={28} />
          <Bar dataKey="generation" name="Generation" stackId="a" fill={vistra} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <ChartKey items={[[vistra, 'Generation'], ['#aec1e7', 'Retail']]} />
    </div>
  )
}

export function HedgeChart({ compact = false }) {
  return (
    <div className={compact ? 'rr-chart h-[180px]' : 'rr-chart h-[220px]'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={vistraHedge} margin={{ top: 24, right: 24, left: -14, bottom: 0 }}>
          <CartesianGrid stroke={paleRule} vertical={false} />
          <XAxis dataKey="year" {...axis} />
          <YAxis {...axis} domain={[60, 105]} ticks={[60, 80, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<ChartTooltip unit="%" />} />
          <Line type="linear" dataKey="coverage" name="Hedged" stroke={vistra} strokeWidth={2} dot={{ r: 4.5, fill: vistra, stroke: '#fff', strokeWidth: 1.5 }}>
            <LabelList content={({ x, y, value }) => <text x={x} y={y - 12} textAnchor="middle" fill={ink} fontSize="10" fontWeight="650">{value}%</text>} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function VistraFrameworkChart() {
  return (
    <div className="rr-chart h-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vistraFramework} margin={{ top: 22, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={paleRule} vertical={false} />
          <XAxis dataKey="year" {...axis} interval={0} />
          <YAxis {...axis} domain={[0, 8.5]} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<ChartTooltip unit="$bn" />} cursor={{ fill: '#f6f7f9' }} />
          <Bar dataKey="ebitda" name="Adjusted EBITDA" fill="#9eb6e4" maxBarSize={36} />
          <Bar dataKey="fcfbg" name="Adjusted FCFbG" fill={vistra} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      <ChartKey items={[[vistra, 'Adjusted FCFbG'], ['#9eb6e4', 'Adjusted EBITDA']]} />
    </div>
  )
}

function ChartKey({ items }) {
  return <div className="rr-chart-key">{items.map(([color, label]) => <span key={label}><i style={{ background: color }} />{label}</span>)}</div>
}

function FinancialDumbbell({ company, metric, color }) {
  const rows = delivery[company][metric]
  const [activeIndex, setActiveIndex] = useState(rows.length - 1)
  const values = rows.flatMap((d) => [d.consensus, d.reported])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = Math.max(max - min, 0.5)
  const low = Math.max(0, min - spread * 0.16)
  const high = max + spread * 0.16
  const yFor = (value) => 28 + (1 - (value - low) / (high - low)) * 112
  const selected = rows[activeIndex]
  const money = metric === 'revenue' ? (v) => `$${v.toFixed(2)}bn` : (v) => `$${v.toFixed(2)}`
  const surprise = selected.reported - selected.consensus
  const surpriseCopy = metric === 'revenue'
    ? `${((selected.reported / selected.consensus - 1) * 100).toFixed(0)}%`
    : `${surprise >= 0 ? '+' : '−'}$${Math.abs(surprise).toFixed(2)}`

  return (
    <div className="rr-dumbbell">
      <div className="rr-delivery-readout" aria-live="polite">
        <span>{selected.period} · {metric === 'eps' ? 'EPS' : 'Revenue'}</span>
        <strong>{money(selected.reported)}</strong>
        <small>{money(selected.consensus)} consensus · {surpriseCopy} surprise</small>
      </div>
      <svg viewBox="0 0 520 190" role="img" aria-label={`${delivery[company].name} ${metric} reported versus consensus over five quarters`}>
        {[0, 1, 2].map((i) => {
          const y = 28 + i * 56
          return <line key={i} x1="28" x2="500" y1={y} y2={y} stroke={paleRule} strokeWidth="1" />
        })}
        {rows.map((d, index) => {
          const x = 52 + index * 108
          const yc = yFor(d.consensus)
          const yr = yFor(d.reported)
          const active = activeIndex === index
          return (
            <g key={d.period} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} tabIndex="0" role="button" aria-label={`${d.period}: ${money(d.reported)} reported, ${money(d.consensus)} consensus`}>
              <rect x={x - 30} y="12" width="60" height="148" fill={active ? `${color}0a` : 'transparent'} />
              <line x1={x} x2={x} y1={yc} y2={yr} stroke={color} strokeOpacity=".46" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={x} cy={yc} r="7" fill="#fff" stroke={color} strokeWidth="2" />
              <circle cx={x} cy={yr} r="5" fill={color} stroke="#fff" strokeWidth="1.5" />
              <text x={x} y="178" textAnchor="middle" fill={muted} fontSize="11">{d.period}</text>
            </g>
          )
        })}
      </svg>
      <div className="rr-delivery-key"><span><i className="ring" style={{ '--key': color }} />Consensus</span><span><i style={{ '--key': color }} />Reported</span></div>
    </div>
  )
}

export function FinancialDelivery() {
  return (
    <div className="rr-delivery-grid">
      {['vista', 'vistra'].map((company) => <DeliveryPanel key={company} company={company} />)}
    </div>
  )
}

function DeliveryPanel({ company }) {
  const [metric, setMetric] = useState('eps')
  const companyColor = company === 'vista' ? vista : vistra
  return (
    <article className="rr-delivery-panel">
      <header>
        <div><p className="rr-ticker" style={{ color: companyColor }}>{delivery[company].ticker} · {delivery[company].name}</p><h3>Quarterly result delivery</h3></div>
        <div className="rr-tabs" role="tablist" aria-label={`${delivery[company].name} metric`}>
          {['eps', 'revenue'].map((item) => <button key={item} type="button" role="tab" aria-selected={metric === item} onClick={() => setMetric(item)}>{item === 'eps' ? 'EPS' : 'Revenue'}</button>)}
        </div>
      </header>
      <FinancialDumbbell company={company} metric={metric} color={companyColor} />
      <p className="rr-source-note">Secondary vendor history; definitions are not reconciled to non-GAAP measures. <Cite>{delivery[company].source}</Cite></p>
    </article>
  )
}

export function DependencyMatrix() {
  const mark = (status, company) => {
    if (status === 'none') return <span className="rr-dependency-none">—</span>
    const color = company === 'vista' ? vista : vistra
    return <span className={`rr-dependency-mark ${status === 'secondary' ? 'is-ring' : ''}`} style={{ '--dot': color }} aria-label={status} />
  }
  return (
    <div className="rr-dependency" role="table" aria-label="Direct dependencies by underwrite">
      <div className="rr-dependency-row is-head" role="row"><span>Underwrite dependency</span><span style={{ color: vista }}>Vista</span><span style={{ color: vistra }}>Vistra</span></div>
      {dependencyRows.map((row) => <div className="rr-dependency-row" role="row" key={row.risk}><strong>{row.risk}</strong><span>{mark(row.vista, 'vista')}</span><span>{mark(row.vistra, 'vistra')}</span></div>)}
      <div className="rr-dependency-legend"><span><i style={{ background: ink }} />Direct</span><span><i className="ring" />Mitigated / secondary</span></div>
    </div>
  )
}

export function VistaSystemDiagram() {
  return (
    <div className="rr-system rr-vista-system">
      <div className="rr-system-flow" role="list" aria-label="Vista operating rail">
        {vistaSystem.map((item, index) => (
          <div className="rr-system-node" role="listitem" key={item.label}>
            <div className="rr-node-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{item.label}</b></div>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <small>{item.evidence}</small>
            {index < vistaSystem.length - 1 ? <i aria-hidden="true">→</i> : null}
          </div>
        ))}
      </div>
      <div className="rr-cash-bridge">
        <div><span>FCF excl. Equinor</span><strong>$491m</strong></div>
        <div className="rr-cash-track" aria-label="$392 million Equinor payment left $99 million of reported free cash flow"><i /><b /></div>
        <div><span>Equinor payment</span><strong>−$392m</strong><span>Reported FCF</span><strong style={{ color: vista }}>$99m</strong></div>
      </div>
      <div className="rr-risk-gates"><b>Risk gates</b>{['Oil price', 'Policy / FX', 'Takeaway / export', 'Capex / leverage'].map((gate) => <span key={gate}>{gate}</span>)}</div>
    </div>
  )
}

export function VistraSystemDiagram() {
  return (
    <div className="rr-system rr-vistra-system">
      <div className="rr-hedge-strip">
        <span>Expected generation hedged · Aug. 3</span>
        {vistraHedge.map((d) => <b key={d.year}><small>{d.year}</small>{d.coverage}%</b>)}
      </div>
      <div className="rr-power-network" aria-label="Vistra power value chain">
        <SystemNode eyebrow="Fleet" title="Nuclear + gas" detail="Dispatchable generation" />
        <div className="rr-branch"><SystemNode eyebrow="Wholesale" title="ERCOT + PJM" detail="Energy + capacity" /><SystemNode eyebrow="Retail" title="Customers" detail="Retail margin" /></div>
        <SystemNode eyebrow="Earnings" title="Adjusted EBITDA" detail="$7.2bn · 2026 midpoint" strong />
        <SystemNode eyebrow="Cash" title="FCFbG" detail="$4.325bn · before growth" strong />
      </div>
      <div className="rr-optionality-band"><b>Future optionality · outside 2026 guidance</b><span>Cogentrix · ~5.5GW gas · ~$4.0bn</span><span>Meta PPAs · &gt;2.6GW · 20 years</span></div>
      <div className="rr-capital-ledger"><b>Capital claims + uses</b><span>Growth + acquisitions</span><span>Debt + preferred</span><span>Repurchases + retained cash</span></div>
      <div className="rr-risk-gates"><b>Risk gates</b>{['Fleet availability', 'Power / retail mix', 'Load energization', 'Rules / funding'].map((gate) => <span key={gate}>{gate}</span>)}</div>
    </div>
  )
}

function SystemNode({ eyebrow, title, detail, strong = false }) {
  return <div className={`rr-power-node ${strong ? 'is-strong' : ''}`}><span>{eyebrow}</span><strong>{title}</strong><small>{detail}</small></div>
}

export function MetricBars() {
  const rows = [
    { label: 'Vista', multiple: 3.5, yield: 10.7, color: vista },
    { label: 'Vistra', multiple: 9.6, yield: 9.3, color: vistra },
  ]
  return (
    <div className="rr-metric-grid">
      <MetricBar title="Adjusted EV / 2026E EBITDA" rows={rows} field="multiple" max={11} suffix="x" />
      <MetricBar title="2026E equity cash yield" rows={rows} field="yield" max={12} suffix="%" />
    </div>
  )
}

function MetricBar({ title, rows, field, max, suffix }) {
  return <div className="rr-metric-panel"><h3>{title}</h3>{rows.map((row) => <div className="rr-metric-row" key={row.label}><span>{row.label}</span><div><i style={{ width: `${row[field] / max * 100}%`, background: row.color }} /></div><strong>{row[field]}{suffix}</strong></div>)}</div>
}

export function CapitalClaimsChart() {
  const data = [
    { company: 'Vista', equity: 71, claims: 29, dollars: '$3.06bn' },
    { company: 'Vistra', equity: 67, claims: 33, dollars: '$22.56bn' },
  ]
  return (
    <div className="rr-chart h-[190px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 28, left: 2, bottom: 8 }}>
          <XAxis type="number" domain={[0, 100]} {...axis} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="company" width={48} {...axis} />
          <Tooltip content={<ChartTooltip unit="%" />} cursor={{ fill: '#f6f7f9' }} />
          <Bar dataKey="equity" name="Common equity" stackId="ev" fill="#e5e8ec" maxBarSize={30} />
          <Bar dataKey="claims" name="Claims ahead" stackId="ev" maxBarSize={30}>
            {data.map((d, i) => <Cell key={d.company} fill={i === 0 ? vista : vistra} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="rr-claims-readout"><span><i style={{ background: vista }} />Vista · $3.06bn · 29%</span><span><i style={{ background: vistra }} />Vistra · $22.56bn · 33%</span></div>
    </div>
  )
}

export function ScenarioRange() {
  const min = -40
  const max = 100
  const scale = (value) => `${(value - min) / (max - min) * 100}%`
  return (
    <div className="rr-range-chart">
      <div className="rr-range-axis"><span>−40%</span><span>0%</span><span>+40%</span><span>+80%</span></div>
      {scenarioRows.map((row) => <div className="rr-range-row" key={row.company}>
        <div><strong>{row.company}</strong><small>{row.current} current</small></div>
        <div className="rr-range-track">
          <i className="rr-zero" style={{ left: scale(0) }} />
          <i className="rr-range-span" style={{ left: scale(row.values[0]), width: `calc(${scale(row.values[2])} - ${scale(row.values[0])})`, background: row.color }} />
          {row.values.map((value, index) => <span className="rr-range-point" key={value} style={{ left: scale(value), '--point': row.color }}><b>{['Bear', 'Base', 'Bull'][index]}</b><small>{value > 0 ? '+' : ''}{value}%</small><em>{row.prices[index]}</em></span>)}
        </div>
      </div>)}
    </div>
  )
}

export function SensitivityHeatmap({ company }) {
  const data = company === 'vista' ? vistaSensitivity : vistraSensitivity
  const color = company === 'vista' ? vista : vistra
  const flat = data.values.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)
  return (
    <div className="rr-heatmap-wrap">
      <table className="rr-heatmap">
        <thead><tr><th>{company === 'vista' ? 'EBITDA ↓' : 'FCFbG ↓'}</th>{data.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{data.rows.map((row, r) => <tr key={row}><th>{row}</th>{data.values[r].map((value, c) => {
          const alpha = 0.05 + ((value - min) / (max - min)) * 0.20
          const base = data.base?.[0] === r && data.base?.[1] === c
          return <td key={c} className={base ? 'is-base' : ''} style={{ background: `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` }}>${value.toFixed(1)}</td>
        })}</tr>)}</tbody>
      </table>
    </div>
  )
}

export function SnapshotStrip() {
  return (
    <div className="rr-snapshot-grid">
      <div><span>Vista production</span><strong>156.1k</strong><small>boe/d · Q2 2026</small><i style={{ '--fill': vista, width: '86%' }} /></div>
      <div><span>Entry terms</span><strong>3.5x / 9.6x</strong><small>VIST / VST · 2026E EBITDA</small><i className="dual" /></div>
      <div><span>Vistra hedged</span><strong>100% → 72%</strong><small>2026 → 2028</small><i style={{ '--fill': vistra, width: '72%' }} /></div>
      <div><span>Scenario spread</span><strong>124pp / 84pp</strong><small>Vista / Vistra bull-to-bear</small><i className="neutral" /></div>
    </div>
  )
}

export function CashBridgeChart() {
  return (
    <div className="rr-waterfall" role="img" aria-label="Vista free cash flow fell from 491 million dollars before Equinor payments to 99 million after 392 million of payments">
      <div className="rr-waterfall-scale"><span>$500m</span><span>$250m</span><span>$0</span></div>
      <div className="rr-waterfall-bars">
        <div><span className="bar start" style={{ height: '100%' }} /><strong>$491m</strong><small>FCF before</small></div>
        <div><span className="bar delta" style={{ height: '80%' }} /><strong>−$392m</strong><small>Equinor</small></div>
        <div><span className="bar end" style={{ height: '20%' }} /><strong>$99m</strong><small>Reported FCF</small></div>
      </div>
    </div>
  )
}

export function CompanyThesis({ company, works, breaks }) {
  const color = company === 'Vista' ? vista : vistra
  return (
    <article className="rr-thesis">
      <h3 style={{ color }}>{company} · what works / what breaks</h3>
      <div><div><b>Works</b><ul>{works.map((item) => <li key={item}>{item}</li>)}</ul></div><div><b>Breaks</b><ul>{breaks.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
    </article>
  )
}
