import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import checkFeed from '../modules/checkFeed.ts';


// Since the module doesn't export helper functions, we need to test checkFeed 
// which internally uses these helpers

describe('checkFeed Module', () => {
  describe('RSS Feed Detection', () => {
    it('should detect RSS feed with version attribute', async () => {
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Test RSS Feed</title>
<description>A test RSS feed</description>
<item>
<title>Sample Item</title>
<description>Sample description</description>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', rssContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      assert.strictEqual(result.title, 'Test RSS Feed');
    });

    it('should detect RSS feed by <item> elements', async () => {
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Another RSS Feed</title>
<description>Another test RSS feed</description>
<item>
<title>Another Item</title>
<description>Another description</description>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', rssContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      assert.strictEqual(result.title, 'Another RSS Feed');
    });

    it('should return null for non-RSS content', async () => {
      const nonRssContent = '<html><body>This is not an RSS feed</body></html>';
      
      const result = await checkFeed('https://example.com/page.html', nonRssContent);
      
      assert.strictEqual(result, null);
    });
  });

  describe('Atom Feed Detection', () => {
    it('should detect Atom feed by <entry> elements', async () => {
      const atomContent = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Test Atom Feed</title>
<subtitle>A test Atom feed</subtitle>
<entry>
<title>Sample Entry</title>
<summary>Sample summary</summary>
</entry>
</feed>`;

      const result = await checkFeed('https://example.com/atom.xml', atomContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'atom');
      assert.strictEqual(result.title, 'Test Atom Feed');
    });

    it('should return null for content without <entry> elements', async () => {
      const nonAtomContent = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Not an Atom Feed</title>
</feed>`;

      const result = await checkFeed('https://example.com/feed.xml', nonAtomContent);
      
      assert.strictEqual(result, null);
    });
  });

  describe('JSON Feed Detection', () => {
    it('should detect JSON feed with version property', async () => {
      const jsonContent = JSON.stringify({
        version: "https://jsonfeed.org/version/1",
        title: "Test JSON Feed",
        items: [
          {
            id: "1",
            title: "Sample Item",
            content_text: "Sample content"
          }
        ]
      });

      const result = await checkFeed('https://example.com/jsonfeed.json', jsonContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'json');
      assert.strictEqual(result.title, 'Test JSON Feed');
    });

    it('should detect JSON feed with items property', async () => {
      const jsonContent = JSON.stringify({
        title: "Another JSON Feed",
        items: [
          {
            id: "1",
            title: "Another Item"
          }
        ]
      });

      const result = await checkFeed('https://example.com/jsonfeed.json', jsonContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'json');
      assert.strictEqual(result.title, 'Another JSON Feed');
    });

    it('should detect JSON feed with feed_url property', async () => {
      const jsonContent = JSON.stringify({
        title: "Feed with URL",
        feed_url: "https://example.com/feed.json",
        home_page_url: "https://example.com"
      });

      const result = await checkFeed('https://example.com/feed.json', jsonContent);
      
      assert.ok(result);
      assert.strictEqual(result.type, 'json');
      assert.strictEqual(result.title, 'Feed with URL');
    });

    it('should return null for invalid JSON', async () => {
      const invalidJsonContent = '{ invalid: json }';
      
      const result = await checkFeed('https://example.com/feed.json', invalidJsonContent);
      
      assert.strictEqual(result, null);
    });
  });

  describe('Helper Functions', () => {
    // These are internal functions, so we'll test them indirectly through the main function
    it('should handle CDATA tags in RSS content', async () => {
      const rssContentWithCDATA = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title><![CDATA[Test & 'Special' Chars]]></title>
<description><![CDATA[Description with <CDATA>]]></description>
<item>
<title>Sample Item</title>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', rssContentWithCDATA);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      // Should handle CDATA and special characters properly
      assert.ok(result.title.includes('Test'));
    });

    it('should clean titles properly', async () => {
      // This will be tested through the feed title extraction
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>  Title with   excessive   whitespace  </title>
<description>Test description</description>
<item>
<title>Sample Item</title>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', rssContent);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      // Title should be cleaned of excessive whitespace
      assert.strictEqual(result.title, 'Title with excessive whitespace');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const result = await checkFeed('https://example.com/feed.xml', '');
      assert.strictEqual(result, null);
    });

    it('should handle malformed XML', async () => {
      const malformedXml = `<?xml version="1.0"?><rss><unclosed>`;
      const result = await checkFeed('https://example.com/feed.xml', malformedXml);

      // Should either return null or handle gracefully
      assert.ok(result === null || typeof result === 'object');
    });

    it('should handle feeds without titles', async () => {
      const noTitleFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<description>Feed without title</description>
<item>
<title>Sample Item</title>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', noTitleFeed);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
    });

    it('should handle very large feed content', async () => {
      // Create a feed with many items
      const items = Array.from({ length: 100 }, (_, i) => `
<item>
<title>Item ${i}</title>
<description>Description ${i}</description>
</item>`).join('');

      const largeFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Large Feed</title>
<description>Feed with many items</description>
${items}
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', largeFeed);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      assert.strictEqual(result.title, 'Large Feed');
    });

    it('should handle JSON feed with minimal properties', async () => {
      const minimalJson = JSON.stringify({
        version: "https://jsonfeed.org/version/1",
        title: "Minimal Feed"
      });

      const result = await checkFeed('https://example.com/feed.json', minimalJson);

      assert.ok(result);
      assert.strictEqual(result.type, 'json');
      assert.strictEqual(result.title, 'Minimal Feed');
    });

    it('should handle feeds with special characters in URLs', async () => {
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Test Feed</title>
<link>https://example.com/blog?category=tech&amp;lang=en</link>
<item>
<title>Sample Item</title>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml?format=rss', rssContent);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
    });
  });

  describe('Multiple Feed Formats', () => {
    it('should distinguish between RSS and Atom', async () => {
      const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>RSS</title><item><title>Item</title></item></channel></rss>`;
      const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Atom</title><entry><title>Entry</title></entry></feed>`;

      const rssResult = await checkFeed('https://example.com/rss.xml', rss);
      const atomResult = await checkFeed('https://example.com/atom.xml', atom);

      assert.strictEqual(rssResult.type, 'rss');
      assert.strictEqual(atomResult.type, 'atom');
    });

    it('should handle feeds with namespaces', async () => {
      const rssWithNamespace = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>Namespaced Feed</title>
<item>
<title>Item with namespace</title>
<content:encoded><![CDATA[<p>HTML content</p>]]></content:encoded>
</item>
</channel>
</rss>`;

      const result = await checkFeed('https://example.com/feed.xml', rssWithNamespace);

      assert.ok(result);
      assert.strictEqual(result.type, 'rss');
      assert.strictEqual(result.title, 'Namespaced Feed');
    });
  });
});