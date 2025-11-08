/**
 * @fileoverview EventEmitter - A lightweight, high-performance event emitter implementation
 *
 * This module provides a custom EventEmitter class with modern JavaScript features
 * including private fields, Sets for O(1) lookups, and comprehensive error handling.
 *
 * @module EventEmitter
 * @version 2.0.0
 * @author latz
 * @since 1.0.0
 */

/**
 * A lightweight, high-performance event emitter implementation
 * Uses modern JavaScript features like private fields and Sets for optimal performance
 *
 * @class EventEmitter
 * @example
 * const emitter = new EventEmitter();
 *
 * // Add event listeners
 * emitter.on('data', (data) => console.log('Received:', data));
 * emitter.once('init', () => console.log('Initialized once'));
 *
 * // Emit events
 * emitter.emit('data', { message: 'Hello World' });
 * emitter.emit('init'); // Will only trigger once
 *
 * // Method chaining
 * emitter
 *   .on('start', () => console.log('Started'))
 *   .on('end', () => console.log('Ended'))
 *   .emit('start')
 *   .emit('end');
 *
 * // Error handling
 * emitter.on('error', (err) => console.error('Error:', err));
 * emitter.emit('error', new Error('Something went wrong'));
 */
export default class EventEmitter {
	/**
	 * Private field storing event listeners using Map and Set for optimal performance
	 * @private
	 * @type {Map<string, Set<Function>>}
	 */
	#events = new Map();

	/**
	 * Maximum number of listeners per event (0 = unlimited)
	 * @private
	 */
	#maxListeners;

	/**
	 * Whether to capture async errors
	 * @private
	 */
	#captureAsyncErrors;

	/**
	 * Default max listeners for all instances
	 * @private
	 */
	static #defaultMaxListeners = 10;

	/**
	 * Creates a new EventEmitter instance
	 * @param {Object} options - Configuration options
	 * @param {number} [options.maxListeners=10] - Maximum number of listeners per event (0 = unlimited)
	 * @param {boolean} [options.captureAsyncErrors=true] - Whether to capture async errors from Promise-returning listeners
	 */
	constructor(options = {}) {
		this.#maxListeners = options.maxListeners ?? EventEmitter.#defaultMaxListeners;
		this.#captureAsyncErrors = options.captureAsyncErrors ?? true;
	}

	/**
	 * Sets the default maximum number of listeners for all new EventEmitter instances
	 * @param {number} n - The maximum number of listeners (0 = unlimited)
	 */
	static setDefaultMaxListeners(n) {
		if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
			throw new TypeError('Max listeners must be a non-negative integer');
		}
		EventEmitter.#defaultMaxListeners = n;
	}

	/**
	 * Validates event name
	 * @private
	 */
	#validateEventName(event) {
		if (typeof event !== 'string' || event.trim().length === 0) {
			throw new TypeError('Event must be a non-empty string');
		}
	}

	/**
	 * Validates listener
	 * @private
	 */
	#validateListener(listener) {
		if (typeof listener !== 'function') {
			throw new TypeError('Listener must be a function');
		}
	}

	/**
	 * Checks and warns if max listeners exceeded
	 * @private
	 */
	#checkMaxListeners(event) {
		if (this.#maxListeners > 0) {
			const count = this.listenerCount(event);
			if (count > this.#maxListeners) {
				console.warn(
					`Warning: Possible EventEmitter memory leak detected. ` +
					`${count} ${event} listeners added. ` +
					`Use emitter.setMaxListeners() to increase limit`
				);
			}
		}
	}

	/**
	 * Handles errors from listener execution
	 * @private
	 */
	#handleListenerError(error, event) {
		// Special handling for 'error' event errors
		if (event === 'error') {
			// If an error event listener throws, we can't emit another error event
			// So we log and rethrow
			console.error('Error in error event listener:', error);
			throw error;
		}

		// Emit error event if there are listeners
		const errorListeners = this.#events.get('error');
		if (errorListeners && errorListeners.size > 0) {
			this.emit('error', error, event);
		} else {
			// No error listeners - throw the error
			console.error(`Unhandled error in event listener for '${event}':`, error);
			throw error;
		}
	}

	/**
	 * Adds an event listener for the specified event
	 * @param {string} event - The name of the event to listen for
	 * @param {Function} listener - The function to call when the event is emitted
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When event is not a non-empty string or listener is not a function
	 * @example
	 * emitter.on('data', (payload) => {
	 *   console.log('Received data:', payload);
	 * });
	 */
	on(event, listener) {
		this.#validateEventName(event);
		this.#validateListener(listener);

		const listeners = this.#events.get(event);
		if (!listeners) {
			this.#events.set(event, new Set([listener])); // Use Set for O(1) lookups
		} else {
			listeners.add(listener);
		}

		this.#checkMaxListeners(event);

		return this; // Enable method chaining
	}

	/**
	 * Adds an event listener to the beginning of the listeners array
	 * @param {string} event - The name of the event to listen for
	 * @param {Function} listener - The function to call when the event is emitted
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When event is not a non-empty string or listener is not a function
	 * @example
	 * emitter.prependListener('data', (payload) => {
	 *   console.log('This runs first');
	 * });
	 */
	prependListener(event, listener) {
		this.#validateEventName(event);
		this.#validateListener(listener);

		const listeners = this.#events.get(event);
		if (!listeners) {
			this.#events.set(event, new Set([listener]));
		} else {
			// Create new Set with listener first, then existing listeners
			const newListeners = new Set([listener, ...listeners]);
			this.#events.set(event, newListeners);
		}

		this.#checkMaxListeners(event);

		return this;
	}

	/**
	 * Adds a one-time event listener for the specified event
	 * The listener will be automatically removed after being called once
	 * @param {string} event - The name of the event to listen for
	 * @param {Function} listener - The function to call when the event is emitted (will be removed after first call)
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When event is not a non-empty string or listener is not a function
	 * @example
	 * emitter.once('init', () => {
	 *   console.log('This will only run once');
	 * });
	 *
	 * emitter.emit('init'); // Triggers listener
	 * emitter.emit('init'); // Does nothing - listener was removed
	 */
	once(event, listener) {
		this.#validateEventName(event);
		this.#validateListener(listener);

		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			listener(...args);
		};

		// Store reference to original listener for removal
		onceWrapper.originalListener = listener;
		return this.on(event, onceWrapper);
	}

	/**
	 * Adds a one-time event listener to the beginning of the listeners array
	 * @param {string} event - The name of the event to listen for
	 * @param {Function} listener - The function to call when the event is emitted
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When event is not a non-empty string or listener is not a function
	 */
	prependOnceListener(event, listener) {
		this.#validateEventName(event);
		this.#validateListener(listener);

		const onceWrapper = (...args) => {
			this.off(event, onceWrapper);
			listener(...args);
		};

		onceWrapper.originalListener = listener;
		return this.prependListener(event, onceWrapper);
	}

	/**
	 * Emits an event, calling all listeners registered for that event
	 * Listeners are called synchronously in the order they were added
	 * @param {string} event - The name of the event to emit
	 * @param {...any} args - Arguments to pass to the listeners
	 * @returns {boolean} True if the event had listeners, false otherwise
	 * @throws {Error} If an 'error' event is emitted with no listeners
	 * @example
	 * emitter.emit('data', { id: 1, message: 'Hello' });
	 * emitter.emit('error', new Error('Something went wrong'));
	 *
	 * const hasListeners = emitter.emit('test');
	 * console.log(hasListeners); // true if listeners exist, false otherwise
	 */
	emit(event, ...args) {
		const listeners = this.#events.get(event);

		if (!listeners || listeners.size === 0) {
			// Special case: unhandled 'error' events should throw
			if (event === 'error') {
				const error = args[0];
				if (error instanceof Error) {
					throw error;
				} else {
					throw new Error(`Unhandled error event: ${String(error)}`);
				}
			}
			return false; // Return false if no listeners
		}

		// Convert to array to avoid issues if listeners are modified during emission
		[...listeners].forEach(listener => {
			try {
				// Call listener without binding context
				const result = listener(...args);

				// Handle async errors if enabled
				if (this.#captureAsyncErrors && result instanceof Promise) {
					result.catch(error => {
						this.#handleListenerError(error, event);
					});
				}
			} catch (error) {
				this.#handleListenerError(error, event);
			}
		});

		return true; // Return true if event had listeners
	}

	/**
	 * Removes an event listener for the specified event
	 * @param {string} event - The name of the event
	 * @param {Function} listener - The specific listener function to remove (must be same reference)
	 * @returns {EventEmitter} The instance for method chaining
	 * @example
	 * const handler = (data) => console.log(data);
	 * emitter.on('test', handler);
	 * emitter.off('test', handler); // Removes the specific handler
	 */
	off(event, listener) {
		const listeners = this.#events.get(event);

		if (!listeners) return this;

		// Handle both direct listeners and once() wrappers
		// Use defensive copy to avoid modifying Set during iteration
		[...listeners].forEach(l => {
			if (l === listener || l.originalListener === listener) {
				listeners.delete(l);
			}
		});

		// Clean up empty event sets
		if (listeners.size === 0) {
			this.#events.delete(event);
		}

		return this;
	}

	/**
	 * Removes all listeners for a specific event, or all events if no event specified
	 * @param {string} [event] - The name of the event (optional, if not provided removes all listeners for all events)
	 * @returns {EventEmitter} The instance for method chaining
	 */
	removeAllListeners(event) {
		if (event) {
			this.#validateEventName(event);
			this.#events.delete(event);
		} else {
			this.#events.clear();
		}
		return this;
	}

	/**
	 * Sets the maximum number of listeners for this emitter instance
	 * @param {number} n - The maximum number of listeners (0 = unlimited)
	 * @returns {EventEmitter} The instance for method chaining
	 */
	setMaxListeners(n) {
		if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
			throw new TypeError('Max listeners must be a non-negative integer');
		}
		this.#maxListeners = n;
		return this;
	}

	/**
	 * Gets the maximum number of listeners for this emitter instance
	 * @returns {number} The maximum number of listeners
	 */
	getMaxListeners() {
		return this.#maxListeners;
	}

	/**
	 * Returns the number of listeners for a specific event
	 * @param {string} event - The name of the event
	 * @returns {number} The number of listeners for the event
	 */
	listenerCount(event) {
		const listeners = this.#events.get(event);
		return listeners ? listeners.size : 0;
	}

	/**
	 * Returns a copy of the array of listeners for the specified event
	 * Returns unwrapped listeners (without once() wrappers)
	 * @param {string} event - The name of the event
	 * @returns {Array<Function>} Array of listener functions
	 * @example
	 * const listeners = emitter.listeners('data');
	 * console.log(`There are ${listeners.length} listeners`);
	 */
	listeners(event) {
		const listeners = this.#events.get(event);
		if (!listeners) return [];

		// Return unwrapped listeners (original functions, not wrappers)
		return [...listeners].map(l => {
			return l.originalListener || l;
		});
	}

	/**
	 * Returns a copy of the array of listeners for the specified event,
	 * including any wrappers (such as those created by once())
	 * @param {string} event - The name of the event
	 * @returns {Array<Function>} Array of listener functions including wrappers
	 * @example
	 * const rawListeners = emitter.rawListeners('data');
	 */
	rawListeners(event) {
		const listeners = this.#events.get(event);
		return listeners ? [...listeners] : [];
	}

	/**
	 * Returns an array of event names that have listeners
	 * @returns {Array<string>} Array of event names
	 */
	eventNames() {
		return Array.from(this.#events.keys());
	}
}
