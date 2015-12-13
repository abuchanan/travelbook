import FlightArc from './flight_arc';
import { linear as linear_transition } from './transitions';
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

export function flight_progress(state, flight, track, track_state) {

  flight.features.clear();
  flight.progress = get_flight_progress(flight, track, track_state);

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

    flight.features.append(slice.json());
  }
}
