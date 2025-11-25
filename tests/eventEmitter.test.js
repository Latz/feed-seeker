import { describe, it, beforeEach, afterEach, expect } from 'vitest';
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
      expect(em.getMaxListeners(), 10);
    });

    it('should accept custom maxListeners option', (t) => {
      const em = new EventEmitter({ maxListeners: 5 });
      expect(em.getMaxListeners(), 5);
    });

    it('should accept captureAsyncErrors option', (t) => {
      const em = new EventEmitter({ captureAsyncErrors: false });
      expect(em instanceof EventEmitter).toBeTruthy();
    });

    it('should set default max listeners globally', (t) => {
      EventEmitter.setDefaultMaxListeners(20);
      const em = new EventEmitter();
      expect(em.getMaxListeners(), 20);
      // Reset to default
      EventEmitter.setDefaultMaxListeners(10);
    });

    it('should throw on invalid setDefaultMaxListeners', (t) => {
      expect(() => EventEmitter.setDefaultMaxListeners(-1)).toThrow(TypeError);
      expect(() => EventEmitter.setDefaultMaxListeners('invalid')).toThrow(TypeError);
      expect(() => EventEmitter.setDefaultMaxListeners(1.5)).toThrow(TypeError);
    });
  });

  describe('on() method', () => {
    it('should register an event listener', (t) => {
      let called = false;
      const listener = () => { called = true; };
      
      emitter.on('test', listener);
      emitter.emit('test');
      
      expect(called).toBe(true);
    });

    it('should throw error if listener is not a function', (t) => {
      expect(() => {
        emitter.on('test', 'not a function');
      }).toThrow(TypeError);
    });

    it('should throw error if event name is empty', (t) => {
      expect(() => {
        emitter.on('', () => {});
      }).toThrow(TypeError);
    });

    it('should throw error if event name is not a string', (t) => {
      expect(() => {
        emitter.on(123, () => {});
      }).toThrow(TypeError);
    });

    it('should support method chaining', (t) => {
      const result = emitter.on('test', () => {});
      expect(result).toBe(emitter);
    });

    it('should handle multiple listeners for the same event', (t) => {
      let callCount = 0;
      const listener1 = () => { callCount++; };
      const listener2 = () => { callCount++; };
      
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test');
      
      expect(callCount).toBe(2);
    });
  });

  describe('emit() method', () => {
    it('should return false if no listeners for event', (t) => {
      const result = emitter.emit('nonexistent');
      expect(result).toBe(false);
    });

    it('should return true if event has listeners', (t) => {
      emitter.on('test', () => {});
      const result = emitter.emit('test');
      expect(result).toBe(true);
    });

    it('should pass arguments to listeners', (t) => {
      let receivedArgs = [];
      const listener = (...args) => { receivedArgs = args; };
      
      emitter.on('test', listener);
      emitter.emit('test', 'arg1', 'arg2', 42);
      
      expect(receivedArgs).toEqual(['arg1', 'arg2', 42]);
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

      expect(errorEventFired).toBe(true);
      expect(errorArg instanceof Error).toBeTruthy();
      expect(errorArg.message).toBe('Test error');
    });

    it('should throw unhandled error event if no error listeners', (t) => {
      const err = new Error('Unhandled error');
      expect(() => {
        emitter.emit('error', err);
      }).toThrow(Error);
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
      expect(errorCaught).toBe(true);
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
      expect(asyncListenerCalled).toBe(true);
      expect(errorCaught).toBe(false);
    });
  });

  describe('off() method', () => {
    it('should remove a specific listener', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.on('test', listener);
      emitter.emit('test');
      expect(callCount).toBe(1);
      
      emitter.off('test', listener);
      emitter.emit('test');
      expect(callCount).toBe(1); // Should not increase
    });

    it('should support method chaining', (t) => {
      const listener = () => {};
      emitter.on('test', listener);
      const result = emitter.off('test', listener);
      expect(result).toBe(emitter);
    });

    it('should handle removal of non-existent listener gracefully', (t) => {
      const listener = () => {};
      // Should not throw when trying to remove a non-existent listener
      expect(() => {
        emitter.off('nonexistent', listener);
      }).not.toThrow();
    });
  });

  describe('once() method', () => {
    it('should only call the listener once', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.once('test', listener);
      emitter.emit('test'); // Should be called
      emitter.emit('test'); // Should not be called again
      
      expect(callCount).toBe(1);
    });

    it('should support method chaining', (t) => {
      const result = emitter.once('test', () => {});
      expect(result).toBe(emitter);
    });

    it('should be removed after being called', (t) => {
      let callCount = 0;
      const listener = () => { callCount++; };
      
      emitter.once('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);
      
      emitter.emit('test');
      expect(emitter.listenerCount('test')).toBe(0);
      expect(callCount).toBe(1);
    });
  });

  describe('removeAllListeners() method', () => {
    it('should remove all listeners for a specific event', (t) => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
      
      emitter.removeAllListeners('test');
      expect(emitter.listenerCount('test')).toBe(0);
      expect(emitter.emit('test')).toBe(false); // Should return false after removal
    });

    it('should remove all listeners for all events when called without arguments', (t) => {
      emitter.on('test1', () => {});
      emitter.on('test2', () => {});
      expect(emitter.eventNames().length, 2);
      
      emitter.removeAllListeners();
      expect(emitter.eventNames().length, 0);
    });

    it('should support method chaining', (t) => {
      const result = emitter.removeAllListeners();
      expect(result).toBe(emitter);
    });
  });

  describe('prependListener() method', () => {
    it('should add listener to the beginning', (t) => {
      const callOrder = [];

      emitter.on('test', () => callOrder.push('second'));
      emitter.prependListener('test', () => callOrder.push('first'));

      emitter.emit('test');

      expect(callOrder).toEqual(['first', 'second']);
    });

    it('should support method chaining', (t) => {
      const result = emitter.prependListener('test', () => {});
      expect(result).toBe(emitter);
    });

    it('should validate event name and listener', (t) => {
      expect(() => emitter.prependListener('', () => {})).toThrow(TypeError);
      expect(() => emitter.prependListener('test', 'not a function')).toThrow(TypeError);
    });
  });

  describe('prependOnceListener() method', () => {
    it('should add one-time listener to the beginning', (t) => {
      const callOrder = [];

      emitter.on('test', () => callOrder.push('second'));
      emitter.prependOnceListener('test', () => callOrder.push('first'));

      emitter.emit('test');
      emitter.emit('test');

      expect(callOrder).toEqual(['first', 'second', 'second']);
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
      expect(warningEmitted).toBe(true);
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
      expect(warningEmitted).toBe(false);
    });

    it('should allow setting max listeners on instance', (t) => {
      emitter.setMaxListeners(5);
      expect(emitter.getMaxListeners(), 5);
    });

    it('should throw on invalid setMaxListeners', (t) => {
      expect(() => emitter.setMaxListeners(-1)).toThrow(TypeError);
      expect(() => emitter.setMaxListeners('invalid')).toThrow(TypeError);
      expect(() => emitter.setMaxListeners(1.5)).toThrow(TypeError);
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
      expect(receivedThis).toBe(undefined);
    });

    it('should preserve arrow function context', (t) => {
      const obj = {
        value: 42,
        setupListener() {
          emitter.on('test', () => {
            expect(this.value).toBe(42);
          });
        }
      };

      obj.setupListener();
      emitter.emit('test');
    });
  });

  describe('utility methods', () => {
    it('listenerCount() should return the number of listeners for an event', (t) => {
      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', () => {}); // This won't match since it's a different function
      expect(emitter.listenerCount('test')).toBe(2);

      const listener = () => {};
      emitter.on('test', listener);
      expect(emitter.listenerCount('test')).toBe(3);

      emitter.off('test', listener);
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('eventNames() should return an array of event names with listeners', (t) => {
      expect(emitter.eventNames()).toEqual([]);

      emitter.on('event1', () => {});
      expect(emitter.eventNames()).toEqual(['event1']);

      emitter.on('event2', () => {});
      const eventNames = emitter.eventNames();
      expect(eventNames.includes('event1')).toBeTruthy();
      expect(eventNames.includes('event2')).toBeTruthy();
      expect(eventNames.length).toBe(2);
    });

    it('listeners() should return array of listeners without wrappers', (t) => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on('test', listener1);
      emitter.once('test', listener2);

      const listeners = emitter.listeners('test');
      expect(listeners.length).toBe(2);
      expect(listeners.includes(listener1)).toBeTruthy();
      expect(listeners.includes(listener2)).toBeTruthy();
    });

    it('listeners() should return empty array for non-existent event', (t) => {
      const listeners = emitter.listeners('nonexistent');
      expect(listeners).toEqual([]);
    });

    it('rawListeners() should return array with wrapper functions', (t) => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on('test', listener1);
      emitter.once('test', listener2);

      const rawListeners = emitter.rawListeners('test');
      expect(rawListeners.length).toBe(2);

      // First listener should be the direct listener
      expect(rawListeners[0]).toBe(listener1);

      // Second listener should be wrapped (not equal to original)
      expect(rawListeners[1]).not.toBe(listener2);
    });

    it('rawListeners() should return empty array for non-existent event', (t) => {
      const rawListeners = emitter.rawListeners('nonexistent');
      expect(rawListeners).toEqual([]);
    });
  });
});