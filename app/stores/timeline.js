import Reflux from 'reflux';
import H from 'highland';
import Q from 'q';
import MapboxGL from 'mapbox-gl';
import extend from 'extend';
import jQuery from "jquery";
import IntervalTree from 'interval-tree';

import { LocationActions, MapActions, TimelineActions } from '../actions';


class Track {
  constructor() {
    this.keyframes = [];
    this.noValue = {};
    this.lastValue = this.noValue;
  }

  addKeyframe(time, value) {
    for (var i = 0; i < this.keyframes.length; i++) {
      var keyframe = this.keyframes[i];

      if (keyframe[0] == time) {
        keyframes[1] = value;
      } else if (time < keyframe[0]) {
        this.keyframes.splice(i, 0, [time, value]);
        return;
      }
    }

    this.keyframes.push([time, value]);
  }

  update(time) {
    var i = 0;
    while (time >= this.keyframes[i][0]) {
      i++;
    }

    if (i > 0) {
      i -= 1;
    }
    var value = this.keyframes[i][1];
    if (typeof value == "function") {
      value = value(time);
    }
    if (value !== this.lastValue) {
      this.onChange(value);
      this.lastValue = value;
    }
  }

  onChange(value) {
  }
}


class LocationTrack extends Track {
  onChange(value) {
    console.log(value);
    MapActions.setCenter(value);
  }
}



const TimelineStore = Reflux.createStore({

  listenables: TimelineActions,
  tracks: [],

  init() {
    this.fetchGeoData();
  },

  fetchGeoData() {
    var locationTrack = new LocationTrack();
    this.tracks.push(locationTrack);

    jQuery.ajax({
        url: "/travels.geojson",
        dataType: "json",
        cache: false,
        context: this,
        success: function(data) {
          var t = 0;

          data.features.forEach(feature => {
            locationTrack.addKeyframe(t, feature.geometry.coordinates);
            t += 1500;
          });

          this.endTime = t;
          console.log('loaded');
        }
    });
  },

  onFrame(time, previousTime) {
    this.tracks.forEach(track => track.update(time));

    if (time >= this.endTime) {
      this.stop();
    }
  },

  onPlay() {
    MapActions.disableInteraction();
    var startTime = null;
    var previousTime = -1;
    this.playing = true;
    var store = this;

    var callback = time => {
      if (!store.playing) {
        return;
      }

      if (!startTime) {
        startTime = time;
        requestAnimationFrame(callback);
        return;
      }

      var dt = time - startTime;
      store.onFrame(dt, previousTime);
      previousTime = dt;
      requestAnimationFrame(callback);
    };

    requestAnimationFrame(callback);
  },

  onStop() {
    MapActions.enableInteraction();
    this.playing = false;
  },
});

export default TimelineStore;
