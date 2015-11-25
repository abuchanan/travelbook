import extend from 'extend';
import csp from 'js-csp';
import { map, remove, compose, dedupe } from 'transducers.js';
import arc from 'arc';
import transitions from '../scripts/transitions';
import Track from './Track';
import { MapActions } from '../actions';


class Flight {

  constructor() {
    var start = { x: -122, y: 48 };
    //var end = { x: -77, y: 39 };
    var end = { x: 174.900, y: -36.536 };

    this.arc = new FlightArc(start, end);

    this.progress = new Track();
    this.progress.setKeyframe(0, 0, transitions.linear);
    this.progress.setKeyframe(10000, 1);

    this.id = "flight";
    // TODO need a way to clear the line

    var xform = compose(
      // Convert progress to a number of coordinates
      map(progress => Math.floor(this.arc.numCoordinates * progress)),
      // Remove zeros because empty lines are invalid to Mapbox.
      remove(x => x == 0),
      // Remove consecutive duplicate values
      dedupe(),
      // Get the partial arc (up to current progress)
      map(i => this.arc.slice(i))
    );
    this.channel = csp.chan(1, xform);
    csp.operations.pipe(this.progress.channel, this.channel);
    csp.spawn(this._reader());
  }

  *_reader() {
    while (true) {
      var arc = yield this.channel;
      MapActions.setFeature(this.id, arc.json());
    }
  }
}


class FlightArc {

  static defaultOptions = {
    resolution: 150,
    offset: 10,
  };

  constructor(start, end, options) {
    this.start = start;
    this.end = end;
    options = this.options = extend({}, FlightArc.defaultOptions, options);

    this.properties = {};

    var generator = new arc.GreatCircle(this.start, this.end, this.properties);
    this._arc = generator.Arc(options.resolution, {offset: options.offset});
  }

  get numCoordinates() {
    return this._arc.geometries
      .map(g => g.coords.length)
      .reduce((a, b) => a + b);
  }

  clone() {
    var copy = new this.constructor(this.start, this.end, this.resolution);
    copy.properties = extend({}, this.properties);
    return copy;
  }

  slice(i) {
    var arc = this.clone();
    var geos = arc._arc.geometries;
    var max = this.numCoordinates;

    if (i > max) {
      i = max;
    }

    for (var j = 0; j < geos.length; j++) {
      var coords = geos[j].coords;
      if (i == 0) {
        geos.splice(j, 1);
      } else if (i >= coords.length) {
        i -= coords.length;
      } else {
        coords.splice(i);
        i = 0;
      }
    }

    return arc;
  }

  json() {
    return this._arc.json();
  }
}

export default Flight;
