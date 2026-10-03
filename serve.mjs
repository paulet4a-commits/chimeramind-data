// Local preview of dist/ at http://localhost:4321 (directory URLs → index.html).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dist = path.join(import.meta.dirname, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
    let p = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) { res.writeHead(404, { 'content-type': types['.html'] }); return res.end(fs.readFileSync(path.join(dist, '404.html'))); }
    res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(p));
}).listen(4321, () => console.log('http://localhost:4321'));
