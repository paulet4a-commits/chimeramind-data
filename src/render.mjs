// Guide rendering: frontmatter, live-data placeholders ({{sample}}, {{code}}, {{pricing}}, {{cta}}), FAQ → JSON-LD.
import { marked } from 'marked';
import { sampleStatus } from './freshness.mjs';
import { attributedUrl } from './growth.mjs';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function parseFrontmatter(src) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(src);
    if (!m) return { meta: {}, body: src };
    const meta = {};
    for (const line of m[1].split(/\r?\n/)) {
        const kv = /^(\w+):\s*(.*)$/.exec(line);
        if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
    }
    return { meta, body: src.slice(m[0].length) };
}

export const money = (usd) => {
    if (usd == null) return '—';
    const v = Math.round(usd * 100000) / 100;
    return `$${Number.isInteger(v) ? v : v.toFixed(2)}`;
};

const TIER_NAMES = { FREE: 'Free plan', BRONZE: 'Starter', SILVER: 'Scale', GOLD: 'Business', PLATINUM: 'Enterprise', DIAMOND: 'Enterprise+' };

export function pricingTable(actor) {
    const p = actor?.price;
    if (!p) return '';
    const rows = Object.entries(p.tiers)
        .map(([k, v]) => `<tr><td>${esc(TIER_NAMES[k] ?? k)}</td><td class="num">$${v}</td><td class="num">${money(v)}</td></tr>`)
        .join('');
    return `<div class="table-wrap"><table class="pricing"><thead><tr><th>Apify plan</th><th>Per ${esc(p.unit)}</th><th>Per 1,000</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="fine">Catalog price snapshot. Check the Apify Store for current prices before running. Platform usage is included — you pay per result only, never for compute or proxies. Apify's free plan includes $5 of monthly credit.</p>`;
}

export function sampleBlock(sample, now = Date.now()) {
    const state = sampleStatus(sample, now);
    if (state.status === 'missing' || state.status === 'invalid') return `<p class="fine" data-sample-status="${state.status}">${esc(state.label)}</p>`;
    const json = JSON.stringify(sample.items[0], null, 2);
    return `<figure class="sample" data-sample-status="${state.status}" data-sample-finished="${esc(sample.finishedAt)}" data-sample-run="${esc(sample.runId)}"><figcaption><span data-sample-label>${esc(state.label)}</span><span class="mono">run ${esc(sample.runId)} · ${esc(sample.finishedAt.slice(0, 10))}</span></figcaption><pre><code class="language-json">${esc(json)}</code></pre></figure>`;
}

export function codeTabs(actor) {
    const input = JSON.stringify(actor?.prefill ?? {}, null, 4);
    const id = `webdatatools/${actor?.name}`;
    const py = `import json
import os
from apify_client import ApifyClient

client = ApifyClient(os.environ["APIFY_TOKEN"])
run = client.actor("${id}").call(run_input=json.loads(${JSON.stringify(input)}))

for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)`;
    const js = `import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
const run = await client.actor('${id}').call(${input});
const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items);`;
    const curl = `curl -X POST "https://api.apify.com/v2/acts/${id.replace('/', '~')}/run-sync-get-dataset-items" \\
  -H "Authorization: Bearer $APIFY_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(actor?.prefill ?? {})}'`;
    const tab = (name, lang, code, on) =>
        `<input type="radio" name="t-${esc(actor?.name)}" id="t-${esc(actor?.name)}-${lang}"${on ? ' checked' : ''}><label for="t-${esc(actor?.name)}-${lang}">${name}</label><pre class="tab-${lang}"><code class="language-${lang}">${esc(code)}</code></pre>`;
    return `<div class="tabs">${tab('Python', 'python', py, true)}${tab('JavaScript', 'js', js)}${tab('cURL', 'bash', curl)}</div>`;
}

const cta = (actor, context) =>
    actor ? `<p class="cta-row"><a class="btn" href="${esc(attributedUrl(actor, context))}">Run ${esc(actor.title)} on Apify →</a></p>` : '';

/** Markdown body → { html, faq: [{q, a}] }. FAQ = the "## FAQ" section's "### question" blocks. */
export function renderGuide(body, actor, sample, context = {}) {
    const filled = body
        .replace(/\{\{sample\}\}/g, () => `\n\n${sampleBlock(sample, context.now)}\n\n`)
        .replace(/\{\{code\}\}/g, () => `\n\n${codeTabs(actor)}\n\n`)
        .replace(/\{\{pricing\}\}/g, () => `\n\n${pricingTable(actor)}\n\n`)
        .replace(/\{\{cta\}\}/g, () => `\n\n${cta(actor, context)}\n\n`)
        .replace(/\{\{price\}\}/g, () => (actor?.price ? `${money(actor.price.usd)} per 1,000 ${actor.price.unit}s` : ''));
    const faq = [];
    const faqPart = /^## FAQ\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(filled)?.[1] ?? '';
    for (const m of faqPart.matchAll(/^### (.+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)) faq.push({ q: m[1].trim(), a: m[2].trim().replace(/\s+/g, ' ') });
    const toc = [...filled.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    const renderer = new marked.Renderer();
    renderer.link = function (token) {
        const match = /^https:\/\/apify\.com\/webdatatools\/([a-z0-9-]+)\/?$/.exec(token.href);
        // Route authored related-tool links through their indexable local landing.
        if (match) token = { ...token, href: `/tools/${match[1]}/` };
        return marked.Renderer.prototype.link.call(this, token);
    };
    renderer.heading = ({ tokens, depth }) => {
        const text = marked.Parser.parseInline(tokens);
        const slug = text.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
    };
    renderer.table = function (token) {
        return `<div class="table-wrap">${marked.Renderer.prototype.table.call(this, token)}</div>`;
    };
    return { html: marked.parse(filled, { renderer }), faq, toc };
}

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
