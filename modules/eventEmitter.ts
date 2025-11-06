/**
 * @fileoverview EventEmitter - A lightweight, high-performance event emitter implementation
 *
 * This module provides a custom EventEmitter class with modern JavaScript features
 * including private fields, Sets for O(1) lookups, and comprehensive error handling.
 *
 * @module EventEmitter
 * @version 1.0.0
 * @author latz
 * @since 1.0.0
 */

/**
 * Type definition for event listener functions
 */
export type EventListener<T = any> = (...args: T[]) => void;

/**
 * Interface for wrapper functions that store a reference to the original listener
 */
interface OnceWrapper extends EventListener {
	originalListener?: EventListener;
}

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
 */
export default class EventEmitter {
	/**
	 * Private field storing event listeners using Map and Set for optimal performance
	 * @private
	 * @type {Map<string, Set<EventListener>>}
	 */
	#events: Map<string, Set<EventListener>> = new Map();

	/**
	 * Adds an event listener for the specified event
	 * @param {string} event - The name of the event to listen for
	 * @param {EventListener} listener - The function to call when the event is emitted
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When listener is not a function
	 * @example
	 * emitter.on('data', (payload) => {
	 *   console.log('Received data:', payload);
	 * });
	 */
	on(event: string, listener: EventListener): this {
		if (typeof listener !== 'function') {
			throw new TypeError('Listener must be a function');
		}

		const listeners = this.#events.get(event);
		if (!listeners) {
			this.#events.set(event, new Set([listener])); // Use Set for O(1) lookups
		} else {
			listeners.add(listener);
		}

		return this; // Enable method chaining
	}

	/**
	 * Adds a one-time event listener for the specified event
	 * The listener will be automatically removed after being called once
	 * @param {string} event - The name of the event to listen for
	 * @param {EventListener} listener - The function to call when the event is emitted (will be removed after first call)
	 * @returns {EventEmitter} The instance for method chaining
	 * @throws {TypeError} When listener is not a function
	 * @example
	 * emitter.once('init', () => {
	 *   console.log('This will only run once');
	 * });
	 *
	 * emitter.emit('init'); // Triggers listener
	 * emitter.emit('init'); // Does nothing - listener was removed
	 */
	once(event: string, listener: EventListener): this {
		if (typeof listener !== 'function') {
			throw new TypeError('Listener must be a function');
		}

		const onceWrapper: OnceWrapper = (...args: any[]) => {
			this.off(event, onceWrapper);
			listener.apply(this, args);
		};

		// Store reference to original listener for removal
		onceWrapper.originalListener = listener;
		return this.on(event, onceWrapper);
	}

	/**
	 * Emits an event, calling all listeners registered for that event
	 * Listeners are called synchronously in the order they were added
	 * @param {string} event - The name of the event to emit
	 * @param {...any} args - Arguments to pass to the listeners
	 * @returns {boolean} True if the event had listeners, false otherwise
	 * @example
	 * emitter.emit('data', { id: 1, message: 'Hello' });
	 * emitter.emit('error', new Error('Something went wrong'));
	 *
	 * const hasListeners = emitter.emit('test');
	 * console.log(hasListeners); // true if listeners exist, false otherwise
	 */
	emit(event: string, ...args: any[]): boolean {
		const listeners = this.#events.get(event);

		if (!listeners) return false; // Return false if no listeners

		// Convert to array to avoid issues if listeners are modified during emission
		[...listeners].forEach(listener => {
			try {
				listener.apply(this, args);
			} catch (error) {
				console.error(`Error in event listener for ${event}:`, error);
			}
		});

		return true; // Return true if event had listeners
	}

	/**
	 * Removes an event listener for the specified event
	 * @param {string} event - The name of the event
	 * @param {EventListener} listener - The specific listener function to remove (must be same reference)
	 * @returns {EventEmitter} The instance for method chaining
	 * @example
	 * const handler = (data) => console.log(data);
	 * emitter.on('test', handler);
	 * emitter.off('test', handler); // Removes the specific handler
	 */
	off(event: string, listener: EventListener): this {
		const listeners = this.#events.get(event);

		if (!listeners) return this;

		// Handle both direct listeners and once() wrappers
		listeners.forEach(l => {
			const onceWrapper = l as OnceWrapper;
			if (l === listener || onceWrapper.originalListener === listener) {
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
	removeAllListeners(event?: string): this {
		if (event) {
			this.#events.delete(event);
		} else {
			this.#events.clear();
		}
		return this;
	}

	/**
	 * Returns the number of listeners for a specific event
	 * @param {string} event - The name of the event
	 * @returns {number} The number of listeners for the event
	 */
	listenerCount(event: string): number {
		const listeners = this.#events.get(event);
		return listeners ? listeners.size : 0;
	}

	/**
	 * Returns an array of event names that have listeners
	 * @returns {Array<string>} Array of event names
	 */
	eventNames(): string[] {
		return Array.from(this.#events.keys());
	}
}
