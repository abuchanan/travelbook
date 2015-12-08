import csp from 'js-csp';

// TODO enhance this so it's impossible to put values
export const NEVER = csp.chan();

export function select(...args) {
  return csp.alts(args, {priority: true});
}

export function clear_buffer(buf) {
  while (buf.count() > 0) {
    buf.remove();
  }
}

export function go(func) {
  return (...args) => csp.spawn(func(...args));
}

go.run = (func, ...args) => go(func)(...args)

export const channel = csp.chan;
export const buffers = csp.buffers;
export const mix = csp.operations.mix;
export const put = csp.put;
put.async = csp.putAsync;

export const split = csp.operations.split;

export const take = csp.take;
take.async = csp.takeAsync;

export const broadcast = (...args) => new Broadcast(...args);

export function debounce(input_ch, output_ch, duration) {

  csp.go(function*() {
    let timeout = NEVER;
    let latest = undefined;

    while (!input_ch.closed || timeout !== NEVER) {
      let {channel, value} = yield select(input_ch, timeout);

      switch (channel) {
        case input_ch:
          latest = value;
          timeout = csp.timeout(duration);
          break;

        case timeout:
          yield csp.put(output_ch, latest);
          timeout = NEVER;
          break;
      }
    }
  });
}


class Broadcast {
  constructor(...inputs) {
    this.input = csp.chan();
    this._mix_out = csp.chan();
    this._mult = csp.operations.mult(this._mix_out);
    this._mix = csp.operations.mix(this._mix_out);
    csp.operations.mix.add(this._mix, this.input);

    for (let input of inputs) {
      csp.operations.mix.add(this._mix, input);
    }
  }

  add_input(input) {
    csp.operations.mix.add(this._mix, input);
  }

  tap(chan) {
    chan = chan || csp.chan();
    return csp.operations.mult.tap(this._mult, chan);
  }
}
