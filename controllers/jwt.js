const jwt = require('jsonwebtoken');

const config = require('../config');

function newToken(gameID, playerName) {
    const newToken = jwt.sign({
        game: gameID,
        name: playerName
    }, config.get('jwt_secret'), { expiresIn: '2h' });
    return newToken;
}

function checkToken(token) {
    try {
        jwt.verify(token, config.get('jwt_secret'));    
        return true;
    } catch (error) {
        return false;
    }
    
}

module.exports = {
    newToken,
    checkToken
}