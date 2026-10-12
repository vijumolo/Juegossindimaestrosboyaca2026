const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 8080;
const HOST = process.env.HOST || undefined;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (_) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath === '/favicon.ico') urlPath = '/LOGO TCT TRASPARENTE.png';

  const filePath = path.normalize(path.join(__dirname, urlPath));
  if (!filePath.startsWith(__dirname + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404: ' + urlPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log('Servidor activo: http://localhost:' + PORT);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && PORT < 8100) {
    const next = PORT + 1;
    console.log('Puerto ' + PORT + ' ocupado, probando ' + next + '...');
    server.listen(next, HOST, () => {
      console.log('Servidor activo: http://localhost:' + next);
    });
  } else {
    throw err;
  }
});
