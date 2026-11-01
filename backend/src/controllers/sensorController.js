import { parseSensorInput } from '../parsers/sensorParser.js';
import * as sensorService from '../services/sensorService.js';
import { validateSensorInput } from '../validators/sensorValidator.js';
import { toRegisteredSensorDto, toSensorDto } from '../views/sensorView.js';
import { readIdParam } from './idParamReader.js';

export async function listSensors(req, res) {
  const sensors = await sensorService.listSensors();
  res.json(sensors.map(toSensorDto));
}

export async function getSensor(req, res) {
  const sensor = await sensorService.getSensor(readIdParam(req));
  res.json(toSensorDto(sensor));
}

export async function registerSensor(req, res) {
  validateSensorInput(req.body);
  const { sensor, apiKey } = await sensorService.registerSensor(parseSensorInput(req.body));
  res.set('Cache-Control', 'no-store');
  res.status(201).location(`/api/sensors/${sensor.id}`).json(toRegisteredSensorDto(sensor, apiKey));
}

export async function deregisterSensor(req, res) {
  await sensorService.deregisterSensor(readIdParam(req));
  res.status(204).end();
}
