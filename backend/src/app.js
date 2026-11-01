import express from 'express';
import { config } from './config.js';
import { apiNotFound, errorHandler } from './middleware/errorResponses.js';
import { frontendHosting } from './middleware/frontendHosting.js';
import { JSON_MEDIA_TYPES, requireJsonAccept, requireJsonBody } from './middleware/contentNegotiation.js';
import { httpsRedirect } from './middleware/httpsRedirect.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import seriesRoutes from './routes/seriesRoutes.js';

const MAX_REQUEST_BODY_SIZE = '100kb';

function createApiRouter() {
  const api = express.Router();
  api.use(requireJsonAccept);
  api.use(requireJsonBody);
  api.use(express.json({ type: JSON_MEDIA_TYPES, limit: MAX_REQUEST_BODY_SIZE, strict: false }));

  api.use('/health', healthRoutes);
  api.use('/auth', authRoutes);
  api.use('/series', seriesRoutes);
  api.use('/sensors', sensorRoutes);
  api.use('/measurements', measurementRoutes);
  api.use(apiNotFound);
  return api;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);
  if (config.forceHttps) app.use(httpsRedirect);
  app.use(securityHeaders());

  app.use('/api', createApiRouter());
  app.use(frontendHosting());
  app.use(errorHandler);
  return app;
}
