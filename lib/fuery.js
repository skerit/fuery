/**
 * The Fuery Class
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.1
 */
var Fuery = function Fuery() {

	// If the queue is enabled. False by default
	this.enabled = false;

	// The functions to execute
	this._queue = [];

	// The functions to execute after a pause
	this._pauseQueue = [];

	// Current running functions
	this.running = 0;

	// Is there a limit to the amount of running functions?
	this.limit = false;

	// The context functions should run in
	this.context = null;
};

/**
 * Set the context added functions should run in
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.0.1
 */
Fuery.prototype.setContext = function setContext(context) {
	this.context = context;
};

/**
 * Start the queue now.
 * If a function is provided as a parameter,
 * the queue will be started once that function calls back
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.0.1
 *
 * @param    {Function}   fnc   The optional function to execute before starting
 */
Fuery.prototype.start = function startQueue(fnc) {

	var that = this;

	// Check the pause functions again, just in cace
	that.checkPause();

	if (typeof fnc == 'function') {
		fnc(function afterStartEnabler() {
			that.enabled = true;
			that.check();
		});
	} else {
		that.enabled = true;
		that.check();
	}
};

/**
 * Add a function to the queue
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.1
 *
 * @param    {Function}   fnc      The function to queue
 * @param    {Array}      args     Arguments to pass to the function
 * @param    {Object}     options
 */
Fuery.prototype.add = function addFunction(fnc, args, options) {

	var that = this,
	    done,
	    i;

	if (!options || typeof options !== 'object') {
		options = {};
	}

	// If an ID is given, make sure this isn't already in the queue
	if (options.id) {
		for (i = 0; i < this._queue.length; i++) {
			if (this._queue[i].options.id == options.id) {
				return;
			}
		}
	} else {
		options.id = Date.now() + '-' + ~~(Math.random()*1000);
	}

	done = function doneFueryFunction() {
		that.running--;
		that.check();
	};

	this._queue.push({
		fnc: fnc,
		done: done,
		options: options,
		arguments: args
	});

	this.check();
};

/**
 * Process the queue
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Fuery.prototype.check = function check() {

	var next,
	    args,
	    i;

	// If the queue isn't enabled, do nothing
	if (!this.enabled) {
		this.checkPause();
		return;
	}

	// If there is nothing in the queue, do nothing
	if (!this._queue.length) {
		return;
	}

	// If there is a limit, and it is met, do nothing
	if (this.limit !== false && this.limit <= this.running) {
		return;
	}

	next = this._queue.shift();

	if (next && next.fnc) {

		// Increase the running count
		this.running++;

		// If the function accepts a callback, pass the done function
		if (next.fnc.length) {

			// Add the done callback function to the arguments
			args = [next.done];

			// Don't use special array functions because 'arguments' isn't an array
			if (next.arguments && next.arguments.length) {
				for (i = 0; i < next.arguments.length; i++) {
					args.push(next.arguments[i]);
				}
			}

			next.fnc.apply(this.context, args);
		} else {
			// If it does not, do the done right after
			next.fnc.call(this.context);
			next.done();
		}
	}

	// Check again
	this.check();
};

/**
 * Process the pause queue
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.1
 */
Fuery.prototype.checkPause = function checkPause() {

	var next;

	// Don't do pause functions if something is still running
	if (this.running) {
		return;
	}

	// If the pause queue is empty, do nothing
	if (!this._pauseQueue.length) {
		return;
	}

	next = this._pauseQueue.shift();

	next();

	// Check again
	setImmediate(function() {
		this.checkPause();
	});
};

/**
 * Pause the queue
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.0.1
 *
 * @param    {Function}   fnc   A function to execute after all the running
 *                              functions have finished
 */
Fuery.prototype.pause = function pauseQueue(fnc) {

	// Pause the queue
	this.enabled = false;

	if (typeof fnc == 'function') {
		// Add a function to the pause queue
		this._pauseQueue.push(fnc);
	}

	// Process the pause queue
	this.checkPause();
};

module.exports = Fuery;