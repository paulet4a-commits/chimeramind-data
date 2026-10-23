// Separate recipes: never change the locked Actor catalog inputs or pricing.
export const QUICKSTARTS = [
    {
        slug: 'website-fields', actor: 'css-selector-extractor',
        title: 'Turn website fields into a spreadsheet',
        description: 'Start with one page and one field. Then replace the URL and selector with a product title, price or stock status.',
        guide: 'css-selector-extractor',
        input: { urls: ['https://example.com/'], selectors: [{ name: 'title', selector: 'title', type: 'text' }], firstMatchOnly: true, maxConcurrency: 1, maxPages: 1, proxyMode: 'never' },
        check: 'Check error is empty and matchCounts.title is greater than zero. The title field is inside fields. A successful run with a null field is not a successful extraction.',
        limit: 'Reads static HTML only. Use the browser version for fields inserted by JavaScript. This starter does not follow links or use a proxy.',
    },
    {
        slug: 'youtube-channel-inventory', actor: 'youtube-channel-scraper',
        title: 'Export a YouTube channel inventory',
        description: 'Collect up to 10 recent videos from one channel, then export titles, video URLs and public view counts.',
        guide: 'youtube-channel-inventory',
        input: { channels: ['@apify'], tab: 'videos', sortBy: 'newest', maxVideosPerChannel: 10, maxConcurrency: 1, proxyMode: 'auto' },
        check: 'Check error is empty and each usable row has videoId, title and url. A channel with fewer videos returns fewer rows.',
        limit: 'Public channel data only, without transcripts or private analytics. Relative upload dates and abbreviated view counts are approximate.',
    },
    {
        slug: 'youtube-upload-monitor', actor: 'youtube-channel-scraper',
        title: 'Build a repeatable upload check',
        description: 'Save a small newest-first channel run as a task. Compare video IDs between runs to find newly observed uploads.',
        guide: 'youtube-channel-inventory',
        input: { channels: ['@apify'], tab: 'videos', sortBy: 'newest', maxVideosPerChannel: 20, maxConcurrency: 1, proxyMode: 'auto' },
        check: 'Store successful rows by channelId and videoId. Compare with the previous successful dataset; never treat an error row as an empty channel.',
        limit: 'Scheduling, storing previous results and notifications must be configured separately. A latest-20 window can miss uploads if a channel publishes more than 20 between checks.',
    },
];

export function n8nStarter(recipe) {
    return {
        name: recipe.title,
        nodes: [
            { parameters: {}, id: 'manual-trigger', name: 'Manual trigger', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [240, 300] },
            { parameters: { method: 'POST', url: `https://api.apify.com/v2/acts/webdatatools~${recipe.actor}/run-sync-get-dataset-items`, authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, specifyBody: 'json', jsonBody: JSON.stringify(recipe.input, null, 2), options: { timeout: 300000 } }, id: 'run-apify-actor', name: 'Run Apify actor', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [480, 300] },
        ],
        connections: { 'Manual trigger': { main: [[{ node: 'Run Apify actor', type: 'main', index: 0 }]] } },
        active: false, settings: {}, pinData: {},
    };
}
