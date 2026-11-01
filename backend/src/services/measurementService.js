import { db } from '../database.js';
import { MAX_MEASUREMENT_TIME_AHEAD_MS } from '../domain/limits.js';
import { notFound, unprocessable } from '../http/problemDetails.js';
import * as measurementModel from '../models/measurementModel.js';
import * as sensorModel from '../models/sensorModel.js';
import * as seriesModel from '../models/seriesModel.js';

function assertNotInFuture(measuredAt) {
  if (measuredAt.getTime() > Date.now() + MAX_MEASUREMENT_TIME_AHEAD_MS) {
    throw unprocessable('Timestamp must not be more than 5 minutes ahead of the current server time', [
      { field: 'timestamp', message: 'Timestamp in the future' },
    ]);
  }
}

function assertWithinSeriesRange(value, series) {
  if (value < series.minValue || value > series.maxValue) {
    throw unprocessable(
      `Value ${value} is outside the allowed series range [${series.minValue}, ${series.maxValue}]`,
      [{ field: 'value', message: 'Value outside the series range' }],
    );
  }
}

export function listMeasurements(filters) {
  return measurementModel.findMeasurements(filters);
}

export async function getMeasurement(id) {
  const measurement = await measurementModel.findMeasurementById(id);
  if (!measurement) throw notFound(`Measurement ${id} does not exist`);
  return measurement;
}

export async function recordMeasurement(sensor, { value, measuredAt }) {
  const timestamp = measuredAt ?? new Date();
  assertNotInFuture(timestamp);

  return db.transaction(async (transaction) => {
    const series = await seriesModel.findSeriesByIdForShare(sensor.seriesId, transaction);
    assertWithinSeriesRange(value, series);

    const measurement = await measurementModel.createMeasurement(
      { seriesId: sensor.seriesId, sensorId: sensor.id, value, measuredAt: timestamp },
      transaction,
    );
    await sensorModel.updateLastMeasurementAt(sensor.id, timestamp, transaction);
    return measurement;
  });
}
