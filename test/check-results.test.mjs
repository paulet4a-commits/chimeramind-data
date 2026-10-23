import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect, compareVideos } from '../public/templates/check-results.mjs';
// Synthetic fixtures test logic; these are not Actor output evidence.
const video = (id, over={}) => ({ channelId:'channel-a', videoId:id, title:'Synthetic fixture', url:`https://www.youtube.com/watch?v=${id}`, error:null, ...over });
test('CSS requires populated selected fields and matches; zero is usable',()=>{
    assert.equal(inspect([{fields:{price:0},matchCounts:{price:1}}],'css',['price']).accepted,true);
    for(const value of [null,' ',[]]) assert.equal(inspect([{fields:{title:value},matchCounts:{title:1}}],'css').accepted,false);
    assert.equal(inspect([{fields:{title:'Title'},matchCounts:{title:0}}],'css').accepted,false);
});
test('error and malformed rows cannot pass; empty is unknown rather than success',()=>{
    for(const row of [null,[],video('a',{error:'blocked'}),video('a',{channelId:null}),video('a',{url:'javascript:alert(1)'})]) assert.equal(inspect([row],'youtube').accepted,false);
    assert.equal(inspect([],'youtube').accepted,false);
    assert.throws(()=>inspect({},'youtube'));
});
test('duplicates block comparison, including duplicates across snapshots independently',()=>{
    assert.equal(compareVideos([video('a')],[video('a'),video('a')]).comparable,false);
});
test('compare identifies newly observed IDs, ignores titles/views and row ordering',()=>{
    const r=compareVideos([video('a'),video('b')],[video('b',{title:'Updated'}),video('a'),video('c')]);
    assert.equal(r.newlyObservedCount,1);assert.equal(r.newlyObserved[0].videoId,'c');
    assert.equal(compareVideos([video('a'),video('b')],[video('b')]).newlyObservedCount,0);
});
test('errors, empty and channel changes never become a no-new-videos success',()=>{
    assert.equal(compareVideos([video('a')],[]).comparable,false);
    assert.equal(compareVideos([video('a')],[video('b',{channelId:'other'})]).comparable,false);
    assert.equal(compareVideos([video('a',{error:'timeout'})],[video('b')]).comparable,false);
});
