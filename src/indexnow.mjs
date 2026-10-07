export function changedPages(manifest, state = {}) {
    return manifest.pages.filter(page => state[page.url] !== page.sha256);
}

export async function submitIndexNow({ manifest, state, key, request = fetch }) {
    const changed = changedPages(manifest, state);
    if (!changed.length) return { state, submitted: 0 };
    const location = `https://data.chimeramind.com/${key}.txt`;
    const live = await request(location);
    if (!live.ok || (await live.text()).trim() !== key) throw new Error('IndexNow key is not live; submission blocked');
    const res = await request('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'data.chimeramind.com', key, keyLocation: location, urlList: changed.map(p => p.url) }), signal: AbortSignal.timeout(30000) });
    if (![200, 202].includes(res.status)) throw new Error(`IndexNow rejected submission (HTTP ${res.status}); state was not advanced`);
    return { state: Object.fromEntries(manifest.pages.map(p => [p.url, p.sha256])), submitted: changed.length, status: res.status };
}
