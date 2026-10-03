// Shared pieces of the dashboard boards: top bar, switch, cards, figure cards, rails and pairs.
import portrait from '../assets/tremblant-portrait-768.webp'
import { C } from './theme'


export function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 2.5H11.5L15.5 6.5V17.5H4.5V2.5H5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.5 2.5V6.5H15.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowIcon({ left = false }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d={left ? 'M11 4L6 9L11 14' : 'M6 12L12 6M7 6H12V11'} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TopBar({ mark, brand, views, active, children }) {
  return (
    <header className="topbar">
      <a className="brand" href="/">{mark}<span>{brand}</span></a>
      <nav className="views" aria-label="Sections">
        {views.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id}>{label}</a>)}
      </nav>
      <div className="actions">{children}</div>
    </header>
  )
}

export function Switch({ options, value, onChange, label }) {
  return (
    <div className="switch" role="group" aria-label={label}>
      {options.map(([v, text]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{text}</button>)}
    </div>
  )
}

export function Person() {
  return <a className="person" href="/"><img src={portrait} alt="" width="32" height="32" /><span>Enzo Simier</span></a>
}

export function Head({ title, context, id }) {
  return <div className="head"><h2 id={id}>{title}</h2>{context ? <span>{context}</span> : null}</div>
}

export function Rail({ parts }) {
  const total = parts.reduce((a, [v]) => a + v, 0) || 1
  return <div className="rail" aria-hidden="true">{parts.filter(([v]) => v > 0).map(([v, c], i) => <i key={i} style={{ flexGrow: v / total, background: c }} />)}</div>
}

export function Pair({ value, label, color, end = false }) {
  return <div className={`pair${end ? ' end' : ''}`}><b style={color ? { color } : undefined} title={String(value)}>{value}</b><span title={String(label)}>{label}</span></div>
}

export function Kpi({ title, context, value, unit, aside, valueColor = C.blue, parts, left, right, className = '', ...rest }) {
  return (
    <section className={`card kpi s3 ${className}`} {...rest}>
      <div className="top"><b>{title}</b><span>{context}</span></div>
      <div className="value"><b style={{ color: valueColor }}>{value}</b><span>{unit}</span>{aside ? <i>{aside}</i> : null}</div>
      <div>
        <Rail parts={parts} />
        <div className="pairs"><Pair {...left} /><Pair {...right} end /></div>
      </div>
    </section>
  )
}

export function Bars({ rows, max, color = C.slate, highlight }) {
  const m = max ?? Math.max(1, ...rows.map(([, v]) => v))
  return (
    <div className="bars">
      {rows.map(([label, v]) => {
        const hot = highlight === label
        return (
          <div className="bar" key={label}>
            <div className="label"><span>{label}</span><b style={hot ? { color: C.blue } : undefined}>{v}</b></div>
            <div className="track"><i style={{ width: `${(100 * v) / m}%`, background: hot ? C.blue : color }} /></div>
          </div>
        )
      })}
    </div>
  )
}
