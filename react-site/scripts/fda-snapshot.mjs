// Copies the FDA Catalyst calendar from its Railway API into the site, so the dashboard reads no
// cross-site data at runtime (the API sends no CORS headers). Run before a build: node scripts/fda-snapshot.mjs
import { writeFileSync } from 'node:fs'

const API = 'https://fda-catalyst-api-production.up.railway.app/bpiq/calendar?within_days=90'
const out = new URL('../src/dashboards/fda/snapshot.json', import.meta.url)
const res = await fetch(API)
if (!res.ok) throw new Error(`API answered ${res.status}`)
const data = await res.json()
const rows = data.rows.map((r) => ({
  ticker: r.ticker,
  company: r.company,
  cap: r.market_cap,
  drug: r.drug_name,
  indication: r.indications_text,
  stage: r.stage_label,
  group: r.event_group,
  date: r.catalyst_date,
  flags: r.flags ?? [],
  sourced: Boolean(r.catalyst_source),
}))
const fetched = data.rows.map((r) => r.fetched_at).filter(Boolean).sort().at(-1)
writeFileSync(out, JSON.stringify({ copiedOn: data.as_of, fetchedAt: fetched, rows }))
console.log(`${rows.length} catalysts, BPIQ data of ${fetched}, copied on ${data.as_of}`)
