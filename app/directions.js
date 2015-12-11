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

// https://github.com/mapbox/mapbox-sdk-js/blob/master/API.md#getdirections
function do_request(client, query, response_ch) {
  client.getDirections(query, (err, results) => {
    // TODO handle error
    csp.put.async(response_ch, {query, results});
  });
}


class Directions {

  constructor(results_callback) {
    let client = new MapboxClient(Mapbox_access_key);

    let queries_ch = this._queries_ch = csp.channel();

    // Query results will be received here via manage_queries().
    let results_buffer = csp.buffers.sliding(1);
    let results_ch = csp.channel(results_buffer);

    let cancel_broadcast = this._cancel_broadcast = csp.broadcast();
    clear_buffer_on_signal(results_buffer, cancel_broadcast.tap());

    let bound_do_request = do_request.bind(null, client);
    manage_queries(queries_ch, results_ch, cancel_broadcast.tap(), bound_do_request);

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
            let results = value;
            results_callback(results);
        }
      }
    }
    csp.go.run(handle_results);
  }

  get_directions(query) {
    csp.put.async(this._queries_ch, query);
  }

  clear() {
    csp.put.async(this._cancel_broadcast.input, true);
  }
}

export default Directions;
