# ⚠️ Problems and Use Cases for Simple String Matching
<p class="description">Understanding the risks of simple string matching and its reasonable use in specific scenarios</p>

## Problem Example

Suppose you want to set up a shortcut for your development environment:

```
# ❌ Problematic configuration
dev####https://development.example.com
```

### 🚨 What problems does this cause?

This rule will match **any URL containing "dev"**, causing unexpected redirects:

- `https://example.com/development/guide` → Unexpected redirect!
- `https://site.com/device-info` → Unexpected redirect!  
- `https://blog.com/devops-tutorial` → Unexpected redirect!
- `https://news.com/covid-vaccine` → Unexpected redirect!

## ✅ Recommended Safe Approaches

### Option 1: Exact Match (Safest)
```
# Only matches completely identical URLs
=dev.local####https://development.example.com
```
- ✅ Only matches `http://dev.local`
- ✅ Won't accidentally match other URLs

### Option 2: Prefix Match (Recommended)
```
# Matches URLs starting with specified content
^dev.localhost####https://development.example.com
```
- ✅ Matches `http://dev.localhost`
- ✅ Matches `http://dev.localhost/any/path`
- ✅ Won't match other websites containing "dev"

### Option 3: Local Address with Port
```
# Use port numbers to avoid conflicts
^localhost:3000####https://development.example.com
```
- ✅ Matches `http://localhost:3000`
- ✅ Won't conflict with other websites

## 🎯 Reasonable Use Cases for Simple String Matching

While not recommended in general, simple string matching is relatively safe in these **specific scenarios**:

### Scenario 1: Enterprise Intranet Environment
```
# Enterprise internal unified naming convention
internal-*####https://gateway.company.com/redirect?to={1}
corp-*####https://intranet.company.com/{1}
```
**Why it's safe:**
- Intranet environment is relatively closed
- Enterprise can control URL naming conventions
- Won't access external conflicting websites

### Scenario 2: Custom Application Protocols
```
# Custom application protocols
myapp://####https://web.myapp.com/
electron-app://####https://app.example.com/
```
**Why it's safe:**
- Custom protocols have uniqueness
- Won't conflict with regular HTTP/HTTPS websites
- Application-generated URLs have fixed formats

## ⚠️ Precautions for Using Simple String Matching

If you really need to use simple string matching, please:

1. **Ensure environment isolation**: Use only in intranet or specific application environments
2. **Use unique identifiers**: Choose strings unlikely to appear on other websites
3. **Regular monitoring**: Check for unexpected matches
4. **Consider alternatives**: Prioritize exact match or prefix match

## 💡 Why These Formats Are Recommended

1. **Avoid Accidental Matches**: Won't interfere with normal web browsing
2. **Address Bar Friendly**: Can be typed directly in the address bar (like `dev.local`)
3. **Clear Semantics**: Obviously indicates local development environment
4. **Easy to Remember**: Follows common domain naming conventions

## How to Test

<div class="test-links">
  <div class="test-link">
    <strong>✅ Recommended Testing:</strong>
    <span>Type <code>dev.local</code> or <code>dev.localhost</code> in the address bar</span>
  </div>
  <div class="test-link">
    <strong>📝 Create Bookmark:</strong>
    <span>Save <code>http://dev.local</code> as a bookmark for quick access</span>
  </div>
  <div class="test-link">
    <strong>🔧 Programmatic Call:</strong>
    <span>Use <code>window.open('http://dev.local')</code> in scripts</span>
  </div>
</div>

## Summary

- ❌ **Generally avoid**: Simple string matching like `dev####`
- ✅ **Recommended first**: `=dev.local####` or `^dev.localhost####`
- 🎯 **Special scenarios acceptable**: Enterprise intranet, custom protocols, etc.
- 🛡️ **Safety first**: Convenient to use while not accidentally interfering with other websites

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