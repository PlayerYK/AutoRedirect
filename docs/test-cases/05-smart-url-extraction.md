# 🔗 Smart URL Extraction
<p class="description">Automatically extracts and decodes the target URL from redirect links.</p>

## Configuration Rule

```
# Smart URL Extraction Test Configuration
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## 💡 Rule Description
Leave the target URL empty, and the extension will automatically extract the real destination address from the URL parameters.

- Automatically decodes URL-encoded parameters.
- Skips intermediate redirect pages to go directly to the target site.
- Supports common redirect links from platforms like Zhihu and WeChat.
- Improves browsing experience and saves time.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>Test Link:</strong>
    <a href="https://link.zhihu.com/?target=https%3A//www.github.com" target="_blank">Zhihu redirecting to GitHub</a>
  </div>
  <div class="test-link">
    <strong>Expected Result:</strong>
    <span>Redirects directly to GitHub, skipping the Zhihu intermediate page.</span>
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