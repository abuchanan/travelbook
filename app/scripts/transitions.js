
export default {
  linear(percentComplete, lastValue, nextValue) {
    return (nextValue - lastValue) * percentComplete;
  },
};
