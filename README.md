# International Karstological School — Eleventy site

A bilingual Eleventy site for the International Karstological School “Classical Karst”.

## Local development

```sh
npm ci
npm start
```

The development server is available at `http://localhost:8080`.

## Production build

```sh
npm test
```

This generates the site in `_site`, checks its root-relative links and local images,
and checksum-verifies the established public page and media paths.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds, validates, uploads and deploys `_site`. It uses the base path returned by GitHub's Pages configuration action, so it works for project sites as well as custom domains.

Before the first deployment, open **Settings → Pages** in the GitHub repository and set **Source** to **GitHub Actions**.

## Structure

- `src/_data/pages.json` — Slovenian and English page content
- `src/_includes/` — shared Nunjucks layouts and icons
- `src/assets/` — styles, interaction script, photography and partner logos
- `public-media/` — media files and the manifest that restores established `/wp-content/uploads/` paths
- `scripts/` — output cleanup and generated-site integrity checks
