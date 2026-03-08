import { describe, it, expect } from 'vitest';
import { getMainDomain, smartTruncateUrl } from '../modules/common.ts';

describe('common module', () => {
	describe('getMainDomain()', () => {
		it('returns hostname for two-part domains', () => {
			expect(getMainDomain('https://example.com')).toBe('example.com');
			expect(getMainDomain('https://example.org/path')).toBe('example.org');
		});

		it('strips www subdomain', () => {
			expect(getMainDomain('https://www.example.com')).toBe('example.com');
		});

		it('strips arbitrary subdomains', () => {
			expect(getMainDomain('https://blog.example.com')).toBe('example.com');
			expect(getMainDomain('https://feeds.news.example.com')).toBe('example.com');
		});

		it('handles country-code second-level domains (.co.uk, .com.br)', () => {
			expect(getMainDomain('https://example.co.uk')).toBe('example.co.uk');
			expect(getMainDomain('https://blog.example.co.uk')).toBe('example.co.uk');
			expect(getMainDomain('https://example.com.br')).toBe('example.com.br');
		});

		it('handles ports in URL', () => {
			expect(getMainDomain('https://example.com:8080/path')).toBe('example.com');
		});

		it('throws on invalid URL', () => {
			expect(() => getMainDomain('not-a-url')).toThrow();
		});
	});

	describe('smartTruncateUrl()', () => {
		it('returns URL unchanged when shorter than maxLength', () => {
			const short = 'https://example.com/feed';
			expect(smartTruncateUrl(short, 50)).toBe(short);
		});

		it('truncates long URLs with ellipsis', () => {
			const long = 'https://example.com/very/long/path/to/some/resource/deep/down';
			const result = smartTruncateUrl(long, 30);
			expect(result.length).toBeLessThanOrEqual(33); // some tolerance for ellipsis
			expect(result).toContain('...');
		});

		it('uses default maxLength of 50 when not specified', () => {
			const long = 'https://example.com/' + 'a'.repeat(60);
			const result = smartTruncateUrl(long);
			expect(result.length).toBeLessThanOrEqual(55);
		});

		it('returns ellipsis-truncated domain when domain alone exceeds maxLength', () => {
			const result = smartTruncateUrl('https://very-long-domain-name-example.com/path', 10);
			expect(result).toContain('...');
			expect(result.length).toBeLessThanOrEqual(13);
		});

		it('falls back to truncate-url library for invalid URLs', () => {
			// The catch block delegates to truncateUrl() which may throw on invalid input
			// Documenting actual behavior: invalid URLs propagate errors
			expect(() => smartTruncateUrl('not-a-valid-url', 20)).toThrow();
		});
	});
});
