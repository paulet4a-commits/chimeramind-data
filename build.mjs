// Builds dist/: home, guides, 71 tool landings, workflows, sitemap, robots, CNAME.
// Inputs: content/guides/*.md (authored), data/actors.json + data/samples/*.json (from fetch-data.mjs).
// Usage: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

import { page, SITE } from './src/layout.mjs';
import { esc, money, parseFrontmatter, renderGuide, sampleBlock, pricingTable, codeTabs } from './src/render.mjs';
import { WORKFLOWS, relatedActors, attributedUrl } from './src/growth.mjs';
import { validateData, hash } from './src/quality.mjs';

const here = import.meta.dirname;
const dist = path.join(here, 'dist');
validateData(here, { release: process.argv.includes('--release') });
const actors = JSON.parse(fs.readFileSync(path.join(here, 'data', 'actors.json'), 'utf8'));
const renderedPages = [];
const sampleOf = (name) => {
    const f = path.join(here, 'data', 'samples', `${name}.json`);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
};
const write = (rel, html) => {
    const f = path.join(dist, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
    if (rel.endsWith('.html') && rel !== '404.html') renderedPages.push({ file: rel, url: `${SITE.origin}/${rel === 'index.html' ? '' : rel.replace(/index\.html$/, '')}`, sha256: hash(html) });
};
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(here, 'public'), dist, { recursive: true });
fs.copyFileSync(path.join(here, 'src/freshness.mjs'), path.join(dist, 'assets/freshness.mjs'));

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
        throw new Error(`Missing guide Actor: ${slug}: ${meta.actor}`);
    }
    guides.push({ slug, meta, body, actor });
}
const guideFor = Object.fromEntries(guides.map((g) => [g.meta.actor, g]));
const growthLinks = (a) => `<section class="block"><h2>Related tools</h2><ul>${relatedActors(a, actors).map(x => `<li><a href="/tools/${x.name}/">${esc(x.title)}</a></li>`).join('')}</ul><h2>Workflows</h2><ul>${WORKFLOWS.filter(w => w.actors.includes(a.name)).map(w => `<li><a href="/workflows/${w.slug}/">${esc(w.title)}</a></li>`).join('')}<li><a href="/workflows/">Explore Lead, RAG, SEO and Hiring workflows</a></li></ul></section>`;

for (const g of guides) {
    const { html, faq, toc } = renderGuide(g.body, g.actor, sampleOf(g.actor.name), { page: `/guides/${g.slug}/`, placement: 'guide_cta' });
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
<a class="btn" href="${esc(attributedUrl(a, { page: `/guides/${g.slug}/`, placement: 'spec' }))}">Try it free on Apify</a><p><a href="/tools/${a.name}/">Tool details</a></p></div>
${toc.length > 2 ? `<nav class="toc"><b>On this page</b><ol>${toc.map((t) => `<li><a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(t)}</a></li>`).join('')}</ol></nav>` : ''}
</aside>`;
    const body = `<div class="wrap"><div class="crumbs"><a href="/">Home</a> / <a href="/guides/">Guides</a> / ${esc(g.meta.short ?? a.title)}</div>
<div class="guide"><div><header><div class="kicker">${esc(g.meta.kicker ?? 'Guide')}</div><h1>${esc(g.meta.h1 ?? g.meta.title)}</h1><p class="lede">${esc(g.meta.description)}</p>
<div class="byline"><span>Updated ${esc(updated)}</span><span>Catalog prices and dated sample snapshots from Apify</span></div></header>
<article class="prose">${html}</article>${growthLinks(a)}</div>${spec}</div></div>`;
    write(`guides/${g.slug}/index.html`, page({ path: `/guides/${g.slug}/`, title: `${g.meta.title} | ${SITE.name}`, description: g.meta.description, body, actors, jsonLd, ogType: 'article', nav: 'guides' }));
}

// ---- cards
const card = (a, i = 0, preferGuide = false) => {
    const g = guideFor[a.name];
    const href = preferGuide === true && g ? `/guides/${g.slug}/` : `/tools/${a.name}/`;
    return `<a class="card reveal" style="animation-delay:${Math.min(i, 12) * 40}ms" href="${esc(href)}"><div class="row">${a.icon ? `<img src="${esc(a.icon)}" alt="" loading="lazy" width="38" height="38">` : ''}<h3>${esc(a.title)}</h3></div><p>${esc((a.description ?? '').slice(0, 150))}${(a.description ?? '').length > 150 ? '…' : ''}</p><div class="meta"><span class="price">${a.price ? `${money(a.price.usd)}/1k` : ''}</span><span>${preferGuide === true && g ? 'Read guide →' : 'Tool details →'}</span></div></a>`;
};
const all = Object.values(actors).sort((x, y) => y.runs - x.runs);
const market = all.filter((a) => MARKET.has(a.name));
const cheapest = Math.min(...all.filter((a) => a.price).map((a) => a.price.usd));

// ---- home
const home = `<div class="wrap"><section class="hero"><div><div class="kicker">ChimeraMiND · Data desk</div>
<h1>Data feeds for traders, analysts and <em>AI agents</em>.</h1>
<p class="lede">Market quotes, company signals, search results, jobs and whole websites — returned as clean JSON by ${all.length} maintained tools. Pay per result, call them from Python, JavaScript, no-code tools or an MCP-enabled AI assistant.</p></div>
<div class="stat-board"><div><b>${all.length}</b><span>catalog tools</span></div><div><b>API</b><span>REST · MCP · no-code</span></div><div><b>${money(cheapest)}</b><span>from, per 1k results</span></div><div><b>$0</b><span>to start · $5 free credit</span></div></div></section>
<section class="block" id="market-data"><div class="block-head"><h2>Market data</h2><p>Stocks, crypto and FX — public sources, no API key.</p></div><div class="grid">${market.map(card).join('')}</div></section>
<section class="block"><div class="block-head"><h2>Guides</h2><p>Step-by-step, with dated output and catalog pricing.</p></div><div class="grid">${guides.map((g, i) => card(g.actor, i, true)).join('')}</div></section>
<section class="block"><div class="block-head"><h2>Most used tools</h2><p><a href="/tools/">See all ${all.length} →</a></p></div><div class="grid">${all.slice(0, 9).map(card).join('')}</div></section></div>`;
write('index.html', page({ path: '/', title: `${SITE.name} — ${SITE.tagline}`, description: `${all.length} data tools for market quotes, company signals, Google results, jobs and website content. Clean JSON, pay per result, API and MCP ready.`, body: home, actors, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.origin }] }));

// ---- guides index
write('guides/index.html', page({ path: '/guides/', title: `Data scraping guides | ${SITE.name}`, description: 'Practical guides to extracting market, search, company and website data — with dated output, code in Python and JavaScript, and catalog pricing.', nav: 'guides', actors, body: `<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Guides</div><h1>How to get the data, <em>step by step</em>.</h1><p class="lede">Guides show dated sample snapshots, copy-paste code and catalog prices. Archived examples are labeled with their age.</p></div></section><section class="block"><div class="grid">${guides.map((g, i) => card(g.actor, i, true)).join('')}</div></section></div>` }));

// ---- tools catalog by category
const byCat = {};
for (const a of all) for (const c of (a.categories.length ? a.categories : ['OTHER']).slice(0, 1)) (byCat[c] ??= []).push(a);
const catalog = Object.entries(byCat)
    .sort((x, y) => y[1].length - x[1].length)
    .map(([c, list]) => `<section class="block"><div class="block-head"><h2>${esc(CAT_LABEL[c] ?? c)}</h2><p>${list.length} tools</p></div><div class="grid">${list.map(card).join('')}</div></section>`)
    .join('');
write('tools/index.html', page({ path: '/tools/', title: `All ${all.length} data tools | ${SITE.name}`, description: `Catalog of ${all.length} pay-per-result data extraction tools: market data, search, leads, jobs, social, real estate and AI-ready website content.`, nav: 'tools', actors, body: `<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Catalog</div><h1>All tools</h1><p class="lede">Grouped by what they return. Each runs in the cloud and bills per result.</p></div></section>${catalog}</div>` }));

// ---- individual tool pages and workflow pages
for (const a of all) {
    const toolPath = `/tools/${a.name}/`;
    const guide = guideFor[a.name];
    const body = `<div class="wrap"><div class="crumbs"><a href="/">Home</a> / <a href="/tools/">Tools</a> / ${esc(a.title)}</div><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">${esc(CAT_LABEL[a.categories[0]] ?? 'Data tool')}</div><h1>${esc(a.title)}</h1><p class="lede">${esc(a.description)}</p><p class="cta-row"><a class="btn" href="${esc(attributedUrl(a, { page: toolPath, placement: 'tool_primary' }))}">Run ${esc(a.title)} on Apify →</a></p>${guide ? `<p><a href="/guides/${guide.slug}/">Read the step-by-step guide</a></p>` : ''}</div></section><article class="prose"><h2>Pricing</h2>${pricingTable(a)}<h2>Sample output</h2>${sampleBlock(sampleOf(a.name))}<h2>Call from code</h2><p>Use the existing catalog input below as a starting point. Review the tool's input form on Apify before running it.</p>${codeTabs(a)}</article>${growthLinks(a)}</div>`;
    write(`tools/${a.name}/index.html`, page({ path: toolPath, title: `${a.title} — API, output & pricing | ${SITE.name}`, description: a.description, nav: 'tools', actors, body, jsonLd: [{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: a.title, description: a.description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Web, API', url: `${SITE.origin}${toolPath}`, offers: { '@type': 'Offer', price: a.price.usd, priceCurrency: 'USD', description: `Catalog price per ${a.price.unit}` } }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Tools', item: `${SITE.origin}/tools/` }, { '@type': 'ListItem', position: 2, name: a.title, item: `${SITE.origin}${toolPath}` }] }] }));
}
for (const w of WORKFLOWS) {
    write(`workflows/${w.slug}/index.html`, page({ path: `/workflows/${w.slug}/`, title: `${w.title} — data tools & steps | ${SITE.name}`, description: w.description, nav: 'workflows', actors, body: `<div class="wrap"><div class="crumbs"><a href="/">Home</a> / <a href="/workflows/">Workflows</a></div><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Workflow</div><h1>${esc(w.title)}</h1><p class="lede">${esc(w.description)}</p></div></section><article class="prose"><ol>${w.actors.map(name => `<li><a href="/tools/${name}/">${esc(actors[name].title)}</a><p>${esc(actors[name].description)}</p></li>`).join('')}</ol><p>These are suggested research steps. Review each input schema and map the output fields between steps; each tool is billed separately at its listed price.</p></article><section class="block"><h2>More workflows</h2><ul>${WORKFLOWS.filter(x => x.slug !== w.slug).map(x => `<li><a href="/workflows/${x.slug}/">${esc(x.title)}</a></li>`).join('')}</ul></section></div>` }));
}
write('workflows/index.html', page({ path: '/workflows/', title: `Lead, RAG, SEO & Hiring workflows | ${SITE.name}`, description: 'Connect data tools for lead research, RAG knowledge pipelines, SEO audits and hiring research.', nav: 'workflows', actors, body: `<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">Workflows</div><h1>Connect tools to your research.</h1><p class="lede">Explore practical steps for leads, knowledge retrieval, SEO and hiring.</p></div></section><section class="block"><div class="grid">${WORKFLOWS.map(w => `<a class="card" href="/workflows/${w.slug}/"><h2>${esc(w.title)}</h2><p>${esc(w.description)}</p></a>`).join('')}</div></section></div>` }));

// ---- 404, sitemap, robots, CNAME
write('404.html', page({ path: '/404.html', title: `Not found | ${SITE.name}`, description: 'Page not found.', actors, noindex: true, body: '<div class="wrap"><section class="hero" style="grid-template-columns:1fr"><div><div class="kicker">404</div><h1>That page moved or never existed.</h1><p class="lede"><a href="/guides/">Browse the guides</a> or <a href="/tools/">all tools</a>.</p></div></section></div>' }));
const today = new Date().toISOString().slice(0, 10);
const urls = renderedPages.map(p => new URL(p.url).pathname);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE.origin}${u}</loc><lastmod>${guides.find((g) => `/guides/${g.slug}/` === u)?.meta.updated ?? today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);
write('CNAME', 'data.chimeramind.com\n');
write('.nojekyll', '');
write('build-manifest.json', `${JSON.stringify({ builtAt: new Date().toISOString(), sourceCommit: process.env.GITHUB_SHA ?? null, pages: renderedPages }, null, 2)}\n`);
console.log(`built ${guides.length} guides, ${all.length} tool landings, ${WORKFLOWS.length} workflows (${urls.length} indexable pages) → dist/`);
