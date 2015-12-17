import React from 'react';

import { set_flight_name, set_flight_origin, set_flight_destination } from '../actions';
import LocationControl from './LocationControl';


function get_coordinates(res) {
  let [latitude, longitude] = res.geometry.coordinates;
  return {latitude, longitude};
}

const FlightControl = props => {
  let {flight, dispatch} = props;

  return (
    <div>
      <h1>Flight</h1>
      <div>
        <input
          placeholder="Name"

          value={ flight.name }
          onChange={ e => dispatch(set_flight_name(flight.id, e.target.value)) }
        />
      </div>
      <LocationControl
        onResultSelected={ r => dispatch(set_flight_origin(flight.id, get_coordinates(r))) }
      />
      <LocationControl
        onResultSelected={ r => dispatch(set_flight_destination(flight.id, get_coordinates(r))) }
      />
    </div>
  );
};

export default FlightControl;
