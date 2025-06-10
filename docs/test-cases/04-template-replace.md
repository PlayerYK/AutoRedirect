# 🔧 URL Template Replace
<p class="description">Perform complex URL rewriting using wildcards and placeholders.</p>

## Configuration Rule

```
# URL Template Replace Test Configuration
old-domain.com/*####new-domain.com/{1}
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}
user.com/profile/*####newuser.com/{1}/dashboard/{1}
```

## 💡 Rule Description
Use the `*` wildcard to capture URL segments and reference them with `{1}, {2}, {3}` placeholders.

- Supports domain migration while preserving path structure.
- Allows for reorganizing URL structures.
- Placeholders can be reused or selectively used.
- Ideal for complex URL rewriting needs.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Test Link:</strong>
    <a href="https://old-domain.com/path/to/page" target="_blank">old-domain.com/path/to/page</a>
  </div>
  <div class="test-link">
    <strong>Test Link:</strong>
    <a href="https://example.com/user/page/settings" target="_blank">example.com/user/page/settings</a>
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
  word-break: break-all;
}
</style> 