const express = require('express');
const router = new express.Router();
const io = require ('../controllers/io');

const dbHandler = require('../controllers/mongodb');

router.post('/api/create', async (req, res) => {
    await dbHandler.create().then((gameID) => res.send({response: gameID}));
});

router.post('/api/id', async (req, res) => {
    const id = req.body.id;
    if (await dbHandler.check(id)) {
        res.send({response: true});
    } else {
        res.send({response: false});
    }
    
});

router.post('/api/add', async (req, res) => {
    const playerName = req.body.playerName;
    const gameID = req.body.gameID;

    await dbHandler.add(playerName, gameID).then(async (id) => {
        // console.log(id),
        await update(gameID).then(res.send({response: id}));
    });
});

router.post('/api/players', async (req, res) => {
    const gameID = req.body.gameID;
    console.log('Router', gameID)
    res.send(await dbHandler.list(gameID));
});

router.post('/api/ready', async (req, res) => {
    const id = req.body.id;
    const status = req.body.status;
    const gameID = req.body.gameID;
    await dbHandler.ready(id, status, gameID);

    await update(gameID).then(res.send({response: status}));
    await checkReady(gameID);
});

router.post('/api/submission', async (req, res) => {
    console.log(req.body);
    res.send({response: req.body.submissionText});

    // save submission to referenced user
    const user = req.body.playerName;
    const submissionText = req.body.submissionText;
});

async function update(gameID) {
    await dbHandler.list(gameID).then((players) => {
        // console.log("Update");
        io.updatePlayers(players);
    });
}

async function checkReady(gameID) {
    await dbHandler.list(gameID).then((players) => {
        if (players.every(isReady)) {

        }
    })
}

function isReady(player) {
    if (player.ready) {
        console.log(true);
        return true;
    } else {
        console.log(false);
        return false;
    }
}

module.exports = router;