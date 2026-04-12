# Issue: Google 搜索结果页被跳过问题

## 问题描述

### 用户反馈

用户反馈：在 Google 搜索结果页面，如果页面中有网站链接符合重定向规则，Chrome 会跳过搜索结果页直接打开该网站。

**用户的规则示例：**

```
=https://twitter.com/*####https://x.com/{1}
```

### 复现场景

1. 用户在 Google 搜索 "twitter" 或其他包含 twitter.com 链接的关键词
2. Google 返回搜索结果页面，其中包含指向 `https://twitter.com/xxx` 的链接
3. **用户期望：** 看到 Google 搜索结果页面，然后点击想要的链接
4. **实际情况：** 页面直接跳转到 `https://x.com/xxx`，用户根本看不到搜索结果页

## 问题根源分析

### 代码位置

`src/script/background.js:132-183` 行

```javascript
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    const result = await chrome.storage.local.get(["jump_list_auto"]);
    const isAuto = result.jump_list_auto || 0;

    if (isAuto != 1) {
      return;
    }

    const url = details.url;
    // ... 检查重定向规则
    const { result_list, rule_info } = RedirectEngine.findRedirectMatches(url, rules, src_list);

    switch (result_list.length) {
      case 0:
        break;
      case 1:
        chrome.tabs.update(details.tabId, {
          url: result_list[0],
        });
        break;
      // ...
    }
  },
  {
    urls: ["http://*/*", "https://*/*"],  // ⚠️ 拦截所有 HTTP/HTTPS 请求
    types: ["main_frame"],  // 只拦截主框架导航
  }
);
```

### 技术原因

1. `**webRequest.onBeforeRequest` 的拦截时机**
  - 这个 API 会在请求发出之前就被触发
  - 包括：用户主动导航、浏览器预加载、页面跳转、重定向等所有场景
2. **浏览器的优化机制**
  - Chrome 有预渲染（Prerender）、预取（Prefetch）等优化机制
  - 当搜索结果页面加载时，可能会预先发起对搜索结果链接的请求
  - 即使用户还没有点击链接，`webRequest.onBeforeRequest` 也会被触发
3. **触发流程**
  前提条件：用户需要设置 Chrome -> chrome://settings/performance -> speed -> Extended preloading

### 影响范围

这个问题不仅影响 Google 搜索，还可能影响：

- 任何包含符合规则链接的中间页面
- 社交媒体分享页面（短链接跳转页）
- 新闻聚合网站
- 任何链接聚合页面

## 当前架构的设计问题

### 问题 1：拦截时机过早

`webRequest.onBeforeRequest` 在请求发起前就拦截，导致：

- 无法区分用户主动导航和浏览器自动行为
- 用户失去对中间页面的控制权
- 违背用户预期（用户想看搜索结果）

### 问题 2：缺少上下文信息

当前实现无法判断：

- 请求是否由用户点击触发
- 请求是否来自页面预加载
- 用户是否真的想要进行重定向

### 问题 3：缺少白名单机制

没有办法排除特定域名，如：

- 搜索引擎（google.com, bing.com）
- 重要的中间页面

### 问题 4：影响用户体验

- 用户可能根本看不到中间页面
- 重定向行为不可预测
- 违背"用户主动选择"的原则

## 现有的两个触发机制

当前扩展有两个重定向触发点：

### 1. `tabs.onUpdated` 监听器 (background.js:59-81)

```javascript
async function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab && tab.url && tab.url.indexOf("file:///") > -1) {
    // 只处理 file:/// 协议的 URL
    // ...
  }
}
chrome.tabs.onUpdated.addListener(checkForValidUrl);
```

- **触发时机：** 标签页 URL 更新时
- **当前限制：** 只处理 `file:///` 协议
- **触发频率：** 较低，只在页面加载过程中触发

### 2. `webRequest.onBeforeRequest` 监听器 (background.js:132-183)

```javascript
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    // 处理所有 http:// 和 https:// 的请求
  },
  {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame"],
  }
);
```

- **触发时机：** 请求发出之前（最早）
- **处理范围：** 所有 HTTP/HTTPS 主框架请求
- **问题：** 包括预加载等自动请求

## 技术背景：Chrome Extension APIs

### webRequest API

- **触发时机：** 请求生命周期的最早阶段
- **无法区分：** 用户行为 vs 浏览器自动行为
- **Manifest V3 限制：** 性能和隐私原因，Google 正在逐步限制此 API

### webNavigation API

- **触发时机：** 导航提交时（更晚，但更准确）
- **提供信息：** `transitionType` 可以区分导航类型
  - `typed`：用户在地址栏输入
  - `link`：用户点击链接
  - `auto_bookmark`：自动书签
  - `reload`：重新加载
  - 等等
- **优点：** 更精确，更符合用户预期

### tabs API

- **触发时机：** 标签页状态变化时
- **事件类型：**
  - `onUpdated`：URL、状态等变化
  - `onCreated`：新标签页创建
- **优点：** 简单，兼容性好

## 结论

**这不是用户配置错误，而是扩展的设计缺陷。**

当前使用 `webRequest.onBeforeRequest` 拦截所有请求的设计过于激进，导致：

1. 拦截了不应该拦截的请求（浏览器预加载）
2. 用户失去对中间页面的控制
3. 违背用户预期和使用习惯
4. 影响正常的浏览体验

**需要重新设计重定向触发机制。**