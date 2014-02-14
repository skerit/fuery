var Fuery = function Fuery() {

	if (!(this instanceof Fuery)) return new Fuery();

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

};

/**
 * Start the queue now.
 * If a function is provided as a parameter,
 * the queue will be started once that function calls back
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
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
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
 *
 * @param    {Function}   fnc   The function to queue
 */
Fuery.prototype.add = function addFunction(fnc) {

	var that = this;

	var done = function doneFueryFunction() {
		that.running--;
		that.check();
	};

	this._queue.push({
		fnc: fnc,
		done: done
	});
};

/**
 * Process the queue
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
 */
Fuery.prototype.check = function check() {

	var next;

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
		// If the function accepts a callback, pass the done function
		if (next.fnc.length) {
			next.fnc(next.done);
		} else {
			// If it does not, do the done right after
			next.fnc();
			next.done();
		}
	}

	// Check again
	this.check();
};

/**
 * Process the pause queue
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
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
	this.checkPause();
};

/**
 * Pause the queue
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
 *
 * @param    {Function}   fnc   A function to execute after all the running
 *                              functions have finished
 */
Fuery.prototype.pause = function pauseQueue(fnc) {

	// Pause the queue
	this.enabled = false;

	// Add a function to the pause queue
	this._pauseQueue.push(fnc);

	// Process the pause queue
	this.checkPause();
};

model.exports = Fuery;