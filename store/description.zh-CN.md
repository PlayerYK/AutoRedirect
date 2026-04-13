**AutoRedirect** 是一个基于 Manifest V3 的 Chrome URL 重定向扩展，用于开发环境切换、域名迁移和跳转链接优化。

## 核心功能

- **多种匹配模式** — 精确匹配、前缀、后缀、通配符，覆盖各种场景。
- **URL 模板替换** — 使用 `{1}`, `{2}` 等占位符进行路径重写和域名迁移。
- **URL 提取** — 自动从中间跳转页提取真实链接，一步直达。
- **本地文件映射** — 将本地 `file://` 路径重定向到远程服务器。
- **多结果选择** — 一条规则匹配多个目标时提供选择页面。
- **批量测试** — 内置批量 URL 测试工具，快速验证规则是否正确。

## 使用示例

```
# 精确匹配：本地端口 → 开发服务器
=localhost:3000####https://dev.example.com

# 域名迁移：保持路径不变
old-domain.com/*####https://new-domain.com/{1}

# URL 提取：跳过知乎外链中间页
link.zhihu.com/?target=####

# 后缀匹配：本地文件 → 在线版本
*demo_local.html$####https://www.example.com/demo/
```

## 适用场景

- **开发者** — 在本地、开发、测试、生产环境间快速切换。
- **站长** — 批量处理域名迁移和 URL 重组。
- **日常用户** — 跳过广告页和跳转中间页。

## 文档

完整使用指南和更多配置示例：[https://playeryk.github.io/AutoRedirect/](https://playeryk.github.io/AutoRedirect/)

## 最近更新

- 全新设计的选项页面，更清晰的视觉风格
- 新增批量 URL 测试工具，支持同时验证多条规则
- 规则编辑器增强：行号、语法高亮、错误行提示、注释切换

## 链接

- GitHub: [https://github.com/PlayerYK/AutoRedirect](https://github.com/PlayerYK/AutoRedirect)
- 问题反馈: [https://github.com/PlayerYK/AutoRedirect/issues](https://github.com/PlayerYK/AutoRedirect/issues)

