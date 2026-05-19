const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.txt': 'text/plain',
};

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  });

  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`[Server] ${req.method} ${pathname}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  // Route: /manifest.json
  if (pathname === '/manifest.json') {
    serveFile(res, path.join(BASE_DIR, 'manifest.json'));
    return;
  }

  // Route: /providers/:filename
  if (pathname.startsWith('/providers/')) {
    const filename = pathname.replace('/providers/', '');
    const filePath = path.join(BASE_DIR, 'providers', filename);
    serveFile(res, filePath);
    return;
  }

  // Route: / - liste des providers disponibles
  if (pathname === '/') {
    const manifest = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'manifest.json'), 'utf-8'));
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      name: 'GramFlix Nuvio Providers',
      providers: manifest.map(p => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        url: `http://localhost:${PORT}/${p.filename}`,
      })),
      manifest: `http://localhost:${PORT}/manifest.json`,
    }, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[GramFlix Nuvio Providers] Server running!`);
  console.log(`→ Local:    http://localhost:${PORT}`);
  console.log(`→ Manifest: http://localhost:${PORT}/manifest.json`);
  console.log(`\nDans Nuvio: Settings > Developer > Plugin Tester`);
  console.log(`Entrez: http://<votre-ip>:${PORT}/manifest.json\n`);
});
