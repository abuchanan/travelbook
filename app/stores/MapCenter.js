import csp from 'js-csp';
import { map, remove, compose, dedupe } from 'transducers.js';
import { MapActions } from '../actions';

class MapCenter {

  constructor() {
    this.track = new Track();
    this.fetchGeoData();
    this.channel = csp.chan();
    var xform = compose(
      map(MapActions.setCenter)
    );
    csp.operations.pipeline(this.track.channel, xform, this.channel);
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
