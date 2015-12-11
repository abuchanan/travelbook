import React from 'react';

import Directions from '../directions';
import LocationControl from './LocationControl';

function to_coordinates(loc) {
  return {latitude: loc[1], longitude: loc[0]};
}

export const DirectionsInspector = React.createClass({

  getInitialState() {
    return {from: null, to: null};
  },

  componentDidMount() {
    this.directions = new Directions(results => {
      console.log("directions results", results);
      this.props.drive.route.coordinates.clear();
      this.props.drive.route.coordinates.extend(results.results.routes[0].geometry.coordinates);
    });
  },

  send() {
      if (this.state.from !== null && this.state.to !== null) {

        console.log("Searching for directions", this.state.from, this.state.to);
        this.directions.get_directions([
          to_coordinates(this.state.from.center),
          to_coordinates(this.state.to.center)
        ]);
      }
  },

  render() {
    return (
      <div>
        <h1>Directions</h1>

        <LocationControl
          onResultSelected={ result => this.setState({from: result}) }
        />
        <LocationControl
          onResultSelected={ result => this.setState({to: result}) }
        />

        <button onClick={this.send}>Get Directions</button>
      </div>
    );
  }
});
