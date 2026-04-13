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
