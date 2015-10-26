var yaml = require('js-yaml');
var fs = require('fs');


var docs = [];

yaml.safeLoadAll(fs.readFileSync('days_export.txt'), function(doc) {
  docs.push(doc);
});

yaml.safeLoadAll(fs.readFileSync('data.yml'), function(doc) {
  docs.push(doc);
});

yaml.safeLoadAll(fs.readFileSync('more_days_export.txt'), function(doc) {
  docs.push(doc);
});

function compare(a, b) {
  return b.date - a.date;
}

var docs = docs.sort(compare);

for (var i = 0; i < docs.length; i++) {
  var d = docs[i];
  process.stdout.write('---\n');
  process.stdout.write(yaml.safeDump(d));
}
