# 🎯 精确匹配重定向
<p class="description">完全匹配指定URL，最安全的重定向方式</p>

## 配置规则

```
# 精确匹配测试配置
=localhost:3000####https://www.example.com
=file:///Downloads/full/test_local.html####https://www.example.com/full/
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}
```

## 💡 规则说明
使用 `=` 前缀进行精确匹配，只有完全相同的URL才会触发重定向。

- 最安全的匹配方式，避免误触发
- 适用于特定域名或完整URL的重定向
- 支持本地文件的精确路径匹配
- 支持跨用户的通用路径匹配（使用`*`通配符）
- 推荐用于生产环境的关键重定向规则

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>测试方法：</strong>
    <span>在地址栏输入 <code>localhost:3000</code></span>
  </div>
  <div class="test-link">
    <strong>本地文件测试：</strong>
    <span>打开 <code>file:///Downloads/full/test_local.html</code></span>
  </div>
  <div class="test-link">
    <strong>跨用户路径测试：</strong>
    <span>打开 <code>file:///Users/[用户名]/dev/[项目]/pickone/test.html</code></span>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>自动跳转到对应的目标URL</span>
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
}
</style> 