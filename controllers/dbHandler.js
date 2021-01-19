const mongoose = require('mongoose');
const config = require('../config');
const gameModel = require('../models/game');

mongoose.connect(`mongodb://${config.get("db_host")}:${config.get("db_port")}/${config.get("db_name")}`, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connection to MongoDB established');
});

const game = require('../models/game');
const playerModel = require('../models/player');
const jwtHandler = require('./jwt');


/**
 * creates a new game
 */
async function createGame() {
    // create new instance from game model
    const gameID = generateGameID();
    const newGame = new gameModel({
        gameID,
        players: [],
        gameStatus: false
    });
    await newGame.save();
}

/**
 * add a new player to an existing game
 * @param {Number} gameID 
 * @param {String} playerName 
 */
async function loginPlayer(gameID, playerName) {
    const game = await getGame(gameID);
    const jwt = jwtHandler.newToken(gameID, playerName);
    const player = new playerModel({
        name: playerName,
        assignedPlayer: '',
        submissionText: '',
        ready: false,
        jwt: jwt
    });
    game.players.push(player);
    await game.save();
}

/**
 * make a player ready
 * @param {Number} gameID 
 * @param {String} playerName 
 * @param {Boolean} readyStatus 
 */
async function playerReady(gameID, playerName, readyStatus) {
    const game = await getGame(gameID);
    const player = game.players.find((_player) => _player.name === playerName);
    player.ready = readyStatus;
    await game.save();
}

/**
 * submit an entry
 * @param {Number} gameID 
 * @param {String} playerName 
 * @param {String} entry 
 */
async function submitEntry(gameID, playerName, entry) {
    const game = await getGame(gameID);
    const player = game.players.find((_player) => _player.name === playerName);
    player.submissionText = entry;
    await game.save();
}

/**
 * generate a random 4 digit ID
 */
function generateGameID() {
	const id = (Math.floor(Math.random() * 10000) + 10000)
		.toString()
        .substring(1);
    if ((Math.log(id) * Math.LOG10E + 1 | 0 ) === 4) {
        // 4 digit number
        return Number(id);
    } else {
        // 3 digit number, for now just add 1000 as the 4th digit
        return id + 1000;
    }
}

/**
 * returns corresponding document of the gameID
 * @param {Number} gameID 
 */
async function getGame(gameID) {

}

module.exports = {
    create: createGame,
    login: loginPlayer,
    ready: playerReady,
    submit: submitEntry
}