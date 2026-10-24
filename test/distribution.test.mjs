import test from 'node:test';
import assert from 'node:assert/strict';
import { distributionManifest } from '../src/distribution.mjs';
import { attributeLink, campaignFrom } from '../public/assets/attribution.mjs';
import {codeTabs,renderGuide} from '../src/render.mjs';
test('routes prefer actual starter then guide then tool; all actor rows remain', () => {
    const actors = Object.fromEntries(['a','b','c'].map(name => [name,{name,title:name,url:`https://apify.com/webdatatools/${name}`} ]));
    const manifest = distributionManifest({actors, origin:'https://data.chimeramind.com', quickstarts:[{actor:'a',slug:'start-a',title:'A'}], guides:[{meta:{actor:'b',title:'B'},slug:'guide-b'}], workflows:[]});
    assert.deepEqual(manifest.products.map(p=>new URL(p.preferredUrl).pathname), ['/start/start-a/','/guides/guide-b/','/tools/c/']);
    assert.equal(manifest.products.length,3);
});
test('campaign survives internal navigation and Apify exit without replacing page attribution', () => {
    const entry='https://data.chimeramind.com/start/website-fields/?utm_source=mastodon&utm_medium=social&utm_campaign=css-selector-extractor';
    const internal=attributeLink('/guides/css-selector-extractor/',entry);
    assert.equal(new URL(internal).searchParams.get('utm_source'),'mastodon');
    const out=new URL(attributeLink('https://apify.com/webdatatools/css-selector-extractor?utm_source=data.chimeramind.com&source_actor=css-selector-extractor&source_page=%2Fguides%2Fcss-selector-extractor%2F',internal));
    assert.equal(out.searchParams.get('acquisition_source'),'mastodon');
    assert.equal(out.searchParams.get('utm_source'),'data.chimeramind.com');
    assert.equal(out.searchParams.get('source_page'),'/guides/css-selector-extractor/');
});
test('no arbitrary query, email, token, foreign host or download propagation', () => {
    const entry='https://data.chimeramind.com/?utm_source=user%40mail.com&token=secret&utm_campaign=safe';
    assert.deepEqual(campaignFrom(entry),{utm_campaign:'safe'});
    for(const href of ['https://example.com/','https://apify.com/other/tool','https://data.chimeramind.com/templates/a.json']) assert.equal(attributeLink(href,entry),href);
});
test('a malformed authored URL cannot interrupt later CTA attribution', () => {
    const current='https://data.chimeramind.com/guides/example/?utm_source=mastodon';
    const links=['https://[invalid','https://apify.com/webdatatools/example?source_actor=example'];
    const result=links.map(href=>attributeLink(href,current));
    assert.equal(result[0],links[0]);
    assert.equal(new URL(result[1]).searchParams.get('acquisition_source'),'mastodon');
});
test('Markdown does not reparse code tabs into links or double-escape their input',()=>{
    const actor={name:'example',prefill:{urls:['https://example.com/']}};
    const html=renderGuide('## Call from code\n\n{{code}}\n\n## Next step',actor,null).html;
    assert.ok(html.includes(codeTabs(actor)));
    assert.ok(!html.includes('<a href="https://example.com'));
    assert.ok(!html.includes('&amp;quot;'));
    assert.ok(html.includes('&#10;&#10;'));
});
