let io = undefined;

/**
 * 
 * @param {*} _io 
 * @param {*} socket 
 */
const socketHandler = function(_io, socket) {
    // console.log('New Socket connection');
    io = _io;
    
    if (socket.handshake.query.gameID) {
        gameID = socket.handshake.query.gameID;
        if (gameID != 0) {
            socket.join(gameID);
            socket.emit('refresh');
            console.log('New socket connection for game: ', gameID);
        }
    } else {
        console.log('No gameID');
    }
}

/**
 * 
 * @param {Number} gameID 
 */
function updatePlayers(gameID) {
    if (!isNaN(gameID)) {
        // console.log(io ? true : false);
        if (io) {
            io.to(gameID).emit('refresh');
        }
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