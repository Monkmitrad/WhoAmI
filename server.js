'use strict';

const http = require('http');
const express = require('express');
const fs = require('fs');
const compression = require('compression');
const chalk = require('chalk');
const socketio = require('socket.io')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const __app_folder = './public';

// App
const app = express();
app.use(express.json());
app.use(compression());
const server = http.Server(app);

server.listen(PORT, HOST, function() {
  console.log(`Running on http://${HOST}:${PORT}`);
});

// Socket.IO
const io = socketio(server);

// ---- HANDLE IO CONNECTION ---- //
io.on('connection', function(socket) {
  require('./controllers/io').socketHandler(io, socket);
});

// Routers
const gameRouter = require('./routes/gameRouter');

app.use(gameRouter);

app.get('/api/*', (req, res) => {
  res.send('Hello World!');
});

// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(__app_folder, {maxAge: '1y'})); 

// ---- SERVE APPLICATION PATHS ---- //
app.all('*', (req, res) => {
  try {
      if (fs.existsSync(__app_folder)) {
              res.status(200).sendFile(`/`, {root: __app_folder});
      } else {
              res.status(404).send('404');
      }
  } catch (error) {
      console.log(error);
      res.status(500).send();
  }
});

