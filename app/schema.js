import * as def from './schema/defs';


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
const Keyframes = value => def.List(Keyframe(value));

export const schema = def.Record({

  flights: def.Map({
    id: "",
    name: "Untitled",
    from: Location,
    to: Location,
    visible: true,
    progress: 1,
    last_point: Coordinates,
    tracks: def.List(),
    features: def.List(),
  }),

  drives: def.Map({
    id: "",
    name: "Untitled",
    visible: true,
    progress: 1,
    route: {
      coordinates: def.List(),
    },
    tracks: def.List(),
    features: def.List(),
  }),

  map: {
    sources: def.Map(),
    center: Coordinates,
    zoom: 3,
    tracks: def.List(),
  },

  playback: {
    playing: false,
    start_time: -1,
    end_time: -1,
    previous_time: -1,
    current_time: 0,
  },

});
