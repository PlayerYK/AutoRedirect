# AutoRedirect - URL Redirection

**AutoRedirect** is a powerful URL redirection Chrome extension built on Manifest V3 architecture. It enables seamless environment switching, domain migration, and link optimization, dramatically boosting your browsing and development efficiency.

## ✨ Core Features

- **🎯 Multiple Matching Modes**: Supports exact, prefix, suffix, wildcard, and other flexible matching patterns.
- **🔧 Powerful URL Templates**: Use placeholders like `{1}`, `{2}` for complex URL rewriting.
- **🔗 URL Extraction**: Automatically extract real URLs from redirect links, skipping intermediate pages.
- **📁 Local File Mapping**: Redirect local `file://` paths to remote servers.
- **🔀 Multi-Result Selection**: Provides selection page when one rule matches multiple targets.
- **🛡️ Secure & Reliable**: Built on Manifest V3 for better performance and enhanced security.

## 🚀 Core Usage Examples

```
# Scenario 1: Development Environment Switching
# Automatically redirect local service to development server
=localhost:3000####https://dev.example.com

# Scenario 2: URL Template Replacement (Domain Migration)
# Map all pages from old domain to new domain while preserving paths
old-domain.com/*####https://new-domain.com/{1}

# Scenario 3: URL Extraction (Skip Intermediate Pages)
# Direct access to target URLs when visiting Zhihu external links
link.zhihu.com/?target=####

# Scenario 4: Local File Redirection
# Auto-redirect to online version when opening local HTML files
*demo_local.html$####https://www.example.com/demo/
```

## 📖 Complete Documentation & More Examples

Want to learn about all matching rules and advanced usage? We've prepared comprehensive online documentation for you!

**➡️ [Visit Online Documentation](https://playeryk.github.io/AutoRedirect/)**

In the documentation, you'll find:
- Complete getting started guide
- Detailed explanations of all matching patterns
- Dozens of practical configuration examples ready to copy

## Target Users

- **Developers**: Seamlessly switch between local, development, testing, and production environments.
- **Website Administrators**: Easily handle domain migrations and URL restructuring.
- **Efficiency Seekers**: Skip annoying ads or redirect intermediate pages.

## 🔗 Related Links

- **GitHub Repository (Welcome to Star!)**: https://github.com/PlayerYK/AutoRedirect
- **Issues & Suggestions**: [Submit via GitHub Issues](https://github.com/PlayerYK/AutoRedirect/issues)

AutoRedirect is committed to providing developers and efficiency enthusiasts with the most convenient, secure, and powerful URL redirection solution. 