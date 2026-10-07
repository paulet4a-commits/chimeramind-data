// Page shell: head (SEO meta, Open Graph, JSON-LD, fonts, analytics), masthead, ticker, footer.
import fs from 'node:fs';

import { esc, money } from './render.mjs';
import { attributedUrl } from './growth.mjs';

// Google Search Console HTML-tag verification: put the content= value in data/gsc-verification.txt.
const gscFile = new URL('../data/gsc-verification.txt', import.meta.url);
const GSC = fs.existsSync(gscFile) ? fs.readFileSync(gscFile, 'utf8').trim() : '';

export const SITE = {
    origin: 'https://data.chimeramind.com',
    name: 'ChimeraMiND Data',
    tagline: 'Market & web data, delivered as clean JSON',
};

const FONTS =
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap';

function ticker(actors) {
    const list = Object.values(actors)
        .filter((a) => a.price)
        .sort((a, b) => b.runs - a.runs)
        .slice(0, 14);
    const items = list.map((a) => `<span>${esc(a.name.replace(/-/g, ' ').toUpperCase())} <b>${money(a.price.usd)}</b>/1k <span class="up">● catalog</span></span>`).join('');
    return `<div class="ticker" aria-hidden="true"><div class="track">${items}${items}</div></div>`;
}

export function page({ path, title, description, body, actors, jsonLd = [], ogType = 'website', nav = '', noindex = false }) {
    const url = `${SITE.origin}${path}`;
    const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
    // Cloudflare Web Analytics (cookieless). The token is public by design — it ships in every page.
    const beaconToken = process.env.CF_BEACON_TOKEN ?? "fadbc13040624319a834f09c5b167e36";
    const beacon = beaconToken
        ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(beaconToken)}"}'></script>`
        : '';
    const cur = (p) => (nav === p ? ' aria-current="page"' : '');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : ''}
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="${SITE.name}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0b8f6a">
${GSC ? `<meta name="google-site-verification" content="${esc(GSC)}">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/assets/site.css">
<script type="module" src="/assets/sample-status.js"></script>
${ld}
${beacon}
</head>
<body>
<header class="masthead"><div class="wrap">
<a class="brand" href="/"><span class="dot"></span>ChimeraMiND <b>Data</b></a>
<nav class="top"><a href="/#market-data"${cur('market')}>Market data</a><a href="/guides/"${cur('guides')}>Guides</a><a href="/tools/"${cur('tools')}>All tools</a><a href="/workflows/"${cur('workflows')}>Workflows</a><a class="hide-sm" href="https://chimeramind.com">ChimeraMiND ↗</a></nav>
</div></header>
${ticker(actors)}
${body}
<footer class="site"><div class="wrap">
<div>© ${new Date().getUTCFullYear()} ChimeraMiND · Tools run on the <a href="${esc(attributedUrl({ url: 'https://apify.com/webdatatools', name: 'catalog' }, { page: path, placement: 'footer' }))}">Apify platform</a> under the webdatatools account.</div>
<div><a href="/guides/">Guides</a> · <a href="/tools/">All tools</a> · <a href="/sitemap.xml">Sitemap</a></div>
</div></footer>
</body>
</html>
`;
}
