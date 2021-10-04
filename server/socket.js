const { Server } = require("socket.io");

var SocketClient = require('./client');

let io;

module.exports = class SocketServer{

    constructor(server) {
        io = new Server(server);
        io.on('connection', (socket) => this.handleConnection(socket));
    }

    handleConnection(socket) {
        console.log('a user connected');
        new SocketClient(socket, io);
    }
}


