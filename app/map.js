import * as Keyframes from './keyframes';

export function get_or_create_source(sources, source_id) {

  if (!sources.has(source_id)) {
    var features = [];
    sources.set(source_id, features);
    return features;
  } else {
    return sources.get(source_id);
  }
}

export function add_feature(sources, source_id, feature) {

  get_or_create_source(source_id).push(feature);
}

export function set_features(sources, source_id, features) {
  // TODO ensure that features is the proper shape
  //      this is where Typescript would be useful.
  sources.set(source_id, features);
}

export function update_map(map, time) {
  // let center = get_transition_track_value(map.tracks.center, time);
  // TODO be able to merge objects on set
  // map.center = get_value(keyframes, time);
  // map.center.latitude = center.latitude;
  // map.center.longitude = center.longitude;

  // map.zoom = Keyframes.get_value(map.tracks.zoom.keyframes, time);
}


function get_transition_track_value(track, time) {
  let [start, end] = Keyframes.get_keyframes(track.keyframes, time);
  let transition = start.value.transition;

  // In this case we're past the last keyframe.
  if (end === undefined) {
    return start.value;
  }

  if (!transition) {
    return start.value;
  }

  let percent = (time - start.time) / (end.time - start.time);
  return {
    latitude: transition(percent, start.value.latitude, end.value.latitude),
    longitude: transition(percent, start.value.longitude, end.value.longitude),
  };
}
