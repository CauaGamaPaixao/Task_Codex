const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleGenerateSubtasks } = require('./controllers/aiController');

const PORT = process.env.PORT || 8000;
const rootDir = __dirname;

const contentTypeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function serveStatic(req, res) {
  const rawPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(rootDir, rawPath.split('?')[0]);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = contentTypeByExt[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    if (!body) {
      callback({});
      return;
    }

    try {
      callback(JSON.parse(body));
    } catch {
      callback(null);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/ai/generate-subtasks') {
    parseBody(req, (body) => {
      if (body === null) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'JSON inválido.' }));
        return;
      }

      req.body = body;
      handleGenerateSubtasks(req, res);
    });
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Método não suportado.' }));
});

server.listen(PORT, () => {
  console.log(`Kanban Task rodando em http://localhost:${PORT}`);
});
