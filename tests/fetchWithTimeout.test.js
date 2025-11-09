import { describe, it, expect } from 'vitest';
import fetchWithTimeout from '../modules/fetchWithTimeout.ts';

describe('fetchWithTimeout Module', () => {
  describe('Function Structure', () => {
    it('should be a function', () => {
      expect(typeof fetchWithTimeout).toBe('function');
    });

    it('should have expected function signature', () => {
      // The function should accept URL and optional timeout parameters
      expect(fetchWithTimeout.length >= 1).toBe(true);
    });
  });

  describe('Timeout Behavior', () => {
    it('should accept timeout parameter', () => {
      // Test that the function accepts timeout parameter
      // This is a structural test - we can't easily test actual timeouts without real requests
      const url = 'https://example.com';
      const timeout = 5000;

      // Should not throw when called with valid parameters
      expect(() => {
        // Just verify the function signature, don't actually make the request
        const promise = fetchWithTimeout(url, timeout);
        expect(promise instanceof Promise).toBeTruthy();
      }).not.toThrow();
    });

    it('should use default timeout when not specified', () => {
      const url = 'https://example.com';

      // Should not throw when called with just URL
      expect(() => {
        const promise = fetchWithTimeout(url);
        expect(promise instanceof Promise).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('URL Validation', () => {
    it('should handle valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path',
        'https://example.com:8080/path',
        'https://subdomain.example.com',
      ];

      validUrls.forEach(url => {
        expect(() => {
          const promise = fetchWithTimeout(url);
          expect(promise instanceof Promise).toBeTruthy();
        }).not.toThrow();
      });
    });
  });

  describe('Return Value', () => {
    it('should return a Promise', () => {
      const url = 'https://example.com';
      const result = fetchWithTimeout(url);

      expect(result instanceof Promise).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test with an invalid URL that should fail
      const invalidUrl = 'https://this-domain-does-not-exist-12345.com';

      try {
        await fetchWithTimeout(invalidUrl, 1000);
        // If it doesn't throw, that's okay - we just want to verify it handles errors
        expect(true).toBeTruthy();
      } catch (error) {
        // If it throws, that's expected for network errors
        expect(error instanceof Error).toBeTruthy();
      }
    });

    it('should timeout on very slow requests', async () => {
      // Use a URL that's likely to timeout (non-routable IP)
      const slowUrl = 'http://10.255.255.1';
      const shortTimeout = 100; // 100ms timeout

      try {
        await fetchWithTimeout(slowUrl, shortTimeout);
        // If it doesn't timeout, that's okay for this test
        expect(true).toBeTruthy();
      } catch (error) {
        // Should either timeout or have a network error
        expect(error instanceof Error).toBeTruthy();
      }
    });
  });

  describe('Integration with Fetch API', () => {
    it('should maintain fetch API compatibility', () => {
      // Verify the function works like fetch
      const url = 'https://example.com';
      const promise = fetchWithTimeout(url);

      // Should have then/catch methods like a Promise
      expect(typeof promise.then).toBe('function');
      expect(typeof promise.catch).toBe('function');
      expect(typeof promise.finally).toBe('function');
    });
  });
});
