# enzosimier.com

Personal site for Enzo Simier. The editable source lives in `react-site/`; the repository root contains the static GitHub Pages build.

## Content ownership

- English editorial copy: `react-site/src/content/en.js`
- Shared URLs, image metadata, and the dated FDA snapshot: `react-site/src/content/shared.js`
- Poseidon network model: `/poseidon/index.html` is a hand-written page, not built by Vite: the dashboard (hosted on Railway) full screen in a frame, with the market note PDF and the link-preview image next to it. It is unlisted: not linked from the site, not in the sitemap, `noindex`.
- Altitude demand-planning case study: `/altitude/index.html` follows the same pattern as `/poseidon/`: a hand-written page that frames the dashboard hosted on Railway, with its link-preview image next to it. Unlisted: not linked from the site, not in the sitemap, `noindex`.
- Planning dashboard design guide: `/projects/altitude-design-guide/index.html` is a hand-written, self-contained page, not built by Vite (light theme only; fonts from Google Fonts; the two screenshots are inlined). It is listed in Projects through `react-site/src/content/en.js` and in the sitemap. The Vite build leaves it in place because `emptyOutDir` is off.
- Book titles, links, and deterministic 3D presentation values: `react-site/src/content/en.js`
- Layout and behavior: `react-site/src/App.jsx`
- Visual system: `react-site/src/index.css`

Keep profile copy and external links in those canonical files instead of duplicating them in root HTML or documentation. The root HTML and `assets/` directory are generated.

## Local workflow

```bash
cd react-site
npm install
npm run lint
npm run build
```

`npm run build` writes `/index.html`, the compatibility redirect at `/work/index.html`, `/reading/index.html`, `/fda-catalyst.html`, and hashed files under `/assets/` for GitHub Pages. Remove superseded `assets/main-*.js` and `assets/main-*.css` bundles when committing a new build.

## Publishing

Push `main`. GitHub Pages deploys the root build to [enzosimier.com](https://enzosimier.com).
