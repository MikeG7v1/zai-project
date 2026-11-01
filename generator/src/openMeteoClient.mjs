const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_PAST_DAYS = 92;
const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;
const EXTRA_HOURS_MARGIN = 2;

export const OPEN_METEO_VARIABLE_UNITS = {
  temperature_2m: '°C',
  relative_humidity_2m: '%',
  pressure_msl: 'hPa',
  surface_pressure: 'hPa',
  wind_speed_10m: 'km/h',
  precipitation: 'mm',
  cloud_cover: '%',
};

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Open-Meteo responded with status ${response.status}`);
  return response.json();
}

function pastDaysNeeded(count, intervalSeconds) {
  const hoursNeeded = Math.ceil((count * intervalSeconds) / SECONDS_PER_HOUR) + EXTRA_HOURS_MARGIN;
  return Math.min(MAX_PAST_DAYS, Math.max(1, Math.ceil(hoursNeeded / HOURS_PER_DAY)));
}

/** @returns {Promise<{ date: Date, value: number }[]>} hourly readings up to `end`, oldest first */
export async function fetchHourlyReadings({ latitude, longitude, variable, count, intervalSeconds, end }) {
  const url = `${OPEN_METEO_FORECAST_URL}?latitude=${latitude}&longitude=${longitude}`
    + `&hourly=${variable}&past_days=${pastDaysNeeded(count, intervalSeconds)}&forecast_days=1&timezone=UTC`;
  const data = await fetchJson(url);
  const times = data.hourly?.time ?? [];
  const values = data.hourly?.[variable] ?? [];

  return times
    .map((time, index) => ({ date: new Date(`${time}:00Z`), value: values[index] }))
    .filter((reading) => reading.value !== null && reading.date <= end);
}

export async function fetchCurrentReading({ latitude, longitude, variable }) {
  const url = `${OPEN_METEO_FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=${variable}&timezone=UTC`;
  const data = await fetchJson(url);
  const value = data.current?.[variable];
  if (typeof value !== 'number') throw new Error('Open-Meteo did not return a current value');
  return value;
}
