import extend from 'extend';


export function length(feature) {
  let length = 0;
  for (let coords of feature.geometry.coordinates) {
    length += coords.length;
  }
  return length;
}

export function slice(source, percent) {
  if (source.geometry.type != "MultiLineString") {
    throw new Error("Can only slice MultiLineString");
  }

  // The points at the end/start of each successive multiline are the
  // same, so they shouldn't be included in the slice length and therefore
  // need to be accounted for here.
  let number_of_segments = source.geometry.coordinates.length;
  let source_length = length(source) - (number_of_segments - 1);

  let slice_length = Math.floor(source_length * percent);
  let clone = extend(true, {}, source);

  if (slice_length < 2) {
    clone.geometry.coordinates = [];
    return clone;
  }

  if (slice_length > source_length) {
    slice_length = source_length;
  }

  let slice = [];
  let remaining = slice_length;

  for (let coords of source.geometry.coordinates) {

    if (remaining >= coords.length) {
      slice.push(coords.slice());
      remaining -= coords.length;
      // Adjust for the end/start points between segments being the same.
      remaining += 1;

    } else if (remaining > 1) {
      slice.push(coords.slice(0, remaining));
      break;
    } else {
      break;
    }
  }

  clone.geometry.coordinates = slice;
  return clone;
}

export function last_point(line) {
  if (line.geometry.type == "LineString") {
    return line.geometry.coordinates[line.geometry.coordinates.length - 1];
  } else if (line.geometry.type == "MultiLineString") {
    let c = line.geometry.coordinates[line.geometry.coordinates.length - 1];
    return c[c.length - 1];
  } else {
    throw new Error("Unhandled type");
  }
}
