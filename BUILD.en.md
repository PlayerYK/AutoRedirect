# Build and Pack Extension Guide

This document provides instructions for developers on how to build and package the AutoRedirect extension locally.

## 📦 Build Script

The project includes a build script that automates the process of creating a production-ready extension package. The script handles versioning, file organization, and packaging.

### Usage

To run the build script, open your terminal at the project root and execute the following command:

```bash
node build.js
```

### Script Logic

1.  **Read `package.json`**: The script starts by reading `manifest/manifest.json` to get the current version number.
2.  **Create Build Directory**: It creates a `dist` directory to store the packaged extension files. If the directory already exists, it will be cleaned first.
3.  **Copy Source Files**: All necessary source files from the `src` directory are copied into a new `dist/AutoRedirect` subdirectory.
4.  **Generate ZIP File**: The contents of the `dist/AutoRedirect` directory are compressed into a ZIP file named `AutoRedirect_vX.X.X.zip`, where `X.X.X` is the version number from the manifest.
5.  **Cleanup**: The `dist/AutoRedirect` subdirectory is removed, leaving only the final ZIP file in the `dist` folder.

## 手动打包步骤 (Manual Packaging)

If you prefer to package the extension manually, follow these steps:

1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Ensure "Developer mode" is enabled.
3.  Click the **"Pack extension"** button.
4.  For the "Extension root directory", select the `src` folder from this project.
5.  The "Private key file" field can be left blank for the initial packaging. Chrome will generate a `.pem` file for you. **Save this key file for future updates.**
6.  Click **"Pack extension"**. Chrome will create a `.crx` file and a `.pem` private key file.

**Important**: When updating your extension in the Chrome Web Store, you must use the same private key file (`.pem`) that was generated during the first packaging. Losing this key will prevent you from updating the extension. 