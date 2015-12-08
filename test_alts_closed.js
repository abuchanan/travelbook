var csp = require('js-csp');

var a = csp.chan();
let b;
//var b = csp.chan();
//b.close();

csp.putAsync(a, "foo");
csp.putAsync(a, "bar");
setTimeout(() => a.close(), 3000);

csp.go(function*() {
  while (!a.closed || !b.closed) {
    let {channel, value} = yield csp.alts([a, b]);

    switch (channel) {
      case a:
        console.log("a", value);
        break;
      case b:
        // TODO csp shouldn't use "null" for CLOSED, but an object with a nice toString
        console.log("b", value, value === csp.CLOSED);
        return;
        break;
    }
  }
});
