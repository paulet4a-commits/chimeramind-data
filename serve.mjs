// Local preview of dist/ at http://localhost:4321 (directory URLs → index.html).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.join(import.meta.dirname, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
export function previewServer(root = dist) { return http.createServer((req, res) => {
    let requested;
    try { requested = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
    catch { res.writeHead(400); return res.end('Bad request'); }
    let p = path.resolve(root, `.${requested}`);
    if (!p.startsWith(`${root}${path.sep}`) && p !== root) { res.writeHead(403); return res.end('Forbidden'); }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) { res.writeHead(404, { 'content-type': types['.html'] }); return res.end(fs.readFileSync(path.join(root, '404.html'))); }
    res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(p));
}); }
if (import.meta.url === pathToFileURL(process.argv[1]).href) previewServer().listen(4321, '127.0.0.1', () => console.log('http://127.0.0.1:4321'));
