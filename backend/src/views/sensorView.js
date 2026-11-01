export function toSensorDto(sensor) {
  return {
    id: sensor.id,
    name: sensor.name,
    seriesId: sensor.seriesId,
    createdAt: sensor.createdAt.toISOString(),
    lastMeasurementAt: sensor.lastMeasurementAt?.toISOString() ?? null,
  };
}

export function toRegisteredSensorDto(sensor, apiKey) {
  return { ...toSensorDto(sensor), apiKey };
}
