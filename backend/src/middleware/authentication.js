import { unauthorized } from '../http/problemDetails.js';
import { findSessionByToken } from '../services/authService.js';
import { findSensorByApiKey } from '../services/sensorService.js';

const BEARER_TOKEN_PATTERN = /^Bearer\s+(\S+)$/i;
const API_KEY_CHALLENGE = 'ApiKey header="X-API-Key"';

function readBearerToken(req) {
  const match = BEARER_TOKEN_PATTERN.exec(req.get('authorization') || '');
  return match ? match[1] : null;
}

export async function requireAdmin(req, res, next) {
  const accessToken = readBearerToken(req);
  if (!accessToken) throw unauthorized('Administrator login required');

  const session = await findSessionByToken(accessToken);
  if (!session) throw unauthorized('Token is invalid or has expired');

  req.adminSession = session;
  next();
}

/** An admin token is deliberately not accepted here: only a sensor may submit measurements. */
export async function requireSensor(req, res, next) {
  const apiKey = req.get('x-api-key');
  if (!apiKey) throw unauthorized('Sensor API key required in the X-API-Key header', API_KEY_CHALLENGE);

  const sensor = await findSensorByApiKey(apiKey);
  if (!sensor) throw unauthorized('Sensor API key is invalid or has been revoked', API_KEY_CHALLENGE);

  req.sensor = sensor;
  next();
}
