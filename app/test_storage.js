import extend from 'extend';
let Immutable from 'immutable';

let data = Immutable.Map();


function set(id, updates) {
  let existing = data.get(id);
  if (!existing) {
    data.set(id, updates);
  } else {
    extend(existing, updates);
  }
}

function add_flight(data) {
  let id = generate_id();
  let flight = new Flight(id);
  let flights = data.get("flights");
  flights.set(id, flight);

}

function get_flights(data) {

}
