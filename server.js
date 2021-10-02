const express = require( "express" );
const path = require('path');

var Comm = require('./server/comm');

const port = process.env.PORT || 5000
const app = express();

const comm = new Comm();

app.use(express.static(path.join(__dirname, '/public/static')));

console.log(path.join(__dirname, '/public/static'));

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});