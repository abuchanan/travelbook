import polyfill from 'babel-polyfill';
import extend from 'extend';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import { readonly } from './readonly';

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
    playback_flight(state, flight, current_time);
  }

  for (let drive_id in drives) {
    let drive = drives[drive_id];
    playback_drive(state, drive, current_time);
  }

  playback_map_follow(state, current_time);
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

  if (active_track.keyframes.length == 0 || target_track.keyframes.length) {
    return state;
  }

  let active = Keyframes.get_value(active_track.keyframes, current_time);

  if (active) {
    let target_id = Keyframes.get_value(target_track.keyframes);
    let target = get_path(state, target_id);
    state.map.center = target;
  }

  return state;
}


const initial_state = {
  playback: initial_playback_state.clone(),

  flights: {},
  drives: {},
  tracks: {
    map_follow_active: {
      name: "Map Center: follow active",
      keyframes: [],
    },
    map_follow_target: {
      name: "Map Center: follow target",
      keyframes: [],
    }
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
};


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
  let flight = state.flights[flight_id];
  flight[target] = location;
  flight.arc = flight_arc(flight);
  state.map.sources[flight.id] = [flight.arc];
}


let simple_handlers = {
  stop_playback(state) {
    state.playback.stop_on_next = true;
  },

  receive_frame(state, global_time) {
    on_receive_frame(state.playback, global_time);

    if (state.playback.playing) {
      on_tick_playback(state);
    }
  },

  set_map_position(state, zoom, center) {
    if (center) {
      state.map.center = center;
    }
    if (zoom) {
      state.map.zoom = zoom;
    }
    return state;
  },

  set_inspector(state, key, data) {
    console.log('set inspector', key, data);
    state.inspector = {key, data};
  },


  set_flight_origin(state, flight_id, location) {
    update_flight_path(state, flight_id, "origin", location);
  },

  set_flight_destination(state, flight_id, location) {
    update_flight_path(state, flight_id, "destination", location);
  },

  set_flight_name(state, flight_id, name) {
    state.flights[flight_id].name = name;
  },

  add_flight_and_inspect(state) {
    let flight = create_flight();

    let progress_track_id = flight.id + '-progress-track';
    let progress_track = {
      name: "Flight: " + flight.name,
      keyframes: [],
    };
    Keyframes.set_keyframe(progress_track.keyframes, 0, 0);
    Keyframes.set_keyframe(progress_track.keyframes, 5000, 1);

    let follow_track_active = state.tracks.map_follow_active;
    let follow_track_target = state.tracks.map_follow_target;

    Keyframes.set_keyframe(follow_track_active.keyframes, 0, 1);
    Keyframes.set_keyframe(follow_track_active.keyframes, 5000, 0);

    Keyframes.set_keyframe(follow_track_target.keyframes, 0, ['flights', flight.id, 'current_point']);

    flight.track_ids.progress = progress_track_id;
    state.tracks[progress_track_id] = progress_track;
    state.tracks.map_follow_active = follow_track_active;
    state.tracks.map_follow_target = follow_track_target;
    state.flights[flight.id] = flight;
    state.inspector = {key: 'flight', data: flight.id};
  },


  add_drive_and_inspect(state) {
    let drive = create_drive();

    let progress_track_id = drive.id + '-progress-track';
    let progress_track = {
      name: "Drive: " + drive.name,
      keyframes: []
    };
    Keyframes.set_keyframe(progress_track.keyframes, 0, 0);
    Keyframes.set_keyframe(progress_track.keyframes, 10000, 1);

    drive.track_ids.progress = progress_track_id;
    state.tracks[progress_track_id] = progress_track;
    state.drives[drive.id] = drive;
    state.inspector = {key: 'drives', data: drive.id};
  },

  set_drive_route(state, drive_id, route) {
    state.drives[drive_id].route = route;
  },

  save(state) {
    let data = serialize(state);
    console.log("Save", data);
    localStorage.setItem(STORAGE_KEY, data);
  },

  load(state) {
    let s = localStorage.getItem(STORAGE_KEY);
    let data = deserialize(s);
    extend(true, state, data);
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

  handler(state, ...action.args);
  // TODO this doesn't work because redux will use this as the next state
  //      redux is kinda getting in the way with its opinions
  //return readonly(state);

  // TODO again, redux is getting in the way because it's doing an equality
  //      check here. If you don't return a new object, nothing will be
  //      updated.
  return extend({}, state);
}

const store = createStore(app);


function select(state) {
  return readonly(state);
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
