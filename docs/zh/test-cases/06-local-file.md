# 📁 本地文件重定向
<p class="description">将本地文件路径重定向到远程服务器</p>

## 配置规则

```
# 本地文件重定向测试配置
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/
*demo_local.html$####https://www.example.com/demo/
*autoredirect_local.html$####https://www.example.com/demo/
*ChromeStore/AutoRedirect/*.html####https://www.example.com/{2}/
```

## 💡 规则说明
支持本地文件路径到远程URL的映射，适用于开发环境。

- 支持 `file://` 协议的本地文件
- 可以使用通配符批量处理文件
- 适用于本地开发到生产环境的映射
- 支持保持目录结构的重定向
- 规则按优先级排序：特定项目 > 通用匹配
- 支持占位符 `{1}, {2}` 等引用匹配的路径片段

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>ChromeStore项目测试：</strong>
    <span>打开 <code>file:///path/to/ChromeStore/localfile/test.html</code></span>
  </div>
  <div class="test-link">
    <strong>通用demo文件测试：</strong>
    <span>打开 <code>file:///path/to/demo_local.html</code></span>
  </div>
  <div class="test-link">
    <strong>AutoRedirect项目测试：</strong>
    <span>打开 <code>file:///path/to/ChromeStore/AutoRedirect/test.html</code></span>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>自动跳转到对应的远程服务器地址，保持路径结构</span>
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