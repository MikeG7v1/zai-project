import { notFound } from '../http/problemDetails.js';
import { isPositiveIntegerText } from './textFormats.js';

/** A malformed id in the URL cannot point to an existing resource, so it is reported as 404. */
export function validateIdParam(rawId, maxId) {
  if (!isPositiveIntegerText(rawId) || Number(rawId) > maxId) throw notFound();
}
