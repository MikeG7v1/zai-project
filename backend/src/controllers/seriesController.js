import { parseSeriesInput } from '../parsers/seriesParser.js';
import * as seriesService from '../services/seriesService.js';
import { validateSeriesInput } from '../validators/seriesValidator.js';
import { toSeriesDto } from '../views/seriesView.js';
import { readIdParam } from './idParamReader.js';

function readSeriesInput(req) {
  validateSeriesInput(req.body);
  return parseSeriesInput(req.body);
}

export async function listSeries(req, res) {
  const seriesList = await seriesService.listSeries();
  res.json(seriesList.map(toSeriesDto));
}

export async function getSeries(req, res) {
  const series = await seriesService.getSeries(readIdParam(req));
  res.json(toSeriesDto(series));
}

export async function createSeries(req, res) {
  const series = await seriesService.createSeries(readSeriesInput(req));
  res.status(201).location(`/api/series/${series.id}`).json(toSeriesDto(series));
}

export async function updateSeries(req, res) {
  const id = readIdParam(req);
  const series = await seriesService.updateSeries(id, readSeriesInput(req));
  res.json(toSeriesDto(series));
}

export async function deleteSeries(req, res) {
  await seriesService.deleteSeries(readIdParam(req));
  res.status(204).end();
}
