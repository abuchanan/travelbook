
export function register(actions, name, func) {
  actions.set(name, func);
}

// TODO is this feasible?
export function read_only(state) {
  return state;
}

export function run_action(actions, name, ...args) {
  var func = actions.get(name);
  func(...args);
}
