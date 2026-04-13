[简体中文](./CONTRIBUTING.zh-CN.md)

# Contributing to AutoRedirect

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone** the repository:
  ```bash
   git clone https://github.com/PlayerYK/AutoRedirect.git
   cd AutoRedirect
  ```
2. **Install dependencies** (only needed for docs):
  ```bash
   npm install
  ```
3. **Load the extension** in Chrome:
  - Navigate to `chrome://extensions/`
  - Enable "Developer mode"
  - Click "Load unpacked" and select the `src/` directory

## Project Structure

```
src/
  script/
    background.js        # Service Worker - redirect logic & lifecycle
    redirect-engine.js   # Core matching & redirect engine
    config-manager.js    # Config fetching, caching & storage
    options.js           # Options page UI logic
    chose.js             # Multi-result selection page
    i18n.js              # Internationalization utility
  _locales/              # i18n message files (en, zh_CN)
  manifest.json          # Extension manifest (MV3)
  options.html           # Options page
  chose.html             # Multi-result selection page
test/                    # Unit tests & example configs
docs/                    # VitePress documentation source
build.js                 # Build/packaging script
```

## Making Changes

1. Create a feature branch from `master`.
2. Make your changes in the `src/` directory.
3. If you modify redirect rules logic, update the example configs and tests:
  - `test/example_config.zh-CN.txt` / `test/example_config.en.txt`
  - `test/test_config_rules.zh-CN.js` / `test/test_config_rules.en.js`
4. Run the test suite before submitting:
  ```bash
   npm test
  ```
5. Update documentation in `docs/` if applicable.

## Testing

```bash
# Run all tests
npm test

# Run Chinese config tests only
npm run test:zh

# Run English config tests only
npm run test:en
```

For detailed testing guidance, see the [Developer Testing Guide](./test/TESTING_GUIDE.en.md).

## Code Style

- Use `const`/`let` over `var` for new code.
- All user-facing strings must use `chrome.i18n.getMessage()` with keys in both `en` and `zh_CN` message files.
- Escape all dynamic content before DOM insertion using `RedirectEngine.escapeHtml()`.
- Keep the extension lightweight with zero external runtime dependencies.

## Submitting a Pull Request

1. Ensure all tests pass (`npm test`).
2. Write a clear PR description explaining **what** changed and **why**.
3. Keep PRs focused - one feature or fix per PR.

## Reporting Issues

Please use [GitHub Issues](https://github.com/PlayerYK/AutoRedirect/issues) to report bugs or request features. Include:

- Browser version
- Extension version
- Steps to reproduce
- Expected vs actual behavior

