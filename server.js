const express = require( "express" );
const path = require('path');
const http = require('http');

const port = process.env.PORT || 5000
const app = express();
const server = http.createServer(app);
var SocketServer = require('./server/socket');

new SocketServer(server);

app.use(express.static(path.join(__dirname, '/public')));

console.log(path.join(__dirname, '/public'));

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// start the Express server
server.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});