import Q from 'q';
import React from 'react';
import MapboxGL from 'mapbox-gl';
import buildClassNames from 'classnames';
//import keyboard from 'keyboardJS';


MapboxGL.accessToken = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


const FlightControl = React.createClass({

  contextTypes: {
    act: React.PropTypes.func,
  },

  addFlight() {
    var start = { x: -122, y: 48 };
    var end = { x: 174.900, y: -36.536 };
    this.context.act('add flight', start, end);
  },

  render() {
    return <button onClick={this.addFlight}>Add Flight</button>;
  }
});


  /*
  "version": 8,
  name: "test style",
  sources: {
    "mapbox-satellite": {
      type: "vector",
      style: 'mapbox://styles/buchanae/cih74usbl000y97mawr5vy126',
    },
  },
  */

const style_def = {
  "sprite": "/images/outtest",
  "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  "version": 8,
  "name": "Satellite Test Custom Style",
  "sources": {
    "mapbox": {
      "type": "raster",
      "url": "mapbox://mapbox.satellite",
      "tileSize": 256
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "rgb(4,7,14)"
      }
    },
    {
      "id": "satellite",
      "type": "raster",
      "source": "mapbox",
      "source-layer": "mapbox_satellite_full"
    }
  ]
};


const MapComponent = React.createClass({

  contextTypes: {
    act: React.PropTypes.func,
  },

  componentWillMount() {
    this._load_map_deferred = Q.defer();
    console.log("init");
    this.sources = new Map();
  },

  load_map() {
    return this._load_map_deferred.promise;
  },

  componentDidMount() {
    var map = new MapboxGL.Map({
        container: this._container,
        style: style_def,
    });

    map.on('load', () => this._load_map_deferred.resolve(map));

    console.log("mount");
  },

  addLayers(map, source_id) {
      map.addLayer({
        "id": source_id + "-lines",
        "type": "line",
        "source": source_id,
        "layout": {
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
        },
        "paint": {
          "line-color": "#ffffff"
        }
      });
  },

  render() {

    console.log("render");

    this.load_map().then(map => {

      for (var source of this.props.map.sources) {
        var [source_id, features] = source;

        console.log("source", source_id, features);

        if (!this.sources.has(source_id)) {
          var source = new MapboxGL.GeoJSONSource();
          this.sources.set(source_id, source);
          map.addSource(source_id, source);
          this.addLayers(map, source_id);
          console.log('add source', source_id, features);
        }

        this.sources.get(source_id).setData({
           "type": "FeatureCollection",
           "features": features,
        });
      }
    });

    return (<div>
      <div className="travel-map-controls"><FlightControl /></div>
      <div className="travel-map"
           ref={el => this._container = el}></div>
    </div>);
  }
});

export default MapComponent;
