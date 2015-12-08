let csp = require('js-csp');

var a = csp.chan();
a.close();

csp.go(function*() {
  yield csp.put(a, "foo");
});

setTimeout(() => console.log("done"), 1000);
