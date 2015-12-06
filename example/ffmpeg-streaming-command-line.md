# FFmpeg Basic Streaming Command

This is ffmpeg command line you should get familiar with.

## DirectShow

**[FFmpeg-DirecShow](https://trac.ffmpeg.org/wiki/DirectShow)**

**List of video device in you local machine : `ffmpeg -list_devices true -f dshow -i dummy`**

**Record video and save to out.mp4 : `ffmpeg -f dshow -i video="Lenovo EasyCamera" out.mp4`**

## Video Streaming Client

**[FFpmeg-StreamingGuide](https://trac.ffmpeg.org/wiki/StreamingGuide)**

**Create video streamming client to stream video from local machine to "localhost:1234" : `ffmpeg -f dshow -i video="Lenovo EasyCamera" -vcodec libx264 -tune zerolatency -b 900k -f mpegts udp://localhost:1234`**

**Set new framerate : `ffmpeg -f dshow -i video="Lenovo EasyCamera" -framerate 5 -vcodec libx264 -tune zerolatency -b 900k -f mpegts udp://localhost:1234`**

**Set change from libx264 to mpeg4 for improve performance ([from document](https://trac.ffmpeg.org/wiki/StreamingGuide) ) : `ffmpeg -f dshow -i video="Lenovo EasyCamera" -vcodec mpeg4 -tune zerolatency -preset ultrafast -f mpegts udp://localhost:1234/1234`**

**Note : ip:port is the ip:port of receiver end point or machine which will receive stream**

## Test with VLC Media Player

1. Normal user interface go to Media->Open Network Stream... or use short key `Ctrl+N`

2. Command line please read [VLC User Guide](https://www.videolan.org/doc/vlc-user-guide/en/ch04.html)

**Note : vlc use udp://@localhost:1234 in network stream url**
