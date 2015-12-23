import extend from 'extend';


function is_scalar(val) {
  let type = typeof val;
  return type == "string" || type == "number" || type == "boolean" || val === null || val === undefined;
}

function is_base_object(val) {
  return Object.getPrototypeOf(val) === Object.prototype;
}

function is_array(val) {
  return val instanceof Array;
}



function scalar_prop(val) {
  return {value: val, writeable: false, enumerable: true};
}

function object_prop(obj) {
  return {
    get() {
      return readonly_object(obj);
    },
    enumerable: true,
  };
}

function array_prop(arr) {
  return {
    get() {
      return readonly_array(arr);
    },
    enumerable: true,
  };
}



function readonly_object(d) {
  let props = {
    __data: {value: d, enumerable: false, writeable: false},
    clone: {
      value() { return extend(true, {}, this.__data); },
      enumerable: false,
      writeable: false,
    }
  };

  for (let key in d) {
    let val = d[key];

    if (is_scalar(val)) {
      props[key] = scalar_prop(val);
    } else if (is_base_object(val)) {
      props[key] = object_prop(val);
    } else if (is_array(val)) {
      props[key] = array_prop(val);
    } else {
      throw new Error("Unhandled type: " + (typeof val));
    }
  }

  return Object.create({}, props);
}

function readonly_array(arr) {
  let readonlyper = {
    __data: arr,
    get(i) {
      return readonly(this.__data[i]);
    },
    get length() {
      return this.__data.length;
    },
    [Symbol.iterator]() {
      let it = this.__data[Symbol.iterator]();
      return {
        next: () => {
          let v = it.next();
          if (!v.done) {
            v.value = readonly(v.value);
          }
          return v;
        }
      };
    },

    map(callback, thisArg) {
      return this.__data.map((value, index) => {
        return callback.call(thisArg, readonly(value), index);
      });
    },

    clone() {
      return extend(true, [], this.__data);
    }
  };
  Object.freeze(readonlyper);
  return readonlyper;
}


export function readonly(d) {
  if (is_base_object(d)) {
    return readonly_object(d);
  } else if (is_array(d)) {
    return readonly_array(d);
  } else if (is_scalar(d)) {
    return d;
  } else {
    throw new Error("Unhandled type: " + (typeof d));
  }
}
