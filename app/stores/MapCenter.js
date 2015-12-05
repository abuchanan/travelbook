import csp from 'js-csp';
import { map, remove, compose, dedupe } from 'transducers.js';
import { MapActions } from '../actions';

class MapCenter {

  constructor() {
    this.track = new Track();
    this.fetchGeoData();

    var xform = compose(
      map(MapActions.setCenter)
    );
    this.channel = csp.chan(1, xform);
    csp.operations.pipe(this.track.channel, this.channel);
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
