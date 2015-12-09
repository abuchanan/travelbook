
function update_time(state, global_time) {

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
  var previous_time = state.current_time;
  var current_time = global_time - state.start_time;

  if (state.end_time !== -1 && current_time >= state.end_time) {
    stop(state);
    return;
  }

  state.previous_time = previous_time;
  state.current_time = current_time;
}


// TODO by looking at this function, it's hard to know which part of the state tree
//      it relates to.
export function stop(state) {
  state.playing = false;
  state.start_time = -1;
  state.previous_time = -1;
}

export function start(state) {

  function callback(global_time) {
    update_time(state, global_time);

    if (state.playing) {
      requestAnimationFrame(callback);
    }
  }

  state.playing = true;
  requestAnimationFrame(callback);
}
