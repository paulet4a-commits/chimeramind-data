import test from 'node:test';
import assert from 'node:assert/strict';
import { QUICKSTARTS, n8nStarter } from '../src/quickstarts.mjs';
import { attributedUrl } from '../src/growth.mjs';

test('starter imports remain inactive and require stored header credentials', () => {
    for (const recipe of QUICKSTARTS) {
        const workflow = JSON.parse(JSON.stringify(n8nStarter(recipe)));
        assert.equal(workflow.active, false);
        assert.equal(workflow.nodes[0].type, 'n8n-nodes-base.manualTrigger');
        const request = workflow.nodes[1];
        assert.equal(request.parameters.authentication, 'genericCredentialType');
        assert.equal(request.parameters.genericAuthType, 'httpHeaderAuth');
        assert.equal(request.credentials, undefined);
        assert.equal(request.parameters.headerParameters, undefined);
        assert.equal(new URL(request.parameters.url).search, '');
        assert.deepEqual(JSON.parse(request.parameters.jsonBody), recipe.input);
        assert.equal(workflow.connections['Manual trigger'].main[0][0].node, request.name);
        assert.ok(!JSON.stringify(workflow).includes('YOUR_APIFY_TOKEN'));
        assert.equal(recipe.input.maxConcurrency, 1);
        if (recipe.actor === 'youtube-channel-scraper') {
            assert.equal(recipe.input.channels.length, 1);
            assert.ok(recipe.input.maxVideosPerChannel <= 20);
        } else {
            assert.equal(recipe.input.urls.length, 1);
            assert.equal(recipe.input.maxPages, 1);
            assert.equal(recipe.input.proxyMode, 'never');
        }
    }
});

test('campaign attribution preserves the Actor destination and has no run action', () => {
    for (const recipe of QUICKSTARTS) {
        const actor = { name: recipe.actor, url: `https://apify.com/webdatatools/${recipe.actor}` };
        const url = new URL(attributedUrl(actor, {page: `/start/${recipe.slug}/`, placement:'starter', campaign:'flagship_20261023'}));
        assert.equal(url.origin, 'https://apify.com');
        assert.equal(url.pathname, `/webdatatools/${recipe.actor}`);
        assert.equal(url.searchParams.get('utm_campaign'), 'flagship_20261023');
        assert.equal(url.searchParams.get('source_page'), `/start/${recipe.slug}/`);
        assert.equal(url.searchParams.get('source_actor'), recipe.actor);
    }
});
