import { db } from '../database.js';

const TABLE = 'series';

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    minValue: row.min_value,
    maxValue: row.max_value,
    color: row.color,
    icon: row.icon,
    unit: row.unit,
  };
}

function toRow(series) {
  return {
    name: series.name,
    min_value: series.minValue,
    max_value: series.maxValue,
    color: series.color,
    icon: series.icon,
    unit: series.unit,
  };
}

export async function findAllSeries() {
  const rows = await db(TABLE).orderBy('id');
  return rows.map(fromRow);
}

export async function findSeriesById(id) {
  return fromRow(await db(TABLE).where({ id }).first());
}

/** Locks the row until the transaction ends, so the range cannot change while a measurement is checked against it. */
export async function findSeriesByIdForShare(id, transaction) {
  return fromRow(await transaction(TABLE).where({ id }).forShare().first());
}

/** Locks the row until the transaction ends, so no measurement is added while the range is being changed. */
export async function findSeriesByIdForUpdate(id, transaction) {
  return fromRow(await transaction(TABLE).where({ id }).forUpdate().first());
}

export async function createSeries(series) {
  const [row] = await db(TABLE).insert(toRow(series)).returning('*');
  return fromRow(row);
}

export async function updateSeries(id, series, transaction) {
  const [row] = await transaction(TABLE)
    .where({ id })
    .update({ ...toRow(series), updated_at: transaction.fn.now() })
    .returning('*');
  return fromRow(row);
}

/** Measurements and sensors of the series are removed by ON DELETE CASCADE. */
export async function deleteSeries(id) {
  const deletedCount = await db(TABLE).where({ id }).delete();
  return deletedCount > 0;
}
