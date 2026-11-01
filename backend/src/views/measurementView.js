export function toMeasurementDto(measurement) {
  return {
    id: measurement.id,
    seriesId: measurement.seriesId,
    sensorId: measurement.sensorId,
    value: measurement.value,
    timestamp: measurement.measuredAt.toISOString(),
  };
}
