import { MAX_SENSOR_NAME_LENGTH } from '../domain/limits.js';
import { BodyValidator, validateObjectBody } from './BodyValidator.js';

export function validateSensorInput(body) {
  validateObjectBody(body);
  const validator = new BodyValidator(body);
  validator.checkString('name', { minLength: 1, maxLength: MAX_SENSOR_NAME_LENGTH });

  const rawSeriesId = body.seriesId;
  if (rawSeriesId === undefined || rawSeriesId === null) {
    validator.addError('seriesId', 'Field is required');
  } else if (typeof rawSeriesId !== 'number' && typeof rawSeriesId !== 'string') {
    validator.addError('seriesId', 'Invalid series identifier');
  }
  validator.throwIfInvalid();
}
