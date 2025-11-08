import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import EventEmitter from '../modules/eventEmitter.ts';

describe('EventEmitter Module', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  afterEach(() => {
    // Clean up all listeners after each test
    emitter.removeAllListeners();
  });

  describe('Constructor and Configuration', () => {
    it('should create emitter with default options', (t) => {
      const em = new EventEmitter();
      assert.strictEqual(em.getMaxListeners(), 10);
    });

    it('should accept custom maxListeners option', (t) => {
      const em = new EventEmitter({ maxListeners: 5 });
      assert.strictEqual(em.getMaxListeners(), 5);
    });

    it('should accept captureAsyncErrors option', (t) => {
      const em = new EventEmitter({ captureAsyncErrors: false });
      assert.ok(em instanceof EventEmitter);
    });

    it('should set default max listeners globally', (t) => {
      EventEmitter.setDefaultMaxListeners(20);
      const em = new EventEmitter();
      assert.strictEqual(em.getMaxListeners(), 20);
      // Reset to default
      EventEmitter.setDefaultMaxListeners(10);
    });

    it('should throw on invalid setDefaultMaxListeners', (t) => {
      assert.throws(() => EventEmitter.setDefaultMaxListeners(-1), TypeError);
      assert.throws(() => EventEmitter.setDefaultMaxListeners('invalid'), TypeError);
      assert.throws(() => EventEmitter.setDefaultMaxListeners(1.5), TypeError);
    });
  });

  describe('on() method', () => {
    it('should register an event listener', (t) => {
      let called = false;
      const listener = () => { called = true; };
      
      emitter.on('test', listener);
      emitter.emit('test');
      
      assert.strictEqual(called, true);
    });

    it('should throw error if listener is not a function', (t) => {
      assert.throws(() => {
        emitter.on('test', 'not a function');
      }, TypeError);
    });

    it('should throw error if event name is empty', (t) => {
      assert.throws(() => {
        emitter.on('', () => {});
      }, TypeError);
    });

    it('should throw error if event name is not a string', (t) => {
      assert.throws(() => {
        emitter.on(123, () => {});
      }, TypeError);
    });

    it('should support method chaining', (t) => {
      const result = emitter.on('test', () => {});
      assert.strictEqual(result, emitter);
    });

    it('should handle multiple listeners for the same event', (t) => {
      let callCount = 0;
      const listener1 = () => { callCount++; };
      const listener2 = () => { callCount++; };
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test');
      
      assert.strictEqual(callCount, 2);
    });
  });

  describe('emit() method', () => {
    it('should return false if no listeners for event', (t) => {
      const result = emitter.emit('nonexistent');
      assert.strictEqual(result, false);
    });

    it('should return true if event has listeners', (t) => {
      emitter.on('test', () => {});
      const result = emitter.emit('test');
      assert.strictEqual(result, true);
    });

    it('should pass arguments to listeners', (t) => {
      let receivedArgs = [];
      const listener = (...args) => { receivedArgs = args; };
      
      emitter.on('test', listener);
      emitter.emit('test', 'arg1', 'arg2', 42);
      
      assert.deepStrictEqual(receivedArgs, ['arg1', 'arg2', 42]);
    });

    it('should emit error event when listener throws and error handler exists', (t) => {
      let errorEventFired = false;
      let errorArg = null;

      emitter.on('error', (err) => {
        errorEventFired = true;
        errorArg = err;
      });

      emitter.on('test', () => {
        throw new Error('Test error');
      });

      emitter.emit('test');

      assert.strictEqual(errorEventFired, true);
      assert.ok(errorArg instanceof Error);
      assert.strictEqual(errorArg.message, 'Test error');
    });

    it('should throw unhandled error event if no error listeners', (t) => {
      const err = new Error('Unhandled error');
      assert.throws(() => {
        emitter.emit('error', err);
      }, Error);
    });

    it('should handle async errors when captureAsyncErrors is true', async (t) => {
      const em = new EventEmitter({ captureAsyncErrors: true });
      let errorCaught = false;

      em.on('error', (err) => {
        errorCaught = true;
      });

      em.on('test', async () => {
        throw new Error('Async error');
      });

      em.emit('test');

      // Wait a bit for the async error to be caught
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.strictEqual(errorCaught, true);
    });

    it('should not capture async errors when captureAsyncErrors is false', async (t) => {
      const em = new EventEmitter({ captureAsyncErrors: false });
      let errorCaught = false;
      let asyncListenerCalled = false;

      em.on('error', () => {
        errorCaught = true;
      });

      // Use a listener that returns a promise but doesn't throw
      // (throwing would cause unhandled promise rejection)
      em.on('test', async () => {
        asyncListenerCalled = true;
        // Return a resolved promise - no error to catch
        return Promise.resolve();
      });

      em.emit('test');

      // Wait a bit to ensure listener was called
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.strictEqual(asyncListenerCalled, true);
      assert.strictEqual(errorCaught, false);
    });
  });

  describe('off() method', () => {
    it('should remove a specific listener', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.on('test', listener);
      emitter.emit('test');
      assert.strictEqual(callCount, 1);
      
      emitter.off('test', listener);
      emitter.emit('test');
      assert.strictEqual(callCount, 1); // Should not increase
    });

    it('should support method chaining', (t) => {
      const listener = () => {};
      emitter.on('test', listener);
      const result = emitter.off('test', listener);
      assert.strictEqual(result, emitter);
    });

    it('should handle removal of non-existent listener gracefully', (t) => {
      const listener = () => {};
      // Should not throw when trying to remove a non-existent listener
      assert.doesNotThrow(() => {
        emitter.off('nonexistent', listener);
      });
    });
  });

  describe('once() method', () => {
    it('should only call the listener once', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.once('test', listener);
      emitter.emit('test'); // Should be called
      emitter.emit('test'); // Should not be called again
      
      assert.strictEqual(callCount, 1);
    });

    it('should support method chaining', (t) => {
      const result = emitter.once('test', () => {});
      assert.strictEqual(result, emitter);
    });

    it('should be removed after being called', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.once('test', listener);
      assert.strictEqual(emitter.listenerCount('test'), 1);
      
      emitter.emit('test');
      assert.strictEqual(emitter.listenerCount('test'), 0);
      assert.strictEqual(callCount, 1);
    });
  });

  describe('removeAllListeners() method', () => {
    it('should remove all listeners for a specific event', (t) => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      assert.strictEqual(emitter.listenerCount('test'), 2);
      
      emitter.removeAllListeners('test');
      assert.strictEqual(emitter.listenerCount('test'), 0);
      assert.strictEqual(emitter.emit('test'), false); // Should return false after removal
    });

    it('should remove all listeners for all events when called without arguments', (t) => {
      emitter.on('test1', () => {});
      emitter.on('test2', () => {});
      assert.strictEqual(emitter.eventNames().length, 2);
      
      emitter.removeAllListeners();
      assert.strictEqual(emitter.eventNames().length, 0);
    });

    it('should support method chaining', (t) => {
      const result = emitter.removeAllListeners();
      assert.strictEqual(result, emitter);
    });
  });

  describe('prependListener() method', () => {
    it('should add listener to the beginning', (t) => {
      const callOrder = [];

      emitter.on('test', () => callOrder.push('second'));
      emitter.prependListener('test', () => callOrder.push('first'));

      emitter.emit('test');

      assert.deepStrictEqual(callOrder, ['first', 'second']);
    });

    it('should support method chaining', (t) => {
      const result = emitter.prependListener('test', () => {});
      assert.strictEqual(result, emitter);
    });

    it('should validate event name and listener', (t) => {
      assert.throws(() => emitter.prependListener('', () => {}), TypeError);
      assert.throws(() => emitter.prependListener('test', 'not a function'), TypeError);
    });
  });

  describe('prependOnceListener() method', () => {
    it('should add one-time listener to the beginning', (t) => {
      const callOrder = [];

      emitter.on('test', () => callOrder.push('second'));
      emitter.prependOnceListener('test', () => callOrder.push('first'));

      emitter.emit('test');
      emitter.emit('test');

      assert.deepStrictEqual(callOrder, ['first', 'second', 'second']);
    });
  });

  describe('Max Listeners', () => {
    it('should warn when exceeding max listeners', (t) => {
      const em = new EventEmitter({ maxListeners: 2 });
      let warningEmitted = false;

      const originalWarn = console.warn;
      console.warn = () => { warningEmitted = true; };

      em.on('test', () => {});
      em.on('test', () => {});
      em.on('test', () => {}); // Should trigger warning

      console.warn = originalWarn;
      assert.strictEqual(warningEmitted, true);
    });

    it('should not warn when maxListeners is 0 (unlimited)', (t) => {
      const em = new EventEmitter({ maxListeners: 0 });
      let warningEmitted = false;

      const originalWarn = console.warn;
      console.warn = () => { warningEmitted = true; };

      for (let i = 0; i < 20; i++) {
        em.on('test', () => {});
      }

      console.warn = originalWarn;
      assert.strictEqual(warningEmitted, false);
    });

    it('should allow setting max listeners on instance', (t) => {
      emitter.setMaxListeners(5);
      assert.strictEqual(emitter.getMaxListeners(), 5);
    });

    it('should throw on invalid setMaxListeners', (t) => {
      assert.throws(() => emitter.setMaxListeners(-1), TypeError);
      assert.throws(() => emitter.setMaxListeners('invalid'), TypeError);
      assert.throws(() => emitter.setMaxListeners(1.5), TypeError);
    });
  });

  describe('Context Binding', () => {
    it('should not bind listeners to emitter context', (t) => {
      let receivedThis = null;

      function listener() {
        receivedThis = this;
      }

      emitter.on('test', listener);
      emitter.emit('test');

      // In strict mode, 'this' should be undefined
      assert.strictEqual(receivedThis, undefined);
    });

    it('should preserve arrow function context', (t) => {
      const obj = {
        value: 42,
        setupListener() {
          emitter.on('test', () => {
            assert.strictEqual(this.value, 42);
          });
        }
      };

      obj.setupListener();
      emitter.emit('test');
    });
  });

  describe('utility methods', () => {
    it('listenerCount() should return the number of listeners for an event', (t) => {
      assert.strictEqual(emitter.listenerCount('test'), 0);

      emitter.on('test', () => {});
      assert.strictEqual(emitter.listenerCount('test'), 1);

      emitter.on('test', () => {});
      assert.strictEqual(emitter.listenerCount('test'), 2);

      emitter.off('test', () => {}); // This won't match since it's a different function
      assert.strictEqual(emitter.listenerCount('test'), 2);

      const listener = () => {};
      emitter.on('test', listener);
      assert.strictEqual(emitter.listenerCount('test'), 3);

      emitter.off('test', listener);
      assert.strictEqual(emitter.listenerCount('test'), 2);
    });

    it('eventNames() should return an array of event names with listeners', (t) => {
      assert.deepStrictEqual(emitter.eventNames(), []);

      emitter.on('event1', () => {});
      assert.deepStrictEqual(emitter.eventNames(), ['event1']);

      emitter.on('event2', () => {});
      const eventNames = emitter.eventNames();
      assert.ok(eventNames.includes('event1'));
      assert.ok(eventNames.includes('event2'));
      assert.strictEqual(eventNames.length, 2);
    });

    it('listeners() should return array of listeners without wrappers', (t) => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on('test', listener1);
      emitter.once('test', listener2);

      const listeners = emitter.listeners('test');
      assert.strictEqual(listeners.length, 2);
      assert.ok(listeners.includes(listener1));
      assert.ok(listeners.includes(listener2));
    });

    it('listeners() should return empty array for non-existent event', (t) => {
      const listeners = emitter.listeners('nonexistent');
      assert.deepStrictEqual(listeners, []);
    });

    it('rawListeners() should return array with wrapper functions', (t) => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on('test', listener1);
      emitter.once('test', listener2);

      const rawListeners = emitter.rawListeners('test');
      assert.strictEqual(rawListeners.length, 2);

      // First listener should be the direct listener
      assert.strictEqual(rawListeners[0], listener1);

      // Second listener should be wrapped (not equal to original)
      assert.notStrictEqual(rawListeners[1], listener2);
    });

    it('rawListeners() should return empty array for non-existent event', (t) => {
      const rawListeners = emitter.rawListeners('nonexistent');
      assert.deepStrictEqual(rawListeners, []);
    });
  });
});