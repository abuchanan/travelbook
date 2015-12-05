import csp from 'js-csp';

var LatestBuffer = function(buf) {
  this.buf = buf;
};

LatestBuffer.prototype.is_full = function() {
  return false;
};

LatestBuffer.prototype.remove = function() {
  return this.buf;
};

LatestBuffer.prototype.add = function(item) {
  this.buf = item;
};

LatestBuffer.prototype.count = function() {
  return 1;
};

class Track {

  constructor(sourceCh) {
    this.channel = csp.chan(new LatestBuffer());
    //this.channel = csp.spawn(this._bufferLatest(sourceCh));
  }

  _bufferLatest(sourceCh) {
    var latest = yield sourceCh;

    csp.go(function*() {
      while (true) {
        latest = yield sourceCh;
      }
    });

    return csp.go(function*() {
      while (true) {
        yield latest;
      }
    });
  }
}

export default Track;
