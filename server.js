// Run: node server.js  — opens the site at http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
http.createServer((request, response) => {
  const pathname = request.url === '/' ? '/index.html' : decodeURIComponent(request.url.split('?')[0]);
  const target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(data);
  });
}).listen(4173, () => console.log('Bhaukaal FM → http://localhost:4173'));
