# 🔀 多结果选择测试
<p class="description">当一个URL匹配多个规则时，显示选择页面让用户选择</p>

## 配置规则

```
# 多结果选择测试配置（安全版本）
# 使用安全的精确匹配和开头匹配格式
=search.local####https://www.google.com
=search.local####https://www.bing.com
=search.local####https://www.yahoo.com

# 或者使用开头匹配的安全格式：
^search.localhost####https://www.google.com
^search.localhost####https://www.bing.com
^search.localhost####https://www.yahoo.com
```

## ⚠️ 重要安全说明

**避免简单字符串匹配的风险：**
- ❌ **错误示例：** `search####https://www.google.com`
- ⚠️ **问题：** 会意外匹配包含"search"的任何URL，如：
  - `https://research.com/search-results` 
  - `https://example.com/searchengine/docs`
  - `https://site.com/advanced-search`
- ✅ **正确做法：** 使用精确匹配 `=search.local` 或开头匹配 `^search.localhost`

## 💡 规则说明
当同一个URL模式匹配多个不同的目标URL时，扩展会显示选择页面。

- 用户可以选择想要跳转的目标网站
- 适用于一个关键词对应多个常用网站的场景
- 提供更灵活的重定向选择
- 避免记忆多个不同的快捷方式
- **安全第一：** 使用精确匹配避免意外重定向

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>✅ 推荐测试方法：</strong>
    <span>创建书签指向 <code>http://search.local</code> 或 <code>http://search.localhost</code></span>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>显示选择页面，包含Google、Bing、Yahoo三个选项</span>
  </div>
  <div class="test-link">
    <strong>⚠️ 安全提醒：</strong>
    <span>避免使用简单字符串匹配，防止意外触发重定向</span>
  </div>
  <div class="test-link">
    <strong>💡 提示：</strong>
    <span>直接在地址栏输入会被当作搜索词，建议使用书签或程序调用</span>
  </div>
</div>

<style>
.description {
  color: var(--vp-c-text-2);
  margin-top: -10px;
  margin-bottom: 20px;
}
.test-links {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}
.test-link {
  background: var(--vp-c-bg-soft);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.test-link strong {
  color: var(--vp-c-brand-1);
  display: block;
  margin-bottom: 8px;
}
.test-link code {
  background: var(--vp-c-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--vp-c-code);
  word-break: break-all;
}
.test-link a {
  font-weight: 600;
  word-break: break-all;
}
</style> 