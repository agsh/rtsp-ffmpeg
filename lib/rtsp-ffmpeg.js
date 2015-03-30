/**
 * Created by Andrew D.Laptev<a.d.laptev@gmail.com> on 30.03.15.
 */

const spawn = require('child_process').spawn
	, EventEmitter = require('events').EventEmitter
	, util = require('util')
	;

/**
 * Stream constructor
 * @param {object} options
 * @param {string} options.input Stream uri, for example rtsp://r3---sn-5hn7su76.c.youtube.com/CiILENy73wIaGQnup-1SztVOYBMYESARFEgGUgZ2aWRlb3MM/0/0/0/video.3gp
 * @param {number} [options.rate] Framerate
 * @param {string} [options.quality]
 * @constructor
 */
var FFMpeg = function(options) {
	if (options.input) {
		this.input = options.input;
	} else {
		throw new Error('no `input` parameter');
	}
	this.rate = options.rate || 4;
	this.quality = options.quality || 'qvga';


	this.on('newListener', newListener.bind(this));
	this.on('removeListener', removeListener.bind(this));
};

util.inherits(FFMpeg, EventEmitter);

function newListener(event) {
	if (event === 'data' && this.listeners(event).length === 0) {
		this.start();
	}
}

function removeListener(event) {
	if (event === 'data' && this.listeners(event).length === 0) {
		this.stop();
	}
}

FFMpeg.prototype._args = function() {
	return [
		'-loglevel', 'quiet'
		, '-y'
		, '-i', this.input
		, '-r', this.rate
		, '-s', this.quality
		, '-b:v', '32k'
		, '-f', 'image2'
		, '-updatefirst', '1'
		, '-'
	];
};

/**
 * Start ffmpeg spawn process
 */
FFMpeg.prototype.start = function() {
	this.child = spawn('ffmpeg', this._args());
	this.child.stdout.on('data', this.emit.bind(this, 'data'));
	this.child.stderr.on('data', function(data) {
		console.error(data);
	});
	this.child.on('close', function(code) {
		console.log('exited with code ' + code);
	})
};

/**
 * Stop ffmpeg spawn process
 */
FFMpeg.prototype.stop = function() {
	this.child.kill();
};

/**
 * Restart ffmpeg spawn process
 */
FFMpeg.restart = function() {
	this.stop();
	this.start();
};

module.exports.FFMpeg = FFMpeg;