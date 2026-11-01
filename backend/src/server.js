import { createApp } from './app.js';
import { config } from './config.js';
import { db } from './database.js';

const server = createApp().listen(config.port, () => {
  console.log(`API listening on port ${config.port} (${config.environment})`);
});

async function shutDown() {
  server.close();
  await db.destroy();
  process.exit(0);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
