/**
 * Created by Andrew D.Laptev<a.d.laptev@gmail.com> on 30.03.15.
 */

const app = require('express')()
	, server = require('http').Server(app)
	, io = require('socket.io')(server)
	, rtsp = require('../lib/rtsp-ffmpeg')
	;
// use rtsp = require('rtsp-ffmpeg') instead if you have install the package
server.listen(6147, function(){
	console.log('Listening on localhost:6147');
});


var cams = [
		'http://webcam.mchcares.com/mjpg/video.mjpg?timestamp=1566232173730',
		'http://77.222.181.11:8080/mjpg/video.mjpg',
		'http://tamperehacklab.tunk.org:38001/nphMotionJpeg?Resolution=640x480&Quality=Clarity',
		'udp://localhost:1234', // Your rtsp stream
	].map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri, resolution: '320x240', quality: 3});
		stream.on('start', function() {
			console.log('stream ' + i + ' started');
		});
		stream.on('stop', function() {
			console.log('stream ' + i + ' stopped');
		});
		return stream;
	});

cams.forEach(function(camStream, i) {
	var ns = io.of('/cam' + i);
	ns.on('connection', function(wsocket) {
		console.log('connected to /cam' + i);
		var pipeStream = function(data) {
			wsocket.emit('data', data);
		};
		camStream.on('data', pipeStream);

		wsocket.on('disconnect', function() {
			console.log('disconnected from /cam' + i);
			camStream.removeListener('data', pipeStream);
		});
	});
});

io.on('connection', function(socket) {
	socket.emit('start', cams.length);
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
