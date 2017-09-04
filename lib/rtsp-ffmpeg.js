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
 * @param {number|string} [options.rate] Framerate
 * @param {string} [options.resolution] Resolution in WxH format
 * @param {string|number} [options.quality] JPEG quality
 * @param {Array<string>} [options.arguments] Custom arguments for ffmpeg
 * @constructor
 */
var FFMpeg = function(options) {
	if (options.input) {
		this.input = options.input;
	} else {
		throw new Error('no `input` parameter');
	}
	this.rate = options.rate || 10;
	this.resolution = options.resolution;
	this.quality = (options.quality === undefined || options.quality === "") ? 3 : options.quality;
	this.arguments = options.arguments || [];

	this.on('newListener', newListener.bind(this));
	this.on('removeListener', removeListener.bind(this));
	if (Object.observe && (typeof Proxy !== 'function')) {
		Object.observe(this, observer.bind(this));
	}
};

util.inherits(FFMpeg, EventEmitter);

/**
 * FFMpeg command name
 * @type {string}
 */
FFMpeg.cmd = 'ffmpeg';

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

function observer(changes) {
	if (changes.some(function(change) {
		return change.type === 'update';
	})) {
		this.restart();
	}
}

FFMpeg.prototype._args = function() {
	return this.arguments.concat([
		'-loglevel', 'quiet'
		, '-i', this.input
		, '-r', this.rate.toString()]
		, this.quality ? ['-q:v', this.quality.toString()] : [],
	[
		//, '-vf', 'fps=25'
		//, '-b:v', '32k'
		'-f', 'image2'
		, '-updatefirst', '1'
		, '-'
	]
	, this.resolution ? ['-s', this.resolution] : []);
};

/**
 * Start ffmpeg spawn process
 */
FFMpeg.prototype.start = function() {
	this.child = spawn(FFMpeg.cmd, this._args());
	this.child.stdout.on('data', this.emit.bind(this, 'data'));
	this.child.stderr.on('data', function(data) {
		throw new Error(data);
	});
	this.emit('start');
	this.child.on('close', function(code) {
		if (code === 0) {
			setTimeout(FFMpeg.prototype.start.bind(this), 1000);
		}
	}.bind(this));
	/*this.child.on('error', function(code) {
	});*/
};

/**
 * Stop ffmpeg spawn process
 */
FFMpeg.prototype.stop = function() {
	this.child.kill();
	delete this.child;
	this.emit('stop');
};

/**
 * Restart ffmpeg spawn process
 */
FFMpeg.prototype.restart = function() {
	if (this.child) {
		this.stop();
		this.start();
	}
};

if (typeof Proxy === 'function') {
	FFMpeg = new Proxy(FFMpeg, {
		set: function(target, property) {
			if (property !== 'super_' && target[property] !== undefined) {
				target.restart();
			}
			return true;
		}
	});
}

module.exports.FFMpeg = FFMpeg;
