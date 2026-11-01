import { MAX_INTEGER_ID } from '../domain/limits.js';
import { notFound, unprocessable } from '../http/problemDetails.js';
import * as sensorModel from '../models/sensorModel.js';
import * as seriesModel from '../models/seriesModel.js';
import { generateSecret, hashSecret } from '../security/accessSecrets.js';

const sensorNotFound = (id) => notFound(`Sensor ${id} does not exist`);

async function seriesExists(seriesId) {
  if (seriesId === null || seriesId > MAX_INTEGER_ID) return false;
  return (await seriesModel.findSeriesById(seriesId)) !== null;
}

export function listSensors() {
  return sensorModel.findAllActiveSensors();
}

export async function getSensor(id) {
  const sensor = await sensorModel.findActiveSensorById(id);
  if (!sensor) throw sensorNotFound(id);
  return sensor;
}

export async function registerSensor({ name, seriesId }) {
  if (!(await seriesExists(seriesId))) {
    throw unprocessable('The specified series does not exist', [{ field: 'seriesId', message: 'Series does not exist' }]);
  }

  const apiKey = generateSecret();
  const sensor = await sensorModel.createSensor({ name, seriesId, apiKeyHash: hashSecret(apiKey) });
  return { sensor, apiKey };
}

export async function deregisterSensor(id) {
  const wasRevoked = await sensorModel.revokeSensor(id);
  if (!wasRevoked) throw sensorNotFound(id);
}

export function findSensorByApiKey(apiKey) {
  return sensorModel.findActiveSensorByApiKeyHash(hashSecret(apiKey));
}
