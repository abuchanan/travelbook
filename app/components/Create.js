import React from 'react';

const Create = ({inspector}, {actions: {flights}}) => {

  function add_flight() {
    var flight = flights.add();
    inspector.active = "flight";
    inspector.data = flight;

    act('flight added', id);
    act('flight inspector focused', id);
  }

  function activate_directions() {
    inspector.active = "directions";

    act('directions inspector focused');
  }

  return (<div id="create-inspector">
    <h1>Create</h1>
    <div><button onClick={add_flight}>Flight</button></div>
    <div><button onClick={activate_directions}>Directions</button></div>
  </div>);
};

Create.contextTypes = {actions: React.PropTypes.object};
export default Create;
