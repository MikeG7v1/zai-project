import { db } from '../database.js';
import { MIN_PASSWORD_LENGTH } from '../domain/limits.js';
import { anyAdminExists, createAdmin, isPasswordLongEnough } from '../services/adminAccountService.js';

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

try {
  if (await anyAdminExists()) {
    console.log('Administrator account already exists.');
  } else if (!username || !password || !isPasswordLongEnough(password)) {
    console.warn(`No administrator: set ADMIN_USERNAME and ADMIN_PASSWORD (min. ${MIN_PASSWORD_LENGTH} characters).`);
  } else {
    await createAdmin(username, password);
    console.log(`Created administrator "${username}".`);
  }
} finally {
  await db.destroy();
}
