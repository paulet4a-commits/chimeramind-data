// Catalog review helper: adds newly public Actors to data/catalog-lock.json + data/actors.json with their live
// price and input-schema prefill, so fetch-data.mjs stops failing with "Unexpected public Actor". Read-only on Apify.
// Usage: APIFY_TOKEN=… node scripts/catalog-add.mjs [--apply]   (without --apply: prints what would be added)
//        node scripts/catalog-add.mjs --check <actorName>          (compares derived prefill with the locked one)
import fs from 'node:fs';
import path from 'node:path';
import { getApifyToken } from '../src/credentials.mjs';
import { createApi, primaryPrice } from '../src/apify.mjs';

const root = path.join(import.meta.dirname, '..');
const api = createApi(getApifyToken());
const lockFile = path.join(root, 'data/catalog-lock.json');
const actorsFile = path.join(root, 'data/actors.json');
const lock = JSON.parse(fs.readFileSync(lockFile));
const actors = JSON.parse(fs.readFileSync(actorsFile));

async function prefillOf(d) {
    const buildId = d.taggedBuilds?.latest?.buildId;
    if (!buildId) throw new Error(`No latest build: ${d.name}`);
    const build = (await api(`acts/${d.id}/builds/${buildId}`)).data;
    const raw = build?.inputSchema ?? build?.actorDefinition?.input;
    const schema = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!schema?.properties) throw new Error(`No input schema: ${d.name}`);
    return Object.fromEntries(Object.entries(schema.properties)
        .map(([k, p]) => [k, p.prefill])
        .filter(([, v]) => v !== undefined));
}

const checkName = process.argv.includes('--check') ? process.argv[process.argv.indexOf('--check') + 1] : null;
if (checkName) {
    const d = (await api(`acts/webdatatools~${checkName}`)).data;
    console.log(JSON.stringify({ derived: await prefillOf(d), locked: lock.actors[checkName]?.prefill }, null, 1));
    process.exit(0);
}

const listing = (await api('acts?my=1&limit=1000')).data;
const added = [];
for (const a of listing.items) {
    const d = (await api(`acts/${a.id}`)).data;
    if (!d?.isPublic || lock.actors[d.name]) continue;
    const price = primaryPrice(d);
    if (!price) throw new Error(`No live price: ${d.name}`);
    const prefill = await prefillOf(d);
    lock.actors[d.name] = { price, prefill };
    actors[d.name] = {
        name: d.name, title: d.title, description: d.description, url: `https://apify.com/webdatatools/${d.name}`,
        icon: d.pictureUrl ?? null, users30: d.stats?.totalUsers30Days ?? 0, runs: d.stats?.totalRuns ?? 0,
        categories: d.categories ?? [], price, prefill,
    };
    added.push(`${d.name} (${price.usd}/${price.unit})`);
}
console.log(`${added.length} new public Actor(s):\n  ${added.join('\n  ')}`);
if (!process.argv.includes('--apply') || !added.length) process.exit(0);
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
lock.actors = sorted(lock.actors);
fs.writeFileSync(lockFile, `${JSON.stringify(lock)}\n`);
fs.writeFileSync(actorsFile, `${JSON.stringify(actors, null, 1)}\n`);
console.log(`catalog-lock + actors.json now ${Object.keys(lock.actors).length} Actors. Review the diff, then run npm run fetch.`);
