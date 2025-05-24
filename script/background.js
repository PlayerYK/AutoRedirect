// 引入共享的重定向引擎
importScripts('redirect-engine.js');

var regPatternUrl = "http://jslab.pro/autoredirect/regpattern.txt";

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

async function initializeExtension() {
  // Get auto redirect setting
  const result = await chrome.storage.local.get(["jump_list_auto"]);
  const isAuto = result.jump_list_auto || 0;

  try {
    if (isAuto == 1) {
      await chrome.action.setIcon({
        path: {
          19: "images/icon_19_bold.png",
          38: "images/icon_19_bold.png",
        },
      });
    } else {
      await chrome.action.setIcon({
        path: {
          19: "images/icon_19.png",
          38: "images/icon_19.png",
        },
      });
    }
  } catch (error) {
    debugLog("Failed to set icon: " + error);
  }
}

// Called when the url of a tab changes.
async function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'file:///' is found in the tab's URL...
  if (tab && tab.url && tab.url.indexOf("file:///") > -1) {
    // ...check options and start jump.
    const result = await chrome.storage.local.get([
      "jump_list",
      "jump_list_auto",
    ]);
    let jump_list = result.jump_list;

    if (!jump_list) {
      try {
        const response = await fetch(regPatternUrl);
        const text = await response.text();
        await chrome.storage.local.set({ jump_list: text });
        jump_list = text;
      } catch (error) {
        debugLog("Failed to fetch pattern list: " + error);
        return;
      }
    }

    const isAuto = result.jump_list_auto || 0;
    if (isAuto == 1) {
      startProcess(tab);
    }
  }
}

//Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

async function startProcess(tab) {
  const tabs = await chrome.tabs.query({
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });
  const currentTab = tabs[0];
  // 不要对URL进行编码，保持原始URL用于匹配
  const url = currentTab.url;
  debugLog("local tab url " + url, 1);

  const result = await chrome.storage.local.get(["jump_list"]);
  const jump_list = result.jump_list;

  if (!jump_list) {
    debugLog("No jump list found");
    return;
  }

  // 使用共享的重定向引擎
  const rules = RedirectEngine.parseRedirectRules(jump_list);
  const src_list = jump_list.split("\n");
  const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

  debugLog(result_list, 2);

  switch (result_list.length) {
    case 0:
      // No matches found
      break;
    case 1:
      chrome.tabs.update(currentTab.id, {
        url: result_list[0] + "?t=" + +new Date(),
      });
      break;
    default:
      chrome.tabs.update(currentTab.id, {
        url: chrome.runtime.getURL("chose.html"),
      });
      setTimeout(function () {
        chrome.runtime.sendMessage({
          type: "urls",
          value: result_list,
          rules: rule_info,
        });
      }, 100);
      break;
  }
}

// Handle web requests using declarativeNetRequest
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    debugLog("called details params");
    debugLog(details);
    debugLog("online tab url " + details.url, 2);

    const result = await chrome.storage.local.get([
      "jump_list_auto",
      "jump_list",
    ]);
    const isAuto = result.jump_list_auto || 0;

    debugLog("auto redirect: isAuto " + isAuto);
    if (isAuto != 1) {
      return;
    }

    const url = details.url;
    let jump_list = result.jump_list;

    if (!jump_list) {
      try {
        const response = await fetch(regPatternUrl);
        const text = await response.text();
        await chrome.storage.local.set({ jump_list: text });
        jump_list = text;
      } catch (error) {
        debugLog("Failed to fetch pattern list: " + error);
        return;
      }
    }

    // 使用共享的重定向引擎
    const rules = RedirectEngine.parseRedirectRules(jump_list);
    const src_list = jump_list.split("\n");
    const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

    debugLog("result length " + result_list.length);
    debugLog(result_list, 2);

    switch (result_list.length) {
      case 0:
        break;
      case 1:
        chrome.tabs.update(details.tabId, {
          url: result_list[0],
        });
        break;
      default:
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("chose.html"),
        });
        setTimeout(function () {
          chrome.runtime.sendMessage({
            type: "urls",
            value: result_list,
            rules: rule_info,
          });
        }, 100);
        break;
    }
  },
  {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame"],
  }
);

var show_debug_level = 1;
function debugLog(obj, level) {
  level = level || 0;
  if (level >= show_debug_level) {
    console.log(obj);
  }
}
