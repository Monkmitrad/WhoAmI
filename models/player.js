const mongoose = require('mongoose');

const playerScheme = new mongoose.Schema({
    name: String,
    assignedPlayer: String,
    submissionText: String,
    ready: Boolean,
    jwt: String
});

const playerModel = new mongoose.model('Player', playerScheme, 'players');

module.exports = {
    playerScheme,
    playerModel
};