// 引入共享的重定向引擎和配置管理器
importScripts('redirect-engine.js');
importScripts('config-manager.js');

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  await initializeExtension();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeExtension();
});

async function initializeExtension() {
  try {
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    let isAutoStoredValue = result.jump_list_auto;
    let isAuto;

    if (isAutoStoredValue === undefined) {
      isAuto = 1;
      await chrome.storage.local.set({ jump_list_auto: 1 });
    } else {
      isAuto = Number(isAutoStoredValue);
    }

    const iconPath19On = chrome.runtime.getURL("images/icon_19_on.png");
    const iconPath19Off = chrome.runtime.getURL("images/icon_19_off.png");
    const iconPath38On = chrome.runtime.getURL("images/icon_38_on.png");
    const iconPath38Off = chrome.runtime.getURL("images/icon_38_off.png");

    if (isAuto === 1) {
      await chrome.action.setIcon({
        path: {
          19: iconPath19On,
          38: iconPath38On,
        },
      });
      await chrome.action.setTitle({
        title: "Auto Redirect - On"
      });
    } else {
      await chrome.action.setIcon({
        path: {
          19: iconPath19Off,
          38: iconPath38Off,
        },
      });
      await chrome.action.setTitle({
        title: "Auto Redirect - Off"
      });
    }
  } catch (error) {
    console.error("Error in initializeExtension:", error); // 保留一个顶层错误记录以防万一
  }
}

// Called when the url of a tab changes.
async function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab && tab.url && tab.url.indexOf("file:///") > -1) {
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    try {
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      const jump_list = await configManager.getConfig();
      const isAuto = result.jump_list_auto || 0;
      if (isAuto == 1) {
        startProcess(tab, jump_list);
      }
    } catch (error) {
      console.warn("Failed to get config for file URL:", error.message);
      return;
    }
  }
}

//Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

// 缓存待传递给chose.html的数据，避免 setTimeout 竞态
let pendingChoseData = null;

// 缓存已解析的规则，避免每次请求重新解析
let cachedRules = null;
let cachedRulesSource = null;

function getParsedRules(jumpList) {
  if (cachedRulesSource === jumpList && cachedRules) {
    return cachedRules;
  }
  cachedRules = RedirectEngine.parseRedirectRules(jumpList);
  cachedRulesSource = jumpList;
  return cachedRules;
}

function appendTimestamp(url) {
  try {
    const u = new URL(url);
    u.searchParams.set('t', Date.now());
    return u.toString();
  } catch (e) {
    return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  }
}

async function startProcess(tab, jump_list = null) {
  if (!tab || !tab.id || !tab.url) return;

  const tabId = tab.id;
  const url = tab.url;

  if (!jump_list) {
    try {
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      jump_list = await configManager.getConfig();
    } catch (error) {
      console.warn("Failed to get config in startProcess:", error.message);
      return;
    }
  }

  const rules = getParsedRules(jump_list);
  const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules);

  switch (result_list.length) {
    case 0:
      break;
    case 1:
      chrome.tabs.update(tabId, {
        url: appendTimestamp(result_list[0]),
      });
      break;
    default:
      pendingChoseData = { value: result_list, rules: rule_info };
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL("chose.html"),
      });
      break;
  }
}

// Handle web requests using webRequest API (observe-only, non-blocking)
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    if (details.tabId < 0) return;

    const result = await chrome.storage.local.get(["jump_list_auto"]);
    const isAuto = result.jump_list_auto || 0;

    if (isAuto != 1) {
      return;
    }

    const url = details.url;

    try {
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      const jump_list = await configManager.getConfig();
      const rules = getParsedRules(jump_list);
      const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules);

      switch (result_list.length) {
        case 0:
          break;
        case 1:
          chrome.tabs.update(details.tabId, {
            url: result_list[0],
          });
          break;
        default:
          pendingChoseData = { value: result_list, rules: rule_info };
          chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL("chose.html"),
          });
          break;
      }
    } catch (error) {
      console.warn("Failed to get config in onBeforeRequest:", error.message);
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
    await initializeExtension();
  } catch (error) {
    console.error("Error in immediate initialization:", error);
  }
})();

// 监听扩展图标点击事件，打开选项页面
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});

// 监听chose.html主动请求数据（替代 setTimeout 竞态）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getChoseData') {
    if (pendingChoseData) {
      sendResponse({ type: 'urls', value: pendingChoseData.value, rules: pendingChoseData.rules });
      pendingChoseData = null;
    } else {
      sendResponse({ type: 'urls', value: [], rules: [] });
    }
    return true;
  }
});

// 监听存储变化，更新图标和标题，清除规则缓存
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local') {
    if (changes.jump_list_auto) {
      try {
        await initializeExtension();
      } catch (error) {
        console.error("Failed to re-initialize after storage change:", error);
      }
    }
    if (changes.jump_list) {
      cachedRules = null;
      cachedRulesSource = null;
    }
  }
});
