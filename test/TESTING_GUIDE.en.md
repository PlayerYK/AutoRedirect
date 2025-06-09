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

-   **`example_config.txt` (Source of Truth for Rules)**
    -   The **most important** testing file, serving as the "Source of Truth" for all rules.
    -   It contains the most complete and well-commented rule examples for all features.
    -   **Examples in the online documentation are derived from this file**.

-   **`test_config_rules.js` (JS Version of Rules)**
    -   A JavaScript object representation of all rules found in `example_config.txt`.
    -   Used for programmatic access to the rules and to provide data for future automated testing frameworks (like Jest or Playwright).

## 🧪 Local Testing Workflow

### 1. Load the Local Extension
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **"Developer mode"** in the top-right corner.
3.  Click **"Load unpacked"**.
4.  Select the root directory of this project.

### 2. Use Test Rules
1.  Open `test/example_config.txt`.
2.  Copy the rules corresponding to the feature you need to test.
3.  Open the extension's "Options" page, clear any existing rules, paste the rules you copied, and save.

### 3. Perform Manual Testing
1.  In your browser, visit a URL that should trigger a redirection.
2.  Verify that the behavior is as expected.
3.  Check the Service Worker's console logs for detailed debugging information.

## 🤖 Automated Rule Validation

In addition to manual testing, we provide an automated script to validate the correctness of all rules in `example_config.txt`. This is crucial for ensuring the logical integrity of the core engine and the compatibility of the rules.

### Running the Test Script
Open a terminal in the project's root directory and run the following command:
```bash
node test/test_config_rules.js
```

### Verifying the Output
The script will test each rule from `example_config.txt` and report success or failure. If all tests pass, you will see a success summary. If any tests fail, the script will print detailed error messages.

**Before submitting any code (especially if you have modified the rules), please run this script to ensure all tests pass.**

## 🔧 Maintenance and Contribution Standards

To ensure consistency across the project's code, test cases, and external documentation, you **must** update the following files when adding or modifying features:

1.  **`src/`**: Implement your feature code.
2.  **`test/example_config.txt`**: Add or modify the corresponding rules with clear comments. **This is the first step**.
3.  **`test/test_config_rules.js`**: Update the JS object to keep it in sync with `example_config.txt`.
4.  **`docs/`**: Update the relevant pages in the VitePress online documentation to inform users of the new feature or changes.

Following this process ensures the project remains healthy and maintainable. 