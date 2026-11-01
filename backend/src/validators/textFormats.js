const POSITIVE_INTEGER_PATTERN = /^[1-9]\d{0,15}$/;
const ISO_TIMESTAMP_WITH_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})$/i;

export const ISO_TIMESTAMP_FORMAT_MESSAGE = 'Expected an ISO 8601 date with a time zone';

export function isPositiveIntegerText(text) {
  return POSITIVE_INTEGER_PATTERN.test(text);
}

/** The pattern does not check day and month ranges, so the text must also produce a valid Date. */
export function isIsoTimestampWithZone(text) {
  return typeof text === 'string'
    && ISO_TIMESTAMP_WITH_ZONE_PATTERN.test(text)
    && !Number.isNaN(new Date(text).getTime());
}
