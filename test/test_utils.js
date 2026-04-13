#!/usr/bin/env node

/**
 * AutoRedirect utility & edge-case tests
 * Covers: escapeHtml, isSafeUrl, parseRedirectRules (malformed input),
 *         and ConfigManager basic logic with mocked chrome APIs.
 */

const path = require('path');

// Mock chrome APIs before requiring any source modules
if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = { i18n: { getMessage: () => '' } };
}

const RE = require('../src/script/redirect-engine.js');

// ── test harness ──

let total = 0, passed = 0, failed = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    passed++;
    console.log(`\x1b[32m  PASS\x1b[0m ${name}`);
  } else {
    failed++;
    console.log(`\x1b[31m  FAIL\x1b[0m ${name}`);
  }
}

function eq(actual, expected, name) {
  total++;
  if (actual === expected) {
    passed++;
    console.log(`\x1b[32m  PASS\x1b[0m ${name}`);
  } else {
    failed++;
    console.log(`\x1b[31m  FAIL\x1b[0m ${name}  expected=${JSON.stringify(expected)}  actual=${JSON.stringify(actual)}`);
  }
}

function deepEq(actual, expected, name) {
  total++;
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passed++;
    console.log(`\x1b[32m  PASS\x1b[0m ${name}`);
  } else {
    failed++;
    console.log(`\x1b[31m  FAIL\x1b[0m ${name}  expected=${b}  actual=${a}`);
  }
}

// ── escapeHtml ──

console.log('\n\x1b[36m=== escapeHtml ===\x1b[0m');

eq(RE.escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;', 'script tag');
eq(RE.escapeHtml('a & b'), 'a &amp; b', 'ampersand');
eq(RE.escapeHtml('"hello"'), '&quot;hello&quot;', 'double quotes');
eq(RE.escapeHtml("it's"), "it&#39;s", 'single quote');
eq(RE.escapeHtml(''), '', 'empty string');
eq(RE.escapeHtml('plain text'), 'plain text', 'no special chars');
eq(RE.escapeHtml(null), 'null', 'null input coerced');
eq(RE.escapeHtml(undefined), 'undefined', 'undefined coerced');
eq(RE.escapeHtml(42), '42', 'number coerced');
eq(RE.escapeHtml(true), 'true', 'boolean coerced');
eq(RE.escapeHtml('<img onerror="x" src=x>'), '&lt;img onerror=&quot;x&quot; src=x&gt;', 'img XSS');
eq(RE.escapeHtml('a<b>c&d"e\'f'), 'a&lt;b&gt;c&amp;d&quot;e&#39;f', 'all specials combined');

// ── isSafeUrl ──

console.log('\n\x1b[36m=== isSafeUrl ===\x1b[0m');

eq(RE.isSafeUrl('https://example.com'), true, 'https');
eq(RE.isSafeUrl('http://example.com'), true, 'http');
eq(RE.isSafeUrl('file:///tmp/a.html'), true, 'file protocol');
eq(RE.isSafeUrl('javascript:alert(1)'), false, 'javascript: blocked');
eq(RE.isSafeUrl('data:text/html,<h1>'), false, 'data: blocked');
eq(RE.isSafeUrl('vbscript:MsgBox'), false, 'vbscript: blocked');
eq(RE.isSafeUrl('JAVASCRIPT:void(0)'), false, 'JAVASCRIPT uppercase');
eq(RE.isSafeUrl('  javascript:x'), false, 'leading spaces + javascript');
eq(RE.isSafeUrl(''), false, 'empty string');
eq(RE.isSafeUrl(null), false, 'null');
eq(RE.isSafeUrl(undefined), false, 'undefined');
eq(RE.isSafeUrl(123), false, 'number');
eq(RE.isSafeUrl('ftp://files.example.com'), false, 'ftp blocked (not in whitelist)');
eq(RE.isSafeUrl('/relative/path'), true, 'relative path');
eq(RE.isSafeUrl('example.com'), true, 'bare domain');

// ── parseRedirectRules ──

console.log('\n\x1b[36m=== parseRedirectRules ===\x1b[0m');

{
  const rules = RE.parseRedirectRules('');
  deepEq(rules, [], 'empty string -> empty array');
}
{
  const rules = RE.parseRedirectRules(null);
  deepEq(rules, [], 'null -> empty array');
}
{
  const rules = RE.parseRedirectRules(undefined);
  deepEq(rules, [], 'undefined -> empty array');
}
{
  const rules = RE.parseRedirectRules('# comment only');
  deepEq(rules, [], 'comment-only line -> empty');
}
{
  const rules = RE.parseRedirectRules('\n\n\n');
  deepEq(rules, [], 'blank lines -> empty');
}
{
  const rules = RE.parseRedirectRules('no separator here');
  deepEq(rules, [], 'line without #### -> skipped');
}
{
  const rules = RE.parseRedirectRules('foo.com####bar.com');
  eq(rules.length, 1, 'single valid rule -> 1 entry');
}
{
  const rules = RE.parseRedirectRules('# comment\nfoo####bar\n\nbaz####qux\n# end');
  eq(rules.length, 2, 'mixed content -> 2 rules');
}
{
  const longLine = 'a'.repeat(10000) + '####' + 'b'.repeat(10000);
  const rules = RE.parseRedirectRules(longLine);
  eq(rules.length, 1, 'very long rule line -> still parsed');
}
{
  const rules = RE.parseRedirectRules('####target.com');
  eq(rules.length, 0, 'empty source pattern -> skipped by engine');
}
{
  const rules = RE.parseRedirectRules('source.com####');
  eq(rules.length, 1, 'empty target -> parsed (URL extraction mode)');
}
{
  const rules = RE.parseRedirectRules('  foo.com  ####  bar.com  ');
  eq(rules.length, 1, 'whitespace around separator -> parsed');
}

// ── parseRedirectRules edge cases ──

console.log('\n\x1b[36m=== parseRedirectRules (edge cases) ===\x1b[0m');

{
  const rules = RE.parseRedirectRules('a####b####c');
  eq(rules.length, 1, 'multiple #### in one line -> still 1 rule');
  eq(rules[0].urlStr, 'b', 'multiple #### -> target is first segment after split');
}
{
  const rules = RE.parseRedirectRules('foo.com####bar.com\r\nbaz.com####qux.com\r\n');
  eq(rules.length, 2, 'lines with \\r\\n -> parsed correctly');
}
{
  const rules = RE.parseRedirectRules('foo.com####bar.com\r');
  eq(rules.length, 1, 'trailing \\r -> parsed');
}

// ── normalizeTargetUrl ──

console.log('\n\x1b[36m=== normalizeTargetUrl ===\x1b[0m');

eq(RE.normalizeTargetUrl('', 'https://a.com'), '', 'empty target -> empty');
eq(RE.normalizeTargetUrl(null, 'https://a.com'), null, 'null target -> null');
eq(RE.normalizeTargetUrl('https://b.com', 'https://a.com'), 'https://b.com', 'target with protocol -> unchanged');
eq(RE.normalizeTargetUrl('http://b.com', 'https://a.com'), 'http://b.com', 'http target -> unchanged');
eq(RE.normalizeTargetUrl('/path/to', 'https://a.com'), '/path/to', 'relative path -> unchanged');
eq(RE.normalizeTargetUrl('b.com/page', 'https://a.com'), 'https://b.com/page', 'no protocol + https source -> https');
eq(RE.normalizeTargetUrl('b.com/page', 'http://a.com'), 'http://b.com/page', 'no protocol + http source -> http');
eq(RE.normalizeTargetUrl('b.com', null), 'https://b.com', 'no protocol + null source -> https default');
eq(RE.normalizeTargetUrl('  b.com  ', 'https://a.com'), 'https://b.com', 'whitespace trimmed');

// ── testRedirectChain (multi-step, cycle, limit) ──

console.log('\n\x1b[36m=== testRedirectChain ===\x1b[0m');

{
  const rules = 'a.com####https://b.com\nb.com####https://c.com';
  const chain = RE.testRedirectChain('https://a.com', rules, 5);
  const types = chain.map(s => s.type);
  assert(types.includes('single'), 'multi-step: has single step');
  assert(types[types.length - 1] === 'final', 'multi-step: ends with final');
  const finalStep = chain.find(s => s.type === 'final');
  eq(finalStep.url, 'https://c.com', 'multi-step: A->B->C reaches C');
}
{
  const rules = 'a.com####https://b.com\nb.com####https://a.com';
  const chain = RE.testRedirectChain('https://a.com', rules, 10);
  const types = chain.map(s => s.type);
  assert(types.includes('cycle'), 'cycle: detected A->B->A');
}
{
  const rules = 'a.com####https://b.com\nb.com####https://c.com\nc.com####https://d.com\nd.com####https://e.com';
  const chain = RE.testRedirectChain('https://a.com', rules, 2);
  const lastStep = chain[chain.length - 1];
  eq(lastStep.type, 'limit', 'limit: maxSteps=2 triggers limit');
}
{
  const rules = 'nomatch####https://x.com';
  const chain = RE.testRedirectChain('https://other.com', rules, 5);
  eq(chain.length, 1, 'no match: single final step');
  eq(chain[0].type, 'final', 'no match: type is final');
}
{
  const rules = '=a.com####https://b.com\n=a.com####https://c.com';
  const chain = RE.testRedirectChain('http://a.com', rules, 5);
  const multiStep = chain.find(s => s.type === 'multiple');
  assert(multiStep !== undefined, 'multiple matches: detected');
  eq(multiStep.matches.length, 2, 'multiple matches: 2 targets');
}

// ── performTemplateReplacement ──

console.log('\n\x1b[36m=== performTemplateReplacement ===\x1b[0m');

{
  const pattern = '^test.com/*';
  const processed = RE.processMatchPattern(pattern);
  const result = RE.performTemplateReplacement(
    'https://test.com/hello', pattern,
    'https://dest.com/fixed', processed
  );
  eq(result, 'https://dest.com/fixed', 'no placeholders -> returns template as-is');
}
{
  const pattern = '^test.com/*';
  const processed = RE.processMatchPattern(pattern);
  const result = RE.performTemplateReplacement(
    'https://test.com/hello', pattern,
    'https://dest.com/{1}', processed
  );
  eq(result, 'https://dest.com/hello', 'placeholder {1} -> captures path');
}
{
  const pattern = '^test.com/*';
  const processed = RE.processMatchPattern(pattern);
  const result = RE.performTemplateReplacement(
    'https://test.com/hello', pattern,
    'https://dest.com/{1}/{5}', processed
  );
  assert(result !== null, 'out-of-range placeholder -> does not crash');
  assert(result.includes('{5}') || result.includes('hello'), 'out-of-range placeholder -> handled gracefully');
}

// ── testUrlMatch ──

console.log('\n\x1b[36m=== testUrlMatch ===\x1b[0m');

{
  eq(RE.testUrlMatch('https://foo.com', '^https?://foo\\.com$', 'exact'), true, 'basic exact match');
  eq(RE.testUrlMatch('https://foo.com/', '^https?://foo\\.com', 'prefix'), true, 'trailing slash normalized');
  eq(RE.testUrlMatch('foo.com', '^https?://foo\\.com$', 'exact'), true, 'no protocol -> auto-added');
  eq(RE.testUrlMatch('http://bar.com', '^https?://foo\\.com$', 'exact'), false, 'non-matching URL');
}

// ── ConfigManager mock ──

console.log('\n\x1b[36m=== ConfigManager ===\x1b[0m');

// Build a minimal mock of chrome.storage.local
const mockStorage = {};
globalThis.chrome = {
  i18n: {
    getMessage: () => '',
    getUILanguage: () => 'en'
  },
  storage: {
    local: {
      get: (keys) => {
        const result = {};
        keys.forEach(k => { if (mockStorage[k] !== undefined) result[k] = mockStorage[k]; });
        return Promise.resolve(result);
      },
      set: (obj) => {
        Object.assign(mockStorage, obj);
        return Promise.resolve();
      }
    }
  }
};

// Require config-manager (it registers a global singleton)
require('../src/script/config-manager.js');
const cm = globalThis.ConfigManager;

(async function testConfigManager() {
  // clearCache
  cm.cache = 'cached';
  cm.clearCache();
  eq(cm.cache, null, 'clearCache resets cache to null');

  // saveConfig + getConfig from cache
  await cm.saveConfig('rule1####target1');
  eq(cm.cache, 'rule1####target1', 'saveConfig sets cache');
  const fromCache = await cm.getConfig();
  eq(fromCache, 'rule1####target1', 'getConfig returns cached value');

  // hasConfig
  const has = await cm.hasConfig();
  eq(has, true, 'hasConfig returns true when config exists');

  // getConfig from local storage (no cache)
  cm.clearCache();
  const fromStorage = await cm.getConfig();
  eq(fromStorage, 'rule1####target1', 'getConfig falls back to storage when cache cleared');

  // getConfigUrl
  const url = cm.getConfigUrl();
  assert(url.endsWith('.en.txt'), 'getConfigUrl returns en URL for en locale');

  // setConfigUrl
  cm.setConfigUrl('https://custom.cdn.com/config');
  eq(cm.baseConfigUrl, 'https://custom.cdn.com/config', 'setConfigUrl updates base URL');
  eq(cm.cache, null, 'setConfigUrl clears cache');

  // setConfigUrl with full path
  cm.setConfigUrl('https://example.com/my-config.zh-CN.txt');
  eq(cm.baseConfigUrl, 'https://example.com/my-config', 'setConfigUrl strips language suffix');

  // getConfigStatus
  cm.cache = 'something';
  const status = await cm.getConfigStatus();
  eq(status.hasMemoryCache, true, 'getConfigStatus reports cache');
  eq(status.isLoading, false, 'getConfigStatus reports not loading');

  // summary
  console.log(`\n\x1b[36m=== Summary ===\x1b[0m`);
  console.log(`Total: ${total}  Passed: \x1b[32m${passed}\x1b[0m  Failed: \x1b[31m${failed}\x1b[0m`);

  if (failed > 0) {
    console.log('\x1b[31m\nSome tests failed!\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[32m\nAll tests passed!\x1b[0m');
    process.exit(0);
  }
})();
