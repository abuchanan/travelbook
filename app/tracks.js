
export function add_track(tracks, def) {

  var id = generate_id();
  var track = tracks.get(id);
  track.id = id;

  return track;
}


export function update_tracks(tracks, time) {
  for (var track of tracks) {
    var value = get_value_at_time(track, time);
    track.update.call(null, time);
  }
}


export function set_keyframe(track, time, value, transition) {
  var keyframes = track.keyframes;
  var toSet = {time, value, transition};

  for (var i = 0; i < keyframes.length; i++) {
    var keyframe = keyframes[i];

    if (keyframe.time == time) {
      keyframes[i] = toSet;
      return;
    } else if (time < keyframe.time) {
      keyframes.splice(i, 0, toSet);
      return;
    }
  }

  keyframes.push(toSet);
}

export function get_value_at_time(track, time) {
  var keyframes = track.keyframes;
  var i = 0;
  while (i < keyframes.length && time >= this.keyframes[i].time) {
    i++;
  }

  if (i > 0) {
    i -= 1;
  }
  var keyframe = keyframes[i];

  // If isn't the last keyframe, look for a transition.
  // Clearly, we can't transition after the last keyframe because
  // there's no value to transition _to_.
  if (i < keyframes.length - 1 && keyframe.transition) {
    var nextKeyframe = keyframes[i + 1];
    var percentComplete = (time - keyframe.time) / (nextKeyframe.time - keyframe.time);
    return keyframe.transition(percentComplete, keyframe.value, nextKeyframe.value);
  } else {
    return keyframe.value;
  }
}
