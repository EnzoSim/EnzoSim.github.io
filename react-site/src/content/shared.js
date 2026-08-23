import portrait430 from '../assets/profile-430.webp'
import portrait715 from '../assets/profile-715.webp'

// Site-wide values kept separate from editorial copy.
export const siteUrl = 'https://enzosimier.com'
export const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
export const fdaApiUrl = 'https://fda-catalyst-api-production.up.railway.app/bpiq/calendar?within_days=90'
export const wikiLiveUrl = 'https://wiki.enzosimier.com'
export const wikiRepoUrl = 'https://github.com/EnzoSim/wiki-project'
export const linkedinUrl = 'https://linkedin.com/in/enzo-simier'
export const contactEmail = 'enzo.simier@hec.ca'
export const cvUrl = '/Enzo_Simier_CV.pdf'

// The portrait ships at its full source resolution (715×800) so it can render
// as a real photograph — full column width on phones, a large plate on desktop.
export const portrait = {
  src: portrait715,
  srcSet: `${portrait430} 430w, ${portrait715} 715w`,
  width: 715,
  height: 800,
}

// One dated source for every public FDA metric rendered on this site.
export const fdaSnapshot = Object.freeze({
  asOf: 'Jul 14, 2026',
  events: '112',
  companies: '91',
  pdufa: '29',
  readouts: '79',
})
export const fdaMetricValues = [
  fdaSnapshot.events,
  fdaSnapshot.companies,
  fdaSnapshot.pdufa,
  fdaSnapshot.readouts,
]
