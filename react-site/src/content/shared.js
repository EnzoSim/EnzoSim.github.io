import profileSrc from '../assets/profile.jpg'

// Site-wide values kept separate from editorial copy.
export const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
export const fdaApiUrl = 'https://fda-catalyst-api-production.up.railway.app/bpiq/calendar?within_days=90'
export const wikiLiveUrl = 'https://wiki.enzosimier.com'
export const wikiRepoUrl = 'https://github.com/EnzoSim/wiki-project'
export const linkedinUrl = 'https://linkedin.com/in/enzo-simier'
export const contactEmail = 'enzo.simier@hec.ca'
export const cvUrl = '/Enzo_Simier_CV.pdf'
export const profileImage = { src: profileSrc, width: 715, height: 800 }

// One dated source for every public FDA metric rendered on this site.
export const fdaSnapshot = Object.freeze({
  asOf: 'Jul 11, 2026',
  events: '113',
  companies: '92',
  pdufa: '28',
  readouts: '80',
})
export const fdaMetricValues = [
  fdaSnapshot.events,
  fdaSnapshot.companies,
  fdaSnapshot.pdufa,
  fdaSnapshot.readouts,
]

// Index-matched with library.books.
export const bookLinks = [
  'https://www.simonandschuster.com/books/Chip-War/Chris-Miller/9781982172015',
  'https://www.penguinrandomhouse.com/books/703268/material-world-by-ed-conway/',
  'https://press.stripe.com/working-in-public',
  'https://en.wikipedia.org/wiki/Churchill:_Walking_with_Destiny',
  'https://en.wikipedia.org/wiki/Caesar,_Life_of_a_Colossus',
]
