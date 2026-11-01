export function toSeriesDto(series) {
  return {
    id: series.id,
    name: series.name,
    minValue: series.minValue,
    maxValue: series.maxValue,
    color: series.color,
    icon: series.icon,
    unit: series.unit,
  };
}
