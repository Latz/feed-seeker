#!/usr/bin/env node

/**
 * Smoke test to verify the improvements made to FeedScout
 */

import FeedScout from './dist/feed-scout.js';

console.log('🧪 Testing FeedScout improvements...\n');

// Test 1: Input validation
console.log('1️⃣  Testing input validation...');
try {
	new FeedScout(null);
	console.log('   ❌ FAILED: Should throw error for null input');
} catch (error) {
	if (error.message.includes('non-empty string')) {
		console.log('   ✅ PASSED: Null input validation works');
	} else {
		console.log('   ❌ FAILED: Wrong error message:', error.message);
	}
}

try {
	new FeedScout('');
	console.log('   ❌ FAILED: Should throw error for empty string');
} catch (error) {
	if (error.message.includes('non-empty string')) {
		console.log('   ✅ PASSED: Empty string validation works');
	} else {
		console.log('   ❌ FAILED: Wrong error message:', error.message);
	}
}

// Test 2: URL validation
console.log('\n2️⃣  Testing URL validation...');
try {
	new FeedScout('not a valid url!!!');
	console.log('   ❌ FAILED: Should throw error for invalid URL');
} catch (error) {
	if (error.message.includes('Invalid URL')) {
		console.log('   ✅ PASSED: Invalid URL validation works');
	} else {
		console.log('   ❌ FAILED: Wrong error message:', error.message);
	}
}

// Test 3: Default timeout
console.log('\n3️⃣  Testing default timeout...');
const scout1 = new FeedScout('https://example.com');
if (scout1.options.timeout === 5) {
	console.log('   ✅ PASSED: Default timeout is set to 5 seconds');
} else {
	console.log('   ❌ FAILED: Default timeout is', scout1.options.timeout);
}

// Test 4: Custom timeout
console.log('\n4️⃣  Testing custom timeout...');
const scout2 = new FeedScout('https://example.com', { timeout: 10 });
if (scout2.options.timeout === 10) {
	console.log('   ✅ PASSED: Custom timeout is preserved');
} else {
	console.log('   ❌ FAILED: Custom timeout is', scout2.options.timeout);
}

// Test 5: Protocol handling
console.log('\n5️⃣  Testing protocol handling...');
const scout3 = new FeedScout('example.com');
if (scout3.site === 'https://example.com') {
	console.log('   ✅ PASSED: Protocol auto-added correctly');
} else {
	console.log('   ❌ FAILED: Site is', scout3.site);
}

// Test 6: Trailing slash normalization
console.log('\n6️⃣  Testing trailing slash normalization...');
const scout4 = new FeedScout('https://example.com/');
if (scout4.site === 'https://example.com') {
	console.log('   ✅ PASSED: Trailing slash removed for root');
} else {
	console.log('   ❌ FAILED: Site is', scout4.site);
}

const scout5 = new FeedScout('https://example.com/path/');
if (scout5.site === 'https://example.com/path/') {
	console.log('   ✅ PASSED: Trailing slash kept for non-root paths');
} else {
	console.log('   ❌ FAILED: Site is', scout5.site);
}

// Test 7: Event system
console.log('\n7️⃣  Testing event system...');
const scout6 = new FeedScout('https://example.com');
let eventFired = false;
scout6.on('error', (data) => {
	eventFired = true;
});

if (typeof scout6.on === 'function' && typeof scout6.emit === 'function') {
	console.log('   ✅ PASSED: Event system methods available');
} else {
	console.log('   ❌ FAILED: Event system not properly inherited');
}

console.log('\n✨ All smoke tests completed!\n');
