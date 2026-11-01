import { MAX_SERIES_ICON_LENGTH, MAX_SERIES_NAME_LENGTH, MAX_SERIES_UNIT_LENGTH } from '../domain/limits.js';
import { BodyValidator, validateObjectBody } from './BodyValidator.js';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function validateSeriesInput(body) {
  validateObjectBody(body);
  const validator = new BodyValidator(body);
  validator.checkString('name', { minLength: 1, maxLength: MAX_SERIES_NAME_LENGTH });
  validator.checkNumber('minValue');
  validator.checkNumber('maxValue');
  validator.checkString('color', { trim: false });
  validator.checkPattern('color', HEX_COLOR_PATTERN, 'Color must have the format #RRGGBB');
  validator.checkString('icon', { required: false, nullable: true, maxLength: MAX_SERIES_ICON_LENGTH });
  validator.checkString('unit', { required: false, nullable: true, maxLength: MAX_SERIES_UNIT_LENGTH });
  validator.throwIfInvalid();
}
