import React from 'react';

import LocationControl from './LocationControl';


function get_location(res) {
  let [longitude, latitude] = res.geometry.coordinates;
  return {name: res.place_name, latitude, longitude};
}

const FlightControl = props => {

  let {
    flight,
    dispatchers: {
      set_flight_name,
      set_flight_origin,
      set_flight_destination
    }
  } = props;

  return (
    <div>
      <h1>Flight</h1>
      <div>
        <input
          placeholder="Name"

          value={ flight.name }
          onChange={ e => set_flight_name(flight.id, e.target.value) }
        />
      </div>
      <LocationControl
        onResultSelected={ r => set_flight_origin(flight.id, get_location(r)) }
      />
      <LocationControl
        onResultSelected={ r => set_flight_destination(flight.id, get_location(r)) }
      />
    </div>
  );
};

export default FlightControl;
