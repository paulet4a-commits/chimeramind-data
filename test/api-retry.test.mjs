import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/apify.mjs';

test('transient read failures retry without exposing the token, including 502 during publication', async () => {
    let calls = 0;
    const waits = [];
    const api = createApi('test-only-token', async (url, options) => {
        assert.ok(!url.includes('test-only-token'));
        assert.equal(options.headers.Authorization, 'Bearer test-only-token');
        if (++calls === 1) throw new Error('network failure');
        if (calls === 2) return { ok: false, status: 502 };
        return { ok: true, json: async () => ({ data: 'recovered' }) };
    }, async ms => waits.push(ms));
    assert.deepEqual(await api('acts/test'), { data: 'recovered' });
    assert.equal(calls, 3);
    assert.deepEqual(waits, [500, 1000]);
});

test('unauthorized reads are not retried; repeated upstream errors stop at three attempts', async () => {
    for (const [status, expected] of [[401, 1], [403, 1], [502, 3]]) {
        let calls = 0;
        const api = createApi('test-only-token', async () => { calls++; return { ok: false, status }; }, async () => {});
        await assert.rejects(api('acts/test'), new RegExp(`HTTP ${status}`));
        assert.equal(calls, expected);
    }
});

test('rate-limit delays are honored only within the total read deadline', async () => {
    for (const retryAfter of ['2', '120']) {
        let calls = 0;
        const waits = [];
        const api = createApi('test-only-token', async () => {
            if (++calls === 1) return { ok: false, status: 429, headers: new Headers({ 'Retry-After': retryAfter }) };
            return { ok: true, json: async () => [] };
        }, async ms => waits.push(ms));
        if (retryAfter === '2') { assert.deepEqual(await api('acts/test'), []); assert.deepEqual(waits, [2000]); }
        else { await assert.rejects(api('acts/test'), /HTTP 429/); assert.equal(calls, 1); assert.deepEqual(waits, []); }
    }
});
