const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export function createApi(token, request = fetch, sleep = pause) {
    return async (endpoint) => {
        if (!/^(acts|datasets)(\/|\?)/.test(endpoint) || endpoint.includes('token=')) throw new Error('Invalid read-only Apify endpoint');
        const deadline = Date.now() + 30000;
        for (let attempt = 0; attempt < 3; attempt++) {
            let res;
            try {
                res = await request(`https://api.apify.com/v2/${endpoint}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(Math.max(1, Math.min(10000, deadline - Date.now()))) });
            } catch {
                if (attempt === 2 || Date.now() >= deadline) throw new Error('Apify read request failed. No files were published.');
                await sleep(Math.min(500 * 2 ** attempt, Math.max(0, deadline - Date.now())));
                continue;
            }
            if (res.ok) {
                try { return await res.json(); } catch { throw new Error('Apify returned invalid JSON.'); }
            }
            await res.body?.cancel().catch(() => {});
            if (![429, 500, 502, 503, 504].includes(res.status) || attempt === 2 || Date.now() >= deadline) throw new Error(`Apify read request failed (HTTP ${res.status}).`);
            const retryAfter = res.headers?.get('retry-after');
            const seconds = Number(retryAfter);
            const requestedWait = retryAfter ? (Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now()) : 500 * 2 ** attempt;
            const wait = Number.isFinite(requestedWait) ? Math.max(0, requestedWait) : 500 * 2 ** attempt;
            if (wait >= deadline - Date.now()) throw new Error(`Apify read request failed (HTTP ${res.status}).`);
            await sleep(wait);
        }
    };
}

export function primaryPrice(d, now = Date.now()) {
    const ev = (d.pricingInfos ?? []).filter(p => !p.startedAt || Date.parse(p.startedAt) <= now).at(-1)?.pricingPerEvent?.actorChargeEvents ?? {};
    const e = Object.values(ev).find(x => x.isPrimaryEvent) ?? Object.values(ev).find(x => x.eventTieredPricingUsd || (x.eventPriceUsd && !x.isOneTimeEvent));
    if (!e) return null;
    const tiers = e.eventTieredPricingUsd ? Object.fromEntries(Object.entries(e.eventTieredPricingUsd).map(([k, v]) => [k, v.tieredEventPriceUsd])) : { FREE: e.eventPriceUsd };
    return { unit: e.eventTitle ?? 'result', usd: tiers.FREE, tiers };
}
