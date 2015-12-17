import React from 'react';

export const ListInspector = props => {
  let {flights, drives, onSelect} = props;

  let flight_elements = [];

  for (let id in flights) {
    let flight = flights[id];
    let edit = () => onSelect("flight", flight.id);

    flight_elements.push(
      <div key={flight.id}>
        <span onClick={edit}>{flight.name}</span>
      </div>
    );
  }

  return (
    <div>
      <h1>List</h1>
      <div>
        {flight_elements}
      </div>
    </div>
  );
};
