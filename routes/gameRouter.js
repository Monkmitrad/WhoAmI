const express = require('express');
const router = new express.Router();
const { body, validationResult } = require('express-validator');

const io = require('../controllers/io');
const dbHandler = require('../controllers/dbHandler');
const jwtHandler = require('../controllers/jwt');

const baseURL = '/api/';

/**
 * create new game
 */
router.post(baseURL + 'create', async (req, res) => {
	// trigger game creation in db
	const gameID = await dbHandler.create();

	// trigger socket creation in io

    // return gameID on success
    if (gameID) {
        res.json({ response: gameID });
    } else {
        res.status(500).json({response: 'Internal server error on creation'});
    }
	
});

/**
 * login user
 */
router.post(baseURL + 'login',[
    body('gameID').exists().isNumeric().trim().escape(),
    body('playerName').exists().isLength({min: 3, max: 12}).trim().escape(),
], async (req, res) => {
    try {
        validationResult(req).throw();

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
                } else {
                    res.status(500).json({response: 'Internal server error on login'});
                }
            } else {
                res.status(400).json({response: 'Username already taken'});
            }
        } else {
            res.status(400).json({response: 'Invalid gameID'});
        }
    } catch (err) {
        res.status(400).json({response: err.errors[0].param + ' not valid'});
    }    
});

/**
 * make ready
 */
router.post(baseURL + 'ready', [
    body('gameID').exists().isNumeric().trim().escape(),
    body('playerName').exists().isLength({min: 3, max: 12}).trim().escape(),
    body('status').exists().isBoolean().trim().escape()
], async (req, res) => {
    try {
        validationResult(req).throw();

        const gameID = req.body.gameID;
        const playerName = req.body.playerName;
        const status = req.body.status;

        // check jwt
        if (jwtHandler.checkToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1lIjoiNDQ1OCIsIm5hbWUiOiJUZXN0MyIsImlhdCI6MTYxMTA3NDA2MSwiZXhwIjoxNjExMDgxMjYxfQ.Wl_tWS_ds2DAKgcDvv7FvktHVh1P4iwtAF_wfTjduWk')) {
            // on success check gameID
            if (await dbHandler.id(gameID)) {
                // on success check game status (has to be false)
                if (await dbHandler.status(gameID) === false) {
                    // on success trigger save in db
                    await dbHandler.ready(gameID, playerName, status);
                    // on success update game via socket
                    // trigger ready check for all players
                    res.json({response: 'Ready status set to ' + status});
                } else {
                    res.status(400).json({response: 'Game has already started'});
                }
            } else {
                res.status(400).json({response: 'Invalid gameID'});
            }
            
        } else {
            res.status(401).json({response: 'Invalid JWT'});
        }
    } catch (err) {
        res.status(400).json({response: err.errors[0].param + ' not valid'});
    }
    
	
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
