# Developer Testing Guide

## 🎯 Purpose of This Document

This guide provides the local testing procedures and standards for **developers and contributors of the AutoRedirect project**.

-   **Audience**: Project contributors
-   **Goal**: To ensure the quality and consistency of code changes.
-   **User Documentation**: For end-user guides and examples, please visit our **[official documentation website](https://playeryk.github.io/AutoRedirect/)**.

---

## 📂 `/test` Directory File Structure

The `test` directory is central to local testing and contains the following key files:

-   **`TESTING_GUIDE.md` (This document)**
    -   The file you are currently reading. It provides the complete process and maintenance standards for local testing.

-   **`example_config.en.txt` (English Configuration Examples)**
    -   The **most important** testing file for English users, serving as the "Source of Truth" for all rules.
    -   It contains the most complete and well-commented rule examples for all features in English.
    -   **Examples in the English online documentation are derived from this file**.

-   **`example_config.zh-CN.txt` (Chinese Configuration Examples)**
    -   The Chinese version of configuration examples, containing the same rules with Chinese comments.
    -   Suitable for Chinese-speaking developers and contributors.

-   **`test_config_rules.en.js` (English Test Script)**
    -   A JavaScript test script for validating rules in `example_config.en.txt`.
    -   Used for automated testing and validation of the English configuration examples.

-   **`test_config_rules.zh-CN.js` (Chinese Test Script)**
    -   A JavaScript test script for validating rules in `example_config.zh-CN.txt`.
    -   Used for automated testing and validation of the Chinese configuration examples.

## 🧪 Local Testing Workflow

### 1. Load the Local Extension
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **"Developer mode"** in the top-right corner.
3.  Click **"Load unpacked"**.
4.  Select the root directory of this project.

### 2. Use Test Rules
1.  Open `test/example_config.en.txt` (for English) or `test/example_config.zh-CN.txt` (for Chinese).
2.  Copy the rules corresponding to the feature you need to test.
3.  Open the extension's "Options" page, clear any existing rules, paste the rules you copied, and save.

### 3. Perform Manual Testing
1.  In your browser, visit a URL that should trigger a redirection.
2.  Verify that the behavior is as expected.
3.  Check the Service Worker's console logs for detailed debugging information.

## 🤖 Automated Rule Validation

In addition to manual testing, we provide automated scripts to validate the correctness of all rules in the configuration files. This is crucial for ensuring the logical integrity of the core engine and the compatibility of the rules.

### Running the Test Scripts
Open a terminal in the project's root directory and run one of the following commands:

**For English configuration:**
```bash
node test/test_config_rules.en.js
```

**For Chinese configuration:**
```bash
node test/test_config_rules.zh-CN.js
```

### Verifying the Output
The script will test each rule from the respective configuration file and report success or failure. If all tests pass, you will see a success summary. If any tests fail, the script will print detailed error messages.

**Before submitting any code (especially if you have modified the rules), please run this script to ensure all tests pass.**

## 🔧 Maintenance and Contribution Standards

To ensure consistency across the project's code, test cases, and external documentation, you **must** update the following files when adding or modifying features:

1.  **`src/`**: Implement your feature code.
2.  **`test/example_config.en.txt`** and **`test/example_config.zh-CN.txt`**: Add or modify the corresponding rules with clear comments in both languages. **This is the first step**.
3.  **`test/test_config_rules.en.js`** and **`test/test_config_rules.zh-CN.js`**: Update the test scripts to keep them in sync with the configuration files.
4.  **`docs/`**: Update the relevant pages in the VitePress online documentation to inform users of the new feature or changes.

Following this process ensures the project remains healthy and maintainable. 