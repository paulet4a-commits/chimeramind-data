// Loaded only by the isolated fetch integration test. No real network traffic.
import fs from 'node:fs';
const actors = JSON.parse(fs.readFileSync('./data/actors.json'));
globalThis.fetch = async (url, options) => {
    if (options.method && options.method !== 'GET') throw new Error('Mutation attempted');
    if (url.includes('token=')) throw new Error('Credential in query attempted');
    if (options.headers.Authorization !== 'Bearer integration-test') throw new Error('Missing authorization header');
    fs.appendFileSync('./requests.jsonl',JSON.stringify({url,method:options.method??'GET'})+'\n');
    const p = new URL(url).pathname.replace('/v2/','');
    let data;
    if (p==='acts') data={items:Object.keys(actors).map(id=>({id})),total:71};
    else if(p.endsWith('/runs')) data={items:[]};
    else if(p.startsWith('acts/')) {
        const a = actors[p.slice(5)];
        data={...a,id:a.name,isPublic:true,pictureUrl:a.icon,stats:{totalUsers30Days:a.users30,totalRuns:a.runs},pricingInfos:[{pricingPerEvent:{actorChargeEvents:{result:{isPrimaryEvent:true,eventTitle:a.price.unit,eventTieredPricingUsd:Object.fromEntries(Object.entries(a.price.tiers).map(([k,v])=>[k,{tieredEventPriceUsd:v+(process.env.TEST_PRICE_DRIFT && a.name==='email-validator'?0.001:0)}]))}}}}]};
    } else throw new Error(`Unexpected endpoint: ${p}`);
    return {ok:true,json:async()=>({data})};
};
