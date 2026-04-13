[简体中文](./README.zh-CN.md)

# AutoRedirect

[Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf) · [Documentation](https://playeryk.github.io/AutoRedirect/)

**AutoRedirect** is a Chrome extension for automatic URL redirection, built on Manifest V3. It handles environment switching, domain migration, redirect link extraction, and local file mapping.

## Features

- **Multiple matching modes** — Exact, prefix, suffix, and wildcard patterns.
- **URL templates** — Rewrite paths with `{1}`, `{2}` placeholders for domain migration.
- **URL extraction** — Skip intermediate redirect pages (Zhihu, WeChat, etc.) and go straight to the target.
- **Local file mapping** — Redirect `file://` paths to remote servers.
- **Multi-result selection** — Choose from multiple targets when a rule matches several destinations.
- **Batch testing** — Built-in tool to verify multiple rules at once.
- **Rule editor** — Line numbers, syntax highlighting, error indicators, and comment toggling.

## Quick Start

1. Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf).
2. Open the extension's Options page.
3. Add your redirection rules.
4. Save — rules take effect immediately.

For full usage guide and examples, see the [documentation](https://playeryk.github.io/AutoRedirect/).

## Contributing

See the [Contributing Guide](./CONTRIBUTING.md) and [Developer Testing Guide](./test/TESTING_GUIDE.en.md).

## Changelog

### v0.2 (Latest)

**New Features**

- Batch URL testing tool: validate multiple rules simultaneously
- Rule editor enhancements: line numbers, syntax highlighting, error line indicators, comment toggling (Ctrl+/)
- Rule statistics bar showing valid, comment, and error line counts

**UI Redesign**

- Redesigned options page with a cohesive neutral color palette (Tailwind Slate scale)
- Removed all emoji from UI — cleaner, more consistent across platforms
- Modern flat toggle switch replacing the old skeuomorphic slider
- Clear button hierarchy: primary (blue), secondary (outline), contextual status colors
- Unified toast notifications and error states

**Security & Stability**

- Fixed multiple XSS injection risks with HTML escaping and protocol whitelist
- Fixed race condition in chose.html data loading
- Added rule parsing cache to avoid redundant regex compilation
- Added `tabId < 0` guard for detached requests
- Defensive null checks in `parseRedirectRules`

## License

[MIT License](./LICENSE)
