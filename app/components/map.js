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
    this.sources = new Map();
  },

  componentDidMount() {
    let map = this.props.map;

    this.loaded = false;
    this.mapbox = new MapboxGL.Map({
        container: this._container,
        style: style_def,
        center: [map.center.longitude, map.center.latitude],
        zoom: map.zoom,
    });
    window.mapbox = this.mapbox;

    let self = this;
    mapbox.on('load', () => {
      self.loaded = true;
      self.updateMap(self.props);
    });

    mapbox.on("move", (...args) => {
      var new_center = self.mapbox.getCenter();
  //    map.center.latitude = new_center.lat;
  //    map.center.longitude = new_center.lng;

      console.log("move");
      //map.zoom = mapbox.getZoom();
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

  updateMap(props) {
    console.log("update mapbox");
    let mapbox = this.mapbox;

    let {
      map: {
        center,
        sources,
        zoom,
      },
      interactive,
    } = props;

    if (interactive) {
      mapbox.interaction.enable();
    } else {
      mapbox.interaction.disable();
    }

    console.log("jump to ", center.longitude, center.latitude);

    // Mapbox tile rendering performance improves when you stick
    // to positive longitudes (edge case).
    let lng = center.longitude;
    if (lng < 0) {
      lng = 360 + (lng % -360);
    }

    mapbox.jumpTo({
      center: {lng, lat: center.latitude},
      zoom,
    });

    for (let key of this.sources.keys()) {
      if (!sources.has(key)) {
        mapbox.removeSource(key);
        this.removeLayers(mapbox, key);
        this.sources.delete(key);
      }
    }

    for (let source_id in sources) {
      let source = sources[source_id];

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
  },

  componentWillReceiveProps(props) {
    if (this.loaded) {
      this.updateMap(props);
    }
  },

  shouldComponentUpdate() {
    return false;
  },

  render() {
    console.log("render");
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
