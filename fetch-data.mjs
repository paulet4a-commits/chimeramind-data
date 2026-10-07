// Read-only live catalog + existing run samples. No actor starts, pushes or price updates.
import fs from 'node:fs';
import path from 'node:path';
import { getApifyToken } from './src/credentials.mjs';
import { createApi, primaryPrice } from './src/apify.mjs';
import { validateActors, hash } from './src/quality.mjs';

if (process.argv.length > 2) throw new Error('Fetch accepts no run flags. Starting Actors is disabled.');
const here = import.meta.dirname;
const token = getApifyToken();
const api = createApi(token);
const baseline = JSON.parse(fs.readFileSync(path.join(here, 'data/actors.json')));
const lock = JSON.parse(fs.readFileSync(path.join(here, 'data/catalog-lock.json')));
const sampleDir = path.join(here, 'data/samples');
const samples = Object.fromEntries(fs.readdirSync(sampleDir).filter(f => f.endsWith('.json')).map(f => [f, fs.readFileSync(path.join(sampleDir, f), 'utf8')]));
const wanted = new Set(Object.keys(samples).map(f => f.slice(0, -5)));
const listing = (await api('acts?my=1&limit=1000')).data;
if (!Array.isArray(listing?.items) || listing.total > listing.items.length) throw new Error('Incomplete live Actor catalog');
const out = {};
const clip = (v, depth = 0) => {
    if (typeof v === 'string') return v.length > 280 ? `${v.slice(0, 277)}…` : v;
    if (Array.isArray(v)) return v.slice(0, depth ? 3 : 5).map(x => clip(x, depth + 1));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clip(x, depth + 1)]));
    return v;
};
for (const a of listing.items) {
    const d = (await api(`acts/${a.id}`)).data;
    if (!d?.isPublic) continue;
    if (!baseline[d.name]) throw new Error(`Unexpected public Actor: ${d.name}; catalog review required`);
    out[d.name] = { name: d.name, title: d.title, description: d.description, url: baseline[d.name].url, icon: d.pictureUrl ?? null, users30: d.stats?.totalUsers30Days ?? 0, runs: d.stats?.totalRuns ?? 0, categories: d.categories ?? [], price: primaryPrice(d), prefill: baseline[d.name].prefill };
    if (!wanted.has(d.name)) continue;
    const runs = (await api(`acts/${d.id}/runs?desc=1&limit=20&status=SUCCEEDED`)).data?.items;
    if (!Array.isArray(runs)) throw new Error(`Invalid run listing: ${d.name}`);
    for (const r of runs) {
        if (!r.defaultDatasetId || !Number.isFinite(Date.parse(r.finishedAt)) || Date.parse(r.finishedAt) > Date.now()) continue;
        if (Date.parse(r.finishedAt) <= Date.parse(JSON.parse(samples[`${d.name}.json`]).finishedAt)) continue;
        let raw;
        try { raw = await api(`datasets/${r.defaultDatasetId}/items?limit=25&clean=1`); }
        catch (error) { if (error.message.includes('HTTP 404')) continue; throw error; }
        const filled = x => Object.values(x).filter(v => v !== null && v !== '' && !(Array.isArray(v) && !v.length)).length;
        if (!Array.isArray(raw)) throw new Error(`Invalid dataset: ${d.name}`);
        const items = raw.filter(x => x && typeof x === 'object' && !x.error).sort((a, b) => filled(b) - filled(a) || JSON.stringify(b).length - JSON.stringify(a).length).slice(0, 3);
        if (!items.length) continue;
        samples[`${d.name}.json`] = `${JSON.stringify({ runId: r.id, finishedAt: r.finishedAt, items: items.map(x => clip(x)) }, null, 2)}\n`;
        break;
    }
}
validateActors(out, lock);
const actorsText = `${JSON.stringify(out, null, 1)}\n`;
const meta = { fetchedAt: new Date().toISOString(), actorsSha256: hash(actorsText), sampleHashes: Object.fromEntries(Object.keys(samples).sort().map(f => [f, hash(samples[f])])) };
// Marker written last; an interrupted update fails the release hash check.
const atomicWrite = (file, text) => { fs.writeFileSync(`${file}.tmp`, text); fs.renameSync(`${file}.tmp`, file); };
for (const [file, text] of Object.entries(samples)) atomicWrite(path.join(sampleDir, file), text);
atomicWrite(path.join(here, 'data/actors.json'), actorsText);
atomicWrite(path.join(here, 'data/fetch-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
console.log(`Read-only fetch complete: ${Object.keys(out).length} Actors, ${Object.keys(samples).length} samples. Prices and inputs preserved.`);
