import { esc } from './render.mjs';

export function agentAccess(actor) {
    const id = `webdatatools/${actor.name}`;
    const endpoint = `https://mcp.apify.com?tools=${id}`;
    return `<h2>Use with an AI agent or CLI</h2>
<p>Connect a remote-capable MCP client to this Actor through Apify. Use the <a href="https://mcp.apify.com/">official MCP configurator</a> for your client, then sign in with your own Apify account. Calls are charged to your account at the Actor's current rates.</p>
<pre><code>${esc(endpoint)}</code></pre>
<p>Ask your agent to inspect <code>${esc(id)}</code>, show you the input and estimated cost, then run a small sample. With <code>call-actor</code>, set <code>callOptions.maxTotalChargeUsd</code> to your budget; this is a run option, not an input field. Read the returned dataset with <code>get-dataset-items</code>. Review errors and output before scaling.</p>
<p>For the <a href="https://docs.apify.com/cli/docs/reference">Apify CLI</a>, authenticate locally and save the <a href="/inputs/${esc(actor.name)}.json" download>catalog input JSON</a> as <code>input.json</code>. Review its URLs and limits first. This command starts a paid cloud run:</p>
<pre><code>apify actors info ${esc(id)} --input
apify actors call ${esc(id)} --input-file input.json</code></pre>
<p>The CLI call above does not set a spending ceiling. For an explicit per-run cost cap, use the MCP run option described above or set Maximum cost per run in Apify Console.</p>
<p>Never paste credentials into a prompt or input file. A timeout does not prove the cloud run stopped: inspect it before retrying. <a href="https://docs.apify.com/mcp">Connection and authentication reference</a>.</p>`;
}

export function agentIndex(actors, origin) {
    return `# ChimeraMiND Data\n\n> Public WebDataTools Actor catalog. Input, pricing and limits should be checked before any paid run.\n\n## Connect\n\n- [Apify MCP documentation](https://docs.apify.com/mcp): OAuth, discovery and execution.\n- [Apify CLI reference](https://docs.apify.com/cli/docs/reference)\n- [Catalog manifest](${origin}/distribution-manifest.json): generated page links, not a runtime API.\n\n## Tools\n\n${Object.values(actors).map(a => `- [${a.title.replace(/[\r\n\[\]]/g, ' ')}](${origin}/tools/${a.name}/): input, pricing, API and MCP instructions.`).join('\n')}\n`;
}
