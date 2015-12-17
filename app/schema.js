import { List, Dict, Record } from './schema/defs';


const Coordinates = {
  latitude: 0,
  longitude: 0,
};


export const schema = Record({

  flights: Dict(),
  drives: Dict(),

  map: {
    sources: Dict(),
    center: Coordinates,
    zoom: 3,
    tracks: {
      zoom: List(),
    }
  },

  playback: {
    playing: false,
    stop: false,
    start_time: -1,
    end_time: -1,
    previous_time: -1,
    current_time: 0,
  },
});
