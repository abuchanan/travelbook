// A little helper for defining classes because I hate javascript sometimes
// * methods are automatically bound
// * use YourClass.init() instead of YourClass.constructor()
// * don't use the "new" keyword
function Class(spec) {

  function create(...args) {
    var obj = Object.create({});

    Object.keys(spec).forEach(key => {
      var value = spec[key];
      if (typeof value == "function") {
        value = value.bind(obj);
      }
      obj[key] = value;
    });

    if (obj.init) {
      obj.init(...args);
    }
    return obj;
  }
  return create;
}

export default Class;
