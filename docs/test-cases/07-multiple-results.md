# 🔀 Multiple Results Test
<p class="description">When a URL matches multiple rules, a selection page is displayed for the user to choose from.</p>

## Configuration Rule

```
# Multiple Results Test Configuration
multi####https://www.google.com
multi####https://www.bing.com
multi####https://www.yahoo.com
```

## 💡 Rule Description
When the same URL pattern matches multiple different target URLs, the extension will display a selection page.

- Allows the user to choose the desired destination website.
- Suitable for scenarios where one keyword corresponds to multiple frequently used websites.
- Provides more flexible redirection options.
- Avoids the need to remember multiple different shortcuts.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Test Method:</strong>
    <span>Create a bookmark pointing to <code>http://multi</code> or use a programmatic call.</span>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>A selection page is displayed with three options: Google, Bing, and Yahoo.</span>
  </div>
  <div class="test-link">
    <strong>💡 Tip:</strong>
    <span>Typing "multi" directly in the address bar will be treated as a search query.</span>
  </div>
</div>

<style>
.description {
  color: var(--vp-c-text-2);
  margin-top: -10px;
  margin-bottom: 20px;
}
.test-links {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}
.test-link {
  background: var(--vp-c-bg-soft);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.test-link strong {
  color: var(--vp-c-brand-1);
  display: block;
  margin-bottom: 8px;
}
.test-link code {
  background: var(--vp-c-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--vp-c-code);
  word-break: break-all;
}
.test-link a {
  font-weight: 600;
  word-break: break-all;
}
</style> 