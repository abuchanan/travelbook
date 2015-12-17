


// const STORAGE_KEY = "travel-book-storage-v1";


function update_view() {
  render(<App appState={state} />, container);
}

function update_sources() {
  let entities = [...state.flights.values(), ...state.drives.values()];

  state.map.sources.clear();
  for (let entity of entities) {
    state.map.sources.set(entity.id, Array.from(entity.features));
  }
}

function update_flights() {
  for (let flight of state.flights.values()) {
    update_flight(flight, state.playback.current_time);
  }
}


function on_update() {
  if (state.playback.playing) {
//    drives.update_drives(state.playback.current_time, state.drives, state.map);
    update_flights();
  }

  update_sources();
  update_view();
}

window.dump_storage = function() {
  console.log("storage", JSON.parse(localStorage.getItem(STORAGE_KEY)));
};

window.dump_state = function() {
  console.log("state", state);
}

window.clear_storage = function() {
  localStorage.removeItem(STORAGE_KEY);
};

/*
  init app
*/
// var state = schema.create(on_update);

window.state = state;
window.generate_test_data = function() {

  state.map.zoom = 1;

  let a = add_flight(state.flights);
  a.from.latitude = 45.619300;
  a.from.longitude = -122.685138;
  a.to.latitude = -37.005880;
  a.to.longitude = 174.789457;

  Keyframes.set_keyframe(state.map.tracks.zoom, seconds(0), 1);

  // Tracks:
  // - keyframes: dropped them in favor of concept of having track that is only
  //              active part-time. Also trying to allow different track types:
  //              e.g. flight follow
  // - order: need more control over order (flight.progress -> flight.line -> flight.follow)
  // - serialization: explicit definition makes schema and serialization cleaner
  // - track types: interpolate zoom vs set zoom? flight follow isn't a value
  //                on flight but a value on map.
  Keyframes.set_keyframe(state.map.tracks.zoom, seconds(13), 10);

  // TODO one disadvantage of this functional style is that it makes the
  //      receiver less scannable (wrt. reading)
  Keyframes.set_keyframe(a.tracks.visible, seconds(0), true);
  Keyframes.set_keyframe(a.tracks.visible, seconds(13), false);


  // TODO resolve issue about state vs entity
  // Keyframes.set_keyframe(state.map.tracks, {
  //   start_time: seconds(10),
  //   end_time: seconds(12),
  //   start_value: 5,
  //   end_value: 10,
  //   // TODO confusing whether this refers state or entity and how would you
  //   //      switch. want a better serializeable reference system
  //   target_id: 'map.zoom',
  //   type: 'linear_interpolate',
  // });

  Keyframes.set_keyframe(a.tracks.progress, seconds(0), 0);
  Keyframes.set_keyframe(a.tracks.progress, seconds(10), 1);

  Keyframes.set_keyframe(a.tracks.follow, seconds(0), true);
  Keyframes.set_keyframe(a.tracks.follow, seconds(10), false);

  // Keyframes.set_keyframe(state.tracks, {
  //   start_time: seconds(0),
  //   end_time: seconds(5),
  //   target: state.map.center,
  //   start_point: {
  //     latitude: 45.619,
  //     longitude: -122.685,
  //   },
  //   end_point: {
  //     latitude: -36.596269,
  //     longitude: 174.856537,
  //   },
  //   update: pan_west,
  // });


};
//
// generate_test_data();
// update_view();
