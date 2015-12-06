"use strict";

/**
 * Returns a function that, when called,
 * returns a generator object that is immediately
 * ready for input via `next()`
 */
function coroutine(generatorFunction) {
    return function (...args) {
        let generatorObject = generatorFunction(...args);
        generatorObject.next();
        return generatorObject;
    };
}

const Channel = coroutine(function* (target) {
  while (true) {
    var val = yield;
    target.next(val);
  }
});

const timeout = function(duration) {
  console.log("start timeout");
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("resolve");
      resolve();
    }, duration);
  });
};

const other = function* () {
  yield 1;
  yield 2;
};

function* test(o) {
  console.log("Start");
  let x = yield o;
  console.log("one", x);
}


for (var x of test(other())) {
  console.log("iter", x);
}
