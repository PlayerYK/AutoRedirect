# 🚀 Prefix Match Redirect
<p class="description">Matches URLs that start with a specified string, ideal for domain and path redirection.</p>

## Configuration Rule

```ini
# Prefix Match Test Configuration
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
^localhost:8####https://development.example.com
staging.internal*####https://staging.example.com
```

## 💡 Rule Description
Use the `^` prefix or `*` suffix for a prefix match. It's recommended to use standard domain formats.

- **Recommended Formats:** Use `.localhost`, `.local`, or `localhost` with a port.
- **Use Cases:** Development environments, internal network domains, services on specific ports.
- **Note:** Simple strings (like `dev`, `api`) might be treated as search queries when typed directly into the address bar.
- **Best Practice:** Use with bookmarks, link clicks, or programmatic access for best results.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Recommended Test:</strong>
    <span>Enter <code>dev.localhost</code> or <code>localhost:8000</code> in the address bar.</span>
  </div>
  <div class="test-link">
    <strong>Programmatic Test:</strong>
    <a href="https://staging.internal.example.com" target="_blank">staging.internal.example.com</a>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>Automatically redirects to the corresponding development or staging environment.</span>
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
.test-link a {
  font-weight: 600;
}
</style> 