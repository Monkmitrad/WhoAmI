const mongoose = require('mongoose');
const config = require('../config');

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

const gameModel = require('../models/game');
const playerModel = require('../models/player').playerModel;
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
    return gameID;
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
    return player.jwt;
}

/**
 * make a player ready
 * @param {Number} gameID 
 * @param {String} playerName 
 * @param {Boolean} readyStatus 
 */
async function playerReady(gameID, playerName, readyStatus) {
    const game = await getGame(gameID);
    const player = await game.players.find((_player) => _player.name === playerName);
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
    const player = await game.players.find((_player) => _player.name === playerName);
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
    return await gameModel.findOne({gameID});
}

/**
 * check if game with gameID exists
 * @param {Number} gameID 
 */
async function checkGameID(gameID) {
    if (await getGame(gameID)) {
        return true;
    } else {
        return false
    }

}

async function checkPlayerName(gameID, playerName){
    const game = await getGame(gameID);
    if (await game.players.find((_player) => _player.name === playerName)) {
        // player already exists
        return false;
    } else {
        // playerName is free
        return true;
    }
}

async function checkGameStatus(gameID) {
    const game = await getGame(gameID);
    return game.gameStatus;
}

module.exports = {
    create: createGame,
    login: loginPlayer,
    ready: playerReady,
    submit: submitEntry,
    id: checkGameID,
    name: checkPlayerName,
    status: checkGameStatus
}