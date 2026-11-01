/**
 * Usage:
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='...' npm run create-admin
 *   npm run create-admin -- admin 'password'
 */
import { db } from '../database.js';
import { MIN_PASSWORD_LENGTH } from '../domain/limits.js';
import { createOrResetAdmin, isPasswordLongEnough } from '../services/adminAccountService.js';

const username = process.argv[2] || process.env.ADMIN_USERNAME;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error('Provide a username and password (arguments or ADMIN_USERNAME / ADMIN_PASSWORD).');
  process.exit(1);
}
if (!isPasswordLongEnough(password)) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  process.exit(1);
}

try {
  const result = await createOrResetAdmin(username, password);
  const message = result === 'created'
    ? `Created administrator "${username}".`
    : `Changed the password of administrator "${username}".`;
  console.log(message);
} finally {
  await db.destroy();
}
