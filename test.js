"use strict";
var uuid = require("node-uuid");


function generate_id() {
  return uuid.v4();
}

var Location = {
  latitude: 0,
  longitude: 0,
};



state.playback.playing = true;
console.log(state.playback.playing);

var f1 = state.flights.get("flight-1");
console.log(f1.id);

var f2 = state.flights.get("flight-2");
console.log(f2.id);

var f3 = state.flights.get("flight-1");
console.log(f3.id);

f3.name = "Flight 1";
console.log(f3.name);
console.log(f1.name);
console.log(f2.name);

console.log(f1.from.latitude);
f1.from.latitude = 5;
console.log(f1.from.latitude);
console.log(f3.from.latitude);

// Sealed error
// state.flights["foo"] = 4;

// Can't prevent this unfortunately, without Proxy anyway
console.log(state.flights["foo"] === undefined);

state.scalar_list.append("baz");
console.log(state.scalar_list.get(0));

state.scalar_map.set("key", "my value");
console.log(state.scalar_map.get("key"));

var o1 = state.others.add();
console.log(o1.other_value);
o1.other_value = "other changed";
console.log(state.others.get(0).other_value);

setTimeout(function() {
  state.playback.playing = false;
}, 1000);
