import FlightArc from './flight_arc';
import * as Keyframes from './keyframes';
import * as transitions from './transitions';
import { generate_id } from './utils';


// TODO maybe find a way to integrate this with the schema
export function add_flight(flights) {

  var id = generate_id();
  var flight = flights.get(id);
  flight.id = id;

  // flight.tracks.visible.keyframes.add();
  // flight.tracks.progress.keyframes.add();

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

export function update_flights(time, flights, map) {

  for (var flight of flights.values()) {

    // flight.visible = Keyframes.get_value(flight.tracks.visible.keyframes, time);
    // flight.progress = get_progress_track_value(flight.tracks.progress, time);

    // TODO This should check if from/to are set to useful values and if not
    //      remove the map feature data.
    if (flight.visible && flight.progress > 0) {
      let from = {x: flight.from.longitude, y: flight.from.latitude};
      let to = {x: flight.to.longitude, y: flight.to.latitude};
      var reference_arc = new FlightArc(from, to);

      let slice = reference_arc.slice(flight.progress);

      let last = slice.last_point();
      flight.last_point.longitude = last[0];
      flight.last_point.latitude = last[1];

      console.log("flight", reference_arc.length, slice.length);

      map.sources.set(flight.id, [slice.json()]);
    } else {
      map.sources.delete(flight.id);
    }
  }
}
