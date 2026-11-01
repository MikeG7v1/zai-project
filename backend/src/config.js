import 'dotenv/config';

const DEFAULT_PORT = 3000;
const DEFAULT_TOKEN_TTL_SECONDS = 3600;

function readRequiredVariable(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function readFlag(name) {
  return process.env[name] === 'true';
}

const environment = process.env.NODE_ENV || 'development';

export const config = {
  environment,
  isProduction: environment === 'production',
  port: Number(process.env.PORT) || DEFAULT_PORT,
  databaseUrl: readRequiredVariable('DATABASE_URL'),
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS) || DEFAULT_TOKEN_TTL_SECONDS,
  trustProxy: readFlag('TRUST_PROXY'),
  forceHttps: readFlag('FORCE_HTTPS'),
};
