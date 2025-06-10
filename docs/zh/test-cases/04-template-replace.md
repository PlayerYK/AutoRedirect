# 🔧 URL模板替换
<p class="description">使用通配符和占位符进行复杂的URL重写</p>

## 配置规则

```
# URL模板替换测试配置
old-domain.com/*####new-domain.com/{1}
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}
user.com/profile/*####newuser.com/{1}/dashboard/{1}
```

## 💡 规则说明
使用 `*` 通配符捕获URL片段，用 `{1}, {2}, {3}` 占位符引用。

- 支持域名迁移并保持路径结构
- 可以重新组织URL结构
- 占位符可以重复使用或选择性使用
- 适用于复杂的URL重写需求

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>测试链接：</strong>
    <a href="https://old-domain.com/path/to/page" target="_blank">old-domain.com/path/to/page</a>
  </div>
  <div class="test-link">
    <strong>测试链接：</strong>
    <a href="https://example.com/user/page/settings" target="_blank">example.com/user/page/settings</a>
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
  word-break: break-all;
}
</style> 