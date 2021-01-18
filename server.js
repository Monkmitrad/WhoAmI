'use strict';

const http = require('http');
const express = require('express');
const fs = require('fs');
const compression = require('compression');
const chalk = require('chalk');
const socketio = require('socket.io');
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Constants
const config = require('./config');

// App
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 500 requests per windowMs
});
app.use('/api/*', apiLimiter);

const server = http.Server(app);

server.listen(config.get('port'), config.get('host'), function() {
  console.log(`Running on http://${config.get('host')}:${config.get('port')}`);
});

// Socket.IO
const io = socketio(server);

// ---- HANDLE IO CONNECTION ---- //
io.on('connection', function(socket) {
  require('./controllers/io').socketHandler(io, socket);
});

// Routers

app.all('*', async (req, res, next) => {
  if (req.header('postman-token')) {
    res.status(403).json({response: 'Forbidden'});
  } else {
    next();
  }
});

const gameRouter = require('./routes/gameRouter');
app.use(gameRouter);

app.get('/api/*', (req, res) => {
  res.json({response: 'This API endpoint does not exist'});
});

// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(config.get('app_folder'), {maxAge: '1y'})); 

// ---- SERVE APPLICATION PATHS ---- //
app.get('*', (req, res) => {
  try {
      if (fs.existsSync(config.get('app_folder'))) {
              res.status(200).sendFile(`/`, {root: config.get('app_folder')});
      } else {
              res.status(404).send('404');
      }
  } catch (error) {
      console.log(error);
      res.status(500).send();
  }
});
