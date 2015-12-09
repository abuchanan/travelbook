
export function linear(percentComplete, lastValue, nextValue) {
  return (nextValue - lastValue) * percentComplete;
};
