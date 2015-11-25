import Reflux from 'reflux';
import Q from 'q';
import MapboxGL from 'mapbox-gl';
import jQuery from "jquery";
import IntervalTree from 'interval-tree';
import Immutable from 'immutable';
import Flight from './Flight';

import { Time, LocationActions, MapActions, TimelineActions } from '../actions';




const TimelineStore = Reflux.createStore({

  listenables: TimelineActions,
  tracks: [],

  init() {
    // TODO what's the appropriate place for these to be defined?
    //MapCenter();
    this.flight = new Flight();
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
