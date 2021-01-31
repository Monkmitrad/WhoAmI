const jwt = require('jsonwebtoken');

const config = require('../config');

/**
 * 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
function newToken(gameID, playerName) {
    const newToken = jwt.sign({
        game: gameID,
        name: playerName
    }, config.get('jwt_secret'), { expiresIn: '2h' });
    return newToken;
}

/**
 * 
 * @param {String} token 
 */
function checkToken(token) {
    try {
        jwt.verify(token, config.get('jwt_secret'));
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 
 * @param {String} token 
 * @param {Number} gameID 
 * @param {String} playerName 
 */
function verifyIdentity(token, gameID, playerName) {
    try {
        if (checkToken(token)) {
            const decoded = jwt.decode(token);
            if (decoded.game === gameID && decoded.name === playerName) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * 
 * @param {String} token 
 */
function getJWTName(token) {
    return jwt.verify(token, config.get('jwt_secret')).name;
}

/**
 * 
 * @param {String} token 
 */
function getJWTID(token) {
    return jwt.verify(token, config.get('jwt_secret')).game;
}

module.exports = {
    newToken,
    checkToken,
    verifyIdentity,
    getJWTName,
    getJWTID
}