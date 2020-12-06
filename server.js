'use strict';

const express = require('express');
const fs = require('fs');

// Constants
const PORT = 8080;
const HOST = 'localhost';

// App
const app = express();

app.use('/', express.static(__dirname + '/views'));

app.use('/public', express.static(__dirname + '/public'));

app.get('*/*', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);