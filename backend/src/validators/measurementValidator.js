import { MAX_MEASUREMENTS_LIMIT } from '../domain/limits.js';
import { badRequest } from '../http/problemDetails.js';
import { isQueryParamProvided } from '../http/queryParams.js';
import { BodyValidator, validateObjectBody } from './BodyValidator.js';
import { ISO_TIMESTAMP_FORMAT_MESSAGE, isIsoTimestampWithZone } from './textFormats.js';

const SERIES_ID_PATTERN = /^[1-9]\d{0,9}$/;
const DIGITS_ONLY_PATTERN = /^\d+$/;
const SORT_VALUES = ['timestamp', '-timestamp'];

export function validateMeasurementInput(body) {
  validateObjectBody(body);
  const validator = new BodyValidator(body);
  validator.checkNumber('value');
  validator.checkOptionalTimestamp('timestamp', isIsoTimestampWithZone, ISO_TIMESTAMP_FORMAT_MESSAGE);
  validator.throwIfInvalid();
}

function isValidSeriesIdList(text) {
  const seriesIdTexts = text.split(',').map((part) => part.trim()).filter(Boolean);
  return seriesIdTexts.length > 0 && seriesIdTexts.every((part) => SERIES_ID_PATTERN.test(part));
}

function isValidLimit(text) {
  const limit = Number(text);
  return DIGITS_ONLY_PATTERN.test(text) && limit >= 1 && limit <= MAX_MEASUREMENTS_LIMIT;
}

function isTimeRangeReversed(fromText, toText) {
  return isIsoTimestampWithZone(fromText) && isIsoTimestampWithZone(toText) && new Date(fromText) > new Date(toText);
}

export function validateMeasurementFilters(query) {
  const errors = [];
  const addError = (field, message) => errors.push({ field, message });

  const singleValues = {};
  for (const name of ['series', 'from', 'to', 'sort', 'limit']) {
    if (Array.isArray(query[name])) addError(name, 'Parameter may appear only once');
    else if (isQueryParamProvided(query[name])) singleValues[name] = query[name];
  }

  const { series, from, to, sort, limit } = singleValues;
  if (series !== undefined && !isValidSeriesIdList(series)) {
    addError('series', 'Expected a comma-separated list of series identifiers');
  }
  if (from !== undefined && !isIsoTimestampWithZone(from)) addError('from', ISO_TIMESTAMP_FORMAT_MESSAGE);
  if (to !== undefined && !isIsoTimestampWithZone(to)) addError('to', ISO_TIMESTAMP_FORMAT_MESSAGE);
  if (isTimeRangeReversed(from, to)) addError('from', 'Range start is later than range end');
  if (sort !== undefined && !SORT_VALUES.includes(sort)) addError('sort', `Allowed values: ${SORT_VALUES.join(', ')}`);
  if (limit !== undefined && !isValidLimit(limit)) addError('limit', `Expected an integer from 1 to ${MAX_MEASUREMENTS_LIMIT}`);

  if (errors.length) throw badRequest('Invalid query parameters', errors);
}
