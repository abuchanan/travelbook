import * as Keyframes from './keyframes';
import * as transitions from './transitions';
import { generate_id } from './utils';

export function add_drive(drives) {
  let id = generate_id();
  let drive = drives.get(id);
  drive.id = id;

  drive.tracks.visible.keyframes.add();
  drive.tracks.progress.keyframes.add();

  return drive;
}

function get_progress_track_value(track, time) {
  let [start, end] = Keyframes.get_keyframes(track.keyframes, time);

  // In this case we're past the last keyframe.
  if (end === undefined) {
    return start.value;
  }

  let percent = (time - start.time) / (end.time - start.time);
  return transitions.linear(percent, start.value, end.value);
}

export function update_drives(time, drives, map) {

  for (var drive of drives.values()) {

    // drive.visible = Keyframes.get_value(drive.tracks.visible.keyframes, time);
    // drive.progress = get_progress_track_value(drive.tracks.progress, time);

    // TODO This should check if route is set to useful values and if not
    //      remove the map feature data.
    if (drive.visible && drive.progress > 0) {
      let slice_length = Math.floor(drive.progress * drive.route.coordinates.length);
      map.sources.set(drive.id, [{
        type: "Feature",
        geometry: {
          type: "LineString",
          // TODO using internal __storage
          coordinates: drive.route.coordinates.__storage.slice(0, slice_length),
        },
      }]);
    } else {
      map.sources.delete(drive.id);
    }
  }
}
