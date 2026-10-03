import portrait768 from '../assets/tremblant-portrait-768.webp'
import portrait1440 from '../assets/tremblant-portrait-1440.webp'

// Site-wide values kept separate from editorial copy.
export const siteUrl = 'https://enzosimier.com'
export const fdaLiveUrl = 'https://fda-catalyst-web-production.up.railway.app/calendar'
export const wikiLiveUrl = 'https://wiki.enzosimier.com'
export const wikiRepoUrl = 'https://github.com/EnzoSim/wiki-project'
export const linkedinUrl = 'https://linkedin.com/in/enzo-simier'
export const contactEmail = 'enzo.simier@hec.ca'
export const cvUrl = '/Enzo_Simier_CV.pdf'

// The Tremblant portrait is exported as a square crop, centred on the subject,
// at two responsive sizes.
export const portrait = {
  src: portrait1440,
  srcSet: `${portrait768} 768w, ${portrait1440} 1440w`,
  width: 1440,
  height: 1440,
}
