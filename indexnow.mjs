// Tells IndexNow engines (Bing, Yandex, Seznam, Naver, Yep) about new or changed pages — no account needed.
// The key file is public by design. Content hashes track successfully submitted pages.
// A verified deployment receipt is mandatory; failed deploys never notify search engines.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { submitIndexNow } from './src/indexnow.mjs';
import { hash } from './src/quality.mjs';

const here = import.meta.dirname;
const key = fs.readFileSync(path.join(here, 'data', 'indexnow-key.txt'), 'utf8').trim();
assert.match(key, /^[a-zA-Z0-9-]{8,128}$/, 'Invalid IndexNow public key');
const receipt = JSON.parse(fs.readFileSync(path.join(here, 'data/deploy-receipt.json')));
assert.ok(receipt.pushed && receipt.verifiedAt && Date.now() - Date.parse(receipt.verifiedAt) < 86400000, 'Verified live deployment required before IndexNow');
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'dist/build-manifest.json')));
assert.equal(receipt.manifestSha256, hash(JSON.stringify(manifest)), 'Deployment receipt/build mismatch');
const liveBuild = await fetch('https://data.chimeramind.com/build-manifest.json', { cache: 'no-store', signal: AbortSignal.timeout(20000) });
assert.ok(liveBuild.ok, 'Live build manifest unavailable');
assert.deepEqual(await liveBuild.json(), manifest, 'Live build changed; IndexNow blocked');
const stateFile = path.join(here, 'data', 'indexnow-state.json');
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
const result = await submitIndexNow({ manifest, state, key });
fs.writeFileSync(stateFile, `${JSON.stringify(result.state, null, 1)}\n`);
console.log(`IndexNow: ${result.submitted} changed pages submitted${result.status ? ` (HTTP ${result.status})` : ''}.`);
