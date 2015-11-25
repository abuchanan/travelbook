import React from 'react';
import Reflux from 'reflux';
import MapboxGL from 'mapbox-gl';
import buildClassNames from 'classnames';
import keyboard from 'keyboardJS';

import { LocationActions, MapActions, TimelineActions } from '../actions';
import MapStore from '../stores/map';
import LocationStore from '../stores/location';
import TimelineStore from '../stores/timeline';


MapboxGL.accessToken = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';

const PlaybackControl = React.createClass({
  render() {
    return (<div className="travel-map-playback-controls">
      <button onClick={TimelineActions.play}>Play</button>
      <button onClick={TimelineActions.stop}>Stop</button>
    </div>);
  }
});

const Result = React.createClass({

  handleClick(event) {
    console.log('click', this.props.result);
    LocationActions.selectLocation(this.props.result);
  },

  select() {
    LocationActions.setHighlight(this.props.idx);
  },

  render() {
    var result = this.props.result;
    var classNames = buildClassNames("autocomplete-result", {
      "highlighted": this.props.highlighted,
    });

    return (<div
      className={classNames}
      onMouseOver={this.select}
      onMouseDown={this.handleClick}>
      {result.place_name}
    </div>);
  }
});


const LocationControl = React.createClass({

  mixins: [Reflux.connect(LocationStore)],

  componentDidMount() {
    keyboard.withContext('location search', this.bindKeys);
  },

  bindKeys() {
    keyboard.bind('up', this.onUpKey);
    keyboard.bind('down', this.onDownKey);
    keyboard.bind('enter', this.onEnterKey);
  },

  onEnterKey(e) {
    e.preventDefault();
    LocationActions.selectHighlighted();
  },

  onUpKey(e) {
    e.preventDefault();
    LocationActions.highlightPrevious();
  },

  onDownKey(e) {
    e.preventDefault();
    LocationActions.highlightNext();
  },

  handleChange(event) {
    LocationActions.geocodeForward(event.target.value);
  },

  onFocus(event) {
    keyboard.setContext('location search');
    LocationActions.geocodeForward(event.target.value);
  },

  onBlur() {
    LocationActions.clearResults();
  },

  render() {
    var results = [];

    if (this.state.results) {
      results = this.state.results.map((result, idx) => {
        return (<li role="option" key={result.id}>
        <Result
          idx={idx}
          highlighted={idx == this.state.highlighted}
          result={result}
        /></li>);
      });
    }

    return (<div className="travel-map-controls">
      <input
        autoFocus={false}
        autoComplete={false}
        placeholder="Search"
        onChange={this.handleChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        role="combobox"
        aria-autocomplete="list"
        aria-owns="location-search-results"
        aria-expanded={results.length > 0}
      />
      <div id='location-search-results' role="listbox">
        <ul>
        {results}
        </ul>
      </div>
    </div>);
  }
});


const MapComponent = React.createClass({

  componentDidMount() {
    var map = this.map = new MapboxGL.Map({
        container: this._container,
        style: 'mapbox://styles/buchanae/cih74usbl000y97mawr5vy126',
    });

    map.on('click', MapActions.clicked);

    var source = new MapboxGL.GeoJSONSource({
      data: {
        "type": "FeatureCollection",
        "features": [],
      },
    });

    var features = new Map();

    var testLayer = {
      "id": "testDataLayer",
      "source": "testData",
      "type": "line",
      "paint": {
        "circle-color": "#ffffff",
        "line-color": "#ffffff",
      }
    };

    map.on('load', function() {
      map.addSource('testData', source);
      map.addLayer(testLayer);
    });

    setTimeout(function() {
      console.log('change color');
      map.setPaintProperty("testDataLayer", "line-color", "#FF0000");
    }, 5000);

    MapActions.setFeature.listen((id, feature) => {
      features.set(id, feature);

      source.setData({
        type: "FeatureCollection",
        features: Array.from(features.values()),
      });
    });

    this.bindActionsToMap('setCenter', 'fitBounds');

    MapActions.disableInteraction.listen(() => {
      map.interaction.disable();
    });

    MapActions.enableInteraction.listen(() => {
      map.interaction.enable();
    });
  },

  bindActionsToMap(...actionNames) {
    var map = this.map;
    actionNames.forEach(actionName => {
      MapActions[actionName].listen((...args) => {
        map[actionName].apply(map, args);
      });
    });
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    return (<div>
      <div><LocationControl /><PlaybackControl /></div>
      <div className="travel-map"
           ref={el => this._container = el}></div>
    </div>);
  }
});

export default MapComponent;
