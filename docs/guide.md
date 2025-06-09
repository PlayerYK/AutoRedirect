# Usage Guide

This page will provide you with a detailed guide on how to use the AutoRedirect extension, from basic setup to advanced features.

## Installation

You can install this extension in the following ways:

1.  **Install from Chrome Web Store**: (Recommended)
    - Open Chrome Web Store, search for "AutoRedirect" and click "Add to Chrome".
2.  **Install from local source code**:
    - Download the source code from [GitHub](https://github.com/PlayerYK/AutoRedirect).
    - Open Chrome, go to `chrome://extensions/`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `src` directory in the project's root folder.

## Basic Features

### Adding Redirection Rules

- Open the extension's popup page by clicking the extension icon.
- In the "Add Rule" section, enter the URL or keyword you want to match in the "Match Rule" input box.
- Enter the target URL you want to redirect to in the "Target URL" input box.
- Click the "Add" button to save the rule.

### Rule Management

- All added rules will be displayed in the "Rule List".
- You can enable or disable a rule by toggling the switch next to it.
- Click the "Delete" button to permanently remove a rule.

## Matching Modes

AutoRedirect supports multiple matching modes to handle different scenarios.

### 1. Exact Match

- This is the default mode. It only redirects when the URL in the address bar exactly matches the "Match Rule".

### 2. Prefix Match

- When the URL starts with the content of the "Match Rule", it will be redirected.
- **Example**: If the rule is `https://example.com/page`, then `https://example.com/page/123` will also be matched.

### 3. Simple String Match

- As long as the URL contains the content of the "Match Rule", it will be redirected.
- **Note**: This mode may have a wider impact, please use it with caution.

## Advanced Features

### URL Template Replacement

- In the "Target URL", you can use placeholders like `{1}`, `{2}` to capture parts of the original URL.
- **Example**:
    - Match Rule: `https://example.com/users/(\w+)/posts/(\d+)`
    - Target URL: `https://new-site.com/u/{1}/p/{2}`
    - Accessing `https://example.com/users/john/posts/42` will redirect to `https://new-site.com/u/john/p/42`.

### Smart URL Extraction

- For URLs that are encoded or embedded in other parameters, AutoRedirect can automatically recognize and extract the real target URL for redirection.
- **Example**: `https://login.example.com?redirect_uri=https%3A%2F%2Fexample.com` will be recognized and you can choose to jump to `https://example.com`.

## Options Page

On the options page, you can:

- View and manage all redirection rules.
- Export or import rule configurations.
- Set global options for the extension.

## Feedback

If you encounter any problems or have any suggestions during use, please feel free to provide feedback through the following channels:

- **GitHub Issues**: [Submit an Issue](https://github.com/PlayerYK/AutoRedirect/issues)

Thank you for using AutoRedirect! 