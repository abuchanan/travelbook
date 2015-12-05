import { register, read_only, run_action } from './helpers';
import { start_playback, stop_playback, update_playback_time } from './playback';
import { add_flight, update_tracks, update_flights } from './flights';
import { update_view } from './view';


// State

var state = {
  home: {
    message: "Hello, world!",
  },
  flights: new Map(),
  tracks: new Map(),
  map: {
    sources: new Map(),
  },
  playback: {
    playing: false,
    start_time: null,
    end_time: null,
    current_time: 0,
    previous_time: null,
  }
};


/**********************************************************************************
 core: only affects state. synchronous. does not know about the outside world.
       kept separate for easy testing.
*/
var core = new Map();

register(core, 'add flight', (start, end) => add_flight(state, start, end));

register(core, 'playback frame', time => {
  update_playback_time(state.playback, time);
  update_tracks(state.tracks.values(), state.playback.current_time);
  update_flights(state.flights.values(), state.map.sources);
});

register(core, 'stop playback', () => stop_playback(state.playback));


/**********************************************************************************
  outdoors: the stuff that comes between the core and the outside world
            views, server APIs, the browser, anything asynchronous.

  post process: things that need to run after an action has completed.

  Many also get special treatment:
  - state is readonly
  - they are given the act() function so they can trigger actions
  - they are kept separate for easy testing.
*/
var outdoors = new Map();

register(outdoors, 'init app', container => state.container = container);
register(outdoors, 'start playback', () => start_playback(read_only(state.playback), act));

register(outdoors, 'redo', () => {
  console.log('redo');
  state.map.sources.set('test-data', [
      {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [-76.53063297271729, 39.18174077994108]
        },
        "properties": {
        }
      }
  ]);
});

function post_process() {
  update_view(read_only(state), act);
}


/**********************************************************************************
  init app
*/


// Combine all the sets of actions
var actions = new Map([...core, ...outdoors]);

// TODO don't use strings. use functions. prevents typos.
//      e.g. act.init_app(el)
act('init app', document.getElementById('app-container'));

//setTimeout(() => act('redo'), 4000);


function act(name, ...args) {
  run_action(actions, name, ...args);
  post_process();
}
