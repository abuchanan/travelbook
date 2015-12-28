import uuid from 'node-uuid';

export function generate_id() {
  return uuid.v4();
}

export function seconds(n) {
  return n * 1000;
}

export function* entries(obj) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key]];
   }
}
