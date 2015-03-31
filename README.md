# rtsp-ffmpeg-mjpeg
Node.js FFMpeg wrapper for streaming RTSP into MotionJPEG. It runs FFMpeg process only when someone is subscribed to
its `data` event.

## Sample
With [socket.io](http://socket.io/) library.

Server:
```javascript
const app = require('express')(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  rtsp = require('rtsp-ffmpeg');
server.listen(6147);
var uri = 'rtsp://r3---sn-5hn7su7k.c.youtube.com/CiILENy73wIaGQkcfGRribM88BMYDSANFEgGUgZ2aWRlb3MM/0/0/0/video.3gp',
  stream = new rtsp.FFMpeg({input: uri});
io.on('connection', function(socket) {
  stream.on('data', function(data) {
    socket.emit('data', data);
  });
  socket.on('disconnect', function() {
    stream.removeListener('data', pipeStream);
  });
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
```

Client (index.html):
```html
<img id="img">
<script src="/socket.io/socket.io.js"></script>
<script>
	var img = document.getElementById('img'),
		socket = io('');
	socket.on('data', function(data) {
		img.src = 'data:image/jpeg;base64,' + data;
	});
</script>
```

For more detailed example look at `/example/server.js`