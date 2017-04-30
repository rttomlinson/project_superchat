const socketio = require("socket.io");

module.exports = function(wagner) {

    wagner.factory('io', function(server) {
        let io = socketio(server);
        return io;
    });



};
