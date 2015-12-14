
function update_time(state, global_time) {

  if (state.stop) {
    reset(state);
    return;
  }

  // This is the first frame, so we initialize the start time and return.
  // The stream will start generating time on the next frame.
  if (state.start_time == -1) {
    state.start_time = global_time;
    return;
  }

  // TODO time management here is wrong. If the next global timestamp is
  //      10 seconds from the last (say because you paused execution via the debugger)
  //      should the next frame really jump 10 seconds forward? Or should jump
  //      one frame forward. I guess this is a question of how strongly to tie
  //      animation to actual global time.
  var current_time = global_time - state.start_time;

  // On the first frame of playback, the previous time equals the current time.
  if (state.previous_time == -1) {
    state.previous_time = current_time;
  } else {
    state.previous_time = state.current_time;
  }

  if (state.end_time != -1 && current_time >= state.end_time) {
    stop(state);
    return;
  }

  state.current_time = current_time;
}


// TODO by looking at this function, it's hard to know which part of the state tree
//      it relates to.
function reset(state) {
  console.log("reset");
  state.stop = false;
  state.playing = false;
  state.start_time = -1;
  state.previous_time = -1;
  state.current_time = 0;
}

export function stop(state) {
  state.stop = true;
}

export function start(state) {

  function callback(global_time) {
    if (state.playing) {
      update_time(state, global_time);
      requestAnimationFrame(callback);
    }
  }

  state.playing = true;
  requestAnimationFrame(callback);
}


export function toggle(state) {
  if (state.playing) {
    stop(state);
  } else {
    start(state);
  }
}
