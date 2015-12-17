import React from 'react';

import { toggle_playback, add_flight_and_inspect, set_inspector } from '../actions';

import Map from './map';
import FlightControl from './FlightControl';
import { DirectionsInspector } from './DirectionsInspector';
import { Inspector } from './Inspector';
import { Toolbar, InspectorButton, PlaybackButton } from './Toolbar';
import { ListInspector } from './ListInspector';


export const App = React.createClass({

  render() {

    let {
      dispatch,
      flights,
      drives,
      map,
      playback: {
        playing
      },
      inspector,
    } = this.props;


    return (
      <div>
        <div className="travel-map-controls">
          <Toolbar>
            <PlaybackButton onClick={() => dispatch(toggle_playback()) } playing={playing} />
            <div><button onClick={() => dispatch(set_inspector("list")) }>List</button></div>
            <div><button onClick={() => dispatch(set_inspector("create")) }>Create</button></div>
          </Toolbar>

          <Inspector active={inspector.key}>

            <div id="create-inspector" key="create">
              <h1>Create</h1>
              <div><button onClick={() => dispatch(add_flight_and_inspect()) }>Flight</button></div>
              <div><button onClick={() => dispatch(add_drive()) }>Directions</button></div>
            </div>

            <FlightControl key="flight" dispatch={dispatch} flight={ flights[inspector.data] } />

            <ListInspector
              key="list"
              flights={flights}
              drives={drives}
              onSelect={ (type, data) => dispatch(set_inspector(type, data)) }
            />
          </Inspector>
        </div>

        <Map map={map} interactive={!playing} />
      </div>
    );
  },
});
