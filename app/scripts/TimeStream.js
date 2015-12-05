import csp from 'js-csp';

class TimeStream {

  constructor() {
    this.playing = false;
    this.endTime = null;
    this._source = csp.chan(csp.buffers.sliding(1));
    var debug = csp.chan();
    this._mult = csp.operations.mult(this._source);
    this._mult.tap(debug);

    csp.go(function*() {
      while (true) {
        var time = yield debug;
        console.log("time", time);
      }
    });
    this._frameCallback = this._frameCallback.bind(this);
  }

  tap(dest) {
    if (!dest) {
      dest = csp.chan();
    }
    csp.operations.mult.tap(this._mult, dest);
    return dest;
  }

  setEndTime(endTime) {
    this.endTime = endTime;
  }

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

    csp.putAsync(this._source, dt);

    this._previousTime = dt;
    requestAnimationFrame(this._frameCallback);
  }

  play() {
    if (this.playing) {
      return;
    }

    this._startTime = null;
    this._previousTime = -1;
    this.playing = true;
    requestAnimationFrame(this._frameCallback);
  }

  stop() {
    this.playing = false;
  }

  setTime(time) {
    csp.putAsync(this._source, time);
  }

}

export default TimeStream;
