import { config } from '../config.js';
import { MIN_PASSWORD_LENGTH } from '../domain/limits.js';
import { forbidden, unauthorized, unprocessable } from '../http/problemDetails.js';
import { db } from '../database.js';
import * as adminModel from '../models/adminModel.js';
import * as adminTokenModel from '../models/adminTokenModel.js';
import { hashPassword, verifyPassword } from '../security/passwordHashing.js';
import { generateSecret, hashSecret } from '../security/accessSecrets.js';

// Verifying against this hash when the username is unknown keeps the response time
// the same as for a wrong password, so the timing does not reveal which accounts exist.
const unknownUserPasswordHash = hashPassword(generateSecret());

async function isPasswordCorrect(admin, password) {
  if (!admin) {
    await verifyPassword(await unknownUserPasswordHash, password);
    return false;
  }
  return verifyPassword(admin.passwordHash, password);
}

async function issueToken(adminId) {
  const accessToken = generateSecret();
  const expiresAt = new Date(Date.now() + config.tokenTtlSeconds * 1000);
  await adminTokenModel.createAdminToken({ adminId, tokenHash: hashSecret(accessToken), expiresAt });
  return accessToken;
}

export async function logIn({ username, password }) {
  const admin = await adminModel.findAdminByUsername(username);
  if (!(await isPasswordCorrect(admin, password))) {
    throw unauthorized('Incorrect username or password');
  }

  const accessToken = await issueToken(admin.id);
  await adminTokenModel.deleteExpiredAdminTokens();
  return { accessToken, expiresInSeconds: config.tokenTtlSeconds, username: admin.username };
}

export async function logOut(session) {
  await adminTokenModel.deleteAdminToken(session.tokenId);
}

export async function findSessionByToken(accessToken) {
  return adminTokenModel.findValidTokenOwner(hashSecret(accessToken));
}

export async function changePassword(session, { currentPassword, newPassword }) {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw unprocessable('New password is too short', [
      { field: 'newPassword', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` },
    ]);
  }

  const admin = await adminModel.findAdminById(session.adminId);
  if (!(await verifyPassword(admin.passwordHash, currentPassword))) {
    throw forbidden('Current password is incorrect');
  }

  const newPasswordHash = await hashPassword(newPassword);
  await db.transaction(async (transaction) => {
    await adminModel.updateAdminPassword(admin.id, newPasswordHash, transaction);
    await adminTokenModel.deleteAdminTokens(admin.id, { exceptTokenId: session.tokenId, executor: transaction });
  });
}
