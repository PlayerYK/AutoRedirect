# AutoRedirect - 智能URL重定向

**AutoRedirect** 是一个功能强大的智能URL重定向Chrome扩展，基于Manifest V3架构，能轻松实现开发环境切换、域名迁移和链接优化等功能，大幅提升您的浏览和开发效率。

## ✨ 核心特性

- **🎯 多种匹配模式**：支持精确、前缀、后缀、通配符等多种匹配方式。
- **🔧 强大的URL模板**：使用`{1}`, `{2}`等占位符进行复杂的URL重写。
- **🔗 智能URL提取**：自动从跳转链接中提取真实URL，跳过中间页。
- **📁 本地文件映射**：将本地 `file://` 路径重定向到远程服务器。
- **🔀 多结果选择**：当一个规则匹配多个目标时，提供选择页面。
- **🛡️ 安全可靠**：基于Manifest V3，性能更优，安全性更高。

## 🚀 核心功能示例

```
# 场景1：开发环境切换
# 将本地服务地址自动指向开发服务器
=localhost:3000####https://dev.example.com

# 场景2：URL模板替换 (域名迁移)
# 将旧域名的所有页面映射到新域名，并保持路径
old-domain.com/*####https://new-domain.com/{1}

# 场景3：智能URL提取 (跳过中间页)
# 访问知乎外链时，直接跳转到目标网址
link.zhihu.com/?target=####

# 场景4：本地文件重定向
# 在浏览器中打开本地HTML文件时，自动跳转到在线版本
*demo_local.html$####https://www.example.com/demo/
```

## 📖 完整文档与更多示例

想要了解所有匹配规则和高级用法吗？我们为您准备了详细的在线文档！

**➡️ [访问在线文档](https://playeryk.github.io/AutoRedirect/)**

在文档中，您可以找到：
- 完整的上手指南
- 所有匹配模式的详细说明
- 几十个可直接复制的实用配置示例

## 适用用户

- **开发者**：在本地、开发、测试、生产环境间无缝切换。
- **网站管理员**：轻松处理域名迁移和URL重组。
- **效率追求者**：跳过烦人的广告或跳转中间页。

## 🔗 相关链接

- **GitHub仓库 (欢迎Star!)**: https://github.com/PlayerYK/AutoRedirect
- **问题与建议**: [通过 GitHub Issues 提交](https://github.com/PlayerYK/AutoRedirect/issues)

AutoRedirect致力于为开发者和效率爱好者提供最便捷、安全、强大的URL重定向解决方案。
