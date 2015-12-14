import extend from 'extend';

import FlightArc from './flight_arc';
import { linear as linear_transition } from './transitions';
import { generate_id } from './utils';

// TODO maybe find a way to integrate this with the schema
export function add_flight(flights) {

  var id = generate_id();
  var flight = flights.get(id);
  flight.id = id;

  return flight;
}


function get_flight_progress(flight, track, track_state) {
  let {start_value, end_value} = track;
  let {percent_complete} = track_state;
  let progress = linear_transition(percent_complete, start_value, end_value);
  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }
  return progress;
}

function multiline_length(feature) {
  let length = 0;
  for (let coords of feature.geometry.coordinates) {
    length += coords.length;
  }
  return length;
}

function slice_multiline(source, percent) {
  if (source.geometry.type != "MultiLineString") {
    throw new Error("Can only slice MultiLineString");
  }

  // The points at the end/start of each successive multiline are the
  // same, so they shouldn't be included in the slice length and therefore
  // need to be accounted for here.
  let number_of_segments = source.geometry.coordinates.length;
  let length = multiline_length(source) - (number_of_segments - 1);

  let slice_length = Math.floor(length * percent);
  let clone = extend(true, {}, source);

  if (slice_length < 2) {
    clone.geometry.coordinates = [];
    return clone;
  }

  if (slice_length > length) {
    slice_length = length;
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
  console.log(slice);

  clone.geometry.coordinates = slice;
  return clone;
}


function last_point(line) {
  if (line.geometry.type == "LineString") {
    return line.geometry.coordinates[line.geometry.coordinates.length - 1];
  } else if (line.geometry.type == "MultiLineString") {
    let c = line.geometry.coordinates[line.geometry.coordinates.length - 1];
    return c[c.length - 1];
  } else {
    throw new Error("Unhandled type");
  }
}

export function flight_progress(state, flight, track, track_state) {

  flight.features.clear();
  flight.progress = get_flight_progress(flight, track, track_state);

  // TODO This should check if from/to are set to useful values and if not
  //      remove the map feature data.
  if (flight.visible && flight.progress > 0) {
    let from = {x: flight.from.longitude, y: flight.from.latitude};
    let to = {x: flight.to.longitude, y: flight.to.latitude};
    var reference_arc = new FlightArc(from, to);
    let reference_line = reference_arc.json();
    let slice = slice_multiline(reference_line, flight.progress);

    if (slice.geometry.coordinates.length > 0) {
      let lp = last_point(slice);
      flight.last_point.longitude = lp[0];
      flight.last_point.latitude = lp[1];

      flight.features.append(slice);
    }
  }
}
