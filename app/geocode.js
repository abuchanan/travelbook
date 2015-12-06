import csp from 'js-csp';
import MapboxClient from 'mapbox';

const access = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


function* debouncer(timeout_duration, values, cancel, output) {
  var block = csp.chan();
  var most_recent, wait = block;

  while (true) {
    // Wait for one of the three channels to produce a value. Order matters.
    var result = yield csp.alts([cancel, values, wait], {priority: true});
    console.log("debounce", result.channel === block, result.channel === wait);

    if (result.channel === cancel) {
      // Reset "wait" to blocking. Wait for the next input value.
      wait = block;

    } else if (result.channel === values) {
      // We got a new value, so store it and set a new timeout.
      most_recent = result.value;
      wait = csp.timeout(timeout_duration);

    } else if (result.channel === wait) {
      // We've waited the required duration between values,
      // so yield the most recent value
      csp.putAsync(output, most_recent);
      wait = block;
    }
  }
}

/*
  I like:
  - the power of alts
  - the ability to think of data as a stream when convenient
  - seems to make cancelation easy because no (Promise) value is pushed downstream

  I dislike:
  - the syntax of alts
  -- possibly fixable with a switch() helper
  - spawn and go
  -- possibly fixable with babel async-to-module
  - that spawn doesn't return a channel reflecting the generated values
    only the return value?
  - overhead of channels and buffers
  - disconnect of transducers
  - confusion about put vs putAsync
  - mess of creating a pipeline of channels
*/

class Geocoder {

  constructor(results_callback) {
    this._results_callback = results_callback;
    this._client = new MapboxClient(access);

    this._queries_ch = csp.chan();
    this._cancel_ch = csp.chan();
    this._request_ch = csp.chan();



    var debounced = coroutine(debouncer)(300, this._cancel_ch);
    debounced.next(query);

    const is_query_short = query => query.length < 3;
    var [short_queries, long_queries] = csp.operations.split(is_query_short, debounced);

    csp.spawn(this._cancel_and_clear(short_queries));
    var responses = csp.chan();
    csp.spawn(this._send_requests(long_queries, this._cancel_ch, responses));
    csp.spawn(this._handle_responses(responses));
  }

  *_cancel_and_clear(short_queries) {
    while (true) {
      yield short_queries;
      this.cancel();
      this._clear_results();
    }
  }

  *_send_requests(queries, cancel, output) {
    var block = csp.chan();
    var most_recent = block;

    while (true) {
      var result = yield csp.alts([cancel, queries, most_recent], {priority: true});

      if (result.channel === cancel) {
        most_recent = block;

      } else if (result.channel === queries) {
        most_recent = this._make_request(result.value);

      } else if (result.channel === most_recent) {
        csp.putAsync(output, result.value);
        most_recent = block;
      }
    }
  }

  _make_request(query) {
    var response_ch = csp.chan();
    this._client.geocodeForward(query, (err, res) => {
      console.log("resp", err, res);
      // TODO handle error
      csp.putAsync(response_ch, res);
    });
    
    return response_ch;
  }

  *_handle_responses(responses) {
    while (true) {
      var result = yield responses;
      this._results_callback(result);
    }
  }

  _clear_results() {
    this._results_callback({features: []});
  }

  geocode_forward(query) {
    csp.putAsync(this._queries_ch, query);
  }

  cancel() {
    csp.putAsync(this._cancel_ch, true);
  }
}

export default Geocoder;
