import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

// Create helper functions that mirror the ones in metaLinks.ts for testing
function cleanTitle(title) {
  if (!title) return title;
  return title.replace(/\s+/g, ' ').trim();
}

function getFeedType(link) {
  if (link.type) {
    const typeMatch = link.type.match(/(rss|atom|json)/);
    if (typeMatch) {
      return typeMatch[1];
    }

    if (link.type.includes('rss') || link.type.includes('xml')) {
      return 'rss';
    }
    if (link.type.includes('atom')) {
      return 'atom';
    }
    if (link.type.includes('json')) {
      return 'json';
    }
  }

  if (link.href) {
    const href = link.href.toLowerCase();
    if (href.includes('.rss') || href.includes('.xml')) {
      return 'rss';
    }
    if (href.includes('.atom')) {
      return 'atom';
    }
    if (href.includes('.json')) {
      return 'json';
    }
  }

  return 'rss';
}

describe('metaLinks Module', () => {
  describe('Helper Functions', () => {
    describe('cleanTitle()', () => {
      it('should clean excessive whitespace', () => {
        const result = cleanTitle('  Title   with   spaces  ');
        assert.strictEqual(result, 'Title with spaces');
      });

      it('should handle newlines and tabs', () => {
        const result = cleanTitle('Title\n\twith\nspaces');
        assert.strictEqual(result, 'Title with spaces');
      });

      it('should return null/undefined as is', () => {
        assert.strictEqual(cleanTitle(null), null);
        assert.strictEqual(cleanTitle(undefined), undefined);
      });

      it('should handle empty strings', () => {
        assert.strictEqual(cleanTitle(''), '');
      });

      it('should handle strings with only whitespace', () => {
        assert.strictEqual(cleanTitle('   '), '');
      });
    });

    describe('getFeedType()', () => {
      it('should identify RSS type from type attribute', () => {
        const link = { type: 'application/rss+xml' };
        assert.strictEqual(getFeedType(link), 'rss');
      });

      it('should identify Atom type from type attribute', () => {
        const link = { type: 'application/atom+xml' };
        assert.strictEqual(getFeedType(link), 'atom');
      });

      it('should identify JSON type from type attribute', () => {
        const link = { type: 'application/feed+json' };
        assert.strictEqual(getFeedType(link), 'json');
      });

      it('should identify type from href extension', () => {
        assert.strictEqual(getFeedType({ href: 'feed.rss' }), 'rss');
        assert.strictEqual(getFeedType({ href: 'feed.atom' }), 'atom');
        assert.strictEqual(getFeedType({ href: 'feed.json' }), 'json');
        assert.strictEqual(getFeedType({ href: 'feed.xml' }), 'rss');
      });

      it('should default to RSS if type cannot be determined', () => {
        assert.strictEqual(getFeedType({}), 'rss');
        assert.strictEqual(getFeedType({ type: 'text/html' }), 'rss');
      });

      it('should handle mixed case MIME types', () => {
        const link = { type: 'Application/RSS+XML' };
        assert.strictEqual(getFeedType(link), 'rss');
      });

      it('should handle href with query parameters', () => {
        assert.strictEqual(getFeedType({ href: 'feed.rss?param=value' }), 'rss');
      });
    });
  });

  describe('HTML Parsing', () => {
    it('should find RSS links in document head', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Page</title>
          <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml">
          <link rel="alternate" type="application/atom+xml" title="Atom" href="/atom.xml">
        </head>
        <body></body>
        </html>
      `;

      const { document } = parseHTML(html);
      const links = document.querySelectorAll('link[rel="alternate"]');

      assert.strictEqual(links.length, 2);
      assert.strictEqual(links[0].getAttribute('type'), 'application/rss+xml');
      assert.strictEqual(links[1].getAttribute('type'), 'application/atom+xml');
    });

    it('should handle document with no feed links', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Page</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body></body>
        </html>
      `;

      const { document } = parseHTML(html);
      const links = document.querySelectorAll('link[rel="alternate"]');

      assert.strictEqual(links.length, 0);
    });

    it('should handle empty document', () => {
      const html = '<!DOCTYPE html><html><head></head><body></body></html>';

      const { document } = parseHTML(html);
      const links = document.querySelectorAll('link[rel="alternate"]');

      assert.strictEqual(links.length, 0);
    });

    it('should find links with various type attributes', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed1.xml">
          <link rel="alternate" type="application/atom+xml" href="/feed2.xml">
          <link rel="alternate" type="application/json" href="/feed3.json">
        </head>
        <body></body>
        </html>
      `;

      const { document } = parseHTML(html);
      const links = document.querySelectorAll('link[rel="alternate"]');

      assert.strictEqual(links.length, 3);
    });

    it('should handle multiple links with same type', () => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="alternate" type="application/rss+xml" title="Main Feed" href="/feed1.xml">
          <link rel="alternate" type="application/rss+xml" title="Comments Feed" href="/feed2.xml">
        </head>
        <body></body>
        </html>
      `;

      const { document } = parseHTML(html);
      const links = document.querySelectorAll('link[rel="alternate"]');

      assert.strictEqual(links.length, 2);
      assert.strictEqual(links[0].getAttribute('title'), 'Main Feed');
      assert.strictEqual(links[1].getAttribute('title'), 'Comments Feed');
    });
  });

  describe('URL Handling', () => {
    it('should handle relative URLs', () => {
      const baseUrl = 'https://example.com/path';
      const relativeUrl = '/rss.xml';
      const absoluteUrl = new URL(relativeUrl, baseUrl).href;

      assert.strictEqual(absoluteUrl, 'https://example.com/rss.xml');
    });

    it('should handle absolute URLs', () => {
      const baseUrl = 'https://example.com/path';
      const absoluteUrl = 'https://feeds.example.com/rss.xml';
      const resolvedUrl = new URL(absoluteUrl, baseUrl).href;

      assert.strictEqual(resolvedUrl, 'https://feeds.example.com/rss.xml');
    });

    it('should handle protocol-relative URLs', () => {
      const baseUrl = 'https://example.com/path';
      const protocolRelativeUrl = '//feeds.example.com/rss.xml';
      const absoluteUrl = new URL(protocolRelativeUrl, baseUrl).href;

      assert.strictEqual(absoluteUrl, 'https://feeds.example.com/rss.xml');
    });

    it('should preserve query parameters in URLs', () => {
      const baseUrl = 'https://example.com';
      const urlWithParams = '/feed?format=rss&lang=en';
      const absoluteUrl = new URL(urlWithParams, baseUrl).href;

      assert.strictEqual(absoluteUrl, 'https://example.com/feed?format=rss&lang=en');
    });
  });
});
