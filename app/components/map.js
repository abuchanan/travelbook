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
    let {map, onMove} = this.props;

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

    mapbox.on('move', () => {
      // Don't trigger the onMove callback if the current mapbox position matches
      // the position in the app state. This can happen when the position is updated
      // from the app state, which updates Mapbox, which triggers this "move" event,
      // and you get a circle of updates.
      if (this.is_position_different(map.zoom, map.center)) {
        let z = mapbox.getZoom();
        let c = mapbox.getCenter();
        onMove(z, {
          longitude: c.lng,
          latitude: c.lat
        });
      }
    });
  },

  is_position_different(zoom, center) {
    let z = this.mapbox.getZoom();
    let c = this.mapbox.getCenter();
    return (z != zoom || center.latitude != c.lat || center.longitude != c.lng);
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

    if (this.is_position_different(zoom, center)) {
      // Mapbox tile rendering performance improves when you stick
      // to positive longitudes (edge case).
      let lng = center.longitude;
      if (lng < 0) {
        lng = 360 + (lng % -360);
      }

      mapbox.jumpTo({
        center: {
          lng,
          lat: center.latitude
        },
        zoom,
      });
    }

    for (let key of this.sources.keys()) {
      if (!sources[key]) {
        mapbox.removeSource(key);
        this.removeLayers(mapbox, key);
        this.sources.delete(key);
      }
    }

    for (let source_id in sources) {
      this.get_or_create_source(source_id).setData({
         "type": "FeatureCollection",
         "features": sources[source_id].clone(),
      });
    }
  },

  get_or_create_source(id) {
    var source;
    if (!this.sources.has(id)) {
      source = new MapboxGL.GeoJSONSource();
      this.sources.set(id, source);
      mapbox.addSource(id, source);
      this.addLayers(mapbox, id);
    } else {
      source = this.sources.get(id);
    }
    return source;
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
