const express = require('express');
const router = new express.Router();

const dbHandler = require('../controllers/mongodb');

router.post('/api/id', async (req, res) => {
    const id = req.body.id;

    return true;
});

router.post('/api/add', async (req, res) => {
    const playerName = req.body.playerName;
    const gameID = req.body.gameID;

    await dbHandler.add(playerName, gameID).then((id) => {
        // console.log(id),
        res.send({response: id})
    });
});

router.get('/api/players', async (req, res) => {
    res.send(await dbHandler.list());
});

router.post('/api/ready', async (req, res) => {
    console.log(req.body);
    res.send({response: req.body.status});
});

router.post('/api/submission', async (req, res) => {
    console.log(req.body);
    res.send({response: req.body.submissionText});

    // save submission to referenced user
    const user = req.body.playerName;
    const submissionText = req.body.submissionText;
});

module.exports = router;