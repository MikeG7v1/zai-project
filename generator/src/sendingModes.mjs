import { SensorKeyRejectedError } from './MeasurementSender.mjs';
import { fetchCurrentReading, fetchHourlyReadings } from './openMeteoClient.mjs';
import { createSyntheticSource } from './syntheticValueSources.mjs';

const SECONDS_PER_HOUR = 3600;

const roundTo = (value, decimals) => Number(value.toFixed(decimals));
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Keeps every n-th hourly reading, counting back from the newest, so the last reading is always included. */
function takeEveryNthFromNewest(readings, step) {
  return readings.filter((_, index) => (readings.length - 1 - index) % step === 0);
}

async function openMeteoHistoryPoints(options) {
  const hourlyReadings = await fetchHourlyReadings(options);
  const stepHours = Math.max(1, Math.round(options.intervalSeconds / SECONDS_PER_HOUR));
  const points = takeEveryNthFromNewest(hourlyReadings, stepHours).slice(-options.count);
  if (points.length < options.count) console.warn(`Open-Meteo returned only ${points.length} readings.`);
  return points;
}

function syntheticHistoryPoints(options) {
  const valueAt = createSyntheticSource(options);
  const points = [];
  for (let stepsBeforeEnd = options.count - 1; stepsBeforeEnd >= 0; stepsBeforeEnd--) {
    const date = new Date(options.end.getTime() - stepsBeforeEnd * options.intervalSeconds * 1000);
    points.push({ date, value: valueAt(date) });
  }
  return points;
}

export async function runHistoryMode(options, sender) {
  const points = options.source === 'open-meteo'
    ? await openMeteoHistoryPoints(options)
    : syntheticHistoryPoints(options);

  console.log(`Sending ${points.length} past measurements (${points[0]?.date.toISOString()} – ${points.at(-1)?.date.toISOString()}).`);
  for (const point of points) {
    await sender.send(roundTo(point.value, options.decimals), point.date);
  }
}

function createCurrentValueReader(options) {
  if (options.source === 'open-meteo') return () => fetchCurrentReading(options);
  const valueAt = createSyntheticSource(options);
  return async () => valueAt(new Date());
}

export async function runLiveMode(options, sender) {
  const readCurrentValue = createCurrentValueReader(options);

  const countInfo = Number.isFinite(options.count) ? `, ${options.count} measurements` : '';
  console.log(`Live mode: one measurement every ${options.intervalSeconds} s${countInfo}. Press Ctrl+C to stop.`);

  for (let sentCount = 0; sentCount < options.count; sentCount++) {
    const startedAt = Date.now();
    try {
      await sender.send(roundTo(await readCurrentValue(), options.decimals), null);
    } catch (error) {
      if (error instanceof SensorKeyRejectedError) throw error;
      sender.recordFailure();
      console.error(`[error] ${error.message}`);
    }

    const isLast = sentCount === options.count - 1;
    if (!isLast) await sleep(Math.max(0, options.intervalSeconds * 1000 - (Date.now() - startedAt)));
  }
}
