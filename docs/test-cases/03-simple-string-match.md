# ⚠️ Simple String Match (Special Cases - Use with Caution)
<p class="description">Understand the limitations and use cases for simple string matching, marked with a `danger_` prefix to indicate risk.</p>

## Configuration Rule

```
# Simple String Match Configuration (Special Cases - Use with Caution)
^danger_dev####https://development.example.com
danger_api*####https://api.example.com
^danger_docs####https://documentation.example.com
```

## ⚠️ Important Safety Notice
These simple string matching rules use the `danger_` prefix to highlight risks and limitations:

- **Address Bar Limitation:** Typing "danger_dev" directly into the Chrome address bar will be treated as a search query, leading to a search engine.
- **Safety Identifier:** The `danger_` prefix reminds users that these rules have usage restrictions.
- **Applicable Scenarios:**
  - When another application opens a URL in the browser.
  - When clicking bookmarks or web links.
  - When accessed via scripts or programmatic methods.
  - For special configurations in an enterprise intranet environment.
- **Recommended Alternative:** Use standard formats like `.localhost`, `.local`, or full domain names.
- **Testing Method:** Create a bookmark or use programmatic calls instead of typing directly into the address bar.

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>❌ Not Recommended:</strong>
    <span>Typing <code>danger_dev</code> directly in the address bar (will trigger a search).</span>
  </div>
  <div class="test-link">
    <strong>✅ Recommended:</strong>
    <span>Create a bookmark pointing to <code>http://danger_dev</code> or use a programmatic call.</span>
  </div>
  <div class="test-link">
    <strong>💡 Tip:</strong>
    <span>If you need to type directly in the address bar, please use the standard domain formats mentioned above.</span>
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