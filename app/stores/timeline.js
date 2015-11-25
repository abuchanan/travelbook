import Reflux from 'reflux';
import H from 'highland';
import Q from 'q';
import MapboxGL from 'mapbox-gl';
import extend from 'extend';
import jQuery from "jquery";
import IntervalTree from 'interval-tree';
import arc from 'arc';
import Class from '../scripts/Class';
import TimeStream from '../scripts/TimeStream';
import Immutable from 'immutable';

import { LocationActions, MapActions, TimelineActions } from '../actions';


function dropRepeats(stream) {
  var dropMe = {};
  return stream
    .scan1((memo, value) => {
      if (memo === value) {
        return dropMe;
      } else {
        return value;
      }
    })
    .reject(value => value === dropMe);
}


const Time = new TimeStream();

const Track = Class({
  init() {
    this.keyframes = [];
  },

  setKeyframe(time, value, transition) {
    var toSet = {time, value, transition};

    for (var i = 0; i < this.keyframes.length; i++) {
      var keyframe = this.keyframes[i];

      if (keyframe.time == time) {
        keyframes[i] = toSet;
        return;
      } else if (time < keyframe.time) {
        this.keyframes.splice(i, 0, toSet);
        return;
      }
    }

    this.keyframes.push(toSet);
  },

  getValueAtTime(time) {
    var i = 0;
    while (i < this.keyframes.length && time >= this.keyframes[i].time) {
      i++;
    }

    if (i > 0) {
      i -= 1;
    }
    var keyframe = this.keyframes[i];

    // If this isn't the last keyframe, look for a transition.
    // Clearly, we can't transition after the last keyframe because
    // there's no value to transition _to_.
    if (i < this.keyframes.length - 1 && keyframe.transition) {
      var nextKeyframe = this.keyframes[i + 1];
      var percentComplete = (time - keyframe.time) / (nextKeyframe.time - keyframe.time);
      return keyframe.transition(percentComplete, keyframe.value, nextKeyframe.value);
    } else {
      return keyframe.value;
    }
  },

  stream() {
    return Time.stream().map(this.getValueAtTime).through(dropRepeats);
  },

});


const Flight = Class({
  init() {
    var start = { x: -122, y: 48 };
    var end = { x: -77, y: 39 };

    var generator = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});
    this.line = generator.Arc(100, {offset: 10}).json();
    this.coordinates = this.line.geometry.coordinates;

    this.progress = new Track();
    this.progress.setKeyframe(0, 0, this.progressTransition);
    this.progress.setKeyframe(10000, 1);

    // TODO need a way to clear the line
    this.progress.stream()
      .map(this.progressToIndex)
      .reject(i => i == 0)
      .through(dropRepeats)
      .map(this.makeLine)
      .each(line => MapActions.setFeature('flight', line));
  },

  progressTransition(percentComplete, lastValue, nextValue) {
    return (nextValue - lastValue) * percentComplete;
  },

  makeLine(i) {
    this.line.geometry.coordinates = this.coordinates.slice(0, i);
    return this.line;
  },

  progressToIndex(progress) {
    return Math.floor(this.coordinates.length * progress);
  },
});


const MapCenter = Class({
  init() {
    this.track = new Track();
    this.fetchGeoData();
    this.track.stream().each(MapActions.setCenter);
  },

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
  },
});



const TimelineStore = Reflux.createStore({

  listenables: TimelineActions,
  tracks: [],

  init() {
    // TODO what's the appropriate place for these to be defined?
    //MapCenter();
    Flight();
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
