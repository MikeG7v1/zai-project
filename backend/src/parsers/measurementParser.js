import { DEFAULT_MEASUREMENTS_LIMIT } from '../domain/limits.js';
import { isQueryParamProvided } from '../http/queryParams.js';
import { parseTimestamp } from './textParsers.js';

/** measuredAt is null when the sensor sent no timestamp. */
export function parseMeasurementInput(body) {
  const hasTimestamp = body.timestamp !== undefined && body.timestamp !== null;
  return { value: body.value, measuredAt: hasTimestamp ? parseTimestamp(body.timestamp) : null };
}

function parseSeriesIdList(text) {
  const seriesIds = text.split(',').map((part) => part.trim()).filter(Boolean).map(Number);
  return [...new Set(seriesIds)];
}

export function parseMeasurementFilters(query) {
  const readParam = (name, parse, defaultValue) => (isQueryParamProvided(query[name]) ? parse(query[name]) : defaultValue);
  return {
    seriesIds: readParam('series', parseSeriesIdList, null),
    from: readParam('from', parseTimestamp, null),
    to: readParam('to', parseTimestamp, null),
    newestFirst: query.sort === '-timestamp',
    limit: readParam('limit', Number, DEFAULT_MEASUREMENTS_LIMIT),
  };
}
