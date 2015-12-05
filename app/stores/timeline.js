import Reflux from 'reflux';
import Q from 'q';
import MapboxGL from 'mapbox-gl';
import jQuery from "jquery";
import IntervalTree from 'interval-tree';
import Immutable from 'immutable';
import Flight from './Flight';
import csp from 'js-csp';
import { map, remove, compose, dedupe } from 'transducers.js';

import { Time, LocationActions, MapActions, TimelineActions } from '../actions';


const TimelineStore = Reflux.createStore({

  listenables: TimelineActions,
  tracks: [],

  init() {
    // TODO what's the appropriate place for these to be defined?
    //MapCenter();
    var flight = this.flight = new Flight("flight-1", start, end);

    flight.features.forEach(feature => {
      //var latestDataCh = csp.chan(new LatestBuffer());
      var latestDataCh = csp.chan(10);
      csp.operations.pipe(feature.dataCh, latestDataCh);

      var gated = csp.spawn(this._gate(latestDataCh, feature.onOffCh));
      csp.spawn(this._dataListener(feature.id, gated));
    });

    Time.setEndTime(15000);
    this.fetchGeoData();
  },

  *_dataListener(id, dataCh) {
    console.log("starting listener");
    while (true) {
      console.log("listening for data on", id);
      var data = yield dataCh;
      console.log("got data", data);
    }
  },

  *_gate(dataCh, onOffCh) {
    while (true) {
      var isOn = yield onOffCh;
      console.log("is on?", isOn);
      if (isOn) {
        var value = yield dataCh;
        console.log('-----is on', value);
        yield value;
      }
    }
  },

  fetchGeoData() {
    jQuery.ajax({
      url: "/travels.geojson",
      dataType: "json",
      cache: false,
      context: this,
      success: function(data) {

        var i = 0;
        data.features.forEach(feature => {
          i += 1;
          MapActions.setFeature('marker-' + i, feature);
        });
    }});
  },

  onRegisterTrack(track) {
    this.tracks.push(track);
    var store = this;
    return function() {
      var i = store.indexOf(track);
      store.tracks.splice(i, 1);
    };
  },

  onPlay() {
    MapActions.disableInteraction();
    Time.play();
  },

  onStop() {
    MapActions.enableInteraction();
    Time.stop();
  },
});

export default TimelineStore;
