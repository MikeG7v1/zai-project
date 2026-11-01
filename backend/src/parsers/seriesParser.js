import { parseOptionalText } from './textParsers.js';

export function parseSeriesInput(body) {
  return {
    name: body.name.trim(),
    minValue: body.minValue,
    maxValue: body.maxValue,
    color: body.color.toLowerCase(),
    icon: parseOptionalText(body.icon),
    unit: parseOptionalText(body.unit),
  };
}
