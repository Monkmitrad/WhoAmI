let io = undefined;

const socketHandler = function(_io, socket) {
    console.log('New Socket connection');
    io = _io;
}

function updatePlayers(players) {
    io.emit('players', players);
}

module.exports = {
    socketHandler,
    updatePlayers
};