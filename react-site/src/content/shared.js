import portrait768 from '../assets/montreal-portrait-768.webp'
import portrait1440 from '../assets/montreal-portrait-1440.webp'

// Site-wide values kept separate from editorial copy.
export const siteUrl = 'https://enzosimier.com'
export const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
export const fdaApiUrl = 'https://fda-catalyst-api-production.up.railway.app/bpiq/calendar?within_days=90'
export const wikiLiveUrl = 'https://wiki.enzosimier.com'
export const wikiRepoUrl = 'https://github.com/EnzoSim/wiki-project'
export const linkedinUrl = 'https://linkedin.com/in/enzo-simier'
export const contactEmail = 'enzo.simier@hec.ca'
export const cvUrl = '/Enzo_Simier_CV.pdf'

// The Montréal portrait is exported at two responsive sizes. CSS controls the
// editorial crop so the original photograph remains intact.
export const portrait = {
  src: portrait1440,
  srcSet: `${portrait768} 768w, ${portrait1440} 1440w`,
  width: 1440,
  height: 1920,
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
