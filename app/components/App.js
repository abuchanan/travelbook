import React from 'react';

import Map from './map';
import FlightControl from './FlightControl';
import { DirectionsInspector } from './DirectionsInspector';
import { Inspector } from './Inspector';
import { Toolbar, InspectorButton, PlaybackButton } from './Toolbar';
import { ListInspector } from './ListInspector';
import { TrackInspector } from './TrackInspector';


export const App = React.createClass({

  render() {
    console.log("render app");

    let {
      dispatch,
      flights,
      drives,
      tracks,
      map,
      playback: {
        playing
      },
      inspector,
      dispatchers: {
        toggle_playback,
        set_inspector,
        add_flight_and_inspect,
        add_drive_and_inspect,
        set_map_position,
        save,
        load
      }
    } = this.props;

    // TODO could try inspect(add_flight())
    //      maybe actions should be promises?
    return (
      <div>
        <div className="travel-map-controls">
          <Toolbar>
            <PlaybackButton onClick={ toggle_playback } playing={playing} />
            <div><button onClick={ save }>Save</button></div>
            <div><button onClick={ load }>Load</button></div>

            <div><button onClick={() => set_inspector("list") }>List</button></div>
            <div><button onClick={() => set_inspector("create") }>Create</button></div>
            <div><button onClick={() => set_inspector("tracks") }>Tracks</button></div>

          </Toolbar>

          <Inspector active={inspector.key}>

            <div id="create-inspector" key="create">
              <h1>Create</h1>
              <div><button onClick={ add_flight_and_inspect }>Flight</button></div>
              <div><button onClick={ add_drive_and_inspect }>Directions</button></div>
            </div>

            <FlightControl
              key="flight"
              dispatchers={this.props.dispatchers}
              flight={ flights[inspector.data] }
            />

            <DirectionsInspector
              key="drives"
              drive={ drives[inspector.data] }
              dispatchers={this.props.dispatchers}
            />

            <ListInspector
              key="list"
              flights={flights}
              drives={drives}
              onSelect={ set_inspector }
            />

            <TrackInspector
              key="tracks"
              tracks={tracks}
              dispatchers={this.props.dispatchers}
            />
          </Inspector>
        </div>

        <Map
          map={map}
          interactive={!playing}
          onMove={ set_map_position }
        />
      </div>
    );
  },
});
