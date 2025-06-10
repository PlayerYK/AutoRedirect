# ⚠️ 简单字符串匹配（特殊场景 - 谨慎使用）
<p class="description">了解简单字符串匹配的限制和适用场景，使用danger_前缀标识风险</p>

## 配置规则

```
# 简单字符串匹配配置（特殊场景 - 谨慎使用）
^danger_dev####https://development.example.com
danger_api*####https://api.example.com
^danger_docs####https://documentation.example.com
```

## ⚠️ 重要安全说明
这类简单字符串匹配规则使用 `danger_` 前缀标识风险，需要了解其限制：

- **地址栏限制：** 在Chrome地址栏直接输入 "danger_dev" 会被当作搜索词，跳转到搜索引擎
- **安全标识：** `danger_` 前缀提醒用户这些规则有使用限制
- **适用场景：**
    - 其他应用程序调用浏览器打开URL时
    - 点击书签或网页链接时
    - 通过脚本或程序化方式访问时
    - 企业内网环境的特殊配置
- **推荐替代：** 使用 `.localhost`、`.local` 或完整域名格式
- **测试方法：** 创建书签或通过程序调用，而非直接在地址栏输入

## 测试方法

<div class="test-links">
  <div class="test-link">
    <strong>❌ 不推荐：</strong>
    <span>在地址栏直接输入 <code>danger_dev</code>（会跳转到搜索）</span>
  </div>
  <div class="test-link">
    <strong>✅ 推荐：</strong>
    <span>创建书签指向 <code>http://danger_dev</code> 或通过程序调用</span>
  </div>
  <div class="test-link">
    <strong>💡 提示：</strong>
    <span>如需地址栏直接输入，请使用上面的标准域名格式</span>
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