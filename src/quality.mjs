import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { WORKFLOWS } from './growth.mjs';
import { sampleStatus } from './freshness.mjs';
import { parseFrontmatter } from './render.mjs';

export const hash = value => createHash('sha256').update(value).digest('hex');
export function validateActors(actors, lock) {
    const keys = Object.keys(actors).sort();
    assert.equal(keys.length, 71, 'Expected exactly 71 public actors');
    assert.deepEqual(keys, Object.keys(lock.actors).sort(), 'Actor catalog drift: missing or unexpected actor');
    for (const name of keys) {
        const a = actors[name];
        assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Unsafe actor slug');
        assert.equal(a.name, name, 'Actor name does not match catalog key');
        assert.ok(a.title && a.description, `Missing title/description: ${name}`);
        assert.equal(a.url, `https://apify.com/webdatatools/${name}`, `Unexpected actor URL: ${name}`);
        assert.ok(a.price && a.price.unit && Number.isFinite(a.price.usd) && a.price.usd >= 0, `Missing/invalid price: ${name}`);
        assert.ok(Object.keys(a.price.tiers ?? {}).length && a.price.usd === a.price.tiers.FREE, `Invalid tiers: ${name}`);
        assert.ok(Object.values(a.price.tiers).every(p => Number.isFinite(p) && p >= 0), `Invalid price tier: ${name}`);
        assert.deepEqual(a.price, lock.actors[name].price, `Price change blocked: ${name}`);
        assert.deepEqual(a.prefill, lock.actors[name].prefill, `Actor input change blocked: ${name}`);
        assert.ok(Array.isArray(a.categories), `Missing categories: ${name}`);
    }
    for (const w of WORKFLOWS) for (const name of w.actors) assert.ok(actors[name], `Missing workflow actor: ${name}`);
}

export function validateData(root, { release = false, now = Date.now() } = {}) {
    const actorsFile = path.join(root, 'data/actors.json');
    const actors = JSON.parse(fs.readFileSync(actorsFile));
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog-lock.json')));
    validateActors(actors, lock);
    const samples = {};
    for (const f of fs.readdirSync(path.join(root, 'data/samples')).filter(f => f.endsWith('.json'))) {
        const name = f.slice(0, -5);
        assert.ok(actors[name], `Sample references missing actor: ${name}`);
        const value = JSON.parse(fs.readFileSync(path.join(root, 'data/samples', f)));
        const state = sampleStatus(value, now);
        assert.notEqual(state.status, 'invalid', `Invalid sample provenance/date: ${name}`);
        samples[name] = state;
    }
    for (const f of fs.readdirSync(path.join(root, 'content/guides')).filter(f => f.endsWith('.md'))) {
        const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(root, 'content/guides', f), 'utf8'));
        if (meta.draft === 'true') continue;
        assert.ok(actors[meta.actor], `Missing guide actor: ${f}`);
        assert.ok(meta.title && meta.description && meta.updated, `Missing guide metadata: ${f}`);
        assert.ok(!/from a recent run/i.test(body), `Unverified recent sample claim: ${f}`);
    }
    if (release) {
        const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/fetch-meta.json')));
        const age = now - Date.parse(meta.fetchedAt);
        assert.ok(Number.isFinite(age) && age >= 0 && age < 86400000, 'Release requires live data fetched within 24 hours');
        assert.equal(meta.actorsSha256, hash(fs.readFileSync(actorsFile)), 'Catalog snapshot was changed after fetch');
        const sampleHashes = Object.fromEntries(fs.readdirSync(path.join(root, 'data/samples')).filter(f => f.endsWith('.json')).sort().map(f => [f, hash(fs.readFileSync(path.join(root, 'data/samples', f)))]));
        assert.deepEqual(meta.sampleHashes, sampleHashes, 'Sample snapshot was changed after fetch');
    }
    return { actors: Object.keys(actors).length, samples: Object.keys(samples).length, archived: Object.values(samples).filter(s => s.status === 'archived').length };
}

export function filesIn(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

export function validateDist(root) {
    const dist = path.join(root, 'dist');
    const actors = JSON.parse(fs.readFileSync(path.join(root, 'data/actors.json')));
    const urls = [...fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URL');
    assert.ok(urls.every(u => /^https:\/\/data\.chimeramind\.com\/(?:[a-z0-9-]+\/)*$/.test(u)), 'Invalid sitemap URL');
    const titles = new Set();
    const seen = new Set();
    for (const file of filesIn(dist).filter(f => f.endsWith('.html'))) {
        const html = fs.readFileSync(file, 'utf8');
        const rel = path.relative(dist, file).replaceAll('\\', '/');
        const pagePath = rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? `/${rel.slice(0, -10)}` : `/${rel}`;
        const canonical = `https://data.chimeramind.com${pagePath}`;
        const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
        assert.ok(title && !titles.has(title), `Missing/duplicate title: ${rel}`);
        titles.add(title);
        assert.equal([...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)].length, 1, `Missing/duplicate canonical: ${rel}`);
        assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `Wrong canonical: ${rel}`);
        if (rel !== '404.html') {
            assert.ok(urls.includes(canonical), `Page absent from sitemap: ${rel}`);
            assert.ok(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), `Page is not indexable: ${rel}`);
            seen.add(canonical);
        } else assert.ok(html.includes('noindex, follow'), '404 must be noindex');
        assert.ok(!/\{\{(?:sample|code|pricing|price|cta)\}\}/.test(html), `Unresolved placeholder: ${rel}`);
        assert.ok(!/from a recent run|output from a recent run/i.test(html), `Unverified sample freshness: ${rel}`);
        for (const m of html.matchAll(/data-sample-status="([^"]+)" data-sample-finished="([^"]+)" data-sample-run="([^"]+)"/g)) {
            const state = sampleStatus({ finishedAt: m[2], runId: m[3], items: [true] });
            assert.equal(m[1], state.status, `Incorrect sample age label: ${rel}`);
        }
        for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
        for (const m of html.matchAll(/\bhref="([^"]+)"/g)) {
            const href = m[1].replaceAll('&amp;', '&');
            if (href.startsWith('/')) {
                const target = href.split(/[?#]/)[0];
                const resolved = path.join(dist, target, target.endsWith('/') ? 'index.html' : '');
                assert.ok(fs.existsSync(resolved), `Broken internal link ${href} in ${rel}`);
            }
            if (href.startsWith('https://apify.com/')) {
                const u = new URL(href);
                for (const param of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','source_page','source_actor']) assert.ok(u.searchParams.get(param), `Missing CTA attribution ${param}: ${rel}`);
                assert.equal(u.searchParams.get('source_page'), pagePath, `Wrong CTA source page: ${rel}`);
                const name = u.searchParams.get('source_actor');
                assert.ok(name === 'catalog' || actors[name], `Wrong CTA actor: ${rel}`);
                assert.equal(u.pathname, name === 'catalog' ? '/webdatatools' : `/webdatatools/${name}`, `CTA destination changed: ${rel}`);
            }
        }
    }
    assert.equal(seen.size, urls.length, 'Sitemap points to missing pages');
    for (const a of Object.values(actors)) assert.ok(seen.has(`https://data.chimeramind.com/tools/${a.name}/`), `Missing actor landing: ${a.name}`);
    for (const w of WORKFLOWS) assert.ok(seen.has(`https://data.chimeramind.com/workflows/${w.slug}/`), `Missing workflow page: ${w.slug}`);
    assert.equal(fs.readFileSync(path.join(dist, 'CNAME'), 'utf8').trim(), 'data.chimeramind.com');
    assert.ok(fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8').includes('Sitemap: https://data.chimeramind.com/sitemap.xml'));
    const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'build-manifest.json')));
    assert.deepEqual(manifest.pages.map(p => p.url).sort(), [...urls].sort(), 'Manifest/sitemap mismatch');
    for (const p of manifest.pages) assert.equal(p.sha256, hash(fs.readFileSync(path.join(dist, p.file))), `Manifest content hash mismatch: ${p.file}`);
    return { pages: urls.length, tools: Object.keys(actors).length, workflows: WORKFLOWS.length };
}
