const REQUEST_TIMEOUT_MS = 30000;

export class SensorKeyRejectedError extends Error {}

async function readJsonOrNull(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export class MeasurementSender {
  constructor({ apiUrl, apiKey, dryRun }) {
    this.measurementsUrl = `${apiUrl}/api/measurements`;
    this.apiKey = apiKey;
    this.dryRun = dryRun;
    this.stats = { saved: 0, rejected: 0, failed: 0 };
  }

  recordFailure() {
    this.stats.failed++;
  }

  /** A null timestamp lets the server use its current time. Returns false when the measurement could not be delivered. */
  async send(value, timestamp) {
    const body = timestamp ? { value, timestamp: timestamp.toISOString() } : { value };
    const label = `${timestamp ? timestamp.toISOString() : 'now'}  value ${value}`;

    if (this.dryRun) {
      console.log(`[dry run] ${label}`);
      return true;
    }

    let response;
    try {
      response = await fetch(this.measurementsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-API-Key': this.apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.recordFailure();
      console.error(`[network error] ${label}: could not connect to ${this.measurementsUrl} (${error.cause?.code || error.message})`);
      return false;
    }

    return this.handleResponse(response, label);
  }

  async handleResponse(response, label) {
    const responseBody = await readJsonOrNull(response);
    const detail = responseBody?.detail || responseBody?.title || `status ${response.status}`;

    if (response.status === 201) {
      this.stats.saved++;
      console.log(`[saved] ${label}  (id ${responseBody?.id})`);
      return true;
    }
    if (response.status === 400 || response.status === 422) {
      this.stats.rejected++;
      console.error(`[REJECTED] ${label}: ${detail}`);
      return true;
    }
    if (response.status === 401) {
      this.recordFailure();
      console.error(`[DENIED] ${label}: ${detail}`);
      throw new SensorKeyRejectedError('The API key is invalid or the sensor has been deregistered - stopping.');
    }

    this.recordFailure();
    console.error(`[error ${response.status}] ${label}: ${detail}`);
    return false;
  }

  printSummary() {
    const { saved, rejected, failed } = this.stats;
    console.log(`\nSummary: saved ${saved}, rejected ${rejected}, errors ${failed}.`);
  }
}
