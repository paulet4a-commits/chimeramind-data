import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const receiptFile = new URL('../data/deploy-receipt.json', import.meta.url);
const receipt = JSON.parse(fs.readFileSync(receiptFile));
assert.ok(receipt.pushed, 'No published deployment receipt');
const manifest = JSON.parse(fs.readFileSync(new URL('../dist/build-manifest.json', import.meta.url)));
let ready = false;
for (let i = 0; i < 24; i++) {
    try {
        const res = await fetch(`https://data.chimeramind.com/build-manifest.json?deploy=${receipt.publishedSha}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
        if (res.ok && JSON.stringify(await res.json()) === JSON.stringify(manifest)) { ready = true; break; }
    } catch { /* Pages may still be rebuilding. */ }
    console.log('Waiting for the published build identity...');
    await new Promise(resolve => setTimeout(resolve, 15000));
}
assert.ok(ready, 'Published build not live after 6 minutes. IndexNow blocked; use rollback receipt.');
const result = spawnSync(process.execPath, ['scripts/smoke.mjs','--live'], { cwd: new URL('..', import.meta.url), stdio: 'inherit' });
assert.equal(result.status, 0, 'Live smoke failed. IndexNow blocked; use rollback receipt.');
receipt.verifiedAt = new Date().toISOString();
fs.writeFileSync(receiptFile, JSON.stringify(receipt,null,2));
console.log('Live deployment verified.');
