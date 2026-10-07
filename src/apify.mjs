export function createApi(token, request = fetch) {
    return async (endpoint) => {
        if (!/^(acts|datasets)(\/|\?)/.test(endpoint) || endpoint.includes('token=')) throw new Error('Invalid read-only Apify endpoint');
        let res;
        try {
            res = await request(`https://api.apify.com/v2/${endpoint}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
        } catch { throw new Error('Apify read request failed. No files were published.'); }
        if (!res.ok) throw new Error(`Apify read request failed (HTTP ${res.status}).`);
        try { return await res.json(); } catch { throw new Error('Apify returned invalid JSON.'); }
    };
}

export function primaryPrice(d, now = Date.now()) {
    const ev = (d.pricingInfos ?? []).filter(p => !p.startedAt || Date.parse(p.startedAt) <= now).at(-1)?.pricingPerEvent?.actorChargeEvents ?? {};
    const e = Object.values(ev).find(x => x.isPrimaryEvent) ?? Object.values(ev).find(x => x.eventTieredPricingUsd || (x.eventPriceUsd && !x.isOneTimeEvent));
    if (!e) return null;
    const tiers = e.eventTieredPricingUsd ? Object.fromEntries(Object.entries(e.eventTieredPricingUsd).map(([k, v]) => [k, v.tieredEventPriceUsd])) : { FREE: e.eventPriceUsd };
    return { unit: e.eventTitle ?? 'result', usd: tiers.FREE, tiers };
}
