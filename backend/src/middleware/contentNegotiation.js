import { HttpProblem, sendProblem } from '../http/problemDetails.js';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);
export const JSON_MEDIA_TYPES = ['application/json', 'application/*+json'];

function hasEmptyBody(req) {
  return req.get('content-length') === '0' && !req.get('transfer-encoding');
}

export function requireJsonAccept(req, res, next) {
  if (!req.accepts(['application/json', 'application/problem+json'])) {
    return sendProblem(req, res, new HttpProblem(406, 'Only the application/json representation is available'));
  }
  next();
}

export function requireJsonBody(req, res, next) {
  const mayHaveBody = METHODS_WITH_BODY.has(req.method) && !hasEmptyBody(req);
  // req.is() returns null when there is no body at all and false only when the type does not match.
  if (mayHaveBody && req.is(JSON_MEDIA_TYPES) === false) {
    return sendProblem(req, res, new HttpProblem(415, 'Request body must have type application/json'));
  }
  next();
}
