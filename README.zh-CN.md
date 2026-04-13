[English](./README.md)

# AutoRedirect - URL 重定向扩展

[Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf) · [在线文档](https://playeryk.github.io/AutoRedirect/)

**AutoRedirect** 是一个基于 Manifest V3 的 Chrome URL 重定向扩展，用于开发环境切换、域名迁移、跳转链接提取和本地文件映射。

## 功能特性

- **多种匹配模式** — 精确匹配、前缀、后缀、通配符，覆盖各种场景。
- **URL 模板替换** — 使用 `{1}`, `{2}` 等占位符进行路径重写和域名迁移。
- **URL 提取** — 自动从中间跳转页（知乎、微信等）提取真实链接。
- **本地文件映射** — 将本地 `file://` 路径重定向到远程服务器。
- **多结果选择** — 一条规则匹配多个目标时提供选择页面。
- **批量测试** — 内置批量 URL 测试工具，快速验证规则是否正确。
- **规则编辑器** — 行号、语法高亮、错误行提示、注释切换。

## 快速开始

1. 从 [Chrome Web Store](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf) 安装。
2. 打开扩展的选项页面。
3. 添加重定向规则。
4. 保存即刻生效。

完整使用指南和配置示例请查阅[在线文档](https://playeryk.github.io/AutoRedirect/)。

## 参与贡献

欢迎提交 Pull Request 和 Issue。开发前请阅读[开发者测试指南](test/TESTING_GUIDE.zh-CN.md)。

- 问题反馈: [GitHub Issues](https://github.com/PlayerYK/AutoRedirect/issues)

## 更新日志

### v0.2（最新）

**新功能**

- 批量 URL 测试工具：同时验证多条规则
- 规则编辑器增强：行号、语法高亮、错误行提示、注释切换（Ctrl+/）
- 规则统计栏：显示有效规则、注释和错误行数

**界面重设计**

- 全新设计的选项页面，采用统一的中性色调（Tailwind Slate 色阶）
- 移除所有 emoji，跨平台显示更一致
- 现代扁平风格开关，替换旧的拟物化滑块
- 清晰的按钮层级：主要操作（蓝色）、次要操作（描边）、上下文状态色
- 统一的提示通知和错误状态样式

**安全与稳定性**

- 修复多处 XSS 注入风险，增加 HTML 转义和协议白名单
- 修复 chose.html 数据加载竞态条件
- 新增规则解析缓存，避免重复正则编译
- 增加 `tabId < 0` 前置校验
- `parseRedirectRules` 增加空值防御检查

## 许可证

[MIT License](./LICENSE)