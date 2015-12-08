var csp = require('js-csp');

function select(...args) {
  return csp.alts(args, {priority: true});
}

// TODO enhance this so it's impossible to put values
let NEVER = csp.chan();

function fake_request(query, response_ch) {
  setTimeout(() => {
    console.log("fake response", query);
    csp.putAsync(response_ch, `Result: ${query}`);
  }, 3000);
}

function do_request(query, response_ch) {
  fake_request(query, response_ch);
}


function clear_buffer(buf) {
  while (buf.count() > 0) {
    buf.remove();
  }
}

function clear_buffer_on_signal(buffer, signal_ch) {
  csp.go(function*() {
    while (!signal_ch.closed) {
      yield signal_ch;
      clear_buffer(buffer);
    }
  });
}


function debounce(input_ch, output_ch, duration) {

  csp.go(function*() {
    let timeout = NEVER;
    let latest = undefined;

    while (!input_ch.closed || timeout !== NEVER) {
      let {channel, value} = yield select(input_ch, timeout);

      switch (channel) {
        case input_ch:
          latest = value;
          timeout = csp.timeout(duration);
          break;

        case timeout:
          yield csp.put(output_ch, latest);
          timeout = NEVER;
          break;
      }
    }
  });
}

function manage_queries(query_ch, output_ch, cancel_ch) {

  csp.go(function*() {
    let response_ch = NEVER;

    while (!query_ch.closed || response_ch !== NEVER) {
      let {channel, value} = yield select(query_ch, response_ch, cancel_ch);

      switch (channel) {
        case query_ch:
          let query = value;
          console.log("got query", query);
          // TODO should close the existing response channel probably.
          //      but have to check if it's NEVER, which is annoying.
          response_ch = csp.chan();
          do_request(query, response_ch);
          break;

        case response_ch:
          let response = value;
          yield csp.put(output_ch, response);
          break;

        case cancel_ch:
          console.log("canceled");
          response_ch = NEVER;
          break;
      }
    }
  });
}


let is_query_short = query => query.length < 3;


// TODO how do you handle closing/cleaning up with something like this?
class Broadcast {
  constructor(...inputs) {
    this.input = csp.chan();
    this._mix_out = csp.chan();
    this._mult = csp.operations.mult(this._mix_out);
    this._mix = csp.operations.mix(this._mix_out);
    csp.operations.mix.add(this._mix, this.input);

    for (let input of inputs) {
      csp.operations.mix.add(this._mix, input);
    }
  }

  add_input(input) {
    csp.operations.mix.add(this._mix, input);
  }

  tap(chan) {
    chan = chan || csp.chan();
    return csp.operations.mult.tap(this._mult, chan);
  }
}


let cancel = new Broadcast();
var queries_ch = csp.chan();
var debounced_ch = csp.chan();

var output_buffer = csp.buffers.sliding(1);
var output_ch = csp.chan(output_buffer);

debounce(queries_ch, debounced_ch, 300);

let [short_queries, long_queries] = csp.operations.split(is_query_short, debounced_ch);

cancel.add_input(short_queries);

clear_buffer_on_signal(output_buffer, cancel.tap());
manage_queries(long_queries, output_ch, cancel.tap());

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
