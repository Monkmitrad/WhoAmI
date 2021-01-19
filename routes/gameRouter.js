const express = require('express');
const router = new express.Router();
const { check } = require('express-validator');

const io = require('../controllers/io');
const db = require('../controllers/dbHandler');
const dbHandler = require('../controllers/dbHandler');

const baseURL = '/api/';

/**
 * create new game
 */
router.post(baseURL + 'create', async (req, res) => {
	// trigger game creation in db
	const gameID = await dbHandler.create();

	// trigger socket creation in io

	// return gameID on success
	res.json({ response: gameID });
});

/**
 * login user
 */
router.post(baseURL + 'login',[
    check('gameID').isNumeric().trim().escape(),
    check('playerName').isLength({min: 3, max: 12}).trim().escape(),
], async (req, res) => {
    const gameID = req.body.gameID;
    const playerName = req.body.playerName;

    // check gameID
    if (await dbHandler.id(gameID)) {
        // on success check validity of playerName
        if (await dbHandler.name(gameID, playerName)) {
            // on success trigger player and jwt creation in db
            const jwt = await dbHandler.login(gameID, playerName);
            if (jwt) {
                // on success return jwt and socket id
                res.json({'jwt': jwt});

                // update game via socket
            }
        } else {
            res.status(400).json({'response': 'Username already taken'});
        }
    } else {
        res.status(400).json({'response': 'Invalid gameID'});
    }
});

/**
 * make ready
 */
router.post(baseURL + 'ready', async (req, res) => {
	// check jwt
	// on success check gameID
	// on success check game status (has to be false)
	// on success trigger save in db
	// on success update game via socket
	// trigger ready check for all players
});

/**
 * submit entry
 */
router.post(baseURL + 'submit', async (req, res) => {
	// check jwt
	// on success check gameID
	// on success check game status (has to be true)
	// on success check validity of submission text
});

module.exports = router;
