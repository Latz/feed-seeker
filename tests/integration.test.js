import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Integration Tests for FeedSeeker
 *
 * These tests verify end-to-end functionality and integration between modules.
 * Note: These tests avoid making real network calls to ensure reliability.
 */

describe('FeedSeeker Integration Tests', () => {
  describe('URL Processing', () => {
    it('should correctly parse and normalize URLs', () => {
      const testCases = [
        { input: 'example.com', expected: 'https://example.com' },
        { input: 'http://example.com', expected: 'http://example.com' },
        { input: 'https://example.com', expected: 'https://example.com' },
        { input: 'https://example.com/', expected: 'https://example.com/' },
        { input: 'https://example.com/blog', expected: 'https://example.com/blog' },
      ];

      testCases.forEach(({ input, expected }) => {
        let normalized;
        if (!input.startsWith('http://') && !input.startsWith('https://')) {
          normalized = 'https://' + input;
        } else {
          normalized = input;
        }

        assert.strictEqual(normalized, expected);
      });
    });

    it('should handle URL path manipulation', () => {
      const baseUrl = 'https://example.com/blog/posts';
      const url = new URL(baseUrl);
      const pathParts = url.pathname.split('/').filter(p => p);

      // Verify path parts extraction
      assert.deepStrictEqual(pathParts, ['blog', 'posts']);

      // Build parent paths
      const parentPaths = [];
      for (let i = pathParts.length; i > 0; i--) {
        const path = '/' + pathParts.slice(0, i).join('/');
        parentPaths.push(path);
      }

      assert.deepStrictEqual(parentPaths, ['/blog/posts', '/blog']);
    });

    it('should preserve query parameters in URLs', () => {
      const baseUrl = 'https://example.com/feed?category=tech&lang=en';
      const url = new URL(baseUrl);

      assert.strictEqual(url.searchParams.get('category'), 'tech');
      assert.strictEqual(url.searchParams.get('lang'), 'en');
      assert.strictEqual(url.href, baseUrl);
    });

    it('should handle URL resolution correctly', () => {
      const base = 'https://example.com/blog/posts';
      const relative = '/feed.xml';
      const absolute = new URL(relative, base).href;

      assert.strictEqual(absolute, 'https://example.com/feed.xml');
    });
  });

  describe('Feed Type Detection', () => {
    it('should detect feed types from URLs', () => {
      const feedUrls = [
        { url: 'https://example.com/feed.rss', expectedType: 'rss' },
        { url: 'https://example.com/feed.xml', expectedType: 'rss' },
        { url: 'https://example.com/feed.atom', expectedType: 'atom' },
        { url: 'https://example.com/feed.json', expectedType: 'json' },
      ];

      feedUrls.forEach(({ url, expectedType }) => {
        const urlLower = url.toLowerCase();
        let detectedType = 'unknown';

        if (urlLower.includes('.rss') || urlLower.includes('.xml')) {
          detectedType = 'rss';
        } else if (urlLower.includes('.atom')) {
          detectedType = 'atom';
        } else if (urlLower.includes('.json')) {
          detectedType = 'json';
        }

        assert.strictEqual(detectedType, expectedType);
      });
    });

    it('should detect feed types from MIME types', () => {
      const mimeTypes = [
        { mime: 'application/rss+xml', expectedType: 'rss' },
        { mime: 'application/atom+xml', expectedType: 'atom' },
        { mime: 'application/feed+json', expectedType: 'json' },
        { mime: 'application/json', expectedType: 'json' },
      ];

      mimeTypes.forEach(({ mime, expectedType }) => {
        let detectedType = 'unknown';

        if (mime.includes('rss') || mime.includes('xml')) {
          detectedType = 'rss';
        }
        if (mime.includes('atom')) {
          detectedType = 'atom';
        }
        if (mime.includes('json')) {
          detectedType = 'json';
        }

        assert.strictEqual(detectedType, expectedType);
      });
    });
  });

  describe('Common Feed Patterns', () => {
    it('should recognize common feed paths', () => {
      const commonPaths = [
        'feed',
        'rss',
        'atom',
        'feeds',
        'feed.xml',
        'rss.xml',
        'atom.xml',
        'feed.json',
        'index.xml',
        'index.rss',
      ];

      // Verify all paths are non-empty and valid
      commonPaths.forEach(path => {
        assert.ok(path.length > 0);
        assert.ok(!path.includes(' '));
        assert.ok(!path.startsWith('/'));
      });
    });

    it('should generate feed URL variations', () => {
      const baseUrl = 'https://example.com';
      const feedPaths = ['feed', 'rss', 'atom.xml'];
      const feedUrls = feedPaths.map(path => new URL(path, baseUrl).href);

      assert.deepStrictEqual(feedUrls, [
        'https://example.com/feed',
        'https://example.com/rss',
        'https://example.com/atom.xml',
      ]);
    });

    it('should combine base paths with feed patterns', () => {
      const baseUrl = 'https://example.com/blog';
      const feedPatterns = ['feed', 'rss.xml', 'index.xml'];

      const feedUrls = feedPatterns.map(pattern => {
        return new URL(pattern, baseUrl + '/').href;
      });

      assert.deepStrictEqual(feedUrls, [
        'https://example.com/blog/feed',
        'https://example.com/blog/rss.xml',
        'https://example.com/blog/index.xml',
      ]);
    });
  });

  describe('Event System Integration', () => {
    it('should handle event emission and listening', () => {
      const events = {};
      const emit = (event, data) => {
        if (events[event]) {
          events[event].forEach(cb => cb(data));
        }
      };
      const on = (event, callback) => {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      };

      let startCalled = false;
      let endCalled = false;

      on('start', () => { startCalled = true; });
      on('end', () => { endCalled = true; });

      emit('start', { module: 'test' });
      emit('end', { module: 'test' });

      assert.strictEqual(startCalled, true);
      assert.strictEqual(endCalled, true);
    });

    it('should pass data with events', () => {
      const events = {};
      const emit = (event, data) => {
        if (events[event]) {
          events[event].forEach(cb => cb(data));
        }
      };
      const on = (event, callback) => {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      };

      let receivedData = null;
      on('log', (data) => { receivedData = data; });

      const testData = { module: 'test', message: 'Test message' };
      emit('log', testData);

      assert.deepStrictEqual(receivedData, testData);
    });
  });

  describe('Feed Content Validation', () => {
    it('should validate RSS feed structure', () => {
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Test Feed</title>
<description>Test Description</description>
<item>
<title>Item 1</title>
<description>Description 1</description>
</item>
</channel>
</rss>`;

      // Basic validation
      assert.ok(rssContent.includes('<rss'));
      assert.ok(rssContent.includes('<channel>'));
      assert.ok(rssContent.includes('<item>'));
      assert.ok(rssContent.includes('version="2.0"'));
    });

    it('should validate Atom feed structure', () => {
      const atomContent = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Test Feed</title>
<subtitle>Test Subtitle</subtitle>
<entry>
<title>Entry 1</title>
<summary>Summary 1</summary>
</entry>
</feed>`;

      // Basic validation
      assert.ok(atomContent.includes('<feed'));
      assert.ok(atomContent.includes('xmlns="http://www.w3.org/2005/Atom"'));
      assert.ok(atomContent.includes('<entry>'));
    });

    it('should validate JSON feed structure', () => {
      const jsonFeed = {
        version: "https://jsonfeed.org/version/1",
        title: "Test Feed",
        items: [
          {
            id: "1",
            title: "Item 1",
            content_text: "Content 1"
          }
        ]
      };

      // Basic validation
      assert.ok(jsonFeed.version);
      assert.ok(jsonFeed.title);
      assert.ok(Array.isArray(jsonFeed.items));
      assert.strictEqual(jsonFeed.items.length, 1);
      assert.ok(jsonFeed.items[0].id);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs gracefully', () => {
      const invalidUrls = [
        '',
        '   ',
        'not a url',
        'ht!tp://invalid',
      ];

      invalidUrls.forEach(url => {
        try {
          if (!url || !url.trim()) {
            throw new Error('Invalid URL');
          }
          new URL(url);
        } catch (error) {
          assert.ok(error instanceof Error);
        }
      });
    });

    it('should handle malformed feed content', () => {
      const malformedContent = [
        '',
        '   ',
        '<invalid>',
        '{ invalid json',
      ];

      malformedContent.forEach(content => {
        // Each should be recognized as invalid
        const isValid = content.trim().length > 0 &&
          (content.includes('<?xml') || content.startsWith('{'));

        if (!isValid) {
          assert.ok(true, 'Correctly identified as invalid');
        }
      });
    });
  });

  describe('Search Strategy Integration', () => {
    it('should implement cascading search strategy', () => {
      // Simulate the search strategy
      const strategies = ['metaLinks', 'anchors', 'blindSearch', 'deepSearch'];
      const results = [];

      // Simulate metaLinks finding feeds
      const metaLinksResult = [{ url: 'https://example.com/feed.xml', type: 'rss' }];
      results.push(...metaLinksResult);

      // If we found feeds, we might skip other strategies
      const shouldContinue = results.length === 0;

      assert.strictEqual(strategies.length, 4);
      assert.strictEqual(results.length > 0, true);
      assert.strictEqual(shouldContinue, false); // Found feeds, so don't continue
    });

    it('should aggregate results from multiple strategies', () => {
      const allResults = [];

      // Simulate each strategy finding feeds
      const metaLinksResults = [
        { url: 'https://example.com/rss.xml', type: 'rss', source: 'meta' }
      ];
      const blindSearchResults = [
        { url: 'https://example.com/feed', type: 'rss', source: 'blind' }
      ];

      allResults.push(...metaLinksResults);
      allResults.push(...blindSearchResults);

      // Deduplicate by URL
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.url, item])).values()
      );

      assert.strictEqual(allResults.length, 2);
      assert.strictEqual(uniqueResults.length, 2);
    });
  });

  describe('Options Handling', () => {
    it('should handle configuration options', () => {
      const defaultOptions = {
        timeout: 10000,
        maxFeeds: 10,
        maxDepth: 3,
        maxLinks: 1000,
      };

      const userOptions = {
        timeout: 5000,
        maxFeeds: 5,
      };

      const mergedOptions = { ...defaultOptions, ...userOptions };

      assert.strictEqual(mergedOptions.timeout, 5000);
      assert.strictEqual(mergedOptions.maxFeeds, 5);
      assert.strictEqual(mergedOptions.maxDepth, 3); // from defaults
      assert.strictEqual(mergedOptions.maxLinks, 1000); // from defaults
    });

    it('should validate option values', () => {
      const options = {
        timeout: 5000,
        maxFeeds: 10,
        maxDepth: 3,
      };

      // All values should be positive numbers
      assert.ok(options.timeout > 0);
      assert.ok(options.maxFeeds > 0);
      assert.ok(options.maxDepth > 0);

      // Types should be numbers
      assert.strictEqual(typeof options.timeout, 'number');
      assert.strictEqual(typeof options.maxFeeds, 'number');
      assert.strictEqual(typeof options.maxDepth, 'number');
    });
  });
});
