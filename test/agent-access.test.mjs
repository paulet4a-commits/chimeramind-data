import test from 'node:test';
import assert from 'node:assert/strict';
import {agentAccess,agentIndex} from '../src/agent-access.mjs';
test('actor connection links match the selected Actor and distinguish run budget from input',()=>{
 const h=agentAccess({name:'shopify-products-scraper'});
 assert.ok(h.includes('https://mcp.apify.com?tools=webdatatools/shopify-products-scraper'));
 assert.ok(h.includes('/inputs/shopify-products-scraper.json'));
 assert.ok(h.includes('callOptions.maxTotalChargeUsd'));
 assert.ok(!h.includes('--max-total-charge-usd'));
 assert.ok(h.includes('does not set a spending ceiling'));
});
test('agent index follows catalog without invented actors',()=>{
 const s=agentIndex({one:{name:'one',title:'A [test]\nactor'}},'https://example.com');
 assert.ok(s.includes('https://example.com/tools/one/'));
 assert.ok(!s.includes('[test]'));
 assert.ok(s.includes('distribution-manifest.json'));
});
