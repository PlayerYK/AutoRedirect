# 🚀 开头匹配重定向
<p class="description">匹配以指定字符串开头的URL，适用于域名和路径重定向</p>

## 配置规则

```ini
# 开头匹配测试配置
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
^localhost:8####https://development.example.com
staging.internal*####https://staging.example.com
```

## 💡 规则说明
使用 `^` 前缀或 `*` 后缀进行开头匹配，推荐使用标准域名格式。

- **推荐格式：** 使用 `.localhost`、`.local` 或带端口的 `localhost`
- **适用场景：** 开发环境、内网域名、特定端口服务
- **注意：** 简单字符串（如 `dev`、`api`）在浏览器地址栏直接输入时可能被当作搜索词
- **最佳实践：** 配合书签、链接点击或程序化访问使用

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>推荐测试：</strong>
    <span>在地址栏输入 <code>dev.localhost</code> 或 <code>localhost:8000</code></span>
  </div>
  <div class="test-link">
    <strong>程序化测试：</strong>
    <a href="https://staging.internal.example.com" target="_blank">staging.internal.example.com</a>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>自动跳转到对应的开发或测试环境</span>
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
.test-link a {
  font-weight: 600;
}
</style> 