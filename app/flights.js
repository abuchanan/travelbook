import uuid from 'node-uuid';

import FlightArc from './flight_arc';
import { add_track, set_keyframe, get_value_at_time } from './tracks.js';
import transitions from './scripts/transitions';



function seconds(t) {
  return t * 1000;
}

function generate_id() {
  return uuid.v4();
}


export function add_flight(flights, tracks, map_sources) {

  var id = generate_id();
  var flight = flights.get(id);

  flight.id = id;

  /*
  var active_track = add_track(tracks, {
    name: 'Active',
    type: 'boolean',
    update(is_active) { flight.is_active = is_active; },
  });

  var progress_track = add_track(tracks, {
    name: 'Flight Progress',
    type: 'float',
    min: 0,
    max: 1,
    // TODO how to store this in the schema
    update(progress) { flight.progress = progress; },
  });

  flight.track_ids.set('active', active_track.id);
  flight.track_ids.set('progress', progress_track.id);

  update_flights(flights, map_sources);
  */

  return flight;
}


export function update_flights(flights, map_sources) {

  for (var flight of flights.values()) {
    if (flight.is_active && flight.from && flight.to) {
      var reference_arc = new FlightArc(flight.from, flight.to);
      var arc = slice_arc(reference_arc, flight.progress);
      set_features(map_sources, flight.id, [arc.json()]);
    }
  }
}



function slice_arc(arc, progress) {
  var slice_length = Math.floor(arc.length * progress);
  return arc.slice(slice_length);
}
