import extend from 'extend';
import arc from './lib/arc';

import * as Multiline from './multiline';
import { generate_id } from './utils';
import * as Keyframes from './keyframes';
import { linear as linear_transition } from './transitions';


const Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

const Flight = {
  id: "",
  name: "Untitled",
  origin: Location,
  destination: Location,
  arc: null,

  visible: true,
  progress: 1,

  track_ids: {
    visible: "",
    progress: "",
    follow: "",
  },
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

  let origin = {x: flight.origin.longitude, y: flight.origin.latitude};
  let destination = {x: flight.destination.longitude, y: flight.destination.latitude};
  let properties = {};

  let generator = new arc.GreatCircle(origin, destination, properties);
  return generator.Arc(options.resolution).json();
}


function get_progress(progress_track, current_time) {
  let [start, end] = Keyframes.get_keyframes(progress_track.keyframes, current_time);

  if (!end) {
    return start.value;
  }

  let percent_complete = (current_time - start.time) / (end.time - start.time);
  let progress = linear_transition(percent_complete, start.value, end.value);

  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }

  return progress;
}

function slice_line(source, percent) {
  let source_length = source.geometry.coordinates.length;
  let slice_length = Math.floor(source_length * percent);
  let clone = extend(true, {}, source);

  if (slice_length < 2) {
    clone.geometry.coordinates = [];
    return clone;
  }

  if (slice_length > source_length) {
    slice_length = source_length;
  }

  let slice = source.geometry.coordinates.slice(0, slice_length);
  clone.geometry.coordinates = slice;
  return clone;
}

function line_last_point(line) {
  return line.geometry.coordinates[line.geometry.coordinates.length - 1];
}

export function playback_flight(state, flight, current_time) {
  // TODO update visible track

  let progress_track = state.tracks[flight.track_ids.progress];
  let progress = get_progress(progress_track, current_time);
  flight.progress = progress;

  let slice, current_point;

  if (flight.arc.geometry.type == "MultiLineString") {
    slice = Multiline.slice(flight.arc, flight.progress);
    let lp;

    if (slice.geometry.coordinates.length > 0) {
      lp = Multiline.last_point(slice);
    } else {
      lp = Multiline.last_point(flight.arc);
    }

    current_point = {longitude: lp[0], latitude: lp[1]};

  } else {
    slice = slice_line(flight.arc, flight.progress);
    let lp;

    if (slice.geometry.coordinates.length > 0) {
      lp = line_last_point(slice);
    } else {
      lp = line_last_point(flight.arc);
    }

    current_point = {longitude: lp[0], latitude: lp[1]};
  }

  flight.current_point = current_point;


  if (flight.visible && flight.progress > 0) {
    state.map.sources[flight.id] = [slice];
  }

  state.flights[flight.id] = flight;
}
