const express = require('express');
const router = new express.Router();
const { body, header, validationResult } = require('express-validator');

const ioHandler = require('../controllers/io');
const dbHandler = require('../controllers/dbHandler');
const jwtHandler = require('../controllers/jwt');
const config = require('../config');

const baseURL = config.get('api_baseURL');

/**
 * create new game
 */
router.post(baseURL + 'create', async (req, res) => {
	// trigger game creation in db
	const gameID = await dbHandler.create();

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
            // on success check game status (has to be false)
            if (await dbHandler.status(gameID) === false) {
                // on success check validity of playerName
                if (await dbHandler.name(gameID, playerName)) {
                    // on success trigger player and jwt creation in db
                    const jwt = await dbHandler.login(gameID, playerName);
                    if (jwt) {
                        // on success return jwt and socket id
                        res.json({response: jwt});
                        // update game via socket
                        ioHandler.updatePlayers(gameID);
                    } else {
                        res.status(500).json({response: 'Internal server error on login'});
                    }
                } else {
                    res.status(400).json({response: 'Username already taken'});
                }
            } else {
                res.status(400).json({response: 'Game has already started'});
            }
        } else {
            res.status(400).json({response: 'Invalid gameID'});
        }
    } catch (err) {
        if (err.errors) {
            res.status(400).json({response: err.errors[0].param + ' not valid'});
        } else {
            res.status(400).json({response: err});
        }
    }    
});

/**
 * make ready
 */
router.post(baseURL + 'ready', [
    body('gameID').exists().isNumeric().trim().escape(),
    body('playerName').exists().isLength({min: 3, max: 12}).trim().escape(),
    body('status').exists().isBoolean().trim().escape(),
    header('authorization').exists().isString().trim()
], async (req, res) => {
    try {
        validationResult(req).throw();

        const gameID = req.body.gameID;
        const playerName = req.body.playerName;
        const status = req.body.status;

        // check jwt
        if (jwtHandler.checkToken(req.header('Authorization'))) {
            // on success check gameID
            if (await dbHandler.id(gameID)) {
                // on success check if token matches gameID and playerName
                if (jwtHandler.verifyIdentity(req.header('Authorization'), gameID, playerName)) {
                    // on success check game status (has to be false)
                    if (await dbHandler.status(gameID) === false) {
                        // on success trigger save in db
                        await dbHandler.ready(gameID, playerName, status);
                        res.json({response: 'Ready status set to ' + status});
                        // on success update game via socket
                        ioHandler.updatePlayers(gameID);
                        // trigger ready check for all players
                        if (await dbHandler.check(gameID)) {
                            // all players ready, start game
                            await dbHandler.start(gameID);
                            ioHandler.updatePlayers(gameID);
                        }
                    } else {
                        res.status(400).json({response: 'Game has already started'});
                    }
                } else {
                    res.status(400).json({response: 'Parameters do not match'});
                }
            } else {
                res.status(400).json({response: 'Invalid gameID'});
            }
        } else {
            res.status(401).json({response: 'Invalid JWT'});
        }
    } catch (err) {
        if (err.errors) {
            res.status(400).json({response: err.errors[0].param + ' not valid'});
        } else {
            res.status(400).json({response: err});
        }
    }
});

/**
 * submit entry
 */
router.post(baseURL + 'submit',[
    body('gameID').exists().isNumeric().trim().escape(),
    body('playerName').exists().isLength({min: 3, max: 12}).trim().escape(),
    body('entry').exists().notEmpty().trim().escape(),
    header('authorization').exists().isString().trim()
], async (req, res) => {
    try {
        validationResult(req).throw();

        const gameID = req.body.gameID;
        const playerName = req.body.playerName;
        const entry = req.body.entry;

        // check jwt
        if (jwtHandler.checkToken(req.header('Authorization'))) {
            // on success check gameID
            if (await dbHandler.id(gameID)) {
                // on success check if token matches gameID and assignedPlayerName
                if (dbHandler.assigned(req.header('Authorization'), gameID, playerName)) {
                    // on success check game status (has to be true)
                    if (await dbHandler.status(gameID) === true) {
                        // on success trigger save in db
                        await dbHandler.submit(gameID, playerName, entry);
                        // on success update game via socket
                        ioHandler.updatePlayers(gameID);
                        res.json({response: true});
                        // trigger submit check for all players
                        if (await dbHandler.guess(gameID)) {
                            // all players submitted, start guessing
                            ioHandler.startPlayers(gameID);
                            console.log('Start guessing');
                        }
                    } else {
                        res.status(400).json({response: 'Game has not started yet'});
                    }
                } else {
                    res.status(400).json({response: 'Parameters do not match'});
                }
            } else {
                res.status(400).json({response: 'Invalid gameID'});
            }
        } else {
            res.status(401).json({response: 'Invalid JWT'});
        }
    } catch (err) {
        if (err.errors) {
            res.status(400).json({response: err.errors[0].param + ' not valid'});
        } else {
            res.status(400).json({response: err});
        }
    }	
});

router.get(baseURL + 'data', [
    header('authorization').exists().isString().trim()
], async (req, res) => {
    try {
        validationResult(req).throw();
        
        // check JWT
        if (jwtHandler.checkToken(req.header('Authorization'))) {
            const playerName = jwtHandler.getJWTName(req.header('Authorization'));
            const gameID = jwtHandler.getJWTID(req.header('Authorization'));
            // on success check gameID
            if (await dbHandler.id(gameID)) {
                // on success return personalized gameData
                res.json({response: await dbHandler.data(gameID, playerName)});
            } else {
                res.status(400).json({response: 'Invalid gameID'});
            }
        } else {
            res.status(401).json({response: 'Invalid JWT'});
        }
    } catch (err) {
        if (err.errors) {
            res.status(400).json({response: err.errors[0].param + ' not valid'});
        } else {
            res.status(400).json({response: err});
        }
    }	
});

module.exports = router;
