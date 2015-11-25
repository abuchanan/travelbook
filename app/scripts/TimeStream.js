import H from 'highland';
import Class from './Class';

const TimeStream = Class({

  init() {
    this.playing = false;
    this.endTime = null;
    this._stream = H();
    this._stream.resume();
  },

  setEndTime(endTime) {
    this.endTime = endTime;
  },

  _frameCallback(timestamp) {
    // Playback was stopped, so just return without requesting another frame.
    if (!this.playing) {
      return;
    }

    // This is the first frame, so we initialize the start time and return.
    // The stream will start generating time on the next frame.
    if (!this._startTime) {
      this._startTime = timestamp;
      requestAnimationFrame(this._frameCallback);
      return;
    }

    // Write a time value into the stream.
    var dt = timestamp - this._startTime;

    if (this.endTime !== null && dt >= this.endTime) {
      this.stop();
      return;
    }

    this._stream.write(dt);

    this._previousTime = dt;
    requestAnimationFrame(this._frameCallback);
  },

  play() {
    if (this.playing) {
      return;
    }

    this._startTime = null;
    this._previousTime = -1;
    this.playing = true;
    requestAnimationFrame(this._frameCallback);
  },

  stop() {
    this.playing = false;
  },

  setTime(time) {
  },

  stream() {
    return this._stream.observe();
  },

});

export default TimeStream;
