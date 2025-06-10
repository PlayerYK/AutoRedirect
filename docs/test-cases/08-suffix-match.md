# 🎯 Suffix Match Redirect
<p class="description">Matches URLs that end with a specified string, suitable for specific file types or suffixes.</p>

## Configuration Rule

```
# Suffix Match Test Configuration
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

## 💡 Rule Description
Use the `*` prefix or `$` suffix to match URLs that end with a specified string.

- Suitable for redirecting specific file extensions.
- Can match domains or paths with a specific suffix.
- Supports special cases like configuration files and API endpoints.
- Can be combined with prefix matching for precise control.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Test Link:</strong>
    <a href="https://test.localprod" target="_blank">test.localprod</a>
  </div>
  <div class="test-link">
    <strong>Test Link:</strong>
    <a href="https://app.config.json" target="_blank">app.config.json</a>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>Redirects to the production environment and the configuration management page, respectively.</span>
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