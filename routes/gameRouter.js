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
	await dbHandler.ready(id, status, gameID);

	await update(gameID).then(res.send({ response: status }));
	if (await checkReady(gameID)) {
        await dbHandler.gameReady(gameID).then(
            await dbHandler.list(gameID).then(async (players) => {
                const result = randomAssignment(players);
    
                await dbHandler.assign(gameID, result).then(await update(gameID));
            })
        );
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
    //console.log(players);
	let returnArray = new Array(players.length);

    

	while (players.length > 0) {
		if (players.length === 1) {
            // Uneven playercount =>  player 1 gets this player too
            console.log('Uneven');
            returnArray[0] += ' ' + players[0].name
        }
        const index = Math.floor(Math.random(players.length - 1))+1;
        const randomPlayer = players[index];
        returnArray[0] = randomPlayer.name;
        returnArray[index] = players[0].name;
        // console.log(index, ',', randomPlayer);
        players = players.slice(index, 1);
        players.shift();
        // console.log(players.length);
    }

    return returnArray;
}

module.exports = router;
