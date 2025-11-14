class o {
  /**
   * Private field storing event listeners using Map and Set for optimal performance
   * @private
   * @type {Map<string, Set<Function>>}
   */
  #e = /* @__PURE__ */ new Map();
  // Use private field and Map for better performance
  /**
   * Adds an event listener for the specified event
   * @param {string} event - The name of the event to listen for
   * @param {Function} listener - The function to call when the event is emitted
   * @returns {EventEmitter} The instance for method chaining
   * @throws {TypeError} When listener is not a function
   * @example
   * emitter.on('data', (payload) => {
   *   console.log('Received data:', payload);
   * });
   */
  on(e, t) {
    if (typeof t != "function")
      throw new TypeError("Listener must be a function");
    const r = this.#e.get(e);
    return r ? r.add(t) : this.#e.set(e, /* @__PURE__ */ new Set([t])), this;
  }
  /**
   * Adds a one-time event listener for the specified event
   * The listener will be automatically removed after being called once
   * @param {string} event - The name of the event to listen for
   * @param {Function} listener - The function to call when the event is emitted (will be removed after first call)
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
  once(e, t) {
    if (typeof t != "function")
      throw new TypeError("Listener must be a function");
    const r = (...s) => {
      this.off(e, r), t.apply(this, s);
    };
    return r.originalListener = t, this.on(e, r);
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
  emit(e, ...t) {
    const r = this.#e.get(e);
    return r ? ([...r].forEach((s) => {
      try {
        s.apply(this, t);
      } catch (i) {
        console.error(`Error in event listener for ${e}:`, i);
      }
    }), !0) : !1;
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
  off(e, t) {
    const r = this.#e.get(e);
    return r ? (r.forEach((s) => {
      (s === t || s.originalListener === t) && r.delete(s);
    }), r.size === 0 && this.#e.delete(e), this) : this;
  }
  /**
   * Removes all listeners for a specific event, or all events if no event specified
   * @param {string} [event] - The name of the event (optional, if not provided removes all listeners for all events)
   * @returns {EventEmitter} The instance for method chaining
   */
  removeAllListeners(e) {
    return e ? this.#e.delete(e) : this.#e.clear(), this;
  }
  // New utility methods
  /**
   * Returns the number of listeners for a specific event
   * @param {string} event - The name of the event
   * @returns {number} The number of listeners for the event
   */
  listenerCount(e) {
    const t = this.#e.get(e);
    return t ? t.size : 0;
  }
  /**
   * Returns an array of event names that have listeners
   * @returns {Array<string>} Array of event names
   */
  eventNames() {
    return Array.from(this.#e.keys());
  }
}
export {
  o as default
};
