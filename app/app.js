import polyfill from 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import Immutable from 'seamless-immutable';

import {
  create_flight,
  flight_arc,
  playback_flight
} from './flights';

import {
  create_drive,
  playback_drive
} from './drives';

import {
  initial_playback_state,
  on_receive_frame
} from './playback';

import { App } from './components/App';
import * as Keyframes from './keyframes';

const STORAGE_KEY = 'travel-book-v2';

JSON.pretty = function(data) {
  return JSON.stringify(data, null, 2);
}

function on_tick_playback(state) {
  let {playback: {current_time}, flights, drives} = state;

  console.log("playback tick", current_time);

  for (let flight_id in flights) {
    let flight = flights[flight_id];
    state = playback_flight(state, flight, current_time);
  }

  for (let drive_id in drives) {
    let drive = drives[drive_id];
    state = playback_drive(state, drive, current_time);
  }

  state = playback_map_follow(state, current_time);
  return state;
}

function get_path(state, path) {
  var ret;
  for (let key of path) {
    if (ret === undefined) {
      ret = state[key];
    } else {
      ret = ret[key];
    }
  }
  return ret;
}

function playback_map_follow(state, current_time) {

  let active_track = state.tracks['map_follow_active'];
  let target_track = state.tracks['map_follow_target'];

  if (active_track.length == 0 || target_track.length) {
    return state;
  }

  let active = Keyframes.get_value(active_track, current_time);

  if (active) {
    let target_id = Keyframes.get_value(target_track);
    let target = get_path(state, target_id);
    state = state.setIn(["map", "center"], target);
  }

  return state;
}


const initial_state = Immutable({
  playback: initial_playback_state,

  flights: {},
  drives: {},
  tracks: {
    map_follow_active: [],
    map_follow_target: [],
  },

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


function serialize(state) {
  let to_save = {
    flights: state.flights,
    drives: state.drives,
    tracks: state.tracks,
  };
  return JSON.pretty(to_save);
}

function deserialize(s) {
  return JSON.parse(s);
}

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


let simple_handlers = {
  stop_playback(state) {
    return state.setIn(['playback', 'stop_on_next'], true);
  },

  receive_frame(state, global_time) {
    let playback_state = on_receive_frame(state.playback, global_time);
    state = state.set('playback', playback_state);
    if (playback_state.playing) {
      state = on_tick_playback(state);
    }
    return state;
  },

  set_map_position(state, zoom, center) {
    if (center) {
      state = state.setIn(["map", "center"], center);
    }
    if (zoom) {
      state = state.setIn(["map", "zoom"], zoom);
    }
    return state;
  },

  set_inspector(state, key, data) {
    return state.set('inspector', {key, data});
  },


  set_flight_origin(state, flight_id, location) {
    return update_flight_path(state, flight_id, "origin", location);
  },

  set_flight_destination(state, flight_id, location) {
    return update_flight_path(state, flight_id, "destination", location);
  },

  set_flight_name(state, flight_id, name) {
    return state.setIn(["flights", flight_id, "name"], name);
  },

  add_flight_and_inspect(state) {
    let flight = create_flight();

    let progress_track_id = flight.id + '-progress-track';
    let progress_track = [];
    Keyframes.set_keyframe(progress_track, 0, 0);
    Keyframes.set_keyframe(progress_track, 5000, 1);

    let follow_track_active = [];
    let follow_track_target = [];

    Keyframes.set_keyframe(follow_track_active, 0, 1);
    Keyframes.set_keyframe(follow_track_active, 5000, 0);

    Keyframes.set_keyframe(follow_track_target, 0, ['flights', flight.id, 'current_point']);

    // TODO this is why I hate immutable code.
    //      the subtle bug here is that state.flights.set returns
    //      the _flights_ state object, not the whole state.
    //      also, you're constantly reassigning the state object.
    // state = state.flights.set(flight.id, flight);
    // state = state.setIn(['inspector', 'key'], 'flight');
    // state = state.setIn(['inspector', 'data'], flight.id);

    return state
      .setIn(['flights', flight.id], flight)
      .setIn(['flights', flight.id, 'track_ids', 'progress'], progress_track_id)
      .setIn(['tracks', progress_track_id], progress_track)
      .setIn(['tracks', 'map_follow_active'], follow_track_active)
      .setIn(['tracks', 'map_follow_target'], follow_track_target)
      .set('inspector', {key: 'flight', data: flight.id});
  },


  add_drive_and_inspect(state) {
    let drive = create_drive();

    let progress_track_id = drive.id + '-progress-track';
    let progress_track = [];
    Keyframes.set_keyframe(progress_track, 0, 0);
    Keyframes.set_keyframe(progress_track, 10000, 1);

    return state
      .setIn(['drives', drive.id], drive)
      .setIn(['drives', drive.id, 'track_ids', 'progress'], progress_track_id)
      .setIn(['tracks', progress_track_id], progress_track)
      .set('inspector', {key: 'drives', data: drive.id});
  },

  set_drive_route(state, drive_id, route) {
    return state.setIn(['drives', drive_id, 'route'], route);
  },

  save(state) {
    let data = serialize(state);
    console.log("Save", data);
    localStorage.setItem(STORAGE_KEY, data);
    return state;
  },

  load(state) {
    let s = localStorage.getItem(STORAGE_KEY);
    let data = deserialize(s);
    return state.merge(data, {deep: true});
  },

};

let async_handlers = {

  toggle_playback(dispatchers, get_state) {
    if (get_state().playback.playing) {
      dispatchers.stop_playback();
    } else {
      dispatchers.start_playback();
    }
  },

  start_playback(dispatchers, get_state) {
    function callback(global_time) {
      dispatchers.receive_frame(global_time);

      if (get_state().playback.playing) {
        requestAnimationFrame(callback);
      }
    }

    requestAnimationFrame(callback);
  },

};

let handlers = {...simple_handlers, ...async_handlers};

function app(state = initial_state, action) {
  let handler = handlers[action.type];
  if (handler === undefined) {
    return state;
  }

  let ret = handler(state, ...action.args);
  if (ret === undefined) {
    throw new Error(`Forgot to return state? in action $(action.type)`);
  }
  return ret;
}

const store = createStore(app);


function select(state) {
  return state;
}

function make_dispatchers(dispatch) {
  let dispatchers = {};

  function make_simple_dispatcher(type) {
    return (...args) => dispatch({type, args});
  }

  function make_async_dispatcher(func) {
    return (...args) => func(dispatchers, store.getState, ...args);
  }

  for (let key in simple_handlers) {
    dispatchers[key] = make_simple_dispatcher(key);
  }

  for (let key in async_handlers) {
    dispatchers[key] = make_async_dispatcher(async_handlers[key]);
  }
  return {dispatchers};
}

let container = document.getElementById('app-container');
let ConnectedApp = connect(select, make_dispatchers)(App);

render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  container);
