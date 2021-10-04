
var Player = require('./player');
var Model = require('./model');

module.exports = class SocketClient{

    io;
    socket;
    game;
    room;

    constructor(socket, io) {
        this.io = io;
        this.socket = socket;
        socket.on('joinRoom', (room) => this.handleJoinRoom(room));
        socket.on('disconnect', () => this.handleDisconnect());
    }

    handleJoinRoom(room) {
        this.room = room;
        this.socket.join(room);

        if (!Model.rooms[room]) {
            Model.rooms[room] = {players: []}; //create room
        }

        this.game = Model.rooms[room];

        if (this.game.players.length < 2) {
            let player = new Player(this.socket);
            this.game.players.push(player);
            this.io.to(room).emit('update players', this.game.players);
        } else {
            this.socket.emit('room full');
        }

    }

    handleDisconnect() {
        let players = this.game.players;

        for (let i = players.length - 1; i > 0 ; i--) {
            if (players[i].id === this.socket.id) {
                this.game.players.splice(i, 1);
            }
        }

        this.io.to(this.room).emit('update players', this.game.players);
    }
}