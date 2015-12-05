import csp from 'js-csp';
import { map, remove, compose, dedupe } from 'transducers.js';
import { MapActions } from '../actions';

class Markers {

  constructor() {
    this.track = new Track();
    this.fetchGeoData();

    var xform = compose(
      map(MapActions.setCenter)
    );
    this.id = "markers";

    this.channel = csp.chan();
    csp.operations.pipe(this.track.channel, this.channel);
    csp.spawn(this._reader());
  }

  *_reader() {
    while (true) {
      var arc = yield this.channel;
      MapActions.setFeature(this.id, arc.json());
    }
  }

  fetchGeoData() {
    jQuery.ajax({
      url: "/travels.geojson",
      dataType: "json",
      cache: false,
      context: this,
      success: function(data) {
        var keyframeTime = 0;

        data.features.forEach(feature => {
          var value = feature.geometry.coordinates;
          this.track.setKeyframe(keyframeTime, value);
          keyframeTime += 1500;
        });

        Time.setEndTime(keyframeTime);
    }});
  }
}

export MapCenter;
