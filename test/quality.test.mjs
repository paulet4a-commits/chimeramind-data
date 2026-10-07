import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { validateData, validateDist, hash } from '../src/quality.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
let fixture;
before(() => {
    fixture = fs.mkdtempSync(path.join(os.tmpdir(),'chimeramind-data-quality-'));
    for (const name of ['src','data','public','content','node_modules','build.mjs']) fs.cpSync(path.join(root,name),path.join(fixture,name),{recursive:true});
    execFileSync(process.execPath,['build.mjs'],{cwd:fixture});
});
after(() => {
    assert.equal(path.dirname(fixture),path.resolve(os.tmpdir()));
    assert.ok(path.basename(fixture).startsWith('chimeramind-data-quality-'));
    fs.rmSync(fixture,{recursive:true,force:true});
});
function mutate(file, edit, expected) {
    const p=path.join(fixture,file), original=fs.readFileSync(p,'utf8');
    fs.writeFileSync(p,edit(original));
    try { assert.throws(()=>validateDist(fixture),expected); }
    finally { fs.writeFileSync(p,original); }
}
test('generated pages cover exactly 71 tools, 17 guides, 4 workflows and indexes',()=>{
    assert.deepEqual(validateDist(fixture),{pages:96,tools:71,workflows:4});
});
test('wrong canonical and noindex landing are rejected',()=>{
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('rel="canonical" href="https://data.chimeramind.com/tools/google-maps-scraper/"','rel="canonical" href="https://wrong.invalid/"'),/Wrong canonical/);
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('<head>','<head><meta name="robots" content="noindex">'),/not indexable/);
});
test('duplicate titles, missing pages and sitemap duplicates are rejected',()=>{
    const homeTitle=/<title>([^<]+)<\/title>/.exec(fs.readFileSync(path.join(fixture,'dist/index.html'),'utf8'))[1];
    mutate('dist/tools/index.html',s=>s.replace(/<title>[^<]+<\/title>/,`<title>${homeTitle}</title>`),/duplicate title/);
    mutate('dist/sitemap.xml',s=>s.replace(/<url><loc>https:\/\/data\.chimeramind\.com\/tools\/email-validator\/[\s\S]*?<\/url>/,''),/absent from sitemap/);
    mutate('dist/sitemap.xml',s=>s.replace('</urlset>','<url><loc>https://data.chimeramind.com/</loc></url></urlset>'),/Duplicate sitemap/);
});
test('stale label lies and broken internal links are rejected',()=>{
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('data-sample-status="archived"','data-sample-status="recorded"'),/Incorrect sample age/);
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('Archived example','Real output from a recent run'),/Unverified sample freshness/);
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('href="/tools/contact-extractor/"','href="/tools/nonexistent/"'),/Broken internal link/);
});
test('CTA attribution and build artifact tampering are rejected',()=>{
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace(/source_page=[^&"]+/, 'source_page=%2Fwrong%2F'),/Wrong CTA source/);
    mutate('dist/tools/google-maps-scraper/index.html',s=>s.replace('</h1>','!</h1>'),/hash mismatch/);
});
test('live release blocks missing, old or mismatched fetch marker and accepts verified hashes',()=>{
    const p=path.join(fixture,'data/fetch-meta.json');
    if(fs.existsSync(p))fs.unlinkSync(p);
    assert.throws(()=>validateData(fixture,{release:true}),/fetch-meta/);
    const marker={fetchedAt:new Date().toISOString(),actorsSha256:hash(fs.readFileSync(path.join(fixture,'data/actors.json'))),sampleHashes:Object.fromEntries(fs.readdirSync(path.join(fixture,'data/samples')).sort().filter(f=>f.endsWith('.json')).map(f=>[f,hash(fs.readFileSync(path.join(fixture,'data/samples',f)))]))};
    fs.writeFileSync(p,JSON.stringify(marker));
    assert.equal(validateData(fixture,{release:true}).actors,71);
    fs.writeFileSync(p,JSON.stringify({...marker,fetchedAt:'2020-01-01T00:00:00Z'}));
    assert.throws(()=>validateData(fixture,{release:true}),/within 24 hours/);
    fs.writeFileSync(p,JSON.stringify({...marker,actorsSha256:'wrong'}));
    assert.throws(()=>validateData(fixture,{release:true}),/changed after fetch/);
    fs.writeFileSync(p,JSON.stringify({...marker,sampleHashes:{}}));
    assert.throws(()=>validateData(fixture,{release:true}),/changed after fetch/);
});
