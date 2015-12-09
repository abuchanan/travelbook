import extend from 'extend';
import arc from 'arc';


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

  get length() {
    return this._arc.geometries
      .map(g => g.coords.length)
      .reduce((a, b) => a + b);
  }

  clone() {
    var copy = new this.constructor(this.start, this.end, this.resolution);
    copy.properties = extend({}, this.properties);
    return copy;
  }

  slice(percent) {
    let i = Math.floor(this.length * percent);
    var arc = this.clone();
    var geos = arc._arc.geometries;
    var max = this.length;

    if (i > max) {
      i = max;
    }

    for (var j = 0; j < geos.length; j++) {
      var coords = geos[j].coords;
      if (i >= coords.length) {
        i -= coords.length;
      } else {
        coords.splice(i);
        geos[j].length = i;
        geos.splice(j + 1);
        break;
      }
    }

    return arc;
  }

  json() {
    return this._arc.json();
  }
}

export default FlightArc;
