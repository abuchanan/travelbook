import csp from 'js-csp';
import { map, compose, dedupe } from 'transducers.js';
import { Time } from '../actions';

class Track {

  constructor() {
    this.keyframes = [];

    this.channel = csp.chan();
    var xform = compose(
      map(time => this.getValueAtTime(time)),
      dedupe()
    );
    csp.operations.pipeline(this.channel, xform, Time.channel);
  }

  setKeyframe(time, value, transition) {
    var toSet = {time, value, transition};

    for (var i = 0; i < this.keyframes.length; i++) {
      var keyframe = this.keyframes[i];

      if (keyframe.time == time) {
        keyframes[i] = toSet;
        return;
      } else if (time < keyframe.time) {
        this.keyframes.splice(i, 0, toSet);
        return;
      }
    }

    this.keyframes.push(toSet);
  }

  getValueAtTime(time) {
    var i = 0;
    while (i < this.keyframes.length && time >= this.keyframes[i].time) {
      i++;
    }

    if (i > 0) {
      i -= 1;
    }
    var keyframe = this.keyframes[i];

    // If this isn't the last keyframe, look for a transition.
    // Clearly, we can't transition after the last keyframe because
    // there's no value to transition _to_.
    if (i < this.keyframes.length - 1 && keyframe.transition) {
      var nextKeyframe = this.keyframes[i + 1];
      var percentComplete = (time - keyframe.time) / (nextKeyframe.time - keyframe.time);
      return keyframe.transition(percentComplete, keyframe.value, nextKeyframe.value);
    } else {
      return keyframe.value;
    }
  }
}

export default Track;
