
module.exports = class Player{

    id;

    constructor(socket) {
        this.id = socket.id;
    }
}