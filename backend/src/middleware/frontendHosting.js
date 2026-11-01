import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDistDirectory = path.resolve(currentDirectory, '../../../frontend/dist');
const frontendIndexFile = path.join(frontendDistDirectory, 'index.html');

const PLACEHOLDER_PAGE = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Measurement Series</title></head>
<body><main><h1>Measurement Series</h1><p>The interface is under construction. The API is available at <a href="/api/series">/api/series</a>.</p></main></body>
</html>`;

function servePlaceholderPage(router) {
  router.get('/', (req, res) => res.type('html').send(PLACEHOLDER_PAGE));
}

/** Every unknown path outside /api returns index.html, so the Vue router can resolve it. */
function serveSinglePageApplication(router) {
  router.use(express.static(frontendDistDirectory, { index: false, maxAge: '1h' }));
  router.get('/{*path}', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(frontendIndexFile);
  });
}

export function frontendHosting() {
  const router = express.Router();
  if (fs.existsSync(frontendIndexFile)) serveSinglePageApplication(router);
  else servePlaceholderPage(router);
  return router;
}
