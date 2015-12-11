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

  constructor(on_change, value_type_def) {

    Object.defineProperties(this, {
      __on_change: {
        value: on_change,
        enumerable: false,
      },
    });

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


class BaseMap {

  constructor(on_change) {
    Object.defineProperties(this, {
      __on_change: {
        value: on_change,
        enumerable: false,
      },
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

    Object.defineProperties(this, {
      __value_type_def: {
        value: value_type_def,
        enumerable: false,
      }
    });
  }

  get(key) {
    if (!this.__storage.has(key)) {
      var val = this.__value_type_def.create(this.__on_change);
      this.__storage.set(key, val);
      return val;
    } else {
      return this.__storage.get(key);
    }
  }
}


class BaseList {

  constructor(on_change) {
    Object.defineProperties(this, {
      __on_change: {
        value: on_change,
        enumerable: false,
      },
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
    this.__on_change();
  }

  get length() {
    return this.__storage.length;
  }

  clear() {
    this.__storage.length = 0;
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

    Object.defineProperties(this, {
      __value_type_def: {
        value: value_type_def,
        enumerable: false,
      }
    });
  }

  add() {
    let val = this.__value_type_def.create(this.__on_change);
    this.__storage.push(val);
    this.__on_change();
    return val;
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

export { SchemaDef, Record, RecordMap, RecordList, BaseMap, BaseList, ScalarList };
