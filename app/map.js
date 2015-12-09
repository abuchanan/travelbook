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
  let center = Keyframes.get_value(map.tracks.center.keyframes, time);
  // TODO be able to merge objects on set
  // map.center = get_value(keyframes, time);
  map.center.latitude = center.latitude;
  map.center.longitude = center.longitude;
}
