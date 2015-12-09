var csp = require('js-csp');

csp.go(function*() {
  while (true) {
    yield csp.timeout(7000);
    console.log("timeout done");
    var res = yield output_ch;
    console.log("Received output", res);
  }
});

csp.putAsync(queries_ch, "query1.1");
csp.putAsync(queries_ch, "query1.2");
csp.putAsync(queries_ch, "query1.3");
csp.putAsync(queries_ch, "query1.4");
csp.putAsync(queries_ch, "query1.5");
csp.putAsync(queries_ch, "f");

setTimeout(() => csp.putAsync(queries_ch, "query2"), 500);
setTimeout(() => {
  console.log("putting canceled b");
  csp.putAsync(queries_ch, "b");
}, 4000);

// TODO really want a way to easily check that goroutines are all cleaned up correctly
//      as it could be easy to forget to exit when the input channel(s) close.

//setTimeout(() => console.log("done"), 6000);
