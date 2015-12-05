
export function update_playback_time(state, time) {

  // This is the first frame, so we initialize the start time and return.
  // The stream will start generating time on the next frame.
  if (!state.start_time) {
    state.start_time = time;
    return;
  }

  var previous_time = state.time;
  var current_time = time - state.start_time;

  if (state.end_time !== null && current_time >= state.end_time) {
    state.playing = false;
    return;
  }

  state.previous_time = previous_time;
  state.current_time = current_time;
}


// TODO by looking at this function, it's hard to know which part of the state tree
//      it relates to.
export function stop_playback(state) {
  state.playing = false;
  state.start_time = null;
  state.previous_time = null;
}

export function start_playback(state, act) {

    function callback(timestamp) {
      act('playback_frame', timestamp);

      if (state.playing) {
        requestAnimationFrame(callback);
      }
    }
    requestAnimationFrame(callback);
}
