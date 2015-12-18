import polyfill from 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import Immutable from 'seamless-immutable';

import * as actions from './actions';
import { create_flight, flight_arc, playback_flight } from './flights';
import { initial_playback_state, on_receive_frame } from './playback';
import { App } from './components/App';
import * as Keyframes from './keyframes';


JSON.pretty = function(data) {
  return JSON.stringify(data, null, 2);
}

function on_tick_playback(state) {
  let {playback: {current_time}, flights} = state;

  console.log("playback tick", current_time);
  console.log("flights", JSON.pretty(flights));

  for (let flight_id in flights) {
    let flight = flights[flight_id];
    state = playback_flight(state, flight, current_time);
  }
  return state;
}


const initial_state = Immutable({
  playback: initial_playback_state,

  flights: {},
  drives: {},
  tracks: {},

  map: {
    sources: {},
    center: {
      longitude: 0,
      latitude: 0,
    },
    zoom: 3,
  },

  inspector: {
    key: ""
  }
});

function update_flight_path(state, flight_id, target, location) {
  // TODO so fucking ugly. this is why I wanted to avoid immutable and redux
  let flight = state
    .flights[flight_id]
    .set(target, location);
  flight = flight.set("arc", flight_arc(flight));
  return state
    .setIn(["flights", flight.id], flight)
    .setIn(["map", "sources", flight.id], [flight.arc]);
}



function app(state = initial_state, action) {
  switch (action.type) {

    case "stop_playback":
      return state.setIn(['playback', 'stop_on_next'], true);

    case "receive_frame":
      let playback_state = on_receive_frame(state.playback, action.global_time);
      state = state.set('playback', playback_state);
      if (playback_state.playing) {
        state = on_tick_playback(state);
      }
      return state;

    case "set_map_position":
      if (action.center) {
        state = state.setIn(["map", "center"], action.center);
      }
      if (action.zoom) {
        state = state.setIn(["map", "zoom"], action.zoom);
      }
      return state;

    case "set_inspector":
      return state.set('inspector', {key: action.key, data: action.data});

    case "set_flight_origin":
      return update_flight_path(state, action.flight_id, "origin", action.location);

    case "set_flight_destination":
      return update_flight_path(state, action.flight_id, "destination", action.location);

    case "set_flight_name":
      return state.setIn(["flights", action.flight_id, "name"], action.name);

    case "add_flight_and_inspect":
      let flight = create_flight();

      let progress_track_id = flight.id + '-progress-track';
      let track = [];
      Keyframes.set_keyframe(track, 0, 0);
      Keyframes.set_keyframe(track, 5000, 1);

      // TODO this is why I hate immutable code.
      //      the subtle bug here is that state.flights.set returns
      //      the _flights_ state object, not the whole state.
      //      also, you're constantly reassigning the state object.
      // state = state.flights.set(flight.id, flight);
      // state = state.setIn(['inspector', 'key'], 'flight');
      // state = state.setIn(['inspector', 'data'], flight.id);

      return state
        .set('flights', {[flight.id]: flight})
        .setIn(['flights', flight.id, 'track_ids', 'progress'], progress_track_id)
        .setIn(['tracks', progress_track_id], track)
        .set('inspector', {key: 'flight', data: flight.id});

    default:
      return state;
  }
}


const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore);

const store = createStoreWithMiddleware(app);


function select(state) {
  return state;
}

let container = document.getElementById('app-container');
let ConnectedApp = connect(select)(App);

render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  container);
