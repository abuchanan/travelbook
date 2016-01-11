import polyfill from 'babel-polyfill';
import tape from 'tape';
import tape_dom from 'tape-dom';

import { slice_line } from '../app/flights';

var d = require('./data/auckland-to-bali.json');

console.log('start testing', d);

tape.createStream({ objectMode: true }).on('data', row => {
    console.log(JSON.stringify(row))
});

tape_dom.installCSS();
tape_dom.stream(tape);

tape('entry test', t => {
  t.plan(1);
  t.pass('Tests are running');
});
