import React from 'react';

import { add_flight } from './flights';
import { add_drive } from './drives';

import Layout from './components/layout';
import Home from './components/home';
import Map from './components/map';
import EntityList from './components/EntityList';
import FlightControl from './components/FlightControl';
import DirectionsInspector from './components/DirectionsInspector';
import Inspector from './components/Inspector';
import Create from './components/Create';
import { Toolbar, InspectorButton, PlaybackButton } from './components/Toolbar';


export const App = React.createClass({
  childContextTypes: {
    actions: React.PropTypes.object,
  },

  getChildContext() {
    return {actions: this.props.appActions};
  },

  set_inspector(key, data) {
    this.setState({
      inspector: {
        active: key,
        data,
      }
    });
  },

  render() {
    let appState = this.props.appState;
    let actions = this.props.appActions;

    let {
      flights,
      drives,
      map,
      playback: {
        playing
      }
    } = appState;

    let {
      inspector,
    } = this.state;

    return (
      <div>
        <div className="travel-map-controls">
          <Toolbar>
            <PlaybackButton onClick={actions.playback.toggle} playing={playing} />
            <div><button onClick={() => this.set_inspector("create")}>Create</button></div>
          </Toolbar>

          <Inspector active={inspector.active}>
            <div id="create-inspector" key="create">
              <h1>Create</h1>
              <div><button onClick={() => this.set_inspector("flight", add_flight(flights))}>Flight</button></div>
              <div><button onClick={() => this.set_inspector("directions", add_drive(drives))}>Directions</button></div>
            </div>

            <FlightControl key="flight" flight={inspector.data} />
            <DirectionsInspector key="directions" drive={inspector.data} />
            <EntityList key="entity-list" flights={flights} />
          </Inspector>
        </div>

        <Map map={map} interactive={!playing} />
      </div>
    );
  },
});
