/**
 * Replaces the text content of elements with i18n attributes with localized strings.
 * This script should be included in any HTML page that needs localization.
 */
function localizePage() {
    // Localize elements with data-i18n attribute (for innerText/innerHTML)
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        const message = chrome.i18n.getMessage(key);
        if (message) {
            // Use innerHTML to allow simple formatting tags like <strong> in the message
            elem.innerHTML = message;
        }
    });

    // Localize elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        const message = chrome.i18n.getMessage(key);
        if (message) {
            elem.placeholder = message;
        }
    });

    // Localize elements with data-i18n-title attribute (for tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-title');
        const message = chrome.i18n.getMessage(key);
        if (message) {
            elem.title = message;
        }
    });
}

// Run the localization when the document is ready.
// Using DOMContentLoaded is generally safe and faster.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', localizePage);
} else {
    localizePage();
} 