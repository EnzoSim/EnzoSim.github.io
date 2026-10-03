# enzosimier.com

Personal site for Enzo Simier. The editable source lives in `react-site/`; the repository root contains the static GitHub Pages build.

## Content ownership

- English editorial copy: `react-site/src/content/en.js`
- Shared URLs, image metadata, and the dated FDA snapshot: `react-site/src/content/shared.js`
- Poseidon network model: `/poseidon/index.html` is a hand-written page, not built by Vite: the dashboard (hosted on Railway) full screen in a frame, with the market note PDF and the link-preview image next to it. It is unlisted: not linked from the site, not in the sitemap, `noindex`.
- Altitude demand-planning case study: `/altitude/index.html` follows the same pattern as `/poseidon/`: a hand-written page that frames the dashboard hosted on Railway, with its link-preview image next to it. Unlisted: not linked from the site, not in the sitemap, `noindex`.
- Placement note, « Que faire de 900 000 € qui dorment sur un compte ? »: `/placements/index.html` is a self-contained page in French, not built by Vite (light and dark themes; fonts from Google Fonts; no images). It compares Yomoni Lux, independent advisers and the Swiss Life « hors Sapin 2 » fonds euros, with figures dated 3 October 2026. Its calculation engine (`Fin`), chart functions (`Viz`) and two simulators are inline scripts at the end of the file, so every figure is drawn from the same numbers as the text. Edit it in place. Unlisted: not linked from the site, not in the sitemap, `noindex`.
- Dashboard design study guide, « Learn dashboard design with me »: `/projects/dashboard-design-guide/index.html` is a hand-written, self-contained page, not built by Vite (light theme only; fonts from Google Fonts; no images, every figure is drawn by the page's own script from a small sample dataset, with the same model and chart functions as the demand-planning dashboard and plain product-line names in place of brands). The page is set on a programme of twelve 64 px columns with 32 px gutters (1120 px; 1000 px under a 1200 px window; one fluid column under 1080 px), and a switch in its first rule overlays that grid. Edit it in place. It is listed in Projects through `react-site/src/content/en.js` and in the sitemap. `/projects/altitude-design-guide/index.html` is only a redirect to it, kept so the guide's first address still works. The Vite build leaves both in place because `emptyOutDir` is off.
- Paper field guide, « Learn Paper with me »: `/projects/paper-guide/index.html` is a self-contained page, not built by Vite, generated once from the guide's notes (light theme only; fonts from Google Fonts; no images, its three cover figures are inline SVG). It uses the dashboard guide's programme of twelve 64 px columns with 32 px gutters and the same grid switch. `/projects/paper-guide/learn-paper-with-me.pdf` is its print edition, linked from the page's top bar, cover and footer; replace the two files together. It is listed in Projects through `react-site/src/content/en.js` and in the sitemap.
- FDA Catalyst dashboard: `/fda-catalyst.html` is a Vite entry (`react-site/src/dashboards/fda/`), drawn from the Paper file « FDA Catalyst ». The FDA Catalyst API sends no CORS headers, so the page reads a copy of the calendar, `react-site/src/dashboards/fda/snapshot.json`. Refresh it with `node scripts/fda-snapshot.mjs` (from `react-site/`) before a build; the dates are counted from the visitor's day, so catalysts that have passed drop out.
- Two kinds of scarcity dashboard: `/research/vista-vs-vistra/` is a Vite entry (`react-site/src/research/vista-vs-vistra/Dashboard.jsx`) reading `report-data.js`, drawn from the Paper file « Two kinds of scarcity ». Blue is Vistra, slate is Vista Energy.
- Both dashboards share `react-site/src/dashboards/board.css`, `kit.jsx` and `theme.js`: the Poseidon grid system (12 columns, 24 px gutters, glass cards, Inter, one blue).
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
