import { MAX_INTEGER_ID } from '../domain/limits.js';
import { validateIdParam } from '../validators/idParamValidator.js';

export function readIdParam(req, maxId = MAX_INTEGER_ID) {
  validateIdParam(req.params.id, maxId);
  return Number(req.params.id);
}
