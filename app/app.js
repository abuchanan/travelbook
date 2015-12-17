import polyfill from 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import Immutable from 'seamless-immutable';

import * as actions from './actions';
import { create_flight } from './flights';
import { initial_playback_state, on_receive_frame } from './playback';
import { App } from './components/App';


function on_tick_playback(state) {
  let {playback: {current_time}} = state;
  console.log("playback tick", current_time);
}

const initial_state = Immutable({
  playback: initial_playback_state,

  flights: {},
  drives: {},

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


function app(state = initial_state, action) {
  switch (action.type) {

    case "stop_playback":
      return state.setIn(['playback', 'stop_on_next'], true);

    case "receive_frame":
      let playback_state = on_receive_frame(state.playback, action.global_time);
      state = state.set('playback', playback_state);
      if (playback_state.playing) {
        on_tick_playback(state);
      }
      return state;

    case "set_inspector":
      return state.set('inspector', {key: action.key, data: action.data});

    case "add_flight_and_inspect":
      let flight = create_flight();
      // TODO this is why I hate immutable code.
      //      the subtle bug here is that state.flights.set returns
      //      the _flights_ state object, not the whole state.
      //      also, you're constantly reassigning the state object.
      // state = state.flights.set(flight.id, flight);
      // state = state.setIn(['inspector', 'key'], 'flight');
      // state = state.setIn(['inspector', 'data'], flight.id);

      return state
        .set('flights', {[flight.id]: flight})
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
