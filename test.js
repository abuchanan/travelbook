"use strict";
var uuid = require("node-uuid");


class BaseMap {

  constructor(on_change) {
    this.__on_change = on_change;
    this.__storage = new Map();
    this.__is_schema_value = true;
  }

  get(key) {
    return this.__storage.get(key);
  }

  set(key, value) {
    this.__storage.set(key, value);
    this.__on_change();
  }

  delete(key) {
    this.__storage.delete(key);
    this.__on_change();
  }

  keys() {
    return this.__storage.keys();
  }

  values() {
    return this.__storage.values();
  }

  entries() {
    return this.__storage.entries();
  }

  has(key) {
    return this.__storage.has(key);
  }
  
  clear() {
    this.__storage.clear();
    this.__on_change();
  }
}


class RecordMap extends BaseMap {

  constructor(on_change, value_type_def) {
    super(on_change);
    this.__value_type_def = value_type_def;
  }

  get(key) {
    if (!this.__storage.has(key)) {
      var val = build_schema(this.__value_type_def, this.__on_change);
      this.__storage.set(key, val);
      return val;
    } else {
      return this.__storage.get(key);
    }
  }
}


class BaseList {

  constructor(on_change) {
    this.__on_change = on_change;
    this.__storage = [];
    this.__is_schema_value = true;
  }

  get(index) {
    return this.__storage[index];
  }

  set(index, value) {
    this.__storage[index] = value;
    this.__on_change();
  }

  clear() {
    this.__storage = [];
    this.__on_change();
  }

  extend(vals) {
    this.__storage.push(...vals);
    this.__on_change();
  }
}

class ScalarList extends BaseList {

  append(...vals) {
    this.__storage.push(...vals);
    this.__on_change();
  }
}


class RecordList extends BaseList {

  constructor(on_change, value_type_def) {
    super(on_change);
    this.__value_type_def = value_type_def;
  }

  add() {
    var val = build_schema(this.__value_type_def, this.__on_change);
    this.__storage.push(val);
    this.__on_change();
    return val;
  }
}


var Schema = {

  Map(value_type_def) {
    if (value_type_def !== undefined) {
      return on_change => {
        return new RecordMap(on_change, value_type_def);
      };
    } else {
      return on_change => {
        return new BaseMap(on_change);
      };
    }
  },

  List(value_type_def) {
    if (value_type_def !== undefined) {
      return on_change => {
        return new RecordList(on_change, value_type_def);
      };
    } else {
      return on_change => {
        return new ScalarList(on_change);
      };
    }
  },
};


function wrap_on_change(callback) {
  var timeout;

  function wrapper() {
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = false;
        callback();
      }, 0);
    }
  }
  wrapper.__is_on_change_wrapper = true;
  return wrapper;
}


function build_schema(schema, on_change) {
  if (typeof schema != "object") {
    throw new TypeError("Invalid schema definition. Must be an object.");
  }

  var built = {};
  var defaults = {};

  if (on_change.__is_on_change_wrapper !== true) {
    on_change = wrap_on_change(on_change);
  }

  for (var key in schema) {
    var value = schema[key];

    if (typeof value == "function") {
      value = value(on_change);
    }

    var type = typeof value;

    if (type == "string" || type == "number" || type == "boolean" || value === null) {

      defaults[key] = value;
      Object.defineProperty(built, key, value_property(key));

    } else if (type == "object") {

      if (value.__is_schema_value !== true) {
        value = build_schema(value, on_change);
      }

      Object.seal(value);
      Object.defineProperty(built, key, {value, writable: false});

    } else {
      throw new Error("Unknown type: key = " + key + ", type = " + type);
    }
  }

  Object.defineProperty(built, '__storage', {value: defaults});
  Object.defineProperty(built, '__on_change', {value: on_change});

  built = Object.seal(built);
  return built;
}


function value_property(key) {
  return {
    get() {
      return this.__storage[key];
    },
    set(value) {
      this.__storage[key] = value;
      this.__on_change();
    },
    enumerable: true,
  }
}



function generate_id() {
  return uuid.v4();
}

var Location = {
  latitude: 0,
  longitude: 0,
};

var schema = {

  flights: Schema.Map({
    id: generate_id,
    name: "Untitled",
    from: Location,
    to: Location,
  }),

  others: Schema.List({
    other_value: "other",
  }),

  scalar_list: Schema.List(),
  scalar_map: Schema.Map(),

  playback: {
    playing: false,
    start_time: -1,
    end_time: -1,
    current_time: 0,
  },

  inspector: {
    active: "",
    data: null,
  },
};
var state = build_schema(schema, () => console.log("______ON CHANGE______"));


state.playback.playing = true;
console.log(state.playback.playing);

var f1 = state.flights.get("flight-1");
console.log(f1.id);

var f2 = state.flights.get("flight-2");
console.log(f2.id);

var f3 = state.flights.get("flight-1");
console.log(f3.id);

f3.name = "Flight 1";
console.log(f3.name);
console.log(f1.name);
console.log(f2.name);

console.log(f1.from.latitude);
f1.from.latitude = 5;
console.log(f1.from.latitude);
console.log(f3.from.latitude);

// Sealed error
// state.flights["foo"] = 4;

// Can't prevent this unfortunately, without Proxy anyway
console.log(state.flights["foo"] === undefined);

state.scalar_list.append("baz");
console.log(state.scalar_list.get(0));

state.scalar_map.set("key", "my value");
console.log(state.scalar_map.get("key"));

var o1 = state.others.add();
console.log(o1.other_value);
o1.other_value = "other changed";
console.log(state.others.get(0).other_value);

setTimeout(function() {
  state.playback.playing = false;
}, 1000);
