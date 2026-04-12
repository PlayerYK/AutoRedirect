[简体中文](./README.zh-CN.md)

# AutoRedirect

[Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)
[Chrome Web Store Users](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)
[Documentation](https://playeryk.github.io/AutoRedirect/)

---

**AutoRedirect** is a browser extension that gives you full control over URL redirection. Whether you want to skip ad-filled landing pages, correct typos in URLs, or create custom shortcuts for your favorite websites, AutoRedirect makes it easy.

## 🌟 Key Features

- **Powerful Rule Engine**: Supports wildcards (`*`), regular expressions, and custom functions for complex redirection logic.
- **Flexible Configuration**: Easily import/export your rules, and sync them across devices.
- **User-Friendly Interface**: Manage your rules with a clean and intuitive UI.
- **Lightweight & Fast**: Designed to be efficient and have minimal impact on your browsing experience.
- **Privacy-Focused**: No data collection, ever. Your rules are your own.

## 🚀 Getting Started

1. **Install** the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf).
2. **Open** the extension's "Options" page.
3. **Add** your redirection rules.
4. **Save** and enjoy automatic redirection!

For detailed usage and examples, please visit our **[documentation website](https://playeryk.github.io/AutoRedirect/)**.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) and [Developer Testing Guide](./test/TESTING_GUIDE.en.md) for more details.

## 📋 Changelog

### v0.2.1

**Security Fixes**

- Fix multiple XSS injection risks: all dynamic content is now HTML-escaped before DOM insertion; `href` attributes are validated against a protocol whitelist
- Fix `startProcess` ignoring the passed `tab` parameter, which caused redirects to the wrong tab

**Feature Improvements**

- Eliminate message-passing race condition: chose.html now actively requests data from background instead of relying on unreliable `setTimeout`
- Fix URL timestamp appending that broke existing query parameters (now uses the `URL` object correctly)
- Add parsed-rule caching to avoid redundant parsing and regex compilation when config is unchanged
- Fix `isRegexPattern` regex logic; remove unused extra parameter from `findRedirectMatches` calls
- Add `tabId < 0` guard to prevent `tabs.update` failures on detached requests

**UX Improvements**

- Add `<meta viewport>` and `lang` attribute to the options page for better mobile and screen-reader support
- Add `focus-visible` styles so keyboard users can see focus indicators
- Replace `alert()` validation prompts with in-page Toast notifications for a more consistent experience
- Fix CSS `insertRule` breaking when localized text contains quotes

**Code Quality**

- Fix test scripts silently exiting with code 0 when config file fails to load
- Add `chrome.i18n` mock for the Node.js test environment — all 48 test cases now pass
- Sync `package.json` version with `manifest.json`
- Add `npm test` scripts; exclude `.DS_Store` and other system files from build output

## 📄 License

This project is licensed under the [MIT License](./LICENSE).