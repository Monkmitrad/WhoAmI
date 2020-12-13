const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/whoami', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connection to MongoDB established');
});

const player = new mongoose.Schema({
    name: String,
    assignedPlayer: String,
    submissionText: String,
    ready: Boolean,
    gameID: Number
});

const playerModel = mongoose.model('Player', player, 'players');

const testPlayer = new playerModel({
    name: "Test",
    assignedPlayer: "User2",
    submissionText: "",
    ready: "false",
    gameID: 123
});

// testPlayer.save();

// add new player after login
async function addPlayer(playerName, gameID) {
    const player = new playerModel({
        name: playerName,
        assignedPlayer: "",
        submissionText: "",
        ready: false,
        gameID
    });
    return await player.save().then((player) => {
        // console.log(player._id);
        return player._id;
    });

    // TODO: return unqiue id back to client
}


// get all players
async function listPlayers() {
    const players = await playerModel.find({});
    return players;
}

// set ready status of player
function playerReady(status, playerName) {

}

// set submissionText for player
function saveSubmission() {

}

module.exports = {
    list: listPlayers,
    add: addPlayer
};