const express = require('express');
const router = new express.Router();
const io = require('../controllers/io');

const dbHandler = require('../controllers/mongodb');

router.post('/api/create', async (req, res) => {
	await dbHandler.create().then((gameID) => res.send({ response: gameID }));
});

router.post('/api/id', async (req, res) => {
	const id = req.body.gameID;
	if (await dbHandler.check(id)) {
		res.send({ response: true });
	} else {
		res.send({ response: false });
	}
});

router.post('/api/add', async (req, res) => {
	const playerName = req.body.playerName;
	const playerID = req.body.playerID;
	const gameID = req.body.gameID;

	await dbHandler.add(playerName, gameID, playerID).then(async (id) => {
		// console.log(id),
		await update(gameID).then(res.send({ response: id }));
	});
});

router.post('/api/players', async (req, res) => {
	const gameID = req.body.gameID;
	res.send(await dbHandler.list(gameID));
});

router.post('/api/ready', async (req, res) => {
	const id = req.body.id;
	const status = req.body.status;
	const gameID = req.body.gameID;
	if (!(await dbHandler.gameStatus(gameID))) {
		await dbHandler.ready(id, status, gameID);

		await update(gameID).then(res.send({ response: status }));
		if (await checkReady(gameID)) {
			await dbHandler.gameReady(gameID).then(
				await dbHandler.list(gameID).then(async (players) => {
					const result = randomAssignment(players);

					await dbHandler.assign(gameID, result);
					await update(gameID);
				})
			);
		}
	}
});

router.post('/api/submission', async (req, res) => {
	// save submission to referenced user
	const user = req.body.playerName;
	const submissionText = req.body.submissionText;
	const gameID = req.body.gameID;

	await dbHandler.submit(user, submissionText, gameID).then(async () => {
		await update(gameID).then(res.send({ response: true }));
	});
});

async function update(gameID) {
	await dbHandler.list(gameID).then(async (players) => {
		// console.log("Update");
		io.updatePlayers(players);
		io.startGame(await dbHandler.gameStatus(gameID));
	});
}

async function checkReady(gameID) {
	return await dbHandler.list(gameID).then((players) => {
		if (players.length > 1) {
			return players.every(isReady);
		} else {
			return false;
		}
	});
}

function isReady(element) {
	return element.ready;
}

function randomAssignment(players) {
	const copyArray = [...players];
	const returnArray = new Array(players.length);

	while (copyArray.length > 0) {
		if (copyArray.length === 1) {
			// Uneven playercount =>  player 1 gets this player too
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

function getRandomExcept(length, except) {
	if (length <= 0) {
		return null;
	} else if (length === 1) {
		if (0 === except) return null;
	}
	var n = Math.floor(Math.random() * length);

	if (n === except) {
		// n = (n + Math.floor(Math.random() * length)) % length;
		return getRandomExcept(length, except);
	}
	return n;
}

module.exports = router;
