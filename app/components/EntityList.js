import React from 'react';

const EntityList = React.createClass({
  render() {

    var flights = [];
    for (var flight of this.props.flights.values()) {
      flights.push(<div>
        <div>{flight.name}</div>
        <div>Start: {flight.start.x}, {flight.start.y} End: {flight.end.x}, {flight.end.y}</div>
      </div>);
    }

    return (
    <div className="entity-list">
      {flights}
    </div>
    );
  }
});

export default EntityList;
