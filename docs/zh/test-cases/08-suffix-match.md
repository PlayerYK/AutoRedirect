# 🎯 结尾匹配重定向
<p class="description">匹配以指定字符串结尾的URL，适用于特定文件类型或后缀</p>

## 配置规则

```ini
# 结尾匹配测试配置
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

## 💡 规则说明
使用 `*` 前缀或 `$` 后缀匹配以指定字符串结尾的URL。

- 适用于特定文件扩展名的重定向
- 可以匹配特定后缀的域名或路径
- 支持配置文件、API端点等特殊场景
- 与开头匹配配合使用，实现精确控制

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>测试链接：</strong>
    <a href="https://test.localprod" target="_blank">test.localprod</a>
  </div>
  <div class="test-link">
    <strong>测试链接：</strong>
    <a href="https://app.config.json" target="_blank">app.config.json</a>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>分别跳转到生产环境和配置管理页面</span>
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