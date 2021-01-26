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
        return Number(id) + 1000;
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

/**
 * 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
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

/**
 * 
 * @param {Number} gameID 
 */
async function checkGameStatus(gameID) {
    const game = await getGame(gameID);
    return game.gameStatus;
}

/**
 * 
 * @param {String} token 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
async function checkAssignedPlayer(token, gameID, playerName) {
    const game = await getGame(gameID);
    if (jwtHandler.verifyIdentity(token, gameID, playerName)) {
        const player = await game.players.find((_player) => _player.name === jwtHandler.getJWTName(token));
        if (player.assignedPlayer === playerName) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * 
 * @param {Number} gameID 
 */
async function checkReadyStatus(gameID) {
    const game = await getGame(gameID);
    if (game.players.length >= 2) {
        return game.players.every((element) => {
            return element.ready;
        });
    } else {
        return false;
    }
    
}

async function checkSubmitStatus(gameID) {
    const game = await getGame(gameID);
    return game.players.every((element) => {
        return element.submissionText;
    });
}

/**
 * 
 * @param {Number} gameID 
 */
async function startGame(gameID) {
    const game = await getGame(gameID);
    game.gameStatus = true;

    const assignedArray = randomAssignment(game.players);
    for (let index = 0; index < game.players.length; index++) {
        const element = game.players[index];
        element.assignedPlayer = assignedArray[index];
    }
    await game.save();
}

/**
 * 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
async function gameData(gameID, playerName) {
    const game = await getGame(gameID);
    game.players.forEach(player => {
        player.jwt = '';
        if (player.name === playerName) {
            player.submissionText = 'Hidden to yourself';
        }
    });
    return game;
}

/**
 * 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
async function disconnectPlayer(gameID, playerName) {
    const game = await getGame(gameID);
    const player = await game.players.find((_player) => _player.name === playerName);
    const playerIndex = game.players.indexOf(player);
    if (player) {
        game.players.splice(playerIndex, 1);
    }
    await game.save();
    return 'Disconnected';
}

/**
 * @typedef {Object} player
 * @property {String} playerName
 * @property {String} assignedPlayer
 * @property {String} submissionText
 * @property {boolean} ready
 * @param {[player]} players 
 */
function randomAssignment(players) {
    const copyArray = [...players];
	const returnArray = new Array(players.length);

	while (copyArray.length > 0) {
		if (copyArray.length === 1) {
			// uneven playercount
			console.log('Uneven');
			const changedPlayer = copyArray[0];
			returnArray[players.indexOf(copyArray[0])] = returnArray[0];
			returnArray[0] = changedPlayer.name;

			return returnArray;

		}
		const index = getRandomExcept(copyArray.length, 0);

		const randomPlayer = copyArray[index];
		returnArray[players.indexOf(copyArray[0])] = randomPlayer.name;
		returnArray[players.indexOf(randomPlayer)] = copyArray[0].name;
		copyArray.splice(index, 1);
		copyArray.shift();
	}
	return returnArray;
}

/**
 * 
 * @param {Number} length 
 * @param {Number} exceptIndex 
 */
function getRandomExcept (length, exceptIndex) {
    if (length <= 0) {
		return null;
	} else if (length === 1) {
		if (0 === exceptIndex) return null;
	}
	var n = Math.floor(Math.random() * length);

	if (n === exceptIndex) {
		// n = (n + Math.floor(Math.random() * length)) % length;
		return getRandomExcept(length, exceptIndex);
	}
	return n;
}

module.exports = {
    create: createGame,
    login: loginPlayer,
    ready: playerReady,
    submit: submitEntry,
    id: checkGameID,
    name: checkPlayerName,
    status: checkGameStatus,
    assigned: checkAssignedPlayer,
    check: checkReadyStatus,
    start: startGame,
    data: gameData,
    guess: checkSubmitStatus,
    disconnect: disconnectPlayer
}
