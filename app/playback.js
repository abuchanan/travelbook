import extend from 'extend';


export function initial_playback_state() {
  return {
    playing: false,
    stop_on_next: false,
    global_start_time: -1,
    end_time: Number.POSITIVE_INFINITY,
    previous_time: -1,
    current_time: 0,
  };
};


export function on_receive_frame(playback_state, global_time) {

  if (playback_state.stop_on_next) {
    extend(playback_state, initial_playback_state());
    return;
  }

  // The first frame is a special case where the current and previous
  // playback time are 0 and the start time is now.
  if (playback_state.global_start_time == -1) {
    extend(playback_state, {
      global_start_time: global_time,
      previous_time: 0,
      current_time: 0,
      playing: true,
    });
    return;
  }

  // TODO time management here is wrong. If the next global timestamp is
  //      10 seconds from the last (say because you paused execution via the debugger)
  //      should the next frame really jump 10 seconds forward? Or should jump
  //      one frame forward. I guess this is a question of how strongly to tie
  //      animation to actual global time.
  var current_time = global_time - playback_state.global_start_time;

  // Stop if playback has reached the end time.
  if (current_time >= playback_state.end_time) {
    extend(playback_state, initial_playback_state());
    return;
  }

  extend(playback_state, {
    current_time,
    previous_time: playback_state.current_time,
    playing: true,
  });
}
