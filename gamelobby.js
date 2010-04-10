/**
 * A simple Game Lobby built on node.js
 * @author brit@britg.com
 * http://britg.com
 **/
var http = require('http');
var puts = require('sys').puts;
// our in-memory list of player
var players = [];

// our in-memory list of players waiting
var waiting = [];

// Define a new HTTP Server
var server = http.createServer(function (req, res) {

    // define a set of paths that respond to requests
    var paths = {

        /**
         * Requests to /join add players to our
         * player list, and fire off a notification
         * to all our waiting players
         **/
        "/join": function(req, res) {
            
            var parsed_url = require('url').parse(req.url, true);
            // extract the player from the request
            var newPlayer = parsed_url.query.player;

            // respond to this request with a list of players
            // already in the lobby
            respond(200, players);

            // add this player to list of players
            players.push(newPlayer);

            // notify all of our waiting players that
            // a new player has joined
            while(waiting.length > 0) {
                waiting.shift().callback.apply(this, [newPlayer]);
            }
        },

        /**
         * Requests to /wait holds the connection
         * open until another player joins
         **/
        "/wait": function(req, res) {

            // define our waiting player and the notification
            // callback to trigger when another player joins
            var parsed_url = require('url').parse(req.url, true);

            var waitingPlayer = {
                "player": parsed_url.query.player,
                "callback": function(newPlayer) {
                    respond(200, newPlayer);
                }
            };

            waiting.push(waitingPlayer);
        }
    };

    // tell our server to look at the paths definition
    // for a responder to the request
    var parsed_url = require('url').parse(req.url);
    try {
        paths[parsed_url.pathname].apply(this, [req, res]);
    } catch (err) {
        respond(404, err );
    }
    
    // respond to a request
    function respond(status, obj) {
        var body = JSON.stringify(obj);
        res.sendHeader(status, [ ["Content-Type", "application/json"]
                                 , ["Content-Length", body.length]
                               ]);
        res.write(body);
        res.end();
    }
});
server.listen(8000);
puts("The game lobby has started!");
