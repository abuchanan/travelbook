class SchemaDef {
  constructor(type, ...args) {
    this.type = type;
    this.args = args;
  }

  create(on_change) {
    if (!on_change.__is_on_change_wrapper) {
      on_change = wrap_on_change(on_change);
    }
    return new this.type(on_change, ...this.args);
  }
}


class Record {

  constructor(value_type_def) {

    for (let key in value_type_def) {
      let val = value_type_def[key];

      if (Object.getPrototypeOf(val) == Object.prototype) {
        val = new SchemaDef(Record, val);
      }

      if (val instanceof SchemaDef) {
        var prop = {
          value: val.create(on_change),
          writable: false,
          enumerable: true,
        };
      } else {
        var prop = value_property(val, on_change);
      }
      Object.defineProperty(this, key, prop);
    }
    Object.seal(this);
  }

  merge(other) {
    for (var k of other) {
      this[k] = other[k];
    }
    this.__on_change();
  }
}


class Dict {

  constructor() {
    Object.defineProperties(this, {
      __storage: {
        value: new Map(),
        enumerable: false,
      },
    });
  }

  [Symbol.iterator]() {
    return this.__storage[Symbol.iterator]();
  }

  merge(v) {
    if (!(v instanceof Map)) {
      throw new Error("Merged value must be a Map.");
    }

    for (var e of v.entries()) {
      this.__storage.set(e[0], e[1]);
    }
    this.__on_change();
  }

  get(key) {
    return this.__storage.get(key);
  }

  set(key, value) {
    this.__storage.set(key, value);
  }

  delete(key) {
    this.__storage.delete(key);
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
  }
}


class List {

  constructor(on_change) {
    Object.defineProperties(this, {
      __storage: {
        value: [],
        enumerable: false,
      },
    });
  }

  [Symbol.iterator]() {
    return this.__storage[Symbol.iterator]();
  }

  get(index) {
    return this.__storage[index];
  }

  set(index, value) {
    this.__storage[index] = value;
  }

  get length() {
    return this.__storage.length;
  }

  clear() {
    this.__storage.length = 0;
  }

  extend(vals) {
    this.__storage.push(...vals);
  }

  slice(...args) {
    return this.__storage.slice(...args);
  }

  insert(i, x) {
    this.__storage.splice(i, 0, x);
  }

  append(...vals) {
    this.__storage.push(...vals);
  }
}

function value_property(value, on_change) {
  return {
    get() {
      return value;
    },
    set(v) {
      value = v;
      on_change();
    },
    enumerable: true,
  }
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

export { SchemaDef, Record, List, Dict };
