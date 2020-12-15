const mongoose = require('mongoose');
mongoose.connect('mongodb://db:27017/whoami', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
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
	name: 'Test',
	assignedPlayer: 'User2',
	submissionText: '',
	ready: 'false',
});

// testPlayer.save();

const game = new mongoose.Schema({
	gameID: Number,
	players: [player],
	gameStatus: Boolean,
});

const gameModel = mongoose.model('Game', game, 'games');

const testGame = new gameModel({
	gameID: 1000,
	players: [player],
	gameStatus: false,
});

// testGame.save();

// create new game and return gameID
async function createGame() {
	gameID = generateGameID();

	const newGame = new gameModel({
		gameID,
		players: [],
		gameStatus: false,
	});
	return await newGame.save().then((returnedGame) => {
		return returnedGame.gameID;
	});
}

// add new player after login
async function addPlayer(playerName, gameID, playerID) {
	searchedGame = await checkID(gameID);
	if (searchedGame) {
        // look if playerName is already registered
        const foundPlayer = searchedGame.players.find((player) => player.name == playerName);
		if (foundPlayer) {

			// look if playerID is matching
			if (foundPlayer._id == playerID && playerID !== 'false' && playerID !== undefined) {
				return playerID;
			} else {
                // playerID not matching playerName => choose another name
                console.log(playerID, foundPlayer);
				return false;
			}
		} else {
			// create new player
			const newPlayer = new playerModel({
				name: playerName,
				assignedPlayer: '',
				submissionText: '',
				ready: false,
			});

			await searchedGame.players.push(newPlayer);
			await searchedGame.save();
			return searchedGame.players[searchedGame.players.length - 1]._id;
		}
	} else {
		return false;
	}
}
// get all players
async function listPlayers(gameID) {
	// console.log('GameID: ', gameID);
	return await gameModel
		.findOne({ gameID: gameID })
		.then((foundGame) => foundGame.players);
}

// set ready status of player
async function playerReady(playerID, status, gameID) {
	await gameModel.findOne({ gameID: gameID }).then(async (foundGame) => {
		const player = foundGame.players.id(playerID);
		player.ready = status;
		await foundGame.save();
	});
}

// checks if gameID exists
async function checkID(id) {
	return await gameModel.findOne({ gameID: id });
}

// saves assigned players
async function assignPlayers(gameID, assignedPlayers) {
	await gameModel.findOne({ gameID: gameID }).then(async (foundGame) => {
		for (let index = 0; index < foundGame.players.length; index++) {
			const element = foundGame.players[index];
			// console.log(element);
			element.assignedPlayer = assignedPlayers[index];
		}
		await foundGame.save();
	});
}

// set submissionText for player
async function saveSubmission(playerName, submissionText, gameID) {
    await gameModel.findOne({ gameID: gameID }).then(async (foundGame) => {
        const player = await foundGame.players.find((player) => player.name === playerName);
        player.submissionText = submissionText;

        await foundGame.save();
    });
}

function generateGameID() {
	const id = (Math.floor(Math.random() * 10000) + 10000)
		.toString()
		.substring(1);
	return Number(id);
	// TODO: check if 4 digits
}

async function gameReady(gameID) {
    await gameModel.findOne({ gameID: gameID }).then(async (foundGame) => {
        foundGame.gameStatus = true;
        await foundGame.save();
    });
}

async function gameStatus(gameID) {
    return await gameModel.findOne({ gameID: gameID }).then((foundGame) => {
        return foundGame.gameStatus;
    });
}

module.exports = {
	list: listPlayers,
	add: addPlayer,
	ready: playerReady,
	create: createGame,
	check: checkID,
    assign: assignPlayers,
    submit: saveSubmission,
    gameReady,
    gameStatus
};
