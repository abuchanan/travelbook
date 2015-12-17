import extend from 'extend';
import arc from 'arc';

import * as Multiline from './multiline';
import { generate_id } from './utils';
import { Record, List } from './schema/defs';


const Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

const Flight = {
  id: "",
  name: "Untitled",
  from: Location,
  to: Location,
  visible: true,
  progress: 1,
  last_point: {
    latitude: 0,
    longitude: 0,
  },
  tracks: {
    visible: [],
    progress: [],
    follow: [],
  },
  features: [],
};


export function create_flight() {
  let flight = extend(true, {}, Flight);
  flight.id = generate_id();
  return flight;
}

export function flight_arc(flight, options) {
  let default_options = {
    resolution: 200,
  };
  options = extend({}, default_options, options);

  let from = {x: flight.from.longitude, y: flight.from.latitude};
  let to = {x: flight.to.longitude, y: flight.to.latitude};
  let properties = {};

  let generator = new arc.GreatCircle(from, to, properties);
  return generator.Arc(options.resolution).json();
}


function get_progress(flight, current_time) {
  let [start, end] = Keyframes.get_keyframes(flight.tracks.progress, current_time);
  let percent_complete = (current_time - start.time) / (end.time - start.time);
  let progress = linear_transition(percent_complete, start.value, end.value);

  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }

  return progress;
}

export function update_flight_playback(flight, current_time) {
  // TODO update visible track
  flight.progress = get_progress(flight, current_time);

  // TODO This should check if from/to are set to useful values
  let reference_line = flight_arc(flight);
  let slice = Multiline.slice(reference_line, flight.progress);

  if (slice.geometry.coordinates.length > 0) {
    let lp = Multiline.last_point(slice);
    flight.last_point.longitude = lp[0];
    flight.last_point.latitude = lp[1];
  }

  flight.features.clear();

  if (flight.visible && flight.progress > 0) {
    flight.features.append(slice);
  }

  // TODO update follow track. be able to follow if invisible.
}
