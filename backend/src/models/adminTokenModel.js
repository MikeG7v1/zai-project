import { db } from '../database.js';

const TABLE = 'admin_tokens';

export async function createAdminToken({ adminId, tokenHash, expiresAt }) {
  await db(TABLE).insert({ admin_id: adminId, token_hash: tokenHash, expires_at: expiresAt });
}

/** @returns {Promise<{ tokenId: number, adminId: number, username: string } | null>} */
export async function findValidTokenOwner(tokenHash) {
  const owner = await db(`${TABLE} as token`)
    .join('admins as admin', 'admin.id', 'token.admin_id')
    .where('token.token_hash', tokenHash)
    .andWhere('token.expires_at', '>', db.fn.now())
    .first('token.id as tokenId', 'admin.id as adminId', 'admin.username');
  return owner ?? null;
}

export async function deleteAdminToken(tokenId) {
  await db(TABLE).where({ id: tokenId }).delete();
}

export async function deleteExpiredAdminTokens() {
  await db(TABLE).where('expires_at', '<=', db.fn.now()).delete();
}

export async function deleteAdminTokens(adminId, { exceptTokenId = null, executor = db } = {}) {
  const query = executor(TABLE).where({ admin_id: adminId });
  if (exceptTokenId !== null) query.whereNot({ id: exceptTokenId });
  await query.delete();
}
