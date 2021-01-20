let io = undefined;

const socketHandler = function(_io, socket) {
    // console.log('New Socket connection');
    io = _io;
    
    if (socket.handshake.query.gameID) {
        socket.join(socket.handshake.query.gameID);
        console.log('New socket connection for game: ', socket.handshake.query.gameID);
    }

    socket.on('test', (text) => {
        console.log(text);
    });
}

function updatePlayers(gameID) {
    io.to(gameID).emit('refresh');
}

module.exports = {
    socketHandler,
    updatePlayers,
};