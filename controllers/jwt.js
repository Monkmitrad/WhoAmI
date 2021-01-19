const jwt = require('jsonwebtoken');

const config = require('../config');

function newToken(gameID, playerName) {
    const jwt = jwt.sign({
        game: gameID,
        name: playerName
    }, config.get('jwt_secret'), { expiresIn: '2h' });
    return jwt;
}

module.exports = {
    newToken
}