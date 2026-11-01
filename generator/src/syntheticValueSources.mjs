function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomSignedFraction() {
  return Math.random() * 2 - 1;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createRandomSource({ min, max }) {
  return () => randomBetween(min, max);
}

function createRandomWalkSource({ min, max, step }) {
  let currentValue = (min + max) / 2;
  return () => {
    currentValue = clamp(currentValue + randomSignedFraction() * step, min, max);
    return currentValue;
  };
}

function createSineSource({ offset, amplitude, periodSeconds, noise }) {
  return (date) => {
    const secondsSinceEpoch = date.getTime() / 1000;
    const noiseValue = noise ? randomSignedFraction() * noise : 0;
    return offset + amplitude * Math.sin((2 * Math.PI * secondsSinceEpoch) / periodSeconds) + noiseValue;
  };
}

const SOURCE_FACTORIES = {
  random: createRandomSource,
  walk: createRandomWalkSource,
  sine: createSineSource,
};

export function createSyntheticSource(options) {
  const createSource = SOURCE_FACTORIES[options.source];
  if (!createSource) throw new Error(`Unknown source ${options.source}`);
  return createSource(options);
}
