[English](./README.md)

# AutoRedirect - URL 重定向扩展

[Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)
[Chrome Web Store Users](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)
[Documentation](https://playeryk.github.io/AutoRedirect/)

AutoRedirect 是一个强大的 Chrome 扩展，用于自动重定向 URL，特别适用于开发环境与生产环境之间的自动切换，以及简化日常的网页浏览。

## ✨ 主要特性

- 🎯 **多种匹配**：支持精确匹配、前缀、后缀等多种模式。
- 🔧 **URL模板替换**：使用通配符和占位符进行复杂的URL重写。
- 📁 **本地文件重定向**：支持本地文件到远程URL的映射。
- 🔗 **URL提取**：自动解码跳转链接中的目标URL。
- 🔀 **多结果选择**：当匹配多个规则时提供选择页面。
- ⚡ **即时生效**：配置保存后立即生效，无需重启浏览器。
- 🛡️ **安全可靠**：基于 Manifest V3，性能优化，安全性更高。

## 📖 在线文档

我们提供了完整且详细的在线文档，包含了**使用指南**、**全部测试用例**和**高级功能说明**。

**➡️ [访问在线文档](https://playeryk.github.io/AutoRedirect/)**

在这里，您可以找到所有功能的详细解释和可直接复制的配置示例。

## 📦 安装

[🛒 **从 Chrome Web Store 安装（推荐）](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)**

## 🛠️ 开发与贡献

本项目是一个开源项目，欢迎所有形式的贡献！无论是代码实现、功能建议还是问题反馈，我们都非常欢迎。

- **贡献代码**: 请先 Fork 本仓库，然后在您的分支上进行修改，最后提交 Pull Request。
- **本地测试**: 参与开发前，请务必阅读我们的 [开发者测试指南](test/TESTING_GUIDE.zh-CN.md)。
- **问题反馈**: [请通过 GitHub Issues 提交](https://github.com/PlayerYK/AutoRedirect/issues)

## 📋 更新日志

### v0.2.1

**安全修复**

- 修复多处 XSS 注入风险：所有动态内容插入 DOM 前均经过 HTML 转义，href 属性增加协议白名单校验
- 修复 `startProcess` 忽略传入标签参数导致重定向到错误标签页的 bug

**功能改进**

- 消除消息传递竞态：chose.html 改为主动向 background 请求数据，不再依赖不可靠的 `setTimeout`
- 修复 URL 时间戳拼接破坏已有查询参数的问题（使用 `URL` 对象正确处理）
- 新增规则解析缓存，配置不变时避免重复解析和正则编译，提升性能
- 修正 `isRegexPattern` 正则判断逻辑，移除 `findRedirectMatches` 中未使用的多余参数
- 增加 `tabId < 0` 前置校验，防止对无宿主标签页调用 `tabs.update` 失败

**体验优化**

- 选项页添加 `<meta viewport>` 和 `lang` 属性，改善移动端和屏幕阅读器体验
- 焦点元素添加 `focus-visible` 样式，键盘用户可见焦点指示
- 校验提示从 `alert()` 改为页面内 Toast 通知，体验更一致
- 修复 CSS `insertRule` 中本地化文案含引号时破坏样式的问题

**代码质量**

- 修复测试脚本配置加载失败时错误退出码为 0 的问题
- 添加 Node.js 测试环境下的 `chrome.i18n` mock，全部 48 个测试用例通过
- 统一 `package.json` 与 `manifest.json` 版本号
- 添加 `npm test` 脚本，构建时排除 `.DS_Store` 等系统文件

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。