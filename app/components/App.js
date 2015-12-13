import React from 'react';

import { add_flight } from '../flights';
import { add_drive } from '../drives';
import { toggle as toggle_playback } from '../playback';

import Map from './map';
import FlightControl from './FlightControl';
import { DirectionsInspector } from './DirectionsInspector';
import { Inspector } from './Inspector';
import { Toolbar, InspectorButton, PlaybackButton } from './Toolbar';
import { ListInspector } from './ListInspector';


export const App = React.createClass({

  getInitialState() {
    return {
      inspector: {
        active: null,
        data: null,
      }
    };
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

    let {
      flights,
      drives,
      map,
      playback,
    } = appState;
    let playing = playback.playing;

    let {
      inspector,
    } = this.state;

    return (
      <div>
        <div className="travel-map-controls">
          <Toolbar>
            <PlaybackButton onClick={() => toggle_playback(playback)} playing={playing} />
            <div><button onClick={() => this.set_inspector("list")}>List</button></div>
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
            <ListInspector key="list" flights={flights} drives={drives} onSelect={this.set_inspector} />
          </Inspector>
        </div>

        <Map map={map} interactive={!playing} />
      </div>
    );
  },
});
