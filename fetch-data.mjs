// Pulls everything the guides quote from the live Apify API, so no number on the site is typed by hand:
// actor metadata (title, price, users, icon, input schema prefill) and REAL output rows from our latest
// successful run of each actor. Writes data/actors.json and data/samples/<actor>.json. Reads only, costs nothing.
// Usage: node fetch-data.mjs [--run-missing]   (--run-missing: one default-input platform run for a guide actor that has
// no successful run inside the 7-day retention window, so its sample is still real output; ~$0.001 each)
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const actorsDir = path.join(here, '..', 'actors');
const TOKEN = fs.readFileSync(path.join(actorsDir, '.secrets', 'apify-token.txt'), 'utf8').trim();
const api = async (p) => (await fetch(`https://api.apify.com/v2/${p}${p.includes('?') ? '&' : '?'}token=${TOKEN}`)).json();

const guides = fs.readdirSync(path.join(here, 'content', 'guides')).filter((f) => f.endsWith('.md'));
const wanted = new Set(guides.map((f) => /^actor:\s*(\S+)/m.exec(fs.readFileSync(path.join(here, 'content', 'guides', f), 'utf8'))?.[1]).filter(Boolean));

const primaryPrice = (d) => {
    const ev = (d.pricingInfos ?? []).filter((p) => !p.startedAt || Date.parse(p.startedAt) <= Date.now()).at(-1)?.pricingPerEvent?.actorChargeEvents ?? {};
    const e = Object.values(ev).find((x) => x.isPrimaryEvent) ?? Object.values(ev).find((x) => x.eventTieredPricingUsd || (x.eventPriceUsd && !x.isOneTimeEvent));
    if (!e) return null;
    const tiers = e.eventTieredPricingUsd ? Object.fromEntries(Object.entries(e.eventTieredPricingUsd).map(([k, v]) => [k, v.tieredEventPriceUsd])) : { FREE: e.eventPriceUsd };
    return { unit: e.eventTitle ?? 'result', usd: tiers.FREE, tiers };
};

const clip = (v, depth = 0) => {
    if (typeof v === 'string') return v.length > 280 ? `${v.slice(0, 277)}…` : v;
    if (Array.isArray(v)) return v.slice(0, depth ? 3 : 5).map((x) => clip(x, depth + 1));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clip(x, depth + 1)]));
    return v;
};

const acts = (await api('acts?my=1&limit=500')).data.items;
const out = {};
fs.mkdirSync(path.join(here, 'data', 'samples'), { recursive: true });
for (const a of acts) {
    const d = (await api(`acts/${a.id}`)).data;
    if (!d?.isPublic) continue;
    let prefill = {};
    try {
        const schema = JSON.parse(fs.readFileSync(path.join(actorsDir, d.name, '.actor', 'input_schema.json'), 'utf8'));
        for (const [k, f] of Object.entries(schema.properties ?? {})) {
            const v = f.prefill ?? f.default;
            if (v !== undefined && !f.sectionCaption && Object.keys(prefill).length < 3) prefill[k] = v;
        }
    } catch {
        prefill = {};
    }
    out[d.name] = {
        name: d.name,
        title: d.title,
        description: d.description,
        url: `https://apify.com/webdatatools/${d.name}`,
        icon: d.pictureUrl ?? null,
        users30: d.stats?.totalUsers30Days ?? 0,
        runs: d.stats?.totalRuns ?? 0,
        categories: d.categories ?? [],
        price: primaryPrice(d),
        prefill,
    };
    if (!wanted.has(d.name)) continue;
    let runs = (await api(`acts/${d.id}/runs?desc=1&limit=20&status=SUCCEEDED`)).data?.items ?? [];
    if (!runs.length && process.argv.includes('--run-missing')) {
        const r = await (await fetch(`https://api.apify.com/v2/acts/${d.id}/runs?waitForFinish=240&token=${TOKEN}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).json();
        console.log(`ran ${d.name}: ${r.data?.status}`);
        if (r.data?.status === 'SUCCEEDED') runs = [r.data];
    }
    for (const r of runs) {
        const raw = await api(`datasets/${r.defaultDatasetId}/items?limit=25&clean=1`);
        // The richest row makes the best example: most filled fields, then most content.
        const filled = (x) => Object.values(x).filter((v) => v !== null && v !== '' && !(Array.isArray(v) && !v.length)).length;
        const items = Array.isArray(raw) ? raw.filter((x) => !x.error).sort((a, b) => filled(b) - filled(a) || JSON.stringify(b).length - JSON.stringify(a).length).slice(0, 3) : raw;
        if (Array.isArray(items) && items.length) {
            fs.writeFileSync(path.join(here, 'data', 'samples', `${d.name}.json`), `${JSON.stringify({ runId: r.id, finishedAt: r.finishedAt, items: items.map((x) => clip(x)) }, null, 2)}\n`);
            break;
        }
    }
}
fs.writeFileSync(path.join(here, 'data', 'actors.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`actors ${Object.keys(out).length}, guides want ${wanted.size}, samples ${fs.readdirSync(path.join(here, 'data', 'samples')).length}`);
