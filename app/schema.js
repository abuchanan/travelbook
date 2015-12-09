// TODO
// - O(1) equality testing with version numbers
// - Iterable collections
// - separable read/write interfaces?
// -- this is where Go would really shine

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
      var val = build(this.__value_type_def, this.__on_change);
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

  get length() {
    return this.__storage.length;
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
    var val = build(this.__value_type_def, this.__on_change);
    this.__storage.push(val);
    this.__on_change();
    return val;
  }
}


function MapWrapper(value_type_def) {
  return on_change => {
    if (value_type_def !== undefined) {
      return new RecordMap(on_change, value_type_def);
    } else {
      return new BaseMap(on_change);
    }
  };
}

function ListWrapper(value_type_def) {
  return on_change => {
    if (value_type_def !== undefined) {
      return new RecordList(on_change, value_type_def);
    } else {
      return new ScalarList(on_change);
    }
  };
}


class Factory {
  constructor(on_change, value_type_def) {
    this.__on_change = on_change;
    this.__value_type_def = value_type_def;
  }

  create() {
    return build_schema(this.__value_type_def, this.__on_change);
  }
}


function FactoryWrapper(value_type_def) {
  return on_change => {
    return new Factory(on_change, value_type_def);
  };
}


function wrap_on_change(callback) {
  var timeout;
  var disabled = false;

  function wrapper() {
    if (!timeout && !disabled) {
      timeout = setTimeout(() => {
        timeout = false;
        disabled = true;
        callback();
        disabled = false;
      }, 0);
    }
  }
  wrapper.__is_on_change_wrapper = true;
  return wrapper;
}


function build(schema, on_change) {
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
        value = build(value, on_change);
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

export default {
  build,
  Map: MapWrapper,
  List: ListWrapper,
};
