const SERIES_ID_TEXT_PATTERN = /^[1-9]\d{0,9}$/;

/** Returns null when the reference cannot name any series; the service then reports the series as missing. */
function parseSeriesReference(rawSeriesId) {
  if (Number.isInteger(rawSeriesId) && rawSeriesId > 0) return rawSeriesId;
  if (typeof rawSeriesId === 'string' && SERIES_ID_TEXT_PATTERN.test(rawSeriesId)) return Number(rawSeriesId);
  return null;
}

export function parseSensorInput(body) {
  return { name: body.name.trim(), seriesId: parseSeriesReference(body.seriesId) };
}
