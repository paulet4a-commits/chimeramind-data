import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { sampleStatus, SAMPLE_MAX_AGE_MS } from '../src/freshness.mjs';
import { sampleBlock, renderGuide } from '../src/render.mjs';
import { getApifyToken } from '../src/credentials.mjs';
import { createApi, primaryPrice } from '../src/apify.mjs';
import { attributedUrl, WORKFLOWS, relatedActors } from '../src/growth.mjs';
import { validateActors } from '../src/quality.mjs';
import { submitIndexNow, changedPages } from '../src/indexnow.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const actors = JSON.parse(fs.readFileSync(new URL('../data/actors.json', import.meta.url)));
const lock = JSON.parse(fs.readFileSync(new URL('../data/catalog-lock.json', import.meta.url)));
const now = Date.parse('2026-10-07T12:00:00Z');
const sample = ms => ({ runId: 'recorded-run', finishedAt: new Date(now-ms).toISOString(), items: [{ field: 'public example' }] });

test('sample becomes archived at exactly seven days; missing, invalid and future dates are hidden', () => {
    assert.equal(sampleStatus(sample(SAMPLE_MAX_AGE_MS-1), now).status, 'recorded');
    assert.equal(sampleStatus(sample(SAMPLE_MAX_AGE_MS), now).status, 'archived');
    assert.equal(sampleStatus(null, now).status, 'missing');
    assert.equal(sampleStatus({ ...sample(0), finishedAt: 'unknown' }, now).status, 'invalid');
    assert.equal(sampleStatus(sample(-1), now).status, 'invalid');
    assert.equal(sampleStatus({ ...sample(0), runId: '' }, now).status, 'invalid');
    assert.match(sampleBlock(sample(8*86400000),now), /Archived example.*8 days old/);
    assert.ok(!sampleBlock({ ...sample(0), finishedAt: 'invalid' },now).includes('<pre>'));
});

test('guide samples, pricing, FAQ and code stay functional; related links stay internal', () => {
    const actor = actors['google-maps-scraper'];
    const body = '## Output\n{{sample}}\n{{code}}\n{{pricing}}\n{{cta}}\n[Related](https://apify.com/webdatatools/contact-extractor)\n## FAQ\n### How?\nUse the API.\n';
    const result = renderGuide(body,actor,sample(8*86400000),{now,page:'/guides/example/',placement:'guide_cta'});
    assert.match(result.html,/Archived example/);
    assert.match(result.html,/os.environ/);
    assert.match(result.html,/Authorization: Bearer/);
    assert.match(result.html,/href="\/tools\/contact-extractor\/"/);
    assert.match(result.html,/source_actor=google-maps-scraper/);
    assert.equal(result.faq.length,1);
    assert.ok(!result.html.includes('{{'));
});

test('71 catalog prices and prefills are unchanged; missing actors, null prices and drift block', () => {
    validateActors(actors,lock);
    for (const mutate of [a => delete a['email-validator'], a => a['email-validator'].price=null, a => a['email-validator'].price.usd+=0.01, a => a['email-validator'].price.tiers.GOLD+=0.01, a => a['email-validator'].prefill={changed:true}]) {
        const copy = structuredClone(actors); mutate(copy); assert.throws(()=>validateActors(copy,lock));
    }
});

test('every workflow actor exists; related tools exclude self and link real catalog entries', () => {
    assert.equal(WORKFLOWS.length,4);
    for (const w of WORKFLOWS) for (const name of w.actors) assert.ok(actors[name]);
    for (const actor of Object.values(actors)) for (const related of relatedActors(actor,actors)) {
        assert.notEqual(related.name,actor.name); assert.ok(actors[related.name]);
    }
    assert.ok(relatedActors(actors['google-maps-scraper'],actors).some(a=>a.name==='contact-extractor'));
});

test('CTA keeps its destination and existing query and attributes source/page/actor/placement', () => {
    const actor = { name:'test-tool',url:'https://apify.com/webdatatools/test-tool?existing=1#input' };
    const u = new URL(attributedUrl(actor,{page:'/tools/test-tool/',placement:'primary'}));
    assert.equal(u.pathname,'/webdatatools/test-tool'); assert.equal(u.hash,'#input');
    assert.equal(u.searchParams.get('existing'),'1');
    assert.equal(u.searchParams.get('source_page'),'/tools/test-tool/');
    assert.equal(u.searchParams.get('source_actor'),'test-tool');
    assert.equal(u.searchParams.get('utm_content'),'/tools/test-tool/:primary');
});

test('credentials use env first, optional local keyring second; missing or CI fallback blocks', () => {
    assert.equal(getApifyToken({APIFY_TOKEN:' env-token '},()=>assert.fail()),'env-token');
    assert.equal(getApifyToken({APIFY_USE_KEYRING:'1'},()=> 'keyring-value'),'keyring-value');
    assert.throws(()=>getApifyToken({},()=>assert.fail()),/APIFY_TOKEN is required/);
    assert.throws(()=>getApifyToken({APIFY_USE_KEYRING:'1',CI:'true'},()=>assert.fail()),/APIFY_TOKEN is required/);
    assert.throws(()=>getApifyToken({APIFY_USE_KEYRING:'1'},()=>''),/APIFY_TOKEN is required/);
});

test('missing secret blocks actual fetch/deploy before any data change', () => {
    const before = fs.readFileSync(new URL('../data/actors.json', import.meta.url));
    for (const script of ['fetch-data.mjs','scripts/deploy.mjs']) {
        const r = spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8',env:{...process.env,APIFY_TOKEN:'',APIFY_USE_KEYRING:'',GH_TOKEN:''}});
        assert.notEqual(r.status,0); assert.match(r.stderr,/APIFY_TOKEN is required/);
    }
    assert.deepEqual(fs.readFileSync(new URL('../data/actors.json', import.meta.url)),before);
    const paid = spawnSync(process.execPath,['fetch-data.mjs','--run-missing'],{cwd:root,encoding:'utf8'});
    assert.notEqual(paid.status,0); assert.match(paid.stderr,/Starting Actors is disabled/);
});

test('Apify requests use a header; failures never log credential values or response bodies', async () => {
    let options;
    const api = createApi('private-value',async(url,o)=>{assert.ok(!url.includes('private-value')); options=o; return {ok:true,json:async()=>({data:{}})};});
    await api('acts?my=1&limit=1000');
    assert.equal(options.headers.Authorization,'Bearer private-value');
    assert.ok(!options.method || options.method==='GET');
    await assert.rejects(()=>api('users/me'),/read-only/);
    await assert.rejects(()=>createApi('private-value',async()=>({ok:false,status:403,text:()=>assert.fail()}))('acts/test'),/HTTP 403/);
    await assert.rejects(()=>createApi('private-value',async()=>{throw new Error('private-value');})('acts/test'),e=>!e.message.includes('private-value'));
});

test('future pricing is excluded without changing active event selection', () => {
    const pricing = usd => ({pricingPerEvent:{actorChargeEvents:{result:{isPrimaryEvent:true,eventTitle:'result',eventTieredPricingUsd:{FREE:{tieredEventPriceUsd:usd}}}}}});
    assert.equal(primaryPrice({pricingInfos:[{...pricing(0.01),startedAt:'2026-01-01'},{...pricing(0.02),startedAt:'2027-01-01'}]},now).usd,0.01);
    assert.equal(primaryPrice({}),null);
});

test('IndexNow sends only changed hashes and advances state only after 200/202', async () => {
    const manifest={pages:[{url:'https://data.chimeramind.com/tools/a/',sha256:'new'},{url:'https://data.chimeramind.com/tools/b/',sha256:'same'}]};
    const state={ [manifest.pages[0].url]:'old',[manifest.pages[1].url]:'same' };
    assert.equal(changedPages(manifest,state).length,1);
    let sent;
    const request=async(url,options)=> options ? (sent=JSON.parse(options.body),{status:202}) : {ok:true,text:async()=> 'public-key'};
    const result=await submitIndexNow({manifest,state,key:'public-key',request});
    assert.deepEqual(sent.urlList,[manifest.pages[0].url]);
    assert.equal(state[manifest.pages[0].url],'old');
    assert.equal(result.state[manifest.pages[0].url],'new');
    assert.equal((await submitIndexNow({manifest,state:result.state,key:'public-key',request:()=>assert.fail()})).submitted,0);
    await assert.rejects(()=>submitIndexNow({manifest,state,key:'public-key',request:async(u,o)=>o?{status:500}:{ok:true,text:async()=>'public-key'}}),/state was not advanced/);
    await assert.rejects(()=>submitIndexNow({manifest,state,key:'public-key',request:async()=>({ok:true,text:async()=>'wrong'})}),/key is not live/);
});
