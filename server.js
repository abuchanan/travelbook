var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var app = express();

app.use(express.static('build'));

app.use(bodyParser.json({
  extended: true,
  parameterLimit: 10000,
  limit: 1024 * 1024 * 10
}));

app.use(bodyParser.urlencoded({
  extended: true,
  parameterLimit: 10000,
  limit: 1024 * 1024 * 10
}));

app.post('/save', function (req, res) {
  var path = __dirname + '/data/' + Date.now() + '.json';
  fs.writeFileSync(path, JSON.stringify(req.body));
  var path = __dirname + '/build/data.json';
  fs.writeFileSync(path, JSON.stringify(req.body));
});

app.get('/test', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'build', 'tests', 'index.html'));
});

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'build', 'index.html'))
});


module.exports = function() {
  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}
