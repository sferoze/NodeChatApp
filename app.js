var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	nicknames = [];

server.listen(3000);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.set('log level', 1);

io.sockets.on('connection', function(socket) { //Sockets ready function
	socket.on('new_user', function(data, callback) {// Receives username and updates array, returns false if username is taken
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		} else {
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames(); //emits usernames to all connected clients
			callback(true);
		}
	});

	function updateNicknames() {
		io.sockets.emit('usernames', nicknames); //emits usernames to all connected clients
	};

	socket.on('disconnect', function(data) { //Removes the username from array when user disconnects, then re-emits username list
		if (!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});

	socket.on('send_message', function(data) {
		io.sockets.emit('new_message', {msg: data, nick: socket.nickname});
	});
});