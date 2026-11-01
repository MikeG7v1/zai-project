import { badRequest } from '../http/problemDetails.js';

export function validateObjectBody(body) {
  const isPlainObject = typeof body === 'object' && body !== null && !Array.isArray(body);
  if (!isPlainObject) throw badRequest('Request body must be a JSON object');
}

export class BodyValidator {
  constructor(body) {
    this.body = body;
    this.errors = [];
  }

  addError(field, message) {
    this.errors.push({ field, message });
  }

  hasErrorFor(field) {
    return this.errors.some((error) => error.field === field);
  }

  checkString(field, { required = true, nullable = false, minLength = 0, maxLength = Infinity, trim = true } = {}) {
    const rawValue = this.body[field];
    if (rawValue === undefined) {
      if (required) this.addError(field, 'Field is required');
      return;
    }
    if (rawValue === null) {
      if (!nullable) this.addError(field, required ? 'Field is required' : 'Field must not be null');
      return;
    }
    if (typeof rawValue !== 'string') {
      this.addError(field, 'Field must be a string');
      return;
    }

    const length = (trim ? rawValue.trim() : rawValue).length;
    if (length < minLength) {
      this.addError(field, minLength === 1 ? 'Field must not be empty' : `Minimum length is ${minLength} characters`);
    } else if (length > maxLength) {
      this.addError(field, `Maximum length is ${maxLength} characters`);
    }
  }

  checkNumber(field, { required = true } = {}) {
    const rawValue = this.body[field];
    if (rawValue === undefined || rawValue === null) {
      if (required) this.addError(field, 'Field is required');
      return;
    }
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      this.addError(field, 'Field must be a number');
    }
  }

  checkPattern(field, pattern, message) {
    const rawValue = this.body[field];
    if (typeof rawValue === 'string' && !this.hasErrorFor(field) && !pattern.test(rawValue)) {
      this.addError(field, message);
    }
  }

  checkOptionalTimestamp(field, isValidTimestamp, message) {
    const rawValue = this.body[field];
    if (rawValue !== undefined && rawValue !== null && !isValidTimestamp(rawValue)) {
      this.addError(field, message);
    }
  }

  throwIfInvalid() {
    if (this.errors.length) throw badRequest('Request body contains errors', this.errors);
  }
}
