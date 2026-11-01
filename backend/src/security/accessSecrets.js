import crypto from 'node:crypto';

const SECRET_SIZE_BYTES = 32;

export function generateSecret() {
  return crypto.randomBytes(SECRET_SIZE_BYTES).toString('base64url');
}

export function hashSecret(secret) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex');
}
