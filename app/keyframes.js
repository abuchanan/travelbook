
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

export function get_keyframes(keyframes, time) {
  var i = 0;
  while (i < keyframes.length && time >= keyframes.get(i).time) {
    i++;
  }

  if (i > 0) {
    i -= 1;
  }

  let next_keyframe = undefined;

  if (i < keyframes.length - 1) {
    next_keyframe = keyframes.get(i + 1);
  }

  return [keyframes.get(i), next_keyframe];
}

export function get_value(keyframes, time) {
  return get_keyframes(keyframes, time)[0].value;
}

/*
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
*/
