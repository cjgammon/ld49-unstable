
module.exports = class Player{

    id;
    cards;

    constructor(socket) {
        this.id = socket.id;
        this.cards = [];
    }
}
