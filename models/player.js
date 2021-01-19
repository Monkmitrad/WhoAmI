const mongoose = require('mongoose');

const playerScheme = new mongoose.Schema({
    name: String,
    assignedPlayer: String,
    submissionText: String,
    ready: Boolean
});

module.exports = playerScheme;