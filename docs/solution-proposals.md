# 解决方案提案

## 方案对比总览


| 方案                     | 实现难度 | 用户体验  | 兼容性 | 推荐度     |
| ---------------------- | ---- | ----- | --- | ------- |
| 方案 1：白名单机制             | ⭐    | ⭐⭐    | ⭐⭐⭐ | ❌       |
| 方案 2：改用 tabs.onUpdated | ⭐⭐   | ⭐⭐⭐⭐  | ⭐⭐⭐ | ✅ 推荐    |
| 方案 3：改用 webNavigation  | ⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐  | ⭐ 理想但复杂 |
| 方案 4：混合方案              | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ 最完善   |


---

## 方案 1：添加域名白名单机制

### 核心思路

保留现有 `webRequest.onBeforeRequest` 架构，但添加白名单配置，排除特定域名。

### 实现方案

#### 1.1 修改配置格式

在配置文件中添加白名单部分：

```
# 白名单域名（不触发重定向的页面）
@whitelist:google.com
@whitelist:bing.com
@whitelist:baidu.com

# 正常的重定向规则
=https://twitter.com/*####https://x.com/{1}
```

#### 1.2 代码修改

**修改位置：** `src/script/background.js:132-183`

```javascript
// 新增：解析白名单
function parseWhitelist(jumpList) {
  const whitelist = [];
  const lines = jumpList.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('@whitelist:')) {
      const domain = trimmed.substring('@whitelist:'.length).trim();
      whitelist.push(domain);
    }
  });

  return whitelist;
}

// 新增：检查URL是否在白名单中
function isUrlWhitelisted(url, whitelist) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    return whitelist.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain);
    });
  } catch (error) {
    return false;
  }
}

// 修改：webRequest 监听器
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
      const jump_list = await configManager.getConfig();

      // 新增：检查白名单
      const whitelist = parseWhitelist(jump_list);
      if (isUrlWhitelisted(url, whitelist)) {
        Logger.debug('URL在白名单中，跳过重定向', { url });
        return;
      }

      const rules = RedirectEngine.parseRedirectRules(jump_list);
      const src_list = jump_list.split("\n");
      const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

      // ... 其余逻辑不变
    } catch (error) {
      return;
    }
  },
  {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame"],
  }
);
```

### 优点

✅ 实现简单，代码改动最小
✅ 向后兼容（不添加白名单，功能不变）
✅ 用户可以自定义排除的域名

### 缺点

❌ 治标不治本，仍然会拦截预加载请求
❌ 需要用户手动配置白名单（用户可能不知道该加哪些）
❌ 无法解决所有场景的问题
❌ 用户需要学习新的配置语法

### 风险评估

- **低风险：** 不影响现有功能
- **用户体验：** 需要用户额外配置

### 推荐度：❌ 不推荐

这只是临时方案，无法从根本上解决问题。

---

## 方案 2：完全改用 tabs.onUpdated 触发机制（推荐）

### 核心思路

移除 `webRequest.onBeforeRequest` 监听器，完全依赖 `tabs.onUpdated`，只在页面开始加载时触发重定向。

### 实现方案

#### 2.1 移除 webRequest 监听器

**修改位置：** `src/script/background.js`

删除或注释掉第 132-183 行的整个 `webRequest.onBeforeRequest` 监听器。

#### 2.2 增强 tabs.onUpdated 监听器

**修改位置：** `src/script/background.js:59-81`

```javascript
// 修改前的代码（只处理 file:/// URL）
async function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab && tab.url && tab.url.indexOf("file:///") > -1) {
    // ...只处理本地文件
  }
}

// 修改后的代码（处理所有 URL）
async function checkForValidUrl(tabId, changeInfo, tab) {
  // 只在以下情况触发：
  // 1. URL 发生变化
  // 2. 状态为 loading（页面开始加载）
  if (!changeInfo.url && changeInfo.status !== 'loading') {
    return;
  }

  // 如果没有 tab.url，使用 changeInfo.url
  const url = tab?.url || changeInfo.url;

  if (!url) {
    return;
  }

  // 获取配置和自动重定向状态
  const result = await chrome.storage.local.get(["jump_list_auto"]);
  const isAuto = result.jump_list_auto || 0;

  if (isAuto != 1) {
    return;
  }

  try {
    const configManager = self.ConfigManager || ConfigManager;
    if (!configManager) {
      throw new Error('ConfigManager未加载');
    }

    const jump_list = await configManager.getConfig();

    // 执行重定向检查
    await startProcess(tab, jump_list);

  } catch (error) {
    // 静默失败
    return;
  }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
```

#### 2.3 优化 startProcess 函数

**修改位置：** `src/script/background.js:83-129`

```javascript
async function startProcess(tab, jump_list = null) {
  // 使用传入的 tab，而不是重新查询
  const url = tab.url;

  if (!url) {
    return;
  }

  if (!jump_list) {
    try {
      const configManager = self.ConfigManager || ConfigManager;
      if (!configManager) {
        throw new Error('ConfigManager未加载');
      }
      jump_list = await configManager.getConfig();
    } catch (error) {
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
      chrome.tabs.update(tab.id, {
        url: result_list[0] + "?t=" + +new Date(),
      });
      break;
    default:
      chrome.tabs.update(tab.id, {
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
```

#### 2.4 更新 manifest.json

**修改位置：** `src/manifest.json`

```json
{
  "version": "0.2.1",
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__",
  "default_locale": "zh_CN",
  "key": "...",
  "permissions": [
    "tabs",
    "storage"
    // 移除 "webRequest"
  ],
  "host_permissions": ["http://*/*", "https://*/*", "file://*/*"],
  // ... 其余不变
}
```

### 优点

✅ **从根本上解决问题：** 不会拦截预加载请求
✅ **用户体验好：** 用户能看到中间页面（搜索结果、短链接跳转页等）
✅ **符合用户预期：** 只在页面真正加载时触发
✅ **代码简化：** 移除冗余的 webRequest 逻辑
✅ **权限更少：** 不再需要 webRequest 权限
✅ **向后兼容：** 所有现有规则仍然有效

### 缺点

⚠️ **重定向稍慢：** 会等到页面开始加载才触发（但这正是我们想要的）
⚠️ **用户会看到"闪烁"：** 页面开始加载 → 立即重定向（但比完全看不到要好）

### 触发时机对比

```
webRequest.onBeforeRequest:
  请求发出前 → 立即重定向 (太早！)

tabs.onUpdated (status: loading):
  请求发出 → 页面开始加载 → 触发重定向 (合适！)
```

### 风险评估

- **中等风险：** 改变了核心触发机制
- **需要测试：**
  1. 直接访问 twitter.com 是否正常重定向
  2. Google 搜索结果是否不再被跳过
  3. 地址栏输入 URL 是否正常重定向
  4. 本地文件（file:///）是否仍能正常工作

### 推荐度：✅ 强烈推荐

这是最平衡的方案，既解决了问题，又保持了功能完整性。

---

## 方案 3：改用 webNavigation API（最精确）

### 核心思路

使用 `webNavigation.onCommitted` 替代 `webRequest.onBeforeRequest`，并利用 `transitionType` 区分导航类型。

### 实现方案

#### 3.1 替换监听器

**修改位置：** `src/script/background.js`

```javascript
// 移除 webRequest.onBeforeRequest 监听器

// 添加 webNavigation.onCommitted 监听器
chrome.webNavigation.onCommitted.addListener(
  async function (details) {
    // 只处理顶层框架
    if (details.frameId !== 0) {
      return;
    }

    // 检查自动重定向是否启用
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    const isAuto = result.jump_list_auto || 0;

    if (isAuto != 1) {
      return;
    }

    const url = details.url;

    // 根据 transitionType 决定是否处理
    // typed: 用户在地址栏输入
    // link: 用户点击链接
    // reload: 重新加载
    const allowedTransitions = ['typed', 'link', 'reload', 'form_submit', 'auto_bookmark'];

    if (!allowedTransitions.includes(details.transitionType)) {
      Logger.debug('导航类型不在处理范围内', {
        type: details.transitionType,
        url
      });
      return;
    }

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
      return;
    }
  },
  {
    url: [
      { schemes: ['http', 'https', 'file'] }
    ]
  }
);
```

#### 3.2 更新 manifest.json

**修改位置：** `src/manifest.json`

```json
{
  "version": "0.2.1",
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__",
  "default_locale": "zh_CN",
  "key": "...",
  "permissions": [
    "tabs",
    "storage",
    "webNavigation"  // 新增
    // 移除 "webRequest"
  ],
  "host_permissions": ["http://*/*", "https://*/*", "file://*/*"],
  // ... 其余不变
}
```

### transitionType 说明


| 类型                  | 含义       | 是否处理 |
| ------------------- | -------- | ---- |
| `link`              | 用户点击链接   | ✅ 是  |
| `typed`             | 用户在地址栏输入 | ✅ 是  |
| `auto_bookmark`     | 自动书签     | ✅ 是  |
| `reload`            | 重新加载     | ✅ 是  |
| `form_submit`       | 表单提交     | ✅ 是  |
| `keyword`           | 关键字搜索    | ⭐ 可选 |
| `keyword_generated` | 生成的关键字   | ⭐ 可选 |
| `manual_subframe`   | 手动子框架    | ❌ 否  |
| `auto_subframe`     | 自动子框架    | ❌ 否  |
| `generated`         | 生成的导航    | ❌ 否  |
| `start_page`        | 起始页      | ❌ 否  |
| `other`             | 其他       | ❌ 否  |


### 优点

✅ **最精确：** 可以区分用户行为和自动行为
✅ **不拦截预加载：** 预加载不会触发 onCommitted
✅ **可控性强：** 可以精确控制哪些导航类型触发重定向
✅ **符合最佳实践：** 这是 Chrome 推荐的方式

### 缺点

❌ **API 复杂：** webNavigation API 比较复杂
❌ **兼容性问题：** 某些边缘情况可能需要特殊处理
❌ **需要深度测试：** 不同的导航场景需要大量测试

### 风险评估

- **高风险：** 完全改变触发机制
- **需要充分测试：** 各种导航场景

### 推荐度：⭐ 理想但复杂

这是最理想的方案，但实现和测试成本较高。

---

## 方案 4：混合方案（最完善但最复杂）

### 核心思路

结合 `tabs.onUpdated` 和 `webNavigation.onCommitted`，针对不同场景使用最合适的触发机制。

### 实现方案

#### 4.1 架构设计

```javascript
// 1. tabs.onUpdated: 处理本地文件和基本场景
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 处理 file:/// URL
  // 处理简单的 HTTP/HTTPS URL（作为后备）
});

// 2. webNavigation.onCommitted: 处理复杂场景
chrome.webNavigation.onCommitted.addListener((details) => {
  // 根据 transitionType 精确控制
  // 排除预加载和自动请求
});

// 3. 防止重复触发的机制
const recentRedirects = new Map(); // 记录最近的重定向，避免重复

function shouldProcessRedirect(url, tabId) {
  const key = `${tabId}:${url}`;
  const lastTime = recentRedirects.get(key);
  const now = Date.now();

  // 2秒内不重复处理同一URL
  if (lastTime && now - lastTime < 2000) {
    return false;
  }

  recentRedirects.set(key, now);

  // 清理旧记录
  if (recentRedirects.size > 100) {
    const entries = Array.from(recentRedirects.entries());
    entries.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < 50; i++) {
      recentRedirects.delete(entries[i][0]);
    }
  }

  return true;
}
```

### 优点

✅ **最完善：** 覆盖所有场景
✅ **最精确：** 使用最合适的 API 处理不同场景
✅ **容错性好：** 有后备机制

### 缺点

❌ **最复杂：** 代码量大，逻辑复杂
❌ **维护成本高：** 需要维护多套逻辑
❌ **测试成本高：** 需要测试大量边缘情况
❌ **可能重复触发：** 需要额外的去重逻辑

### 风险评估

- **高风险：** 实现复杂，容易出bug
- **开发成本：** 高

### 推荐度：⭐ 理想但过度设计

除非发现方案2和方案3都有严重问题，否则不推荐。

---

## 最终推荐

### 🎯 首选方案：方案 2（改用 tabs.onUpdated）

**理由：**

1. ✅ 从根本上解决问题
2. ✅ 实现简单，风险可控
3. ✅ 用户体验明显改善
4. ✅ 代码反而更简洁
5. ✅ 不需要新的权限

**建议实施步骤：**

1. 先在测试分支实现方案2
2. 充分测试各种场景
3. 如果发现问题，再考虑方案3
4. 绝不考虑方案1（治标不治本）

### 📊 决策依据


| 考虑因素   | 方案1 | 方案2 | 方案3 | 方案4 |
| ------ | --- | --- | --- | --- |
| 解决根本问题 | ❌   | ✅   | ✅   | ✅   |
| 实现难度   | 低   | 中   | 高   | 很高  |
| 测试成本   | 低   | 中   | 高   | 很高  |
| 用户体验提升 | 有限  | 显著  | 显著  | 显著  |
| 代码维护性  | 中   | 好   | 中   | 差   |
| 风险程度   | 低   | 中   | 高   | 高   |


### 🚀 行动计划

如果选择方案2，建议按以下顺序进行：

**Phase 1: 代码修改**

1. 修改 `checkForValidUrl` 函数，处理所有URL
2. 移除 `webRequest.onBeforeRequest` 监听器
3. 更新 `manifest.json`，移除 webRequest 权限

**Phase 2: 测试**

1. 测试 Google 搜索结果页不再被跳过 ✅
2. 测试直接访问 twitter.com 正常重定向 ✅
3. 测试地址栏输入 URL 正常重定向 ✅
4. 测试本地文件 file:/// 正常工作 ✅
5. 测试多结果选择页面正常工作 ✅
6. 测试其他边缘场景

**Phase 3: 发布**

1. 更新版本号到 0.2.2
2. 更新 CHANGELOG
3. 打包发布
4. 通知用户此修复

### ⚠️ 风险提示

无论选择哪个方案，都需要注意：

1. **充分测试：** 重定向是核心功能，必须保证不破坏现有功能
2. **版本控制：** 修改前做好备份和版本标记
3. **用户通知：** 如果行为有变化，需要在更新说明中告知用户
4. **回滚方案：** 准备好快速回滚的方案

### 📝 需要更新的文档

如果实施修改，需要同步更新：

1. `README.md` / `README.zh-CN.md` - 在问题修复部分说明
2. `CHANGELOG.md` - 记录此次修复
3. `docs/` - 更新相关技术文档
4. Chrome Web Store 更新说明 - 通知用户此修复

