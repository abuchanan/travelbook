import polyfill from 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';

import * as playback from './playback';
import { add_flight, flight_progress } from './flights';
import * as drives from './drives';
import { App } from './components/App';
import { linear as linear_transition } from './transitions';
import { seconds } from './utils';
import { schema } from './schema';
import * as storage from './schema/storage';


function update_view() {
  render(<App appState={state} />, container);
}

function update_sources() {
  let entities = [...state.flights.values(), ...state.drives.values()];

  state.map.sources.clear();
  for (let entity of entities) {
    state.map.sources.set(entity.id, Array.from(entity.features));
  }
}

function update_tracks() {

  let {
    current_time,
    previous_time,
  } = state.playback;
  let track_types = {
    follow_flight,
    linear_interpolate,
    flight_progress,
  };
  let entities = [...state.flights.values(), ...state.drives.values(), state.map];

  for (let entity of entities) {
    for (let track of entity.tracks) {
      let track_type = track_types[track.type];

      if (!track_type) {
        throw new Error(`Unrecognized track type ${track.type}`);
      }

      if (track.start_time <= current_time && track.end_time >= previous_time) {
        track_type(state, entity, track, {
          current_time,
          percent_complete: (current_time - track.start_time) / (track.end_time - track.start_time),
        });
      }
    }
  }

}


const STORAGE_KEY = "travel-book-storage-v1";

function save_state(state) {
  let data = {};

  for (let key in state) {
    let val = state[key];

    if (val instanceof storage.Record) {
      data[key] = save_state(val);

    } else if (val instanceof storage.ScalarList) {
      data[key] = val.__storage;

    } else if (val instanceof storage.RecordList) {
      data[key] = val.__storage.map(save_state);

    } else if (val instanceof storage.RecordMap) {
      data[key] = Array.from(val.entries())
        .map(entry => [entry[0], save_state(entry[1])]);

    } else if (val instanceof storage.BaseMap) {
      data[key] = Array.from(val.entries());

    } else if (is_scalar(val)) {
      data[key] = val;

    } else {
      throw new Error("Unhandled type");
    }
  }
  return data;
}

function save() {
  let data = save_state(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


function on_update() {
  if (state.playback.playing) {
//    drives.update_drives(state.playback.current_time, state.drives, state.map);
    update_tracks();
  }

  update_sources();
  //save();
  update_view();
}

function add_track(tracks, track) {
  tracks.append(track);
}

function is_scalar(val) {
  let type = typeof val;
  return type == "string" || type == "number" || type == "boolean";
}

// TODO playback state should not be saved/loaded
function load_state(data, state) {
  for (let key in data) {
    let val = data[key];
    let substate = state[key];

    if (substate instanceof storage.Record) {
      load_state(val, substate);

    } else if (substate instanceof storage.ScalarList) {
      substate.extend(val);

    } else if (substate instanceof storage.RecordList) {
      for (let subkey of val) {
        load_state(val[subkey], substate.add());
      }

    } else if (substate instanceof storage.RecordMap) {
      for (let entry of val) {
        load_state(entry[1], substate.get(entry[0]));
      }

    } else if (substate instanceof storage.BaseMap) {
      substate.merge(new Map(val));

    } else if (is_scalar(val)) {
      state[key] = val;

    } else {
      throw new Error("Unhandled type");
    }
  }
}

function load() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  load_state(data, state);
}


function get_target(state, key) {
  for (var part of key.split('.')) {
    state = state[part];
  }
  return state;
}

function set_target(state, key, value) {
  let sp = key.split('.');
  for (var i = 0; i < sp.length - 1; i++) {
    state = state[sp[i]];
  }
  state[sp[i]] = value;
}

function follow_flight(state, flight, track, track_state) {
  let {target_id} = track;
  let target = get_target(state, target_id);

  target.latitude = flight.last_point.latitude;
  target.longitude = flight.last_point.longitude;
}

// function pan_west(state, track, track_state) {
//   let {target, start_point, end_point} = track;
//   let {percent_complete} = track_state;
//
//   target = get_target(state, target);
//   target.latitude = linear_transition(percent_complete, start_point.latitude, end_point.latitude);
//   target.longitude = linear_transition(percent_complete, start_point.longitude, end_point.longitude);
// }

function linear_interpolate(state, entity, track, track_state) {
  let {start_value, end_value, target_id} = track;
  let {percent_complete} = track_state;
  let val = linear_transition(percent_complete, start_value, end_value);
  set_target(state, target_id, val);
}


window.dump_storage = function() {
  console.log("storage", JSON.parse(localStorage.getItem(STORAGE_KEY)));
};

window.dump_state = function() {
  console.log("state", state);
}

window.clear_storage = function() {
  localStorage.removeItem(STORAGE_KEY);
};

/*
  init app
*/
var state = schema.create(on_update);

load();
let container = document.getElementById('app-container');


window.state = state;
window.generate_test_data = function() {

  // state.playback.end_time = 11000;

  // state.map.center.latitude = 45.619300;
  // state.map.center.longitude = -122.685138;
  state.map.zoom = 1;

  let a = add_flight(state.flights);
  a.from.latitude = 45.619300;
  a.from.longitude = -122.685138;
  a.to.latitude = -37.005880;
  a.to.longitude = 174.789457;

  //
  // add_track(state.map.tracks, {
  //   start_time: seconds(10),
  //   end_time: seconds(12),
  //   start_value: 5,
  //   end_value: 10,
  //   // TODO confusing whether this refers state or entity and how would you
  //   //      switch. want a better serializeable reference system
  //   target_id: 'map.zoom',
  //   type: 'linear_interpolate',
  // });
  //
  add_track(a.tracks, {
    start_time: seconds(0),
    end_time: seconds(10),
    start_value: 0,
    end_value: 1,
    type: 'flight_progress',
  });

  add_track(a.tracks, {
    start_time: seconds(0),
    end_time: seconds(10),
    target_id: 'map.center',
    type: 'follow_flight',
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


};

generate_test_data();
update_view();
