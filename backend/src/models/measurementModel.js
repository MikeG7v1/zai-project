import { db } from '../database.js';

const TABLE = 'measurements';
const COLUMNS = ['id', 'series_id', 'sensor_id', 'value', 'measured_at'];

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    seriesId: row.series_id,
    sensorId: row.sensor_id,
    value: row.value,
    measuredAt: row.measured_at,
  };
}

export async function findMeasurements({ seriesIds, from, to, newestFirst, limit }) {
  const query = db(TABLE).select(COLUMNS);
  if (seriesIds) query.whereIn('series_id', seriesIds);
  if (from) query.where('measured_at', '>=', from);
  if (to) query.where('measured_at', '<=', to);

  const direction = newestFirst ? 'desc' : 'asc';
  const rows = await query
    .orderBy([{ column: 'measured_at', order: direction }, { column: 'id', order: direction }])
    .limit(limit);
  return rows.map(fromRow);
}

export async function findMeasurementById(id) {
  return fromRow(await db(TABLE).where({ id }).first(COLUMNS));
}

export async function countMeasurementsOutsideRange(seriesId, { minValue, maxValue }, transaction) {
  const { count } = await transaction(TABLE)
    .where({ series_id: seriesId })
    .andWhere((range) => range.where('value', '<', minValue).orWhere('value', '>', maxValue))
    .count({ count: '*' })
    .first();
  return count;
}

export async function createMeasurement({ seriesId, sensorId, value, measuredAt }, transaction) {
  const [row] = await transaction(TABLE)
    .insert({ series_id: seriesId, sensor_id: sensorId, value, measured_at: measuredAt })
    .returning(COLUMNS);
  return fromRow(row);
}
