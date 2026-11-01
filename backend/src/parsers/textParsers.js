export function parseTimestamp(isoText) {
  return new Date(isoText);
}

export function parseOptionalText(rawText) {
  if (rawText === undefined || rawText === null) return null;
  return rawText.trim() || null;
}
