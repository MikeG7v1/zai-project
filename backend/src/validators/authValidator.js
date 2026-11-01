import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH } from '../domain/limits.js';
import { BodyValidator, validateObjectBody } from './BodyValidator.js';

export function validateLoginInput(body) {
  validateObjectBody(body);
  const validator = new BodyValidator(body);
  validator.checkString('username', { minLength: 1, maxLength: MAX_USERNAME_LENGTH });
  validator.checkString('password', { minLength: 1, maxLength: MAX_PASSWORD_LENGTH, trim: false });
  validator.throwIfInvalid();
}

export function validatePasswordChangeInput(body) {
  validateObjectBody(body);
  const validator = new BodyValidator(body);
  validator.checkString('currentPassword', { minLength: 1, maxLength: MAX_PASSWORD_LENGTH, trim: false });
  validator.checkString('newPassword', { maxLength: MAX_PASSWORD_LENGTH, trim: false });
  validator.throwIfInvalid();
}
