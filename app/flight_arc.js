import extend from 'extend';
import arc from 'arc';


class FlightArc {

  static defaultOptions = {
    resolution: 200,
    //offset: 10,
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

  last_point() {
    let geo = this._arc.geometries[this._arc.geometries.length - 1];
    return geo.coords[geo.coords.length - 1];
  }

  clone() {
    var copy = new this.constructor(this.start, this.end, this.resolution);
    copy.properties = extend({}, this.properties);
    return copy;
  }

  json() {
    return this._arc.json();
  }
}

export default FlightArc;
