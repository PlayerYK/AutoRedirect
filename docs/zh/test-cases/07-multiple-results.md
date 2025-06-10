# 🔀 多结果选择测试
<p class="description">当一个URL匹配多个规则时，显示选择页面让用户选择</p>

## 配置规则

```
# 多结果选择测试配置
multi####https://www.google.com
multi####https://www.bing.com
multi####https://www.yahoo.com
```

## 💡 规则说明
当同一个URL模式匹配多个不同的目标URL时，扩展会显示选择页面。

- 用户可以选择想要跳转的目标网站
- 适用于一个关键词对应多个常用网站的场景
- 提供更灵活的重定向选择
- 避免记忆多个不同的快捷方式

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>测试方法：</strong>
    <span>创建书签指向 <code>http://multi</code> 或通过程序调用</span>
  </div>
  <div class="test-link">
    <strong>预期结果：</strong>
    <span>显示选择页面，包含Google、Bing、Yahoo三个选项</span>
  </div>
  <div class="test-link">
    <strong>💡 提示：</strong>
    <span>直接在地址栏输入"multi"会被当作搜索词</span>
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