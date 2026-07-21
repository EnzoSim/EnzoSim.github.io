import profileSrc from '../assets/profile-430.webp'

// Site-wide values kept separate from editorial copy.
export const siteUrl = 'https://enzosimier.com'
export const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
export const fdaApiUrl = 'https://fda-catalyst-api-production.up.railway.app/bpiq/calendar?within_days=90'
export const wikiLiveUrl = 'https://wiki.enzosimier.com'
export const wikiRepoUrl = 'https://github.com/EnzoSim/wiki-project'
export const linkedinUrl = 'https://linkedin.com/in/enzo-simier'
export const bookingUrl = 'https://calendar.app.google/tnALkaQGRdLaDPqB6'
export const contactEmail = 'enzo.simier@hec.ca'
export const cvUrl = '/Enzo_Simier_CV.pdf'
export const profileImage = { src: profileSrc, width: 430, height: 481 }

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
