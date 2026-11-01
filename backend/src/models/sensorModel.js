import { db } from '../database.js';

const TABLE = 'sensors';
const PUBLIC_COLUMNS = ['id', 'name', 'series_id', 'created_at', 'last_measurement_at'];

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    seriesId: row.series_id,
    createdAt: row.created_at,
    lastMeasurementAt: row.last_measurement_at,
  };
}

/** A deregistered sensor keeps its row (revoked_at is set) so that its measurements still name their source. */
function activeSensorsQuery(executor = db) {
  return executor(TABLE).whereNull('revoked_at');
}

export async function findAllActiveSensors() {
  const rows = await activeSensorsQuery().select(PUBLIC_COLUMNS).orderBy('id');
  return rows.map(fromRow);
}

export async function findActiveSensorById(id) {
  return fromRow(await activeSensorsQuery().where({ id }).first(PUBLIC_COLUMNS));
}

export async function findActiveSensorByApiKeyHash(apiKeyHash) {
  return fromRow(await activeSensorsQuery().where({ api_key_hash: apiKeyHash }).first(PUBLIC_COLUMNS));
}

export async function createSensor({ name, seriesId, apiKeyHash }) {
  const [row] = await db(TABLE)
    .insert({ name, series_id: seriesId, api_key_hash: apiKeyHash })
    .returning(PUBLIC_COLUMNS);
  return fromRow(row);
}

export async function revokeSensor(id) {
  const revokedCount = await activeSensorsQuery().where({ id }).update({ revoked_at: db.fn.now() });
  return revokedCount > 0;
}

/** Measurements may arrive out of order, so the newest timestamp wins. */
export async function updateLastMeasurementAt(id, measuredAt, transaction) {
  await transaction(TABLE)
    .where({ id })
    .update({
      last_measurement_at: transaction.raw('GREATEST(COALESCE(last_measurement_at, ?), ?)', [measuredAt, measuredAt]),
    });
}
