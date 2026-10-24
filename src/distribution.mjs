// Generated from published content, never a second hand-maintained product catalog.
export function distributionManifest({ actors, guides, quickstarts, workflows, origin, sourceCommit = null }) {
    const rows = Object.values(actors).map(actor => {
        const starters = quickstarts.filter(r => r.actor === actor.name).map(r => ({ url: `${origin}/start/${r.slug}/`, title: r.title }));
        const articles = guides.filter(g => g.meta.actor === actor.name).map(g => ({ url: `${origin}/guides/${g.slug}/`, title: g.meta.title }));
        const toolUrl = `${origin}/tools/${actor.name}/`;
        return { product: `apify--${actor.name}`, actor: actor.name, title: actor.title, storeUrl: actor.url, toolUrl,
            preferredUrl: starters[0]?.url ?? articles[0]?.url ?? toolUrl,
            starters, guides: articles, workflows: workflows.filter(w => w.actors.includes(actor.name)).map(w => ({ url: `${origin}/workflows/${w.slug}/`, title: w.title })) };
    });
    return { version: 1, origin, generatedAt: new Date().toISOString(), sourceCommit, products: rows,
        note: 'Content routes only. Fetch the selected page before making claims. A route is not runtime, traffic or sales evidence.' };
}
