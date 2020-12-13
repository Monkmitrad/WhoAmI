let io = undefined;

const socketHandler = function(_io, socket) {
    console.log('New Socket connection');
    io = _io;
}

module.exports = {
    socketHandler
};