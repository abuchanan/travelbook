import MapboxClient from 'mapbox';

import * as csp from './csp';

const access = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


function seconds(n) {
  return n * 1000;
}

const clear_buffer_on_signal = csp.go(function*(buffer, signal_ch) {
    while (!signal_ch.closed) {
      yield signal_ch;
      csp.clear_buffer(buffer);
    }
});

const manage_queries = csp.go(function*(query_ch, output_ch, cancel_ch, do_request) {

    let response_ch = csp.NEVER;

    while (!query_ch.closed || response_ch !== csp.NEVER) {
      let {channel, value} = yield csp.select(query_ch, response_ch, cancel_ch);

      switch (channel) {
        case query_ch:
          let query = value;
          console.log("got query", query);
          // TODO should close the existing response channel probably.
          //      but have to check if it's NEVER, which is annoying.
          response_ch = csp.channel();
          do_request(query, response_ch);
          break;

        case response_ch:
          let response = value;
          yield csp.put(output_ch, response);
          break;

        case cancel_ch:
          console.log("canceled");
          response_ch = csp.NEVER;
          break;
      }
    }
});



// TODO how do you handle closing/cleaning up with something like this?



/*
  I like:
  - the power of alts
  - the ability to think of data as a stream when convenient
  - seems to make cancelation easy because no (Promise) value is pushed downstream

  I dislike:
  - spawn and go
  -- can clean up with babel

  - confusion about put vs putAsync
  - mess of creating a pipeline of channels
  - reimplementing cancel in every part of the pipeline

  - js-csp seems to fuck up exception handling stack traces by inserting some handler
*/

function do_request(client, query, response_ch) {
  console.log("sending query", query);
  client.geocodeForward(query, (err, res) => {
    console.log("received client response");
    // TODO handle error
    csp.put.async(response_ch, res);
  });
}


const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_TIME = seconds(.3);

function split_short_queries(queries_ch) {
  return csp.split(query => query.length < MIN_QUERY_LENGTH, queries_ch);
}


class Geocoder {

  // TODO could convert this to export its queries/results channels
  constructor(results_callback) {
    let client = new MapboxClient(access);

    // Query strings are received here via Geocoder.geocode_forward().
    let queries_ch = this._queries_ch = csp.channel();

    // Query results will be received here via manage_queries().
    let results_buffer = csp.buffers.sliding(1);
    let results_ch = csp.channel(results_buffer);

    /*
      A couple actions can cause the geocode request to be canceled:
      1. A call to Geocoder.clear().
      2. A short query. See MIN_QUERY_LENGTH.
    */
    let cancel_broadcast = this._cancel_broadcast = csp.broadcast();
    clear_buffer_on_signal(results_buffer, cancel_broadcast.tap());

    /*
      There are lots of cases where you might be many queries in a short time,
      such as the user typing in a location search box, so wait until no queries
      have arrive for DEBOUNCE_TIME before sending a request.
    */
    let debounced_ch = csp.channel();
    csp.debounce(queries_ch, debounced_ch, DEBOUNCE_TIME);

    // Don't bother sending requests for short queries. See MIN_QUERY_LENGTH.
    let [short_queries, long_queries] = split_short_queries(debounced_ch);
    cancel_broadcast.add_input(short_queries);
    
    let bound_do_request = do_request.bind(null, client);
    manage_queries(long_queries, results_ch, cancel_broadcast.tap(), bound_do_request);

    // Handle cancels and results.
    csp.go.run(function*() {
      let cancel_ch = cancel_broadcast.tap();

      while (!cancel_ch.closed || !results_ch.closed) {
        let {channel, value} = yield csp.select(cancel_ch, results_ch);

        switch (channel) {

          case cancel_ch:
            // Whenever the query is canceled, clear the results.
            results_callback({features: []});
            break;

          case results_ch:
            let results = value;
            results_callback(results);
        }
      }
    });
  }

  geocode_forward(query) {
    csp.put.async(this._queries_ch, query);
  }

  clear() {
    csp.put.async(this._cancel_broadcast.input, true);
  }
}

export default Geocoder;
