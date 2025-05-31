// 引入共享的重定向引擎和配置管理器
importScripts('redirect-engine.js');
importScripts('config-manager.js');

// 调试函数定义
var show_debug_level = 1;
function debugLog(obj, level) {
  level = level || 0;
  if (level >= show_debug_level) {
    console.log(obj);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

async function initializeExtension() {
  debugLog("initializeExtension called");
  
  try {
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    let isAuto = result.jump_list_auto;
  
    debugLog("Current jump_list_auto value: " + isAuto);
  
    if (isAuto === undefined) {
      isAuto = 1;
      await chrome.storage.local.set({ jump_list_auto: 1 });
      debugLog("First install, set jump_list_auto to 1");
    } else {
      isAuto = isAuto || 0;
    }

    debugLog("Final isAuto value: " + isAuto);

    if (isAuto == 1) {
      await chrome.action.setIcon({
        path: {
          19: chrome.runtime.getURL("images/icon_19_bold.png"),
          38: chrome.runtime.getURL("images/icon_38.png"),
        },
      });
      await chrome.action.setTitle({
        title: "Auto Redirect - On"
      });
      debugLog("Set title to: Auto Redirect - On");
    } else {
      await chrome.action.setIcon({
        path: {
          19: chrome.runtime.getURL("images/icon_19.png"),
          38: chrome.runtime.getURL("images/icon_38.png"),
        },
      });
      await chrome.action.setTitle({
        title: "Auto Redirect - Off"
      });
      debugLog("Set title to: Auto Redirect - Off");
    }
  } catch (error) {
    debugLog("Failed to set icon or title: " + error);
  }
}

// Called when the url of a tab changes.
async function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'file:///' is found in the tab's URL...
  if (tab && tab.url && tab.url.indexOf("file:///") > -1) {
    // ...check options and start jump.
    const result = await chrome.storage.local.get(["jump_list_auto"]);

    try {
      // 确保ConfigManager可用
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      
      // 使用配置管理器获取配置
      const jump_list = await configManager.getConfig();
      
      const isAuto = result.jump_list_auto || 0;
      if (isAuto == 1) {
        startProcess(tab, jump_list);
      }
    } catch (error) {
      debugLog("Failed to get config: " + error.message);
      return;
    }
  }
}

//Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

async function startProcess(tab, jump_list = null) {
  const tabs = await chrome.tabs.query({
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });
  const currentTab = tabs[0];
  // 不要对URL进行编码，保持原始URL用于匹配
  const url = currentTab.url;
  debugLog("local tab url " + url, 1);

  // 如果没有传入配置，则获取配置
  if (!jump_list) {
    try {
      // 确保ConfigManager可用
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      
      jump_list = await configManager.getConfig();
    } catch (error) {
      debugLog("Failed to get config: " + error.message);
      return;
    }
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

    const result = await chrome.storage.local.get(["jump_list_auto"]);
    const isAuto = result.jump_list_auto || 0;

    debugLog("auto redirect: isAuto " + isAuto);
    if (isAuto != 1) {
      return;
    }

    const url = details.url;

    try {
      // 确保ConfigManager可用
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      
      // 使用配置管理器获取配置
      const jump_list = await configManager.getConfig();

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
    } catch (error) {
      debugLog("Failed to get config: " + error.message);
      return;
    }
  },
  {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame"],
  }
);

// 立即执行初始化，确保service worker每次启动时都设置正确的状态
(async () => {
  try {
    debugLog("Starting async initialization");
    await initializeExtension();
    debugLog("Async initialization completed");
  } catch (error) {
    debugLog("Error in immediate initialization: " + error);
  }
})();
