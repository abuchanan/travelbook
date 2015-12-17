import { linear as linear_transition } from './transitions';


function get_target(state, key) {
  for (var part of key.split('.')) {
    state = state[part];
  }
  return state;
}

function set_target(state, key, value) {
  let sp = key.split('.');
  for (var i = 0; i < sp.length - 1; i++) {
    state = state[sp[i]];
  }
  state[sp[i]] = value;
}

export function follow_flight(state, flight, track) {
  let {target_id} = track;
  let target = get_target(state, target_id);

  target.latitude = flight.last_point.latitude;
  target.longitude = flight.last_point.longitude;
}

export function set_zoom(state, map, track) {
  map.zoom = track.value;
}

export function interpolate_zoom_to(state, map, track, track_playback_state) {
  let {percent_complete, is_first} = track_playback_state;

  if (is_first) {
    track.zoom_from = map.zoom;
  }
  let val = linear_transition(percent_complete, track.zoom_from, track.zoom_to);
  map.zoom = val;
}

// function pan_west(state, track, track_playback_state) {
//   let {target, start_point, end_point} = track;
//   let {percent_complete} = track_playback_state;
//
//   target = get_target(state, target);
//   target.latitude = linear_transition(percent_complete, start_point.latitude, end_point.latitude);
//   target.longitude = linear_transition(percent_complete, start_point.longitude, end_point.longitude);
// }

export function linear_interpolate(state, entity, track, track_playback_state) {
  let {start_value, end_value, target_id} = track;
  let {percent_complete} = track_playback_state;
  let val = linear_transition(percent_complete, start_value, end_value);
  set_target(state, target_id, val);
}

function get_progress(track, track_playback_state) {
  let {start_value, end_value} = track;
  let {percent_complete} = track_playback_state;
  let progress = linear_transition(percent_complete, start_value, end_value);

  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }

  return progress;
}

export function progress(state, entity, track, track_playback_state) {
  entity.progress = get_progress(track, track_playback_state);
}

export function set_visible(state, entity, track, track_playback_state) {
  entity.visible = track.value;
}


export function get_active(tracks, playback_state) {

  let {
    current_time,
    previous_time,
  } = playback_state;

  let active = [];

  for (let track of tracks) {
    if (track.start_time <= current_time && track.end_time >= previous_time) {
      active.push({
          track,
          state: {
            current_time,
            percent_complete: (current_time - track.start_time) / (track.end_time - track.start_time),
            is_first: track.start_time >= previous_time,
            is_last: track.end_time <= current_time,
          }
      });
    }
  }
  return active;
}
