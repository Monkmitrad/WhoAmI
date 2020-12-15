const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/whoami', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

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
});

const playerModel = mongoose.model('Player', player, 'players');

const testPlayer = new playerModel({
    name: "Test",
    assignedPlayer: "User2",
    submissionText: "",
    ready: "false",
});

// testPlayer.save();

const game = new mongoose.Schema({
    gameID: Number,
    players: [player],
    gameStatus: Boolean
});

const gameModel = mongoose.model('Game', game, 'games');

const testGame = new gameModel({
    gameID: 1000,
    players: [],
    gameStatus: false
});

// testGame.save();

// create new game and return gameID
async function createGame() {
    gameID = generateGameID();

    const newGame = new gameModel({
        gameID,
        players: [player],
        gameStatus: false
    });
    return await newGame.save().then((returnedGame) => {
        return returnedGame.gameID;
    });
}

// add new player after login
async function addPlayer(playerName, gameID) {
    searchedGame = await checkID(gameID);
    if(searchedGame) {
        const newPlayer = new playerModel({
            name: playerName,
            assignedPlayer: "",
            submissionText: "",
            ready: false,
        });
        await searchedGame.players.push(newPlayer);
        await searchedGame.save();
        return searchedGame.players[searchedGame.players.length - 1]._id;
    } else {
        return;
    }
    
    
}
// get all players
async function listPlayers(gameID) {
    console.log('GameID: ', gameID);
    const foundGame = await gameModel.findOne({ 'gameID' : gameID });
    console.log(foundGame);
    return foundGame.players;
}

// set ready status of player
async function playerReady(playerID, status) {
    await playerModel.findByIdAndUpdate(playerID, { ready: status });
}

// checks if gameID exists
async function checkID(id) {
    return await gameModel.findOne({ 'gameID' : id });
}

// set submissionText for player
function saveSubmission() {

}

function generateGameID() {
    const id = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
    return Number(id);
    // TODO: check if 4 digits
}

module.exports = {
    list: listPlayers,
    add: addPlayer,
    ready: playerReady,
    create: createGame,
    check: checkID
};