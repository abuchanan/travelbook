import polyfill from 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';

import Schema from './schema';
import * as playback from './playback';
import * as flights from './flights';
import * as drives from './drives';
import { update_map } from './map';
import { App } from './components/App';
import { linear as linear_transition } from './transitions';
import { seconds } from './utils';

/*
  Set up state data structure
*/
const Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

const Coordinates = {
  latitude: 0,
  longitude: 0,
};

const Keyframe = value => ({ time: 0, value });
const Keyframes = value => Schema.List(Keyframe(value));

const schema = {

  flights: Schema.Map({
    id: "",
    name: "Untitled",
    from: Location,
    to: Location,
    visible: true,
    progress: 1,
    last_point: Coordinates,
    tracks: {
      visible: {
        name: "Visible",
        keyframes: Keyframes(true),
      },
      progress: {
        name: "Flight Progress",
        keyframes: Keyframes(1),
      },
    }
  }),

  tracks: Schema.List(),

  drives: Schema.Map({
    id: "",
    name: "Untitled",
    visible: true,
    progress: 1,
    route: {
      coordinates: Schema.List(),
    },
    tracks: {
      visible: {
        name: "Visible",
        keyframes: Keyframes(true),
      },
      progress: {
        name: "Flight Progress",
        keyframes: Keyframes(1),
      },
    }
  }),

  map: {
    sources: Schema.Map(),
    center: Coordinates,
    zoom: 3,
    tracks: {
      zoom: {
        name: "Map Zoom",
        keyframes: Keyframes(0),
      },
      center: {
        name: "Map Center",
        keyframes: Keyframes({
          latitude: 0,
          longitude: 0,
          transition: null,
        }),
      }
    },
  },

  playback: {
    playing: false,
    start_time: -1,
    end_time: -1,
    previous_time: -1,
    current_time: 0,
  },

};

let container = document.getElementById('app-container');

function update_view() {
  render(<App appState={state} />, container);
}

function update_tracks() {
  let {
    current_time,
    previous_time,
  } = state.playback;

  for (var track of state.tracks.__storage) {

    if (track.start_time <= current_time && track.end_time >= previous_time) {
      track.update(track, {
        current_time,
        percent_complete: (current_time - track.start_time) / (track.end_time - track.start_time),
      });
    }
  }
}

function on_update() {
  if (state.playback.playing) {
    flights.update_flights(state.playback.current_time, state.flights, state.map);
    drives.update_drives(state.playback.current_time, state.drives, state.map);
  //   update_map(state.map, state.playback.current_time);
    update_tracks();
  }
  update_view();
}

var state = Schema.build(schema, on_update);

function add_track(tracks, track) {
  tracks.append(track);
}

/*
  init app
*/

(function test_data() {

  state.playback.end_time = 11000;

  let a = flights.add_flight(state.flights);
  a.from.latitude = 45.619300;
  a.from.longitude = -122.685138;
  a.to.latitude = -37.005880;
  a.to.longitude = 174.789457;

  function follow_flight(track) {
    let {
      target,
      flight,
    } = track;

    target.latitude = flight.last_point.latitude;
    target.longitude = flight.last_point.longitude;
  }

  function pan_west(track, state) {
    let {
      target,
      start_point,
      end_point,
    } = track;
    target.latitude = linear_transition(state.percent_complete, start_point.latitude, end_point.latitude);
    target.longitude = linear_transition(state.percent_complete, start_point.longitude, end_point.longitude);
  }

  function simple_flight_progress(track, state) {
    let progress = linear_transition(state.percent_complete, track.start_value, track.end_value);
    if (progress > 1) {
      progress = 1;
    } else if (progress < 0) {
      progress = 0;
    }
    track.flight.progress = progress;
  }

  function linear_interpolate(set_property) {
    return (track, state) => {
      set_property(linear_transition(state.percent_complete, track.start_value, track.end_value));
    };
  }

  add_track(state.tracks, {
    start_time: seconds(0),
    end_time: seconds(5),
    start_value: 1,
    end_value: 3,
    update: linear_interpolate(val => state.map.zoom = val),
  });

  add_track(state.tracks, {
    start_time: seconds(5),
    end_time: seconds(10),
    start_value: 0,
    end_value: 1,
    flight: a,
    update: simple_flight_progress,
  });

  add_track(state.tracks, {
    start_time: seconds(5),
    end_time: seconds(10),
    flight: a,
    target: state.map.center,
    update: follow_flight,
  });

  // add_track(state.tracks, {
  //   start_time: seconds(0),
  //   end_time: seconds(5),
  //   target: state.map.center,
  //   start_point: {
  //     latitude: 45.619,
  //     longitude: -122.685,
  //   },
  //   end_point: {
  //     latitude: -36.596269,
  //     longitude: 174.856537,
  //   },
  //   update: pan_west,
  // });


})();


update_view();
