const express = require('express');
const router = new express.Router();
const io = require('../controllers/io');
const db = require('../controllers/dbHandler');

const baseURL = '/api/';

/**
 * create new game
 */
router.post(baseURL + 'create', async (req, res) => {
// trigger game creation in db
    
// return gameID on success
});

/**
 * login user
 */
router.post(baseURL + 'login', async (req, res) => {
// check gameID

// on success check validity of playerName

// on success trigger player and jwt creation in db

// on success return jwt and socket id

// update game via socket
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