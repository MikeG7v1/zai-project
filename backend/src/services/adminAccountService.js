import { MIN_PASSWORD_LENGTH } from '../domain/limits.js';
import * as adminModel from '../models/adminModel.js';
import * as adminTokenModel from '../models/adminTokenModel.js';
import { hashPassword } from '../security/passwordHashing.js';

export function isPasswordLongEnough(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export async function anyAdminExists() {
  return (await adminModel.countAdmins()) > 0;
}

export async function createAdmin(username, password) {
  await adminModel.createAdmin({ username, passwordHash: await hashPassword(password) });
}

export async function createOrResetAdmin(username, password) {
  const existingAdmin = await adminModel.findAdminByUsername(username);
  if (!existingAdmin) {
    await createAdmin(username, password);
    return 'created';
  }

  await adminModel.updateAdminPassword(existingAdmin.id, await hashPassword(password));
  await adminTokenModel.deleteAdminTokens(existingAdmin.id);
  return 'passwordChanged';
}
