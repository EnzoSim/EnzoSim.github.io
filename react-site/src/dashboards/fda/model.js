// FDA Catalyst: shapes the copied BPIQ calendar for one window of days. Pure functions, no display code.
import snapshot from './snapshot.json'

export const fetchedAt = new Date(snapshot.fetchedAt)
export const DAY = 86400000

// Dates are calendar days; compare them at UTC midnight so time zones cannot shift a catalyst by a day.
const utc = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
export const todayUtc = () => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) }

// BPIQ places a catalyst known only to the year or the quarter on 31 December.
export const isYearEnd = (iso) => iso.slice(5) === '12-31'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const dayMonth = (ms) => { const d = new Date(ms); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` }

export function money(capUsd) {
  if (!capUsd) return '–'
  const b = capUsd / 1e9
  return b >= 10 ? `${Math.round(b)} B$` : b >= 1 ? `${b.toFixed(1)} B$` : `${Math.round(b * 1000)} M$`
}

// "WELIREG/Belzutifan (MK-6482) + LENVIMA/Lenvatinib (E7080)" -> "Welireg + Lenvima"
export function shortDrug(name) {
  return name.split(' + ').map((part) => {
    const head = part.split('/')[0].split('(')[0].trim()
    return /^[A-Z][A-Z®-]{3,}$/.test(head) ? head.charAt(0) + head.slice(1).toLowerCase() : head
  }).join(' + ')
}

export const shortIndication = (text) => text.split('(')[0].split(',')[0].trim()
export const shortCompany = (name) => name.replace(/,?\s+(Inc\.?|Corporation|Limited|Ltd\.?|plc)$/i, '')
export const isMover = (r) => r.flags.includes('suspected mover') || r.flags.includes('big mover')

const STAGES = [['Phase 1', ['Phase 1']], ['Phase 2', ['Phase 2']], ['Phase 3', ['Phase 3']], ['Phase 1/2', ['Phase 1/2']],
  ['FDA decision', ['PDUFA']], ['Phase 1b', ['Phase 1b']], ['Meetings', ['Biomedical Meeting']]]
const BINS = ['Under 0.3', '0.3 to 1', '1 to 3', '3 to 10', '10 to 50', '50 and up']
const binOf = (b) => (b < 0.3 ? 0 : b < 1 ? 1 : b < 3 ? 2 : b < 10 ? 3 : b < 50 ? 4 : 5)

export function view(windowDays, today = todayUtc()) {
  const rows = snapshot.rows
    .map((r) => ({ ...r, ms: utc(r.date), days: Math.round((utc(r.date) - today) / DAY), exact: !isYearEnd(r.date) }))
    .filter((r) => r.days >= 0 && r.days <= windowDays)
    .sort((a, b) => a.ms - b.ms || a.ticker.localeCompare(b.ticker))
  const decisions = rows.filter((r) => r.group === 'PDUFA')
  const readouts = rows.filter((r) => r.group === 'Data readout')
  const meetings = rows.filter((r) => r.group !== 'PDUFA' && r.group !== 'Data readout')
  const companies = new Map()
  rows.forEach((r) => { if (r.ticker !== 'MEETING' && !companies.has(r.ticker)) companies.set(r.ticker, { cap: r.cap, decision: false }) })
  decisions.forEach((r) => { const c = companies.get(r.ticker); if (c) c.decision = true })

  const stageRows = STAGES.map(([label, keys]) => [label, rows.filter((r) => keys.includes(r.stage)).length])
  stageRows.push(['Other phases', rows.length - stageRows.reduce((a, [, v]) => a + v, 0)])

  // Weeks start on Monday; the dated catalysts are dots, the year-end placeholders stand apart.
  const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY
  const weekCount = Math.max(1, Math.ceil((today + windowDays * DAY - monday + DAY) / (7 * DAY)))
  const weeks = Array.from({ length: weekCount }, (_, i) => ({ start: monday + i * 7 * DAY, items: [] }))
  rows.filter((r) => r.exact).forEach((r) => { const i = Math.floor((r.ms - monday) / (7 * DAY)); if (weeks[i]) weeks[i].items.push(r.group === 'PDUFA') })
  weeks.forEach((w) => w.items.sort((a, b) => b - a))

  const sizes = BINS.map((label, i) => ({ label, all: 0, decisions: 0, i }))
  companies.forEach((c) => { if (!c.cap) return; const b = sizes[binOf(c.cap / 1e9)]; b.all += 1; if (c.decision) b.decisions += 1 })
  const flagCount = (f) => rows.filter((r) => r.flags.includes(f)).length

  return {
    rows, decisions, readouts, meetings, companies, stageRows, weeks, sizes, today, monday,
    next: decisions[0] ?? null,
    exact: rows.filter((r) => r.exact).length,
    decisionsExact: decisions.filter((r) => r.exact).length,
    readoutsExact: readouts.filter((r) => r.exact).length,
    sourced: rows.filter((r) => r.sourced).length,
    yearEnd: { decisions: decisions.filter((r) => !r.exact).length, readouts: rows.filter((r) => !r.exact && r.group !== 'PDUFA').length },
    flags: [['Management interest', flagCount('management interest')], ['Suspected mover', flagCount('suspected mover')], ['Missing source', flagCount('missing source')],
      ['Fund pick', flagCount('fund pick')], ['Big mover', flagCount('big mover')], ['Fund avoid', flagCount('fund avoid')]],
  }
}

export function csv(v) {
  const head = ['Date', 'Exact date', 'Days', 'Ticker', 'Company', 'Event', 'Stage', 'Drug', 'Indication', 'Market cap (USD)', 'Flags', 'Source linked']
  const lines = [head, ...v.rows.map((r) => [r.date, r.exact ? 'yes' : 'no', r.days, r.ticker, r.company, r.group, r.stage, r.drug, r.indication, r.cap ?? '', r.flags.join('; '), r.sourced ? 'yes' : 'no'])]
  return lines.map((l) => l.map((c) => { const s = String(c); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }).join(',')).join('\n')
}
