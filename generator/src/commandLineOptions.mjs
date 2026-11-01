import { parseArgs } from 'node:util';
import { OPEN_METEO_VARIABLE_UNITS } from './openMeteoClient.mjs';

export const HELP_TEXT = `
Data generator - sensor emulator

Usage:
  node zai-generator.mjs --api <URL> --key <KEY> [options]

Connection:
  --api <URL>           application address, e.g. https://my-app.onrender.com  (or ZAI_API_URL)
  --key <KEY>           sensor API key from registration in the application  (or ZAI_API_KEY)

Mode:
  --mode history        series of measurements with past timestamps (default)
  --mode live           current measurements sent every --interval seconds
  --count <N>           number of measurements (history: default 24; live: default endless)
  --interval <S>        seconds between measurements (default 3600 in history, 10 in live)
  --end <ISO>           history: timestamp of the last measurement (default now)

Value generation (--source):
  random                random within [--min, --max] (default 0..100)
  walk                  random walk within [--min, --max], step up to --step (default 1)
  sine                  sine wave: --offset + --amplitude * sin(2π t / --period) + --noise
                        (default offset 50, amplitude 20, period 86400 s, noise 0)
  open-meteo            real weather data from api.open-meteo.com for --lat, --lon
                        and --variable (default Warsaw, temperature_2m);
                        history fetches past hourly data, live the current reading

Other:
  --decimals <N>        number of decimal places (default 2)
  --dry-run             only prints the measurements, sends nothing
  --help                this help

Examples:
  ZAI_API_KEY=... node zai-generator.mjs --api http://localhost:3000 --source sine --count 48
  node zai-generator.mjs --api https://app.example.com --key ... --mode live --interval 30 --source walk --min 15 --max 25
  node zai-generator.mjs --api https://app.example.com --key ... --source open-meteo --variable relative_humidity_2m --count 72
`;

const MODES = ['history', 'live'];
const SOURCES = ['random', 'walk', 'sine', 'open-meteo'];
const MODE_DEFAULTS = {
  history: { count: 24, intervalSeconds: 3600 },
  live: { count: Infinity, intervalSeconds: 10 },
};

const ARGUMENT_DEFINITIONS = {
  api: { type: 'string' },
  key: { type: 'string' },
  mode: { type: 'string', default: 'history' },
  count: { type: 'string' },
  interval: { type: 'string' },
  end: { type: 'string' },
  source: { type: 'string', default: 'random' },
  min: { type: 'string', default: '0' },
  max: { type: 'string', default: '100' },
  step: { type: 'string', default: '1' },
  offset: { type: 'string', default: '50' },
  amplitude: { type: 'string', default: '20' },
  period: { type: 'string', default: '86400' },
  noise: { type: 'string', default: '0' },
  lat: { type: 'string', default: '52.2297' },
  lon: { type: 'string', default: '21.0122' },
  variable: { type: 'string', default: 'temperature_2m' },
  decimals: { type: 'string', default: '2' },
  'dry-run': { type: 'boolean', default: false },
  help: { type: 'boolean', default: false },
};

export class OptionsError extends Error {}

function parseCommandLine() {
  try {
    return parseArgs({ options: ARGUMENT_DEFINITIONS }).values;
  } catch (error) {
    throw new OptionsError(error.message);
  }
}

function describeExpectedNumber({ integer, positive }) {
  if (positive) return `a positive ${integer ? 'integer' : 'number'}`;
  return integer ? 'an integer' : 'a number';
}

function createNumberReader(argumentValues) {
  return (name, { integer = false, positive = false } = {}) => {
    const value = Number(argumentValues[name]);
    const isValid = Number.isFinite(value) && (!integer || Number.isInteger(value)) && (!positive || value > 0);
    if (!isValid) throw new OptionsError(`--${name} must be ${describeExpectedNumber({ integer, positive })}`);
    return value;
  };
}

function readEndDate(rawEnd) {
  if (!rawEnd) return new Date();
  const end = new Date(rawEnd);
  if (Number.isNaN(end.getTime())) throw new OptionsError('--end must be an ISO 8601 date, e.g. 2026-11-01T12:00:00Z');
  return end;
}

function assertValidOptions(options) {
  if (!MODES.includes(options.mode)) throw new OptionsError('--mode must be history or live');
  if (!SOURCES.includes(options.source)) throw new OptionsError('--source must be random, walk, sine or open-meteo');
  if (options.min >= options.max) throw new OptionsError('--min must be less than --max');
  if (options.source === 'open-meteo' && !OPEN_METEO_VARIABLE_UNITS[options.variable]) {
    throw new OptionsError(`--variable must be one of: ${Object.keys(OPEN_METEO_VARIABLE_UNITS).join(', ')}`);
  }
  if (options.dryRun) return;
  if (!options.apiUrl) throw new OptionsError('provide the API address (--api or the ZAI_API_URL variable)');
  if (!/^https?:\/\//.test(options.apiUrl)) throw new OptionsError('the API address must start with http:// or https://');
  if (!options.apiKey) throw new OptionsError('provide the sensor API key (--key or the ZAI_API_KEY variable)');
}

/** @returns {object | null} null when only the help text was requested */
export function readOptions() {
  const argumentValues = parseCommandLine();
  if (argumentValues.help) return null;

  const readNumber = createNumberReader(argumentValues);
  const options = {
    apiUrl: (argumentValues.api || process.env.ZAI_API_URL || '').replace(/\/+$/, ''),
    apiKey: argumentValues.key || process.env.ZAI_API_KEY || '',
    mode: argumentValues.mode,
    source: argumentValues.source,
    dryRun: argumentValues['dry-run'],
    min: readNumber('min'),
    max: readNumber('max'),
    step: readNumber('step', { positive: true }),
    offset: readNumber('offset'),
    amplitude: readNumber('amplitude'),
    periodSeconds: readNumber('period', { positive: true }),
    noise: readNumber('noise'),
    latitude: readNumber('lat'),
    longitude: readNumber('lon'),
    variable: argumentValues.variable,
    decimals: readNumber('decimals', { integer: true }),
  };
  assertValidOptions(options);

  const modeDefaults = MODE_DEFAULTS[options.mode];
  options.count = argumentValues.count !== undefined
    ? readNumber('count', { integer: true, positive: true })
    : modeDefaults.count;
  options.intervalSeconds = argumentValues.interval !== undefined
    ? readNumber('interval', { positive: true })
    : modeDefaults.intervalSeconds;
  options.end = readEndDate(argumentValues.end);
  return options;
}
