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
    return {mapbox: null};
  },

  componentDidMount() {
    let map = this.props.map;

    var mapbox = new MapboxGL.Map({
        container: this._container,
        style: style_def,
        center: [map.center.longitude, map.center.latitude],
        zoom: map.zoom,
    });

    let component = this;

    mapbox.on('load', () => component.setState({mapbox}));

    mapbox.on("move", (...args) => {
      var new_center = mapbox.getCenter();
      map.center.latitude = new_center.lat;
      map.center.longitude = new_center.lng;

      map.zoom = mapbox.getZoom();
    });
  },

  addLayers(mapbox, source_id) {
      mapbox.addLayer({
        "id": source_id + "-circles",
        "type": "circle",
        "source": source_id,
        "layout": {
          "visibility": "none",
        },
        "paint": {
          "circle-color": "#3b52ec"
        }
      });
      mapbox.addLayer({
        "id": source_id + "-lines",
        "type": "line",
        "source": source_id,
        "paint": {
          "line-color": "#3b52ec",
        }
      });
  },

  removeLayers(mapbox, source_id) {
    mapbox.removeLayer(source_id + "-lines");
    mapbox.removeLayer(source_id + "-circles");
  },

  render() {

    let mapbox = this.state.mapbox;

    if (mapbox !== null) {
      console.log("render");

      let {
        map: {
          center,
          sources,
          zoom,
        },
        interactive,
      } = this.props;

      if (interactive) {
        mapbox.interaction.enable();
      } else {
        mapbox.interaction.disable();
      }

      mapbox.jumpTo({
        center: {
          lng: center.longitude,
          lat: center.latitude,
        },
        zoom,
      });

      for (let key of this.sources.keys()) {
        if (!sources.has(key)) {
          mapbox.removeSource(key);
          this.removeLayers(mapbox, key);
          this.sources.delete(key);
        }
      }

      for (var source of sources.entries()) {
        var [source_id, features] = source;

        if (!this.sources.has(source_id)) {
          var source = new MapboxGL.GeoJSONSource();
          this.sources.set(source_id, source);
          mapbox.addSource(source_id, source);
          this.addLayers(mapbox, source_id);
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
