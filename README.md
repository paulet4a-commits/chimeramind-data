# ChimeraMiND Data — data.chimeramind.com

Static guide site for the webdatatools Apify actors. Prices, catalog and sample output are pulled live from the
Apify API at build time; guides are authored in `content/guides/*.md`.

- `node fetch-data.mjs [--run-missing]` — actor metadata → `data/actors.json`, real output rows → `data/samples/`
- `node build.mjs` — renders `dist/` (home, guides, tools catalog, sitemap, robots, CNAME)
- `node serve.mjs` — local preview on http://localhost:4321
- `bash deploy.sh` — fetch + build + force-push `dist/` to the `gh-pages` branch

Guide placeholders: `{{sample}}` real output row, `{{code}}` Python/JS/cURL tabs, `{{pricing}}` live tier table,
`{{cta}}` run button, `{{price}}` inline price. A `## FAQ` section with `### Question` blocks becomes FAQPage JSON-LD.
