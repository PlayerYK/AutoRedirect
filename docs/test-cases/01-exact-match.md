# 🎯 Exact Match Redirect
<p class="description">Redirects only when the URL is an exact match. This is the safest redirection method.</p>

## Configuration Rule

```ini
# Exact Match Test Configuration
=localhost:3000####https://www.example.com
=file:///Downloads/full/test_local.html####https://www.example.com/full/
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}
```

## 💡 Rule Description
Use the `=` prefix for an exact match. The redirect is triggered only if the URL is identical.

- The safest matching method, avoiding unintended triggers.
- Suitable for redirecting specific domains or full URLs.
- Supports exact path matching for local files.
- Supports generic paths across different users (using the `*` wildcard).
- Recommended for critical redirection rules in a production environment.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Test Method:</strong>
    <span>Enter <code>localhost:3000</code> in the address bar.</span>
  </div>
  <div class="test-link">
    <strong>Local File Test:</strong>
    <span>Open <code>file:///Downloads/full/test_local.html</code>.</span>
  </div>
  <div class="test-link">
    <strong>Cross-User Path Test:</strong>
    <span>Open <code>file:///Users/[YourUsername]/dev/[YourProject]/pickone/test.html</code>.</span>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>Automatically redirects to the corresponding target URL.</span>
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
}
</style> 