import { db } from '../database.js';
import { conflict, notFound, unprocessable } from '../http/problemDetails.js';
import * as measurementModel from '../models/measurementModel.js';
import * as seriesModel from '../models/seriesModel.js';

const seriesNotFound = (id) => notFound(`Series ${id} does not exist`);

function assertValidRange({ minValue, maxValue }) {
  if (minValue >= maxValue) {
    throw unprocessable('Lower range bound must be less than the upper bound', [
      { field: 'minValue', message: 'minValue must be less than maxValue' },
    ]);
  }
}

export function listSeries() {
  return seriesModel.findAllSeries();
}

export async function getSeries(id) {
  const series = await seriesModel.findSeriesById(id);
  if (!series) throw seriesNotFound(id);
  return series;
}

export async function createSeries(seriesInput) {
  assertValidRange(seriesInput);
  return seriesModel.createSeries(seriesInput);
}

export async function updateSeries(id, seriesInput) {
  assertValidRange(seriesInput);

  return db.transaction(async (transaction) => {
    const currentSeries = await seriesModel.findSeriesByIdForUpdate(id, transaction);
    if (!currentSeries) throw seriesNotFound(id);

    const excludedCount = await measurementModel.countMeasurementsOutsideRange(id, seriesInput, transaction);
    if (excludedCount > 0) {
      throw conflict(`New range excludes ${excludedCount} stored measurements of the series`);
    }
    return seriesModel.updateSeries(id, seriesInput, transaction);
  });
}

export async function deleteSeries(id) {
  const wasDeleted = await seriesModel.deleteSeries(id);
  if (!wasDeleted) throw seriesNotFound(id);
}
