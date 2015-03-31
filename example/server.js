/**
 * Created by Andrew D.Laptev<a.d.laptev@gmail.com> on 30.03.15.
 */

const app = require('express')()
	, server = require('http').Server(app)
	, io = require('socket.io')(server)
	, rtsp = require('../lib/rtsp-ffmpeg')
	;

server.listen(6147);

var cams = [
		'rtsp://r3---sn-5hn7su76.c.youtube.com/CiILENy73wIaGQnup-1SztVOYBMYESARFEgGUgZ2aWRlb3MM/0/0/0/video.3gp'
		, 'rtsp://192.168.68.111/h264main'
		, 'rtsp://r1---sn-5hn7su76.c.youtube.com/CiILENy73wIaGQn8uA5p5adowhMYDSANFEgGUgZ2aWRlb3MM/0/0/0/video.3gp'
	].map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri});
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
