import uuid from 'node-uuid';

import FlightArc from './flight_arc';
import { set_keyframe, get_value_at_time } from './keyframes.js';
import transitions from './scripts/transitions';



function seconds(t) {
  return t * 1000;
}

function generate_id() {
  return uuid.v4();
}

function add_flight(state, start, end) {

  var flight = {
    id: generate_id(),
    start,
    end,
    arc: new FlightArc(start, end),
    progress: 1,
    is_active: true,
    track_ids: new Map(),
  };

  state.flights.set(flight.id, flight);

  var active_track = add_track(state.tracks, {
    name: 'Active',
    type: 'boolean',
    update(is_active) { flight.is_active = is_active; },
  });

  var progress_track = add_track(state.tracks, {
    name: 'Flight Progress',
    type: 'float',
    min: 0,
    max: 1,
    update(progress) { flight.progress = progress; },
  });

  flight.track_ids.set('active', active_track.id);
  flight.track_ids.set('progress', progress_track.id);

  update_flights(state.flights, state.map.sources);

  return flight;
}


function update_flights(flights, map_features) {

  for (var flight of flights.values()) {
    console.log("flight", flight);
    if (flight.is_active) {
      var arc = slice_arc(flight.arc, flight.progress);
      map_features.set(flight.id, [arc.json()]);
    }
  }
}


function add_track(tracks, def) {

  var track = {
    id: generate_id(),
    keyframes: [],
    def,
  };

  tracks.set(track.id, track);
  return track;
}


function update_tracks(tracks, time) {
  for (var track of tracks) {
    var value = get_value_at_time(track, time);
    track.update.call(null, time);
  }
}


function slice_arc(arc, progress) {
  var slice_length = Math.floor(arc.length * progress);
  return arc.slice(slice_length);
}

function update_map(map) { }


function generate_test_flight(state) {

    var flight = add_flight(state, start, end);

    var active_track_id = flight.track_ids.get('active');
    var active_track = state.tracks.get(active_track_id);

    // TODO I don't like this normalization. A serializer could allow
    //      converting in-memory references to serialized IDs.
    var progress_track_id = flight.track_ids.get('progress');
    var progress_track = state.tracks.get(progress_track_id);

    set_keyframe(active_track, 0, false);
    set_keyframe(active_track, seconds(1), true);
    set_keyframe(active_track, seconds(11), false);

    set_keyframe(progress_track, 0, 0, transitions.linear);
    set_keyframe(progress_track, seconds(10), 1);
}


export { add_flight, update_tracks, update_flights };
