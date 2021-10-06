
const Player = require('./player');
const Model = require('./model');

module.exports = class SocketClient{

    io;
    socket;
    game;
    room;

    constructor(socket, io) {
        this.io = io;
        this.socket = socket;
        socket.on('join room', (room) => this.handleJoinRoom(room));
        socket.on('set cards', (cards) => this.handleSetCards(cards));
        socket.on('play card', (card) => this.handlePlayCard(card));
        socket.on('request cards', (card) => this.handleRequestCards());
        socket.on('disconnect', () => this.handleDisconnect());
    }

    handleSetCards(cards) {
        let player = this.getPlayerById(this.socket.id);
        player.cards = cards;

        this.updatePlayersData();
    }

    handlePlayCard(card) {
        let table = Model.rooms[this.room].table;

        if (!table[card.owner]) {
            table[card.owner] = [];
        }

        table[card.owner].push(card);

        //remove card from deck..
        let player = this.getPlayerById(this.socket.id);
        for (let i = player.cards.length - 1; i > -1; i--) {
            if (player.cards[i].id === card.id) {
                player.cards.splice(i, 1);
            }
        }

        this.socket.to(this.room).emit('card played', card);

        if (Object.keys(table).length % 2 == 0) {
            console.log('evaluate');
            this.evaluate();
        }
    }

    handleJoinRoom(room) {
        this.room = room;
        this.socket.join(room);

        if (!Model.rooms[room]) {
            Model.rooms[room] = {players: [], table: {}}; //create room
        }

        this.game = Model.rooms[room];

        if (this.game.players.length < 2) {
            let player = new Player(this.socket);
            this.game.players.push(player);
            this.socket.emit('get deck');
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

        this.updatePlayersData();
    }

    evaluate() {
        let table = Model.rooms[this.room].table;

        let playerId1 = this.game.players[0].id;
        let playerId2 = this.game.players[1].id;

        let tableCards1 = table[playerId1];
        let tableCards2 = table[playerId2];

        let result = 'tie';
        for (let i = 0; i < tableCards1.length; i++) {
            if (tableCards1[i].value > tableCards2[i].value) {
                console.log('winner', playerId1);
                result = playerId1;
            } else if (tableCards1[i].value < tableCards2[i].value) {
                console.log('winner', playerId2);
                result = playerId2;
            } else if (tableCards1[i].value === tableCards2[i].value) {
                console.log('tie');
            }
        }

        //TODO:: give cards to winner...
        if (result !== 'tie') {
            let winner = this.getPlayerById(result);
            for (let i = 0; i < tableCards1.length; i++) {
                winner.cards.unshift(tableCards1[i]);
                winner.cards.unshift(tableCards2[i]);
            }

            Model.rooms[this.room].table = {};
        }

        setTimeout(() => {
            this.io.in(this.room).emit('evaluated cards', result);
        }, 2000);
    }

    handleRequestCards() {
        let player = this.getPlayerById(this.socket.id);
        let cards = player.cards;
        this.socket.emit('receive cards', cards);
        this.updatePlayersData();
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