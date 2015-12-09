import uuid from 'node-uuid';

import FlightArc from './flight_arc';
import * as Keyframes from './keyframes';
import * as transitions from './transitions';


function seconds(t) {
  return t * 1000;
}

function generate_id() {
  return uuid.v4();
}


// TODO maybe find a way to integrate this with the schema
export function add_flight(flights) {

  var id = generate_id();
  var flight = flights.get(id);
  flight.id = id;

  flight.tracks.active.keyframes.add();
  flight.tracks.progress.keyframes.add();

  return flight;
}


function get_progress_track_value(track, time) {
  let [start, end] = Keyframes.get_keyframes(track.keyframes, time);

  // In this case we're past the last keyframe.
  if (end === undefined) {
    return start.value;
  }

  let percent = (time - start.time) / (end.time - start.time);
  return transitions.linear(percent, start.value, end.value);
}

export function update_flights(time, flights, map_sources) {

  for (var flight of flights.values()) {

    flight.is_active = Keyframes.get_value(flight.tracks.active.keyframes, time);
    flight.progress = get_progress_track_value(flight.tracks.progress, time);

    // TODO This should check if from/to are set to useful values and if not
    //      remove the map feature data.
    if (flight.is_active && flight.progress > 0) {
      let from = {x: flight.from.longitude, y: flight.from.latitude};
      let to = {x: flight.to.longitude, y: flight.to.latitude};
      var reference_arc = new FlightArc(from, to);

      let slice = reference_arc.slice(flight.progress);
      map_sources.set(flight.id, [slice.json()]);
    } else {
      map_sources.delete(flight.id);
    }
  }
}
