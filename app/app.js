import polyfill from 'babel-polyfill';
import Schema from './schema';
import * as playback from './playback';
import * as flights from './flights';
import Geocoder from './geocode';
import { update_view } from './view';


/*
  Set up state data structure
*/
var Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

var schema = {

  container: null,

  flights: Schema.Map({
    id: "",
    name: "Untitled",
    from: Location,
    to: Location,
    is_active: true,
    progress: 1,
    track_ids: Schema.Map(),
  }),

  map: {
    sources: Schema.Map(),
  },

  tracks: Schema.Map({
    id: "",
    name: "Untitled",
    type: "",
    keyframes: Schema.List(),
    definition: null,
  }),

  others: Schema.List({
    other_value: "other",
  }),

  scalar_list: Schema.List(),
  scalar_map: Schema.Map(),

  playback: {
    playing: false,
    start_time: -1,
    end_time: -1,
    current_time: 0,
  },

  inspector: {
    active: "",
    data: null,
  },
};

function on_update() {
  update_view(state, actions);
}

var state = Schema.build(schema, on_update);


/*
  Bind actions
*/

function bind(func, ...args) {
  return func.bind(null, ...args);
}

var actions = {
  flights: {
    add: bind(flights.add_flight, state.flights, state.tracks, state.map.sources),
  },

  playback: {
    start: bind(playback.start, state.playback, timestamp => actions.playback.tick(timestamp)),
    stop: bind(playback.stop, state.playback),

    tick(time) {
      playback.update_time(state.playback, time);
      //flights.update_tracks(state.tracks, state.playback.current_time);
      flights.update_flights(state.flights, state.map.sources);
    },
  },

  Geocoder(results_callback) {
    return new Geocoder(results_callback);
  },
};


/*
  init app
*/

state.container = document.getElementById('app-container');
