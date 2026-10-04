// Tells IndexNow engines (Bing, Yandex, Seznam, Naver, Yep) about new or changed pages — no account needed.
// The key file is served at the site root (public/<key>.txt). Only URLs whose sitemap <lastmod> changed since the
// last successful submission are sent, as IndexNow asks. Usage: node indexnow.mjs (after build + deploy).
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const key = fs.readFileSync(path.join(here, 'data', 'indexnow-key.txt'), 'utf8').trim();
const host = 'data.chimeramind.com';
const sitemap = fs.readFileSync(path.join(here, 'dist', 'sitemap.xml'), 'utf8');
const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ url: m[1], lastmod: m[2] }));
const stateFile = path.join(here, 'data', 'indexnow-state.json');
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
const changed = entries.filter((e) => state[e.url] !== e.lastmod);
if (!changed.length) {
    console.log('indexnow: nothing changed');
    process.exit(0);
}
// The key file must be live before engines fetch it.
const live = await fetch(`https://${host}/${key}.txt`).then((r) => r.text()).catch(() => '');
if (live.trim() !== key) {
    console.log('indexnow: key file not live yet, skipping this time');
    process.exit(0);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: changed.map((e) => e.url) }),
});
console.log(`indexnow: submitted ${changed.length} URL(s) → HTTP ${res.status}`);
if (res.status === 200 || res.status === 202) {
    for (const e of changed) state[e.url] = e.lastmod;
    fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 1)}\n`);
}
