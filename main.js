'use strict';

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

const g_constants = require('./constants');

var credentials = {
  key: privateKey, 
  cert: certificate
};

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(g_constants.my_port);
httpsServer.listen(g_constants.my_portSSL);

app.use(express.static('site'));

require('./reqHandler.js').handle(app);

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

//scp -r ./site/ test@3s3s.org:/home/test/multicoins/