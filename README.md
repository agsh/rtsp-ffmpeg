# rtsp-ffmpeg
Lazy Node.js FFMpeg wrapper for streaming RTSP into MotionJPEG. It runs FFMpeg process only when someone is subscribed to
its `data` event. Every `data` event contains one image `Buffer` object.

## Installation

1. Download [FFmpeg](http://www.ffmpeg.org/) to your local machine.

2. Install package in your project `npm install rtsp-ffmpeg`

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
  var pipeStream = function(data) {
    socket.emit('data', data.toString('base64'));
  };
  stream.on('data', pipeStream);
  socket.on('disconnect', function() {
    stream.removeListener('data', pipeStream);
  });
});
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
```

Client (index.html):
### NB! 
this is not efficient example, but simple. For drawing images on canvas please look on this [example](https://github.com/agsh/rtsp-ffmpeg/blob/master/example/index-canvas.html) by [Seikon](https://github.com/Seikon):  
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

For more detailed example look at [/example/server.js](/example/server.js)
For large images resolution or IP cameras example check [/example/server-canvas.js](/example/server-canvas.js)

## FFMpeg

```javascript
  var ffmpeg = new FFMpeg({
    input: 'rtsp://localhost' // stream uri
    , rate: 10 // output framerate (optional)
    , resolution: '640x480' // output resolution in WxH format (optional)
    , quality: 3 // JPEG compression quality level (optional)
  });
```
