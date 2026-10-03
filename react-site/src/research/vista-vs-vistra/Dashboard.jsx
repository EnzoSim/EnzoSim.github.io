// Two kinds of scarcity: the Paper board « Two kinds of scarcity, overview » (page 04), drawn from report-data.js.
// Blue is Vistra, the preferred case; slate is Vista Energy. The switch dims the company that is not in focus.
import { useMemo, useState } from 'react'
import { ArrowIcon, Head, Kpi, Pair, Person, Switch, TopBar } from '../../dashboards/kit'
import { C, useActiveSection } from '../../dashboards/theme'
import * as D from './report-data'

const SECTIONS = [['overview', 'Overview'], ['economics', 'Economics'], ['valuation', 'Valuation'], ['risk', 'Risk']]
const num = (s) => Number(String(s).replace(/[^0-9.]/g, ''))
const VISTA = D.scenarioRows.find((r) => r.company === 'Vista Energy')
const VISTRA = D.scenarioRows.find((r) => r.company === 'Vistra')
const pct = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))}%`

const Mark = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill={C.slate} /><circle cx="20" cy="10" r="8" fill={C.blue} fillOpacity="0.9" />
  </svg>
)

function Range({ focus }) {
  const W = 824, H = 300, lo = -40, hi = 100
  const xs = (v) => 24 + ((v - lo) / (hi - lo)) * (W - 48)
  const rows = [[VISTA, C.slate, C.greyLight, 'vista'], [VISTRA, C.blue, C.range, 'vistra']]
  return (
    <svg className="chart chart-wide" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bear, base and bull value per share as a change from today's price">
      {[-40, -20, 0, 20, 40, 60, 80, 100].map((v) => (
        <g key={v}>
          <line x1={xs(v)} y1="40" x2={xs(v)} y2="236" stroke={v === 0 ? C.axis : C.line} strokeWidth={v === 0 ? 1.6 : 1} />
          <text x={xs(v)} y="266" textAnchor="middle" fontSize="16" fontWeight={v === 0 ? 700 : 400} fill={v === 0 ? C.ink : C.muted}>{v === 0 ? 'Today' : `${v > 0 ? '+' : '−'}${Math.abs(v)}%`}</text>
        </g>
      ))}
      {rows.map(([row, col, track, id], i) => {
        const y = 92 + i * 104, [b, m, u] = row.values
        return (
          <g key={id} className={focus !== 'both' && focus !== id ? 'dim' : ''}>
            <text x={xs(lo)} y={y - 26} fontSize="16" fontWeight="700" fill={C.ink}>{row.company}</text>
            <rect x={xs(b)} y={y - 8} width={xs(u) - xs(b)} height="16" rx="8" fill={track} />
            <circle cx={xs(m)} cy={y} r="11" fill="#fff" stroke={col} strokeWidth="3" /><circle cx={xs(m)} cy={y} r="5" fill={col} />
            <text x={xs(b) - 10} y={y + 6} textAnchor="end" fontSize="16" fill={C.muted}>{row.prices[0]}</text>
            <text x={xs(u) + 10} y={y + 6} fontSize="16" fill={C.muted}>{row.prices[2]}</text>
            <text x={xs(m)} y={y + 36} textAnchor="middle" fontSize="16" fontWeight="700" fill={col}>{row.prices[1]} base</text>
          </g>
        )
      })}
      <g className={focus === 'vistra' ? 'dim' : ''}>
        <rect x={xs(VISTA.values[2]) - 132} y="4" width="132" height="32" rx="8" fill={C.button} />
        <text x={xs(VISTA.values[2]) - 66} y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>Bull {pct(VISTA.values[2])}</text>
      </g>
    </svg>
  )
}

function Output() {
  const W = 600, H = 280, base = 236
  const cols = [...D.vistaProduction.map((p) => [p.period, p.production, true]), ...D.vistaPlan.map((p) => [p.year.replace(' vision', ''), p.production, false])]
  const step = W / cols.length
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vista production, reported and planned, thousand boe a day">
      <line x1="0" y1={base} x2={W} y2={base} stroke={C.axis} strokeWidth="1.2" />
      {cols.map(([label, v, reported], i) => {
        const x = i * step + step / 2 - 24, h = (180 * v) / 250
        return (
          <g key={label}>
            <rect x={x} y={base - h} width="48" height={h} rx="8" fill={reported ? C.slate : C.greyLight} />
            <text x={x + 24} y={base - h - 10} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>{reported ? v.toFixed(1) : v}</text>
            <text x={x + 24} y={base + 28} textAnchor="middle" fontSize="16" fill={C.muted}>{label.replace("'", '’')}</text>
          </g>
        )
      })}
      <line x1={3 * step} y1="40" x2={3 * step} y2={base} stroke={C.reference} strokeWidth="1.5" strokeDasharray="3 4" />
      <text x={3 * step + 8} y="52" fontSize="16" fontWeight="700" fill={C.ink}>Plan</text>
    </svg>
  )
}

function Segments() {
  const W = 600, H = 280, base = 236
  const max = Math.max(...D.vistraSegments.map((s) => s.retail + s.generation))
  const last = D.vistraSegments.at(-1)
  const hg = (v) => (190 * v) / max
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vistra second-quarter EBITDA by segment, million dollars">
      <line x1="0" y1={base} x2={W} y2={base} stroke={C.axis} strokeWidth="1.2" />
      {D.vistraSegments.map((s, i) => {
        const x = 40 + i * 140
        return (
          <g key={s.period}>
            <rect x={x} y={base - hg(s.generation)} width="64" height={hg(s.generation)} rx="8" fill={C.blue} />
            <rect x={x} y={base - hg(s.generation) - hg(s.retail) - 3} width="64" height={hg(s.retail)} rx="8" fill={C.blueLight} />
            <text x={x + 32} y={base - hg(s.generation) - hg(s.retail) - 13} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>{((s.retail + s.generation) / 1000).toFixed(2)} B$</text>
            <text x={x + 32} y={base + 28} textAnchor="middle" fontSize="16" fill={C.muted}>{s.period.replace("'", '’')}</text>
          </g>
        )
      })}
      <text x={440} y={base - hg(last.generation) / 2 + 6} fontSize="16" fontWeight="700" fill={C.blue}>Generation {last.generation}</text>
      <text x={440} y={base - hg(last.generation) - hg(last.retail) / 2} fontSize="16" fontWeight="700" fill={C.muted}>Retail {last.retail}</text>
    </svg>
  )
}

function Heat({ sens, price, company, base }) {
  const shade = (v) => {
    const up = v / price - 1
    if (company === 'vistra') return up >= 0.3 ? [C.blue, '#fff'] : up >= 0.1 ? [C.blueLight, C.ink] : up >= 0 ? [C.wash, C.ink] : [C.greyLight, C.ink]
    return up >= 0.3 ? [C.muted, '#fff'] : up >= 0.1 ? [C.reference, '#fff'] : up >= 0 ? [C.greyLight, C.ink] : ['#e9edf0', C.ink]
  }
  const cols = `88px repeat(${sens.columns.length}, minmax(0, 96px))`
  return (
    <div className="heat">
      <div className="hr" style={{ gridTemplateColumns: cols }}><span />{sens.columns.map((c) => <span key={c} className="muted" style={{ textAlign: 'center' }}>{c}</span>)}</div>
      {sens.rows.map((r, i) => (
        <div key={r} className="hr" style={{ gridTemplateColumns: cols }}>
          <span className="muted">{r}</span>
          {sens.values[i].map((v, j) => {
            const [bg, fg] = shade(v)
            return <span key={j} className={`cell${base && base[0] === i && base[1] === j ? ' base' : ''}`} style={{ background: bg, color: fg }}>{Math.round(v)}</span>
          })}
        </div>
      ))}
    </div>
  )
}

// Revenue against the analysts' consensus, quarter by quarter: bars centred on zero, values beyond ±40% are clipped and labelled.
function Surprise({ focus }) {
  const W = 600, rowH = 30, x0 = W / 2, k = (W / 2 - 70) / 40
  const quarters = D.delivery.vista.revenue.map((q) => q.period.replace("'", '’'))
  const pctOf = (q) => 100 * (q.reported / q.consensus - 1)
  let y = 4
  const marks = []
  quarters.forEach((label, qi) => {
    marks.push(<text key={`q${qi}`} x="0" y={y + rowH + 4} fontSize="16" fill={C.muted}>{label}</text>)
    ;[['vista', C.slate], ['vistra', C.blue]].forEach(([id, col]) => {
      const v = pctOf(D.delivery[id].revenue[qi])
      const w = Math.min(Math.abs(v), 40) * k, x = v >= 0 ? x0 : x0 - w
      marks.push(
        <g key={`${id}${qi}`} className={focus !== 'both' && focus !== id ? 'dim' : ''}>
          <rect x={x} y={y + 4} width={Math.max(w, 3)} height={rowH - 10} rx="6" fill={col} />
          <text x={v >= 0 ? x + w + 8 : x - 8} y={y + rowH - 9} textAnchor={v >= 0 ? 'start' : 'end'} fontSize="15" fontWeight="700" fill={C.ink}>{pct(v)}</text>
        </g>,
      )
      y += rowH
    })
    y += 4
  })
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${y + 8}`} role="img" aria-label="Reported revenue against consensus, per cent, each quarter; Vista in slate, Vistra in blue">
      <line x1={x0} y1="0" x2={x0} y2={y} stroke={C.axis} strokeWidth="1.6" />
      {marks}
    </svg>
  )
}

const SOURCE_GROUPS = [['Filed and primary', (m) => /^(Primary|Filed)/.test(m)], ['Company claims', (m) => /^Company/.test(m)], ['Market and secondary', (m) => /^(Secondary|Market)/.test(m)]]
const MARKS = { direct: 'Direct', secondary: 'Some', none: 'None' }
function Mk({ level, color }) {
  if (level === 'none') return <span className="mark none" aria-label="None" />
  return <span className={`mark${level === 'secondary' ? ' ring' : ''}`} style={{ background: color, color }} aria-label={MARKS[level]} />
}

export default function Dashboard() {
  const [focus, setFocus] = useState('both')
  const active = useActiveSection(useMemo(() => SECTIONS.map(([id]) => id), []))
  const dim = (id) => (focus !== 'both' && focus !== id ? 'dim' : '')
  const VP = num(VISTA.current), XP = num(VISTRA.current)
  const [vb, vbase, vbull] = VISTA.prices.map(num), [xb, xbase, xbull] = VISTRA.prices.map(num)
  const prod = D.vistaProduction, plan = Object.fromEntries(D.vistaPlan.map((p) => [p.year, p.production]))
  const hedge = Object.fromEntries(D.vistraHedge.map((h) => [h.year, h.coverage]))
  const watch = [['vista', '158k', 'boe/d', 'Output, 2026'], ['vista', '1.0×', 'leverage', 'By end of 2026'], ['vista', 'Open', 'exports', 'Access and repatriation'],
    ['vistra', '6.8–7.6', 'B$', 'EBITDA, 2026'], ['vistra', '3', 'large loads', 'Meta, AWS, Helix'], ['vistra', '5.5', 'GW', 'Cogentrix, 4.0 B$']]
  const rev = Object.fromEntries(['vista', 'vistra'].map((id) => [id, D.delivery[id].revenue.map((q) => 100 * (q.reported / q.consensus - 1))]))
  const beatCount = (id) => rev[id].filter((v) => v >= 0).length

  return (
    <div className="board">
      <TopBar mark={<Mark />} brand="Two kinds of scarcity" views={SECTIONS} active={active}>
        <a className="btn" href="/projects/"><ArrowIcon left /> Projects</a>
        <a className="btn dark" href="#sources">Sources</a>
      </TopBar>

      <div className="titlerow">
        <Switch label="Company" options={[['both', 'Both'], ['vista', 'Vista Energy'], ['vistra', 'Vistra']]} value={focus} onChange={setFocus} />
        <div className="meta">
          <span className="chip tall blue">Vistra preferred</span>
          <span className="chip tall soft">Prices of 25 Aug 2026</span>
          <Person />
        </div>
      </div>

      <div className="grid" id="overview">
        <Kpi className={dim('vista')} title="Vista Energy" context="VIST, 3.5×" value={VP.toFixed(2)} unit="US$" valueColor={C.ink}
          parts={[[VP - vb, C.greyLight], [vbull - VP, C.slate]]} left={{ value: `${vbase.toFixed(1)} US$`, label: 'Base case' }} right={{ value: pct(VISTA.values[1]), label: 'To base' }} />
        <Kpi className={dim('vistra')} title="Vistra" context="VST, 9.6×" value={XP.toFixed(2)} unit="US$"
          parts={[[XP - xb, C.greyLight], [xbull - XP, C.blue]]} left={{ value: `${xbase.toFixed(1)} US$`, label: 'Base case', color: C.blue }} right={{ value: pct(VISTRA.values[1]), label: 'To base', color: C.blue }} />
        <Kpi className={dim('vista')} title="Vista output" context="Q2 2026" value={prod.at(-1).production.toFixed(1)} unit="k boe/d" aside={pct(100 * (prod.at(-1).production / prod[0].production - 1))} valueColor={C.ink}
          parts={[[prod.at(-1).production, C.slate], [plan['2030 vision'] - prod.at(-1).production, C.rail]]} left={{ value: plan['2026E'], label: '2026 plan' }} right={{ value: plan['2030 vision'], label: '2030 aim' }} />
        <Kpi className={dim('vistra')} title="Vistra hedged" context="output sold" value={hedge['2027']} unit="% of 2027" aside={`${hedge['2026']}% of 2026`}
          parts={[[hedge['2027'], C.blue], [100 - hedge['2027'], C.rail]]} left={{ value: `${hedge['2026']}%`, label: '2026', color: C.blue }} right={{ value: `${hedge['2028']}%`, label: '2028', color: C.blue }} />

        <section className="card tall s8">
          <Head title="Scenario range" context="bear, base and bull, from today" />
          <div className="scroll-x grow" style={{ justifyContent: 'center' }}><Range focus={focus} /></div>
          <div className="pairs left">
            <span className={dim('vista')}><Pair value={`${pct(VISTA.values[0])} to ${pct(VISTA.values[2])}`} label="Vista range" /></span>
            <span className={dim('vistra')}><Pair value={`${pct(VISTRA.values[0])} to ${pct(VISTRA.values[2])}`} label="Vistra range" color={C.blue} /></span>
          </div>
        </section>
        <section className="card tall s4">
          <Head title="What each depends on" />
          <div className="matrix grow">
            <div className="mr mh"><span /><span className={`c ${dim('vista')}`}>Vista</span><span className={`c blue ${dim('vistra')}`}>Vistra</span></div>
            {D.dependencyRows.map((d) => (
              <div className="mr" key={d.risk}>
                <span>{d.risk}</span>
                <span className={`c ${dim('vista')}`}><Mk level={d.vista} color={C.slate} /></span>
                <span className={`c ${dim('vistra')}`}><Mk level={d.vistra} color={C.blue} /></span>
              </div>
            ))}
          </div>
          <div className="legend"><span><Mk level="direct" color={C.ink} />Direct</span><span><Mk level="secondary" color={C.ink} />Some</span><span><Mk level="none" />None</span></div>
        </section>

        <section className={`card tall s6 ${dim('vista')}`} id="economics">
          <Head title="Vista output" context="k boe a day" />
          <div className="grow" style={{ justifyContent: 'center' }}><Output /></div>
          <div className="pairs left"><Pair value="4.50 $/boe" label="Lifting cost, Q2" /><Pair value="491 M$" label="Free cash flow, Q2" /><Pair value="1.8 to 1.9 B$" label="Capex a year" /></div>
        </section>
        <section className={`card tall s6 ${dim('vistra')}`}>
          <Head title="Vistra EBITDA by segment" context="second quarter, M$" />
          <div className="grow" style={{ justifyContent: 'center' }}><Segments /></div>
          <div className="pairs left">
            <Pair value={`${D.vistraFramework[1].ebitda.toFixed(1)} B$`} label="2026 EBITDA" color={C.blue} />
            <Pair value={`${D.vistraFramework[1].fcfbg.toFixed(1)} B$`} label="2026 FCF before growth" color={C.blue} />
            <Pair value={`${D.vistraFramework[2].ebitda.toFixed(1)} B$`} label="2027 opportunity" />
          </div>
        </section>

        <section className={`card s6 ${dim('vista')}`} id="valuation" style={{ minHeight: 424 }}>
          <Head title="Vista value per share" context="US$, 2027 EBITDA × multiple" />
          <Heat sens={D.vistaSensitivity} price={VP} company="vista" />
          <div className="more" style={{ minHeight: 32 }}><span className="chip bold">Today {VP.toFixed(2)}</span><span className="chip muted">Dark cells: 30% or more above</span></div>
        </section>
        <section className={`card s6 ${dim('vistra')}`} style={{ minHeight: 424 }}>
          <Head title="Vistra value per share" context="US$, FCF before growth × multiple" />
          <Heat sens={D.vistraSensitivity} price={XP} company="vistra" base={D.vistraSensitivity.base} />
          <div className="more" style={{ minHeight: 32 }}><span className="chip bold">Today {XP.toFixed(2)}</span><span className="chip muted">Outlined: base case</span></div>
        </section>

        <section className="card s6" id="risk">
          <Head title="Revenue against forecasts" context="reported vs consensus" />
          <div className="grow" style={{ justifyContent: 'center' }}><Surprise focus={focus} /></div>
          <div className="pairs left">
            <span className={dim('vista')}><Pair value={`${pct(Math.min(...rev.vista))} to ${pct(Math.max(...rev.vista))}`} label={`Vista, ${beatCount('vista')} beats of 5`} /></span>
            <span className={dim('vistra')}><Pair value={`${pct(Math.min(...rev.vistra))} to ${pct(Math.max(...rev.vistra))}`} label={`Vistra, ${beatCount('vistra')} beat${beatCount('vistra') === 1 ? '' : 's'} of 5`} color={C.blue} /></span>
          </div>
        </section>
        <section className="card s6">
          <Head title="What has to hold" context="next four quarters" />
          <div className="tiles grow">
            {watch.map(([id, value, unit, label]) => (
              <div className={`tile${id === 'vistra' ? ' blue' : ''} ${dim(id)}`} key={label}>
                <div>
                  <span className="who">{id === 'vistra' ? 'Vistra' : 'Vista Energy'}</span>
                  <div className="big"><b>{value}</b><span>{unit}</span></div>
                </div>
                <span className="muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card s12" id="sources">
          <Head title="Sources" context={`${D.sources.length} documents, by kind`} />
          <div className="source-groups">
            {SOURCE_GROUPS.map(([title, test]) => {
              const items = D.sources.filter((x) => test(x.meta))
              return (
                <div key={title}>
                  <div className="group-head"><b>{title}</b><b className="blue">{items.length}</b></div>
                  {items.map((x) => {
                    const text = x.title.replace(/ · /g, ', ')
                    return (
                      <div className="source" key={x.id}>
                        <span className="n">{x.id}</span>
                        {x.href ? <a href={x.href} target="_blank" rel="noopener noreferrer">{text}</a> : <span>{text}</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <footer className="footnote">
        <span>Independent research by Enzo Simier. Scenarios are assumptions, not company guidance; nothing here is investment advice.</span>
        <a href="/projects/">All projects</a>
      </footer>
    </div>
  )
}
