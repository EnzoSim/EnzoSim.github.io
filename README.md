# enzosimier.com

Personal site for Enzo Simier. The editable source lives in `react-site/`; the repository root contains the static GitHub Pages build.

## Content ownership

- English editorial copy: `react-site/src/content/en.js`
- Shared URLs, image metadata, and the dated FDA snapshot: `react-site/src/content/shared.js`
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
