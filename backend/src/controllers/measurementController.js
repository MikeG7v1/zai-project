import { MAX_BIGINT_ID } from '../domain/limits.js';
import { HttpProblem } from '../http/problemDetails.js';
import { parseMeasurementFilters, parseMeasurementInput } from '../parsers/measurementParser.js';
import * as measurementService from '../services/measurementService.js';
import { validateMeasurementFilters, validateMeasurementInput } from '../validators/measurementValidator.js';
import { toMeasurementDto } from '../views/measurementView.js';
import { readIdParam } from './idParamReader.js';

function logRejectedMeasurement(sensor, error, requestBody) {
  if (!(error instanceof HttpProblem)) return;
  console.warn(
    `[measurement rejected] sensor=${sensor.id} series=${sensor.seriesId} status=${error.status} `
      + `reason="${error.detail}" body=${JSON.stringify(requestBody)}`,
  );
}

export async function listMeasurements(req, res) {
  validateMeasurementFilters(req.query);
  const measurements = await measurementService.listMeasurements(parseMeasurementFilters(req.query));
  res.json(measurements.map(toMeasurementDto));
}

export async function getMeasurement(req, res) {
  const measurement = await measurementService.getMeasurement(readIdParam(req, MAX_BIGINT_ID));
  res.json(toMeasurementDto(measurement));
}

export async function recordMeasurement(req, res) {
  const { sensor } = req;
  try {
    validateMeasurementInput(req.body);
    const measurement = await measurementService.recordMeasurement(sensor, parseMeasurementInput(req.body));
    res.status(201).location(`/api/measurements/${measurement.id}`).json(toMeasurementDto(measurement));
  } catch (error) {
    logRejectedMeasurement(sensor, error, req.body);
    throw error;
  }
}
