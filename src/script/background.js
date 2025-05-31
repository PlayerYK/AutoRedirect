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
      // Consider logging this error if important for production
      // console.error("Failed to get config for file URL:", error);
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
  const url = currentTab.url;

  if (!jump_list) {
    try {
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      jump_list = await configManager.getConfig();
    } catch (error) {
      // console.error("Failed to get config in startProcess:", error);
      return;
    }
  }

  const rules = RedirectEngine.parseRedirectRules(jump_list);
  const src_list = jump_list.split("\n");
  const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

  switch (result_list.length) {
    case 0:
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
      const rules = RedirectEngine.parseRedirectRules(jump_list);
      const src_list = jump_list.split("\n");
      const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

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
      // console.error("Failed to get config in onBeforeRequest:", error);
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

// 监听存储变化，更新图标和标题
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local' && changes.jump_list_auto) {
    try {
      await initializeExtension();
    } catch (error) {
      console.error("Failed to re-initialize after storage change:", error);
    }
  }
});
