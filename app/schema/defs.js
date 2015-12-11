// TODO
// - O(1) equality testing with version numbers
// - Iterable collections
import * as storage from './storage';

const SchemaDef = storage.SchemaDef;




export function Map(value_type_def) {
  if (value_type_def !== undefined) {
    return new SchemaDef(storage.RecordMap, wrap(value_type_def));
  } else {
    return new SchemaDef(storage.BaseMap);
  }
}

export function List(value_type_def) {
  if (value_type_def !== undefined) {
    return new SchemaDef(storage.RecordList, wrap(value_type_def));
  } else {
    return new SchemaDef(storage.ScalarList);
  }
}

export function Record(value_type_def) {
  return new SchemaDef(storage.Record, value_type_def);
}

function wrap(def) {
  if (!(def instanceof SchemaDef)) {
    def = new SchemaDef(storage.Record, def);
  }
  return def;
}
