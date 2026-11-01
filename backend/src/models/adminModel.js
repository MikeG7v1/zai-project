import { db } from '../database.js';

const TABLE = 'admins';

function fromRow(row) {
  if (!row) return null;
  return { id: row.id, username: row.username, passwordHash: row.password_hash };
}

export async function findAdminByUsername(username) {
  return fromRow(await db(TABLE).where({ username }).first());
}

export async function findAdminById(id) {
  return fromRow(await db(TABLE).where({ id }).first());
}

export async function countAdmins() {
  const { count } = await db(TABLE).count({ count: '*' }).first();
  return count;
}

export async function createAdmin({ username, passwordHash }) {
  await db(TABLE).insert({ username, password_hash: passwordHash });
}

export async function updateAdminPassword(id, passwordHash, executor = db) {
  await executor(TABLE).where({ id }).update({ password_hash: passwordHash, password_changed_at: executor.fn.now() });
}
