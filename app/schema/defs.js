// TODO
// - O(1) equality testing with version numbers
// - Iterable collections
import * as storage from './storage';

const SchemaDef = storage.SchemaDef;

export function Dict() {
  return new SchemaDef(storage.Dict);
}

export function List() {
  return new SchemaDef(storage.List);
}

export function Record(value_type_def) {
  return new SchemaDef(storage.Record, value_type_def);
}
