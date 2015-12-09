import React from 'react';

import LocationControl from './LocationControl';

const FlightControl = props => {
  let {flight} = props;

  function select(loc, res) {
    let coordinates = res.geometry.coordinates;
    loc.latitude = coordinates[1];
    loc.longitude = coordinates[0];
  }

  return (
    <div>
      <h1>Flight</h1>
      <div>
        <input
          placeholder="Name"
          value={ flight.name }
          onChange={ e => flight.name = e.target.value }
        />
      </div>
      <LocationControl
        onResultSelected={ result => select(flight.from, result) }
      />
      <LocationControl 
        onResultSelected={ result => select(flight.to, result) }
      />
    </div>
  );
};

export default FlightControl;
