import React from 'react';

export const ListInspector = props => {
  let {flights, drives, onSelect} = props;

  let flight_elements = [];

  for (let flight of flights.values()) {
    let del = () => flights.delete(flight.id);
    let edit = () => onSelect("flight", flight);

    flight_elements.push(
      <div key={flight.id}>
        <span onClick={edit}>{flight.name}</span>
        <span onClick={del}>Delete</span>
      </div>
    );
  }

  let drive_elements = [];
  for (let drive of drives.values()) {
    drive_elements.push(
      <div key={drive.id}>{drive.name} <span onClick={() => flights.delete(flight.id)}>Delete</span></div>
    );
  }

  return (
    <div>
      <h1>List</h1>
      <div>
        {flight_elements}
      </div>
      <div>
        {drive_elements}
      </div>
    </div>
  );
};
