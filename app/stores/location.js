import Reflux from 'reflux';
import H from 'highland';
import Q from 'q';
import extend from 'extend';

import MapboxClient from 'mapbox';
import { LocationActions, MapActions } from '../actions';

const access = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


function cache(valuefunc, keyfunc) {
  var data = new Map();

  return (item) => {
    if (keyfunc) {
      var key = keyfunc(item);
    } else {
      key = item;
    }

    if (data.has(key)) {
      return data.get(key);
    } else {
      var value = valuefunc(item);
      data.set(key, value);
      return value;
    }
  };
}


function lastestResponse(stream) {
  var latest;

  return stream.consume((err, resp, push, next) => {
    latest = resp;

    resp.then((res) => {
      if (resp === latest) {
        push(null, res);
      }
    });
    next();
  });
}


const LocationStore = Reflux.createStore({

  listenables: LocationActions,
  data: {
    results: [],
    highlighted: 0,
  },

  init() {
    this.client = new MapboxClient(access);
    // TODO move to wrapping class
    this.client.geocodeForward = Q.nbind(this.client.geocodeForward, this.client);
    this.client.geocodeForward = cache(this.client.geocodeForward);

    this.geocodeForwardQueries = H().debounce(300);
    var isQueryTooShort = q => q.length < 3;

    this.resultStream = this.geocodeForwardQueries
    // Filter out really short queries
    .reject(isQueryTooShort)
    .map(this.client.geocodeForward)
    // Only use the latest response, drop any responses from previous requests.
    .through(lastestResponse)
    .each(this.handleGeocodeForwardResponse);

    // When there's a really short query, clear the results.
    this.geocodeForwardQueries
    .observe()
    .filter(isQueryTooShort)
    .each(this.onClearResults);
  },

  triggerData(newData) {
    extend(this.data, newData);
    this.trigger(this.data);
  },

  onGeocodeForward(query) {
    this.resetData();
    this.geocodeForwardQueries.write(query);
    this.resultStream.resume();
  },

  handleGeocodeForwardResponse(res) {
    this.triggerData({
      results: res.features,
      highlighted: 0,
    });
  },

  resetData() {
    this.triggerData({
      results: [],
      highlighted: 0,
    });
  },

  onSelectLocation(loc) {
    this.onClearResults();
    if (loc.bbox) {
      MapActions.fitBounds([[loc.bbox[0], loc.bbox[1]], [loc.bbox[2], loc.bbox[3]]]);
    }
    MapActions.setCenter(loc.center);
  },

  onSelectHighlighted() {
    var result = this.data.results[this.data.highlighted];
    if (result) {
      LocationActions.selectLocation(result);
    }
  },

  onSetHighlight(idx) {
    this.triggerData({highlighted: idx});
  },
  
  onHighlightNext() {
    if (this.data.highlighted < this.data.results.length - 1) {
      this.data.highlighted += 1;
      this.triggerData();
    }
  },

  onHighlightPrevious() {
    if (this.data.highlighted > 0) {
      this.data.highlighted -= 1;
      this.triggerData();
    }
  },

  onClearResults() {
    this.resultStream.pause();
    this.resetData();
  },
});

export default LocationStore;
