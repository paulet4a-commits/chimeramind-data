// Builds the static site into dist/: home, guide pages, tools catalog, sitemap, robots, CNAME.
// Inputs: content/guides/*.md (authored), data/actors.json + data/samples/*.json (from fetch-data.mjs).
// Usage: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

import { page, SITE } from './src/layout.mjs';
import { esc, money, parseFrontmatter, renderGuide } from './src/render.mjs';

const here = import.meta.dirname;
const dist = path.join(here, 'dist');
const actors = JSON.parse(fs.readFileSync(path.join(here, 'data', 'actors.json'), 'utf8'));
const sampleOf = (name) => {
    const f = path.join(here, 'data', 'samples', `${name}.json`);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
};
const write = (rel, html) => {
    const f = path.join(dist, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
};
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(here, 'public'), dist, { recursive: true });

// Finance actors lead the site (it lives on a trading brand); everything else is "web data".
const MARKET = new Set(['market-quotes', 'yahoo-finance-scraper', 'polymarket-scraper', 'stocktwits-scraper', 'economic-calendar-scraper', 'dexscreener-scraper', 'crypto-fear-greed-index']);
const CAT_LABEL = { AI: 'AI & LLM data', LEAD_GENERATION: 'Leads & company data', SEO_TOOLS: 'SEO & site audits', JOBS: 'Jobs', SOCIAL_MEDIA: 'Social media', VIDEOS: 'Video', ECOMMERCE: 'E-commerce', REAL_ESTATE: 'Real estate', TRAVEL: 'Travel', DEVELOPER_TOOLS: 'Developer tools', NEWS: 'News', BUSINESS: 'Business', MARKETING: 'Marketing', OPEN_SOURCE: 'Open source', AUTOMATION: 'Automation', OTHER: 'Other' };

// ---- guides
const guides = [];
for (const f of fs.readdirSync(path.join(here, 'content', 'guides')).filter((x) => x.endsWith('.md'))) {
    const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(here, 'content', 'guides', f), 'utf8'));
    if (meta.draft === 'true') continue;
    const slug = f.replace(/\.md$/, '');
    const actor = actors[meta.actor];
    if (!actor) {
        console.warn(`skip ${slug}: actor ${meta.actor} not public`);
        continue;
    }
    guides.push({ slug, meta, body, actor });
}
const guideFor = Object.fromEntries(guides.map((g) => [g.meta.actor, g]));

for (const g of guides) {
    const { html, faq, toc } = renderGuide(g.body, g.actor, sampleOf(g.actor.name));
    const url = `${SITE.origin}/guides/${g.slug}/`;
    const updated = g.meta.updated ?? new Date().toISOString().slice(0, 10);
    const jsonLd = [
        { '@context': 'https://schema.org', '@type': 'TechArticle', headline: g.meta.title, description: g.meta.description, dateModified: updated, author: { '@type': 'Organization', name: SITE.name, url: SITE.origin }, mainEntityOfPage: url },
        { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: g.actor.title, applicationCategory: 'DeveloperApplication', operatingSystem: 'Web, API', url: g.actor.url, offers: g.actor.price ? { '@type': 'Offer', price: (g.actor.price.usd * 1000).toFixed(2), priceCurrency: 'USD', description: `per 1,000 ${g.actor.price.unit}s` } : undefined },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Guides', item: `${SITE.origin}/guides/` }, { '@type': 'ListItem', position: 2, name: g.meta.title, item: url }] },
    ];
    if (faq.length) jsonLd.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });
    const a = g.actor;
    const spec = `<aside class="spec"><div class="spec-card">
<div class="row">${a.icon ? `<img src="${esc(a.icon)}" alt="" width="44" height="44">` : ''}<h4>${esc(a.title)}</h4></div>
<dl><dt>Price</dt><dd>${a.price ? `${money(a.price.usd)} / 1k ${esc(a.price.unit)}s` : '—'}</dd><dt>Billing</dt><dd>per result</dd><dt>Output</dt><dd>JSON · CSV · Excel</dd><dt>Access</dt><dd>API · MCP · no-code</dd></dl>
<a class="btn" href="${esc(a.url)}?utm_source=data.chimeramind.com&amp;utm_medium=spec">Try it free on Apify</a></div>
${toc.length > 2 ? `<nav class="toc"><b>On this page</b><ol>${toc.map((t) => `<li><a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(t)}</a></li>`).join('')}</ol></nav>` : ''}
</aside>`;
    const body = `<div class="wrap"><div class="crumbs"><a href="/">Home</a> / <a href="/guides/">Guides</a> / ${esc(g.meta.short ?? a.title)}</div>
<div class="guide"><div><header><div class="kicker">${esc(g.meta.kicker ?? 'Guide')}</div><h1>${esc(g.meta.h1 ?? g.meta.title)}</h1><p class="lede">${esc(g.meta.description)}</p>
<div class="byline"><span>Updated ${esc(updated)}</span><span>Prices and sample output pulled live from Apify</span></div></header>
<article class="prose">${html}</article></div>${spec}</div></div>`;
    write(`guides/${g.slug}/index.html`, page({ path: `/guides/${g.slug}/`, title: `${g.meta.title} | ${SITE.name}`, description: g.meta.description, body, actors, jsonLd, ogType: 'article', nav: 'guides' }));
}

// ---- cards
const card = (a, i = 0) => {
    const g = guideFor[a.name];
    const href = g ? `/guides/${g.slug}/` : `${a.url}?utm_source=data.chimeramind.com&utm_medium=catalog`;
    return `<a class="card reveal" style="animation-delay:${Math.min(i, 12) * 40}ms" href="${esc(href)}"><div class="row">${a.icon ? `<img src="${esc(a.icon)}" alt="" loading="lazy" width="38" height="38">` : ''}<h3>${esc(a.title)}</h3></div><p>${esc((a.description ?? '').slice(0, 150))}${(a.description ?? '').length > 150 ? '…' : ''}</p><div class="meta"><span class="price">${a.price ? `${money(a.price.usd)}/1k` : ''}</span><span>${g ? 'Read guide →' : 'Open on Apify ↗'}</span></div></a>`;
};
const all = Object.values(actors).sort((x, y) => y.runs - x.runs);
const market = all.filter((a) => MARKET.has(a.name));
const cheapest = Math.min(...all.filter((a) => a.price).map((a) => a.price.usd));

// ---- home
const home = `<div class="wrap"><section class="hero"><div><div class="kicker">ChimeraMiND · Data desk</div>
<h1>Data feeds for traders, analysts and <em>AI agents</em>.</h1>
<p class="lede">Market quotes, company signals, search results, jobs and whole websites — returned as clean JSON by ${all.length} maintained tools. Pay per result, call them from Python, JavaScript, no-code tools or an MCP-enabled AI assistant.</p></div>
<div class="stat-board"><div><b>${all.length}</b><span>live tools</span></div><div><b>API</b><span>REST · MCP · no-code</span></div><div><b>${money(cheapest)}</b><span>from, per 1k results</span></div><div><b>$0</b><span>to start · $5 free credit</span></div></div></section>
<section class="block" id="market-data"><div class="block-head"><h2>Market data</h2><p>Stocks, crypto and FX — public sources, no API key.</p></div><div class="grid">${market.map(card).join('')}</div></section>
<section class="block"><div class="block-head"><h2>Guides</h2><p>Step-by-step, with real output and live pricing.</p></div><div class="grid">${guides.map((g, i) => card(g.actor, i)).join('')}</div></section>
<section class="block"><div class="block-head"><h2>Most used tools</h2><p><a href="/tools/">See all ${all.length} →</a></p></div><div class="grid">${all.slice(0, 9).map(card).join('')}</div></section></div>`;
write('index.html', page({ path: '/', title: `${SITE.name} — ${SITE.tagline}`, description: `${all.length} data tools for market quotes, company signals, Google results, jobs and website content. Clean JSON, pay per result, API and MCP ready.`, body: home, actors, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.origin }] }));

// ---- guides index
write('guides/index.html', page({ path: '/guides/', title: `Data scraping guides | ${SITE.name}`, description: 'Practical guides to extracting market, search, company and website data — with real output, code in Python and JavaScript, and live pricing.', nav: 'guides', actors, body: `<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Guides</div><h1>How to get the data, <em>step by step</em>.</h1><p class="lede">Every guide shows real output from a recent run, copy-paste code and the current price.</p></div></section><section class="block"><div class="grid">${guides.map((g, i) => card(g.actor, i)).join('')}</div></section></div>` }));

// ---- tools catalog by category
const byCat = {};
for (const a of all) for (const c of (a.categories.length ? a.categories : ['OTHER']).slice(0, 1)) (byCat[c] ??= []).push(a);
const catalog = Object.entries(byCat)
    .sort((x, y) => y[1].length - x[1].length)
    .map(([c, list]) => `<section class="block"><div class="block-head"><h2>${esc(CAT_LABEL[c] ?? c)}</h2><p>${list.length} tools</p></div><div class="grid">${list.map(card).join('')}</div></section>`)
    .join('');
write('tools/index.html', page({ path: '/tools/', title: `All ${all.length} data tools | ${SITE.name}`, description: `Catalog of ${all.length} pay-per-result data extraction tools: market data, search, leads, jobs, social, real estate and AI-ready website content.`, nav: 'tools', actors, body: `<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Catalog</div><h1>All tools</h1><p class="lede">Grouped by what they return. Each runs in the cloud and bills per result.</p></div></section>${catalog}</div>` }));

// ---- 404, sitemap, robots, CNAME
write('404.html', page({ path: '/404.html', title: `Not found | ${SITE.name}`, description: 'Page not found.', actors, body: '<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">404</div><h1>That page moved or never existed.</h1><p class="lede"><a href="/guides/">Browse the guides</a> or <a href="/tools/">all tools</a>.</p></div></section></div>' }));
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/guides/', '/tools/', ...guides.map((g) => `/guides/${g.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE.origin}${u}</loc><lastmod>${guides.find((g) => `/guides/${g.slug}/` === u)?.meta.updated ?? today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);
write('CNAME', 'data.chimeramind.com\n');
write('.nojekyll', '');
console.log(`built ${guides.length} guides, ${all.length} tools → dist/`);
