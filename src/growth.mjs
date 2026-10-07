export const WORKFLOWS = [
    { slug: 'lead', title: 'Lead research', description: 'Build a local business list, discover contact channels, check email addresses and enrich company profiles.', actors: ['google-maps-scraper', 'contact-extractor', 'email-validator', 'company-360'] },
    { slug: 'rag', title: 'RAG knowledge pipeline', description: 'Discover pages, extract website content, split text into chunks and prepare an llms.txt entry point.', actors: ['sitemap-extractor', 'website-to-markdown', 'rag-text-chunker', 'llms-txt-generator'] },
    { slug: 'seo', title: 'SEO audit workflow', description: 'Collect page URLs, audit on-page SEO, inspect structured data and measure Core Web Vitals.', actors: ['sitemap-extractor', 'seo-page-audit', 'structured-data-extractor', 'core-web-vitals-audit'] },
    { slug: 'hiring', title: 'Hiring research', description: 'Collect jobs from company career sites, research LinkedIn postings and monitor hiring signals alongside remote vacancies.', actors: ['career-site-jobs-api', 'linkedin-jobs-scraper', 'hiring-signals', 'remote-jobs-aggregator'] },
];

export function attributedUrl(actor, { page = '/tools/', placement = 'cta', source = 'data.chimeramind.com' } = {}) {
    const url = new URL(actor.url);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'growth_v2');
    url.searchParams.set('utm_content', `${page}:${placement}`);
    url.searchParams.set('utm_term', actor.name);
    url.searchParams.set('source_page', page);
    url.searchParams.set('source_actor', actor.name);
    return url.href;
}

export function relatedActors(actor, actors) {
    const linked = new Set(WORKFLOWS.filter(w => w.actors.includes(actor.name)).flatMap(w => w.actors));
    return Object.values(actors).filter(a => a.name !== actor.name).map(a => ({ actor: a, score: (linked.has(a.name) ? 100 : 0) + (a.categories ?? []).filter(c => actor.categories?.includes(c)).length }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.actor.name.localeCompare(b.actor.name)).slice(0, 4).map(x => x.actor);
}
