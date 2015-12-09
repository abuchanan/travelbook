import React from 'react';
import MapboxGL from 'mapbox-gl';
import buildClassNames from 'classnames';


MapboxGL.accessToken = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


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
    console.log("init");
    this.sources = new Map();
  },

  getInitialState() {
    return {map: null};
  },

  componentDidMount() {
    var map = new MapboxGL.Map({
        container: this._container,
        style: style_def,
    });

    let component = this;
    let props = this.props;

    map.on('load', () => {
      component.setState({map});
    });

    map.on("move", (...args) => {
      var center = map.getCenter();
      props.map.center.latitude = center.lat;
      props.map.center.longitude = center.lng;
    });
  },

  addLayers(map, source_id) {
      map.addLayer({
        "id": source_id + "-circles",
        "type": "circle",
        "source": source_id,
        "layout": {
          "visibility": "none",
        },
        "paint": {
          "circle-color": "#ffffff"
        }
      });
      map.addLayer({
        "id": source_id + "-lines",
        "type": "line",
        "source": source_id,
        "paint": {
          "line-color": "#ffffff",
        }
      });
  },

  removeLayers(map, source_id) {
    map.removeLayer(source_id + "-lines");
    map.removeLayer(source_id + "-circles");
  },

  render() {

    if (this.state.map !== null) {
      console.log("render");
      let map = this.state.map;
      let {
        map: {
          center,
          sources,
        },
      } = this.props;

      map.setCenter([center.longitude, center.latitude]);

      for (let key of this.sources.keys()) {
        if (!sources.has(key)) {
          map.removeSource(key);
          this.removeLayers(map, key);
        }
      }

      for (var source of sources.entries()) {
        var [source_id, features] = source;

        if (!this.sources.has(source_id)) {
          var source = new MapboxGL.GeoJSONSource();
          this.sources.set(source_id, source);
          map.addSource(source_id, source);
          this.addLayers(map, source_id);
        }

        this.sources.get(source_id).setData({
           "type": "FeatureCollection",
           "features": features,
        });
      }
    }

    return (
      <div 
        className="travel-map"
        ref={el => this._container = el}
      >
      </div>
    );
  }
});

export default MapComponent;
