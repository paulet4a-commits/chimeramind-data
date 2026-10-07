import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateData } from '../src/quality.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
test('read-only fetch preserves prices, input and samples; drift fails before any snapshot write',()=>{
    const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'chimeramind-data-fetch-'));
    try {
        for(const name of ['src','data','content','node_modules','fetch-data.mjs'])fs.cpSync(path.join(root,name),path.join(fixture,name),{recursive:true});
        fs.copyFileSync(path.join(root,'test/fetch-mock.mjs'),path.join(fixture,'mock.mjs'));
        const before=fs.readFileSync(path.join(fixture,'data/actors.json'),'utf8');
        const run=drift=>spawnSync(process.execPath,['--import','./mock.mjs','fetch-data.mjs'],{cwd:fixture,encoding:'utf8',env:{...process.env,APIFY_TOKEN:'integration-test',TEST_PRICE_DRIFT:drift?'1':''}});
        const failed=run(true);
        assert.notEqual(failed.status,0);assert.match(failed.stderr,/Price change blocked/);
        assert.equal(fs.readFileSync(path.join(fixture,'data/actors.json'),'utf8'),before);
        const result=run(false);
        assert.equal(result.status,0,result.stderr);
        assert.equal(validateData(fixture,{release:true}).actors,71);
        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture,'data/actors.json'))),JSON.parse(before));
        for(const f of fs.readdirSync(path.join(root,'data/samples')))assert.deepEqual(fs.readFileSync(path.join(root,'data/samples',f)),fs.readFileSync(path.join(fixture,'data/samples',f)));
        const requests=fs.readFileSync(path.join(fixture,'requests.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
        assert.ok(requests.length>71 && requests.every(r=>r.method==='GET' && !r.url.includes('token=')));
    } finally {
        assert.equal(path.dirname(fixture),path.resolve(os.tmpdir()));
        assert.ok(path.basename(fixture).startsWith('chimeramind-data-fetch-'));
        fs.rmSync(fixture,{recursive:true,force:true});
    }
});
