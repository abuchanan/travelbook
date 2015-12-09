import polyfill from 'babel-polyfill';
import Schema from './schema';
import * as playback from './playback';
import * as flights from './flights';
import Geocoder from './geocode';
import { update_view } from './view';


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

const Track = {
  id: "",
  name: "Untitled",
  type: "",
  keyframes: Schema.List(),
  definition: null,
};

const Keyframe = value => ({ time: 0, value });
const Keyframes = value => Schema.List(Keyframe(value));

const schema = {

  flights: Schema.Map({
    id: "",
    name: "Untitled",
    from: Location,
    to: Location,
    is_active: true,
    progress: 1,

    tracks: {
      active: {
        name: "Active",
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
    tracks: {
      center: {
        name: "Map Center",
        keyframes: Keyframes(Coordinates),
      }
    },
  },

  others: Schema.List({
    other_value: "other",
  }),

  scalar_list: Schema.List(),
  scalar_map: Schema.Map(),

  playback: {
    playing: false,
    start_time: -1,
    end_time: -1,
    previous_time: -1,
    current_time: 0,
  },

  inspector: {
    active: "",
    data: null,
  },
};

function on_update() {
  flights.update_flights(state.playback.current_time, state.flights, state.map.sources);
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
    add: bind(flights.add_flight, state.flights),
  },

  playback: {
    start: bind(playback.start, state.playback),
    stop: bind(playback.stop, state.playback),
  },

  Geocoder(results_callback) {
    return new Geocoder(results_callback);
  },
};


/*
  init app
*/

(function test_data() {
  state.map.center.longitude = 257;

  let a = actions.flights.add();
  a.from.latitude = 45.619300;
  a.from.longitude = -122.685138;
  a.to.latitude = -36.596269;
  a.to.longitude = 174.856537;

  a.tracks.progress.keyframes.get(0).value = 0;
  let end = a.tracks.progress.keyframes.add();
  end.time = 5000;
  end.value = 1;

  state.playback.end_time = 7000;

  setTimeout(() => actions.playback.start(), 2000);
})();


update_view(state, actions);
