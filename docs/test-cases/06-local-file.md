# 📁 Local File Redirect
<p class="description">Redirect local file paths to a remote server.</p>

## Configuration Rule

```
# Local File Redirect Test Configuration
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/
*demo_local.html$####https://www.example.com/demo/
*autoredirect_local.html$####https://www.example.com/demo/
*ChromeStore/AutoRedirect/*.html####https://www.example.com/{2}/
```

## 💡 Rule Description
Supports mapping local file paths to remote URLs, ideal for development environments.

- Supports local files via the `file://` protocol.
- Wildcards can be used for batch processing files.
- Suitable for mapping local development environments to production.
- Supports redirection while maintaining directory structure.
- Rules are prioritized: specific projects > generic matches.
- Supports placeholders like `{1}, {2}` to reference matched path segments.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>ChromeStore Project Test:</strong>
    <span>Open <code>file:///path/to/ChromeStore/localfile/test.html</code>.</span>
  </div>
  <div class="test-link">
    <strong>Generic Demo File Test:</strong>
    <span>Open <code>file:///path/to/demo_local.html</code>.</span>
  </div>
  <div class="test-link">
    <strong>AutoRedirect Project Test:</strong>
    <span>Open <code>file:///path/to/ChromeStore/AutoRedirect/test.html</code>.</span>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>Automatically redirects to the corresponding remote server address, preserving the path structure.</span>
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