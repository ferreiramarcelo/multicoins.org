'use strict';

const express = require('express');
const app = express();

app.use(express.static('site'));

require('./reqHandler.js').handle(app);

require('http').createServer(app).listen(require('./constants').my_port);

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});