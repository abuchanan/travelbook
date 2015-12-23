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
      return wrap_object(obj);
    },
    enumerable: true,
  };
}

function array_prop(arr) {
  return {
    get() {
      return wrap_array(arr);
    },
    enumerable: true,
  };
}



function wrap_object(d) {
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

function wrap_array(arr) {
  let wrapper = {
    __data: arr,
    get(i) {
      return this.__data[i];
    },
    get length() {
      return this.__data.length;
    },
    [Symbol.iterator]() {
      return this.__data[Symbol.iterator]();
    },
    clone() {
      return extend(true, [], this.__data);
    }
  };
  Object.freeze(wrapper);
  return wrapper;
}


export function readonly(d) {
  if (is_base_object(d)) {
    return wrap_object(d);
  } else if (is_array(d)) {
    return wrap_array(d);
  } else if (is_scalar(d)) {
    return d;
  } else {
    throw new Error("Unhandled type: " + (typeof d));
  }
}
