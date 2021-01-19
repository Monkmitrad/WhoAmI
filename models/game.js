const mongoose = require('mongoose');

const playerScheme = require('./player');

const gameScheme = new mongoose.Schema({
    gameID: Number,
    players: [playerScheme],
    gameStatus: Boolean
});

const gameModel = new mongoose.model('Game', gameScheme, 'games');

module.exports = gameModel;