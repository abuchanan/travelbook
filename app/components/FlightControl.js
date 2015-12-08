import React from 'react';

import LocationControl from './LocationControl';

const FlightControl = React.createClass({

  render() {
    var flight = this.props.flight;

    return (<div>
      <h1>Flight</h1>
      <div>
        <input placeholder="Name"
               value={ flight.name }
               onChange={ e => flight.name = e.target.value }
        />
      </div>
      <div>
        <LocationControl onResultSelected={result => console.log("from", result)} />
      </div>
      <div>
        <LocationControl onResultSelected={result => console.log("to", result)} />
      </div>
    </div>);
  }
});

export default FlightControl;
