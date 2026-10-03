// FDA Catalyst dashboard: the Paper board « FDA Catalyst, calendar » (page 04), drawn from the copied BPIQ calendar.
import { useMemo, useState } from 'react'
import { ArrowIcon, Bars, Head, Kpi, Pair, Person, Rail, Switch, TopBar } from '../kit'
import { C, useActiveSection } from '../theme'
import { csv, dayMonth, DAY, fetchedAt, isMover, money, shortCompany, shortDrug, shortIndication, view } from './model'

const CALENDAR_APP = 'https://fda-catalyst-web-production.up.railway.app/calendar'
const SECTIONS = [['calendar', 'Calendar'], ['decisions', 'Decisions'], ['companies', 'Companies']]
const WINDOWS = [[30, 'Next 30 days'], [60, 'Next 60 days'], [90, 'Next 90 days']]

const Mark = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true">
    <rect x="1" y="3" width="26" height="14" rx="7" fill="none" stroke={C.ink} strokeWidth="2" />
    <path d="M8 4 H14 V16 H8 A6 6 0 0 1 8 4 Z" fill={C.blue} />
  </svg>
)

function WeekDots({ v }) {
  const W = 584, H = 336, x0 = 16, base = 280
  const step = (W - x0 - 16) / v.weeks.length
  const tallest = Math.max(1, ...v.weeks.map((w) => w.items.length))
  const gap = Math.min(34, 200 / tallest)
  const r = Math.min(13, gap / 2.6, step / 3)
  const every = v.weeks.length > 8 ? 2 : 1
  const todayX = x0 + step * ((v.today - v.monday) / (7 * DAY))
  let busiest = -1, most = 1
  v.weeks.forEach((w, i) => { const d = w.items.filter(Boolean).length; if (d > most) { most = d; busiest = i } })
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dated catalysts by week, one dot each; FDA decisions in blue">
      <line x1={x0} y1={base + 18} x2={W - 8} y2={base + 18} stroke={C.axis} strokeWidth="1.2" />
      {v.weeks.map((w, i) => {
        const cx = x0 + step * (i + 0.5)
        return (
          <g key={w.start}>
            {w.items.map((isDecision, j) => <circle key={j} cx={cx} cy={base - j * gap} r={r} fill={isDecision ? C.blue : C.slate} />)}
            {i % every === 0 ? <text x={cx} y={base + 46} textAnchor="middle" fontSize="16" fill={C.muted}>{dayMonth(w.start)}</text> : null}
          </g>
        )
      })}
      <line x1={todayX} y1="40" x2={todayX} y2={base + 18} stroke={C.slate} strokeWidth="1.5" strokeDasharray="3 4" />
      <text x={todayX + 8} y="52" fontSize="16" fontWeight="700" fill={C.ink}>Today</text>
      {busiest >= 0 ? (() => {
        const bx = x0 + step * (busiest + 0.5), by = base - (v.weeks[busiest].items.length - 1) * gap - 30
        return <g><rect x={bx - 62} y={by - 26} width="124" height="32" rx="8" fill={C.wash} /><text x={bx} y={by - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.blue}>{most} decisions</text></g>
      })() : null}
    </svg>
  )
}

function CompanySizes({ v }) {
  const W = 824, H = 300, base = 214, colw = 96, gapw = (W - 6 * colw) / 6
  const max = Math.max(1, ...v.sizes.map((s) => s.all))
  const small = v.sizes[0].all + v.sizes[1].all
  return (
    <svg className="chart chart-wide" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Companies by market cap; companies with an FDA decision counted in blue">
      <line x1="0" y1={base} x2={W} y2={base} stroke={C.axis} strokeWidth="1.2" />
      {v.sizes.map((s) => {
        const x = gapw / 2 + s.i * (colw + gapw), h = (150 * s.all) / max
        return (
          <g key={s.label}>
            <rect x={x} y={base - h} width={colw} height={h} rx="8" fill={C.greyMid} />
            <text x={x + colw / 2} y={base - h - 10} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>{s.all}</text>
            <text x={x + colw / 2} y={base + 30} textAnchor="middle" fontSize="16" fill={C.muted}>{s.label}</text>
            <rect x={x + colw / 2 - 22} y={base + 44} width="44" height="28" rx="14" fill={C.wash} />
            <text x={x + colw / 2} y={base + 64} textAnchor="middle" fontSize="16" fontWeight="700" fill={C.blue}>{s.decisions}</text>
          </g>
        )
      })}
      <rect x={W - 200} y="4" width="200" height="32" rx="8" fill={C.button} />
      <text x={W - 100} y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.ink}>{small} under 1 B$</text>
    </svg>
  )
}

// One countdown line per FDA decision: from today to its date, dot sized by company value, ring on expected movers.
function Runway({ rows, days, today }) {
  const W = 1272, L = 344, rowH = 52, top = 44
  const xr = (d) => L + 16 + (d / days) * (W - L - 156)
  const step = days <= 30 ? 7 : 14
  const ticks = []
  for (let k = 0; k <= days; k += step) ticks.push(k)
  const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
  const H = top + rows.length * rowH + 4
  return (
    <svg className="chart runway" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Days to each FDA decision">
      <line x1={xr(0)} y1="36" x2={xr(days)} y2="36" stroke={C.axis} strokeWidth="1.2" />
      {ticks.map((k) => (
        <g key={k}>
          <line x1={xr(k)} y1="28" x2={xr(k)} y2="36" stroke={C.axis} strokeWidth="1.2" />
          <text x={xr(k) - (k ? 0 : 2)} y="18" textAnchor={k ? 'middle' : 'start'} fontSize="16" fontWeight={k ? 400 : 700} fill={k ? C.muted : C.ink}>{k ? dayMonth(today + k * DAY) : 'Today'}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = top + i * rowH, cy = y + 26
        const share = r.cap ? Math.max(0, Math.min(1, (Math.log10(r.cap / 1e9) + 2) / 5)) : 0
        const rad = 5 + 7 * share
        const x = xr(r.days)
        return (
          <g key={`${r.ticker}-${r.date}-${r.drug}`}>
            <title>{`${r.company}: ${r.drug}, ${r.indication}`}</title>
            <text x="0" y={y + 20} fontSize="16" fontWeight="700" fill={C.ink}>{clip(shortCompany(r.company), 32)}</text>
            <text x="0" y={y + 40} fontSize="14" fill={C.muted}>{clip(`${shortDrug(r.drug)} · ${shortIndication(r.indication)}`, 44)}</text>
            <line x1={xr(0)} y1={cy} x2={x} y2={cy} stroke={C.rail} strokeWidth="6" strokeLinecap="round" strokeDasharray={r.exact ? undefined : '2 10'} />
            <circle cx={x} cy={cy} r={rad} fill={r.exact ? C.blue : '#fff'} stroke={r.exact ? 'none' : C.blue} strokeWidth="2" />
            {isMover(r) ? <circle cx={x} cy={cy} r={rad + 4} fill="none" stroke={C.ink} strokeWidth="2" /> : null}
            <text x={x + rad + 12} y={cy + 6} fontSize="16" fontWeight="700" fill={C.ink}>{r.exact ? `${dayMonth(r.ms)} · ${r.days} d` : '2026, no exact date'}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Dashboard() {
  const [days, setDays] = useState(90)
  const [all, setAll] = useState(false)
  const v = useMemo(() => view(days), [days])
  const active = useActiveSection(useMemo(() => SECTIONS.map(([id]) => id), []))
  const n = v.rows.length
  const pct = (a) => (n ? `${Math.round((100 * a) / n)}%` : '–')
  const datedDecisions = v.decisions.filter((r) => r.exact)
  const ordered = [...datedDecisions, ...v.decisions.filter((r) => !r.exact)]
  const shown = all ? ordered : datedDecisions.slice(0, 12)

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv(v)], { type: 'text/csv' }))
    a.download = `fda-catalysts-next-${days}-days.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  return (
    <div className="board">
      <TopBar mark={<Mark />} brand="FDA Catalyst" views={SECTIONS} active={active}>
        <a className="btn" href={CALENDAR_APP} target="_blank" rel="noopener noreferrer">Calendar <ArrowIcon /></a>
        <button className="btn dark" type="button" onClick={download}>Export</button>
      </TopBar>

      <div className="titlerow">
        <Switch label="Window" options={WINDOWS} value={days} onChange={(d) => { setDays(d); setAll(false) }} />
        <div className="meta">
          <span className="chip tall soft">BPIQ data of {dayMonth(Date.UTC(fetchedAt.getUTCFullYear(), fetchedAt.getUTCMonth(), fetchedAt.getUTCDate()))} {fetchedAt.getUTCFullYear()}</span>
          <Person />
        </div>
      </div>

      <div className="grid" id="calendar">
        <Kpi title="Catalysts" context={`next ${days} days`} value={n} unit="events" aside={`${v.companies.size} companies`}
          parts={[[v.decisions.length, C.blue], [v.readouts.length, C.slate], [v.meetings.length, C.greyMid]]}
          left={{ value: v.decisions.length, label: 'FDA decisions', color: C.blue }} right={{ value: v.readouts.length, label: 'Trial readouts' }} />
        <Kpi title="Next decision" context={v.next ? dayMonth(v.next.ms) : '–'} value={v.next ? v.next.days : '–'} unit={v.next?.days === 1 ? 'day' : 'days'}
          aside={v.next ? shortCompany(v.next.company).split(' ')[0] : ''} parts={v.next ? [[v.next.days + 0.5, C.blue], [Math.max(0, days - v.next.days), C.rail]] : [[1, C.rail]]}
          left={{ value: v.next ? shortDrug(v.next.drug) : '–', label: v.next ? shortIndication(v.next.indication) : 'None in this window' }}
          right={{ value: v.next ? money(v.next.cap) : '–', label: 'Market cap' }} />
        <Kpi title="Exact date" context="to the day" value={v.exact} unit={`of ${n}`} aside={pct(v.exact)} valueColor={C.ink}
          parts={[[v.exact, C.slate], [n - v.exact, C.greyLight]]}
          left={{ value: `${v.decisionsExact} of ${v.decisions.length}`, label: 'Decisions', color: C.blue }} right={{ value: `${v.readoutsExact} of ${v.readouts.length}`, label: 'Readouts' }} />
        <Kpi title="Sources" context="linked" value={v.sourced} unit={`of ${n}`} aside={pct(v.sourced)} valueColor={C.ink}
          parts={[[v.sourced, C.slate], [n - v.sourced, C.greyLight]]}
          left={{ value: v.sourced, label: 'With a source' }} right={{ value: n - v.sourced, label: 'To find' }} />

        <section className="card tall s8">
          <Head title="Dated catalysts by week" context="one dot each" />
          <div className="grow" style={{ flexDirection: 'row', gap: 24, alignItems: 'stretch' }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}><WeekDots v={v} /></div>
            <div style={{ width: 216, flex: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, paddingLeft: 24, borderLeft: `1px solid ${C.line}` }}>
              <div>
                <div style={{ fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em' }}>{v.yearEnd.decisions + v.yearEnd.readouts}</div>
                <b>No exact date</b>
                <div className="muted">placed on 31 Dec</div>
              </div>
              <Rail parts={[[v.yearEnd.decisions, C.blue], [v.yearEnd.readouts, C.slate]]} />
              <div className="pairs" style={{ marginTop: 0 }}><Pair value={v.yearEnd.decisions} label="Decisions" color={C.blue} /><Pair value={v.yearEnd.readouts} label="Readouts" end /></div>
            </div>
          </div>
        </section>
        <section className="card tall s4">
          <Head title="By stage" context="events" />
          <Bars rows={v.stageRows} highlight="FDA decision" />
        </section>

        <section className="card s12" id="decisions" style={{ gap: 8 }}>
          <Head title="FDA decisions" context="days to each decision, dot sized by company" />
          <div className="scroll-x">
            {shown.length ? <Runway rows={shown} days={days} today={v.today} /> : <div className="empty">No FDA decision in this window</div>}
          </div>
          <div className="more">
            {ordered.length > shown.length || all ? <button type="button" className="chip blue" onClick={() => setAll(!all)}>{all ? 'Show the first 12' : `Show all ${ordered.length}`}</button> : null}
            {v.yearEnd.decisions ? <span className="chip muted">{v.yearEnd.decisions} dated only to 2026</span> : null}
            <span className="legend"><span><span className="mark ring" style={{ color: C.ink }} />Expected to move the stock</span></span>
          </div>
        </section>

        <section className="card tall s8" id="companies">
          <Head title="Company size" context={`${v.companies.size} companies, market cap in B$`} />
          <div className="scroll-x grow" style={{ justifyContent: 'center' }}><CompanySizes v={v} /></div>
          <div className="pairs left">
            <Pair value={[...v.companies.values()].filter((c) => c.decision).length} label="With an FDA decision, in blue" color={C.blue} />
            <Pair value={[...v.companies.values()].filter((c) => (c.cap ?? 0) >= 1e10).length} label="Worth 10 B$ or more" />
          </div>
        </section>
        <section className="card tall s4">
          <Head title="Flags" context="events" />
          <Bars rows={v.flags} />
        </section>
      </div>

      <footer className="footnote">
        <span>Public data via BPIQ, copied from the FDA Catalyst API. Dates can slip; nothing here is investment advice.</span>
        <a href="/projects/">All projects</a>
      </footer>
    </div>
  )
}
