import Reflux from 'reflux';
import H from 'highland';
import Q from 'q';
import MapboxGL from 'mapbox-gl';
import extend from 'extend';
import jQuery from "jquery";
import IntervalTree from 'interval-tree';

import { LocationActions, MapActions, TimelineActions } from '../actions';


const TimelineStore = Reflux.createStore({

  listenables: TimelineActions,
  events: null,

  init() {
    this.fetchGeoData();
  },

  fetchGeoData() {
    jQuery.ajax({
        url: "/travels.geojson",
        dataType: "json",
        cache: false,
        context: this,
        success: function(data) {
          var t = 0;
          var events = [];

          data.features.forEach(feature => {
            events.push({
              name: 'setCenter',
              coordinates: feature.geometry.coordinates,
              startTime: t,
              endTime: t + 1,
            });

            t += 1500;
          });

          var tree = new IntervalTree(Math.floor(t / 2));
          events.forEach(event => {
            tree.add([event.startTime, event.endTime, event]);
          });
          this.events = tree;
          this.endTime = t;
          console.log('loaded');
        }
    });
  },

  onSetCenter(event, dt) {
    MapActions.setCenter(event.coordinates);
  },

  onFrame(time, previousTime) {
    console.log(time, previousTime);

    this.events.search(previousTime, time).forEach(res => {
      var event = res.data[2];
      TimelineActions[event.name](event, time);
    });

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
