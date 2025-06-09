# 🔗 智能URL提取
<p class="description">自动提取和解码跳转链接中的目标URL</p>

## 配置规则

```ini
# 智能URL提取测试配置
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## 💡 规则说明
目标URL留空，扩展会自动提取URL参数中的真实目标地址。

- 自动解码URL编码的参数
- 跳过中间跳转页面，直达目标网站
- 支持知乎、微信等常见跳转链接
- 提升浏览体验，节省时间

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>测试链接：</strong>
    <a href="https://link.zhihu.com/?target=https%3A//www.github.com" target="_blank">知乎跳转到GitHub</a>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>直接跳转到GitHub，跳过知乎中间页</span>
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