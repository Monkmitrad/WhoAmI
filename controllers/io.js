let io = undefined;

const socketHandler = function(_io, socket) {
    console.log('New Socket connection');
    io = _io;
}

function updatePlayers(players) {
    io.emit('players', players);
}

function startGame(status) {
    io.emit('status', status);
}

module.exports = {
    socketHandler,
    updatePlayers,
    startGame
};