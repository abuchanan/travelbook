
export function set_keyframe(keyframes, time, value, transition) {
  var toSet = {time, value, transition};

  for (var i = 0; i < keyframes.length; i++) {
    var keyframe = keyframes[i];

    if (keyframe.time == time) {
      toSet.id = i;
      keyframes[i] = toSet;
      return;
    } else if (time < keyframe.time) {
      toSet.id = i;
      keyframes.splice(i, 0, toSet);
      return;
    }
  }


  keyframes.push(toSet);
  toSet.id = keyframes.length - 1;
}

export function move_keyframe(keyframes, keyframe_id, time) {
  // TODO this is a major downside of the data storage wrappers
  //      can't do equality testing
  //let i = keyframes.indexOf(keyframe);

  // TODO also dangerous because originally I passed in "keyframe"
  //      which had a read-only wrapper around the value.

  let keyframe = keyframes.splice(keyframe_id, 1);
  set_keyframe(keyframes, time, keyframe.value, keyframe.transition);
}

export function get_keyframes(keyframes, time) {
  var i = 0;
  while (i < keyframes.length && time >= keyframes[i].time) {
    i++;
  }

  if (i > 0) {
    i -= 1;
  }

  let next_keyframe = undefined;

  if (i < keyframes.length - 1) {
    next_keyframe = keyframes[i + 1];
  }

  return [keyframes[i], next_keyframe];
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
