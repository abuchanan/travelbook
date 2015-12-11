import MapboxClient from 'mapbox';

import { seconds } from './utils';
import * as csp from './csp';
import { Mapbox_access_key } from './config';


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
          response_ch = csp.NEVER;
          break;
      }
    }
});


/*
  I like:
  - the power of alts
  - the ability to think of data as a stream when convenient
  - seems to make cancelation easy because no (Promise) value is pushed downstream

  I dislike:
  - spawn and go
  -- can clean up with babel

  - confusion about put vs putAsync
  -- the main thing is that you need a "yield" in order to give the
     backing generator a chance to block. Not sure why put() doesn't work
     without async.
  -- can possibly clean up with babel

  - mess of creating a pipeline of channels
  -- might be a useful sugar for syntax, or maybe a pipeline() helper

  - reimplementing cancel in every part of the pipeline
  -- turns out this isn't so bad and it needs to be implemented differently
     depending on the context anyway.
*/

function do_request(client, query, response_ch) {
  client.geocodeForward(query, (err, results) => {
    // TODO handle error
    csp.put.async(response_ch, {query, results});
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
    let client = new MapboxClient(Mapbox_access_key);

    // Query strings are received here via Geocoder.geocode_forward().
    let queries_ch = this._queries_ch = csp.channel();

    // Query results will be received here via manage_queries().
    let results_buffer = csp.buffers.sliding(1);
    let results_ch = csp.channel(results_buffer);

    // Cache query results.
    let cache = new Map();
    let cache_miss_ch = csp.channel();

    function* check_cache() {
      while (!queries_ch.closed) {
        let query = yield queries_ch;
        if (cache.has(query)) {
          yield csp.put(results_ch, {query, results: cache.get(query)});
        } else {
          yield csp.put(cache_miss_ch, query);
        }
      }
    }
    csp.go.run(check_cache);
    // Updating the cache with results happens later in handle_results()

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
    csp.debounce(cache_miss_ch, debounced_ch, DEBOUNCE_TIME);

    // Don't bother sending requests for short queries. See MIN_QUERY_LENGTH.
    let [short_queries, long_queries] = split_short_queries(debounced_ch);
    cancel_broadcast.add_input(short_queries);

    let bound_do_request = do_request.bind(null, client);
    manage_queries(long_queries, results_ch, cancel_broadcast.tap(), bound_do_request);

    // Handle cancels and results.
    function* handle_results() {
      let cancel_ch = cancel_broadcast.tap();

      while (!cancel_ch.closed || !results_ch.closed) {
        let {channel, value} = yield csp.select(cancel_ch, results_ch);

        switch (channel) {

          case cancel_ch:
            // Whenever the query is canceled, clear the results.
            results_callback({features: []});
            break;

          case results_ch:
            let {query, results} = value;
            cache.set(query, results);
            results_callback(results);
        }
      }
    }
    csp.go.run(handle_results);
  }

  geocode_forward(query) {
    query = query.toLowerCase();
    csp.put.async(this._queries_ch, query);
  }

  clear() {
    csp.put.async(this._cancel_broadcast.input, true);
  }
}

export default Geocoder;
