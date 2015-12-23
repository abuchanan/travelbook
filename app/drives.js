import extend from 'extend';

import * as Keyframes from './keyframes';
import * as transitions from './transitions';
import { generate_id } from './utils';


const Location = {
  name: "",
  latitude: 0,
  longitude: 0,
};

const Drive = {
  id: "",
  name: "Untitled",
  origin: Location,
  destination: Location,
  route: {},
  arc: null,

  visible: true,
  progress: 1,

  track_ids: {
    visible: "",
    progress: "",
    follow: "",
  },
};


export function create_drive() {
  let drive = extend(true, {}, Drive);
  drive.id = generate_id();
  return drive;
}

function get_progress(progress_track, current_time) {
  let [start, end] = Keyframes.get_keyframes(progress_track.keyframes, current_time);

  if (!end) {
    return start.value;
  }

  let percent_complete = (current_time - start.time) / (end.time - start.time);
  let progress = transitions.linear(percent_complete, start.value, end.value);

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

function make_feature(coordinates) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

export function playback_drive(state, drive, current_time) {
  let progress_track = state.tracks[drive.track_ids.progress];
  let progress = get_progress(progress_track, current_time);

  let feature = make_feature(drive.route);

  drive.progress = progress;
  let slice = slice_line(feature, drive.progress);

  if (drive.visible && drive.progress > 0) {
    state.map.sources[drive.id] = [slice];
  }

  state.drives[drive.id] = drive;
}
