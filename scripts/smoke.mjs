import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { previewServer } from '../serve.mjs';
import { validateDist } from '../src/quality.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const live = process.argv.includes('--live');
const result = validateDist(root);
const manifest = JSON.parse(fs.readFileSync(new URL('../dist/build-manifest.json', import.meta.url)));
let server;
let origin = 'https://data.chimeramind.com';
if (!live) {
    server = previewServer();
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    origin = `http://127.0.0.1:${server.address().port}`;
}
const get = async p => {
    const r = await fetch(`${origin}${p}`, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
    assert.equal(r.status, 200, `HTTP ${r.status}: ${p}`);
    return r;
};
try {
    const sitemap = await (await get('/sitemap.xml')).text();
    assert.equal(sitemap.trim(), fs.readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8').trim(), 'Published sitemap differs from tested build');
    const remoteManifest = await (await get('/build-manifest.json')).json();
    assert.deepEqual(remoteManifest, manifest, 'Published build identity differs');
    const paths = live ? ['/', '/tools/', '/guides/google-maps-scraper/', '/tools/google-maps-scraper/', '/tools/website-to-markdown/', '/tools/email-validator/', '/tools/market-quotes/', '/workflows/lead/', '/workflows/rag/', '/workflows/seo/', '/workflows/hiring/'] : manifest.pages.map(p => new URL(p.url).pathname);
    for (const p of paths) {
        const html = await (await get(p)).text();
        assert.ok(html.includes(`<link rel="canonical" href="https://data.chimeramind.com${p}">`), `Canonical wrong at ${p}`);
        assert.ok(!/from a recent run|output from a recent run/.test(html), `Stale freshness claim at ${p}`);
        assert.match(html, /<title>[^<]+<\/title>/);
    }
    for (const p of ['/assets/site.css', '/assets/sample-status.js', '/assets/freshness.mjs', '/robots.txt', '/ddd237ba41bcd5c98c520e1914d9ffdc.txt']) await get(p);
    const missing = await fetch(`${origin}/__growth-v2-missing/`);
    assert.equal(missing.status, 404, 'Missing route must return HTTP 404');
    console.log(`${live ? 'Live' : 'Local HTTP'} smoke passed: ${paths.length} pages, sitemap, build identity, assets, key and 404.`, result);
} finally { if (server) await new Promise(resolve => server.close(resolve)); }
