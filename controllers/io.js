let io = undefined;

/**
 * 
 * @param {*} _io 
 * @param {*} socket 
 */
function socketHandler(_io, socket) {
    // console.log('New Socket connection');
    io = _io;
    
    io.on('connection', (socket) => {
        if (socket.handshake.query.gameID) {
            gameID = socket.handshake.query.gameID;
            if (gameID != 0) {
                socket.join(gameID);
                console.log('New socket connection for game: ', gameID);
                
                updatePlayers(gameID);
            } else {
                console.log('GameID is: ', gameID);
            }
        } else {
            console.log('No gameID');
        }
    });
}

/**
 * 
 * @param {number} gameID 
 */
function updatePlayers(gameID) {
    if (io) {
        io.to(gameID).emit('refresh');
    }
}

function startPlayers(gameID) {
    if (io) {
        io.to(gameID).emit('start');
    }
}

module.exports = {
    socketHandler,
    updatePlayers,
    startPlayers
};