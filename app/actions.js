
export function add_flight() {
  return {type: "add_flight"};
}

export function add_flight_and_inspect() {
  return {type: "add_flight_and_inspect"};
}

export function set_flight_name(flight_id, name) {
  return {type: "set_flight_name", flight_id, name};
}

export function set_flight_origin(flight_id, location) {
  return {type: "set_flight_origin", flight_id, location};
}

export function set_flight_destination(flight_id, location) {
  return {type: "set_flight_destination", flight_id, location};
}

export function set_map_position(zoom, center) {
  return {type: "set_map_position", zoom, center};
}

export function set_keyframe(time, value) {
  return {type: "set_keyframe", time, value};
}

export function set_inspector(key, data) {
  return {type: "set_inspector", key, data};
}

export function receive_frame(global_time) {
  return {type: "receive_frame", global_time};
}

export function toggle_playback() {
  return (dispatch, get_state) => {
    if (get_state().playback.playing) {
      dispatch(stop_playback());
    } else {
      dispatch(start_playback());
    }
  };
}

export function stop_playback() {
  return {type: "stop_playback"};
}

export function start_playback() {
  return (dispatch, get_state) => {

    function callback(global_time) {
      dispatch(receive_frame(global_time));

      if (get_state().playback.playing) {
        requestAnimationFrame(callback);
      }
    }

    requestAnimationFrame(callback);
  };
}
