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

The workflow in `.github/workflows/deploy-pages.yml` builds, validates, uploads and deploys `_site` to **https://iks.zrc-sazu.si/**. Production builds explicitly use `PATH_PREFIX=/` and `SITE_URL=https://iks.zrc-sazu.si` so assets, navigation, canonical URLs and the sitemap use the custom domain rather than the old `/mks/` project path. `src/CNAME` is copied to the build output to record the custom domain.

Before the first deployment, open **Settings → Pages** in the GitHub repository and set **Source** to **GitHub Actions**.

After changing the custom domain in **Settings → Pages**, rerun the deployment workflow: changing the domain alone does not rebuild previously generated URLs. Keep the workflow's `SITE_URL` and `src/CNAME` in sync with the domain setting.

## Structure

- `src/_data/pages.json` — Slovenian and English page content
- `src/_includes/` — shared Nunjucks layouts and icons
- `src/assets/` — styles, interaction script, photography and partner logos
- `public-media/` — media files and the manifest that restores established `/wp-content/uploads/` paths
- `scripts/` — output cleanup and generated-site integrity checks
