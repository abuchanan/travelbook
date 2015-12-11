
export function linear(percentComplete, lastValue, nextValue) {
  return lastValue + ((nextValue - lastValue) * percentComplete);
};
