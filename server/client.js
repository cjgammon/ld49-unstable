
const Player = require('./player');
const Model = require('./model');

module.exports = class SocketClient{

    io;
    socket;
    game;
    room;
    tableCards = {};

    constructor(socket, io) {
        this.io = io;
        this.socket = socket;
        socket.on('join room', (room) => this.handleJoinRoom(room));
        socket.on('set cards', (cards) => this.handleSetCards(cards));
        socket.on('play card', (card) => this.handlePlayCard(card));
        socket.on('disconnect', () => this.handleDisconnect());
    }

    handleSetCards(cards) {
        console.log('ooh got some cards', cards.length);

        let player = this.getPlayerById(this.socket.id);
        player.cards = cards;

        this.updatePlayersData();
    }

    handlePlayCard(card) {
        console.log('play card!', card);

        if (!this.tableCards[card.owner]) {
            this.tableCards[card.owner] = [];
        }
        this.tableCards[card.owner].push(card);

        this.socket.to(this.room).emit('card played', card);

        if (this.tableCards.length > 1) {
            this.evaluate();
        }
        
        //TODO:: store this in played cards..
        //then if two cards... evaluate
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
            this.socket.emit('request cards');
            this.updatePlayersData();
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

    getPlayerById(id) {
        let players = this.game.players;

        for (let i = players.length - 1; i > -1 ; i--) {
            if (players[i].id === id) {
                return players[i];
            }
        }
    }

    updatePlayersData() {
        //this.io.to(room).emit('update players', this.game.players);

        let playerInfo = [];
        for (let i = 0; i < this.game.players.length; i++) {
            let player = this.game.players[i];
            playerInfo.push({
                id: player.id,
                cardCount: player.cards.length
            });
        }

        this.io.to(this.room).emit('update players', playerInfo);
    }
}