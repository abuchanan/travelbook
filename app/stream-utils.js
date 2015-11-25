import H from 'highland';

function dropRepeats(stream) {
  var dropMe = {};
  return stream
    .scan1((memo, value) => {
      if (memo === value) {
        return dropMe;
      } else {
        return value;
      }
    })
    .reject(value => value === dropMe);
}
