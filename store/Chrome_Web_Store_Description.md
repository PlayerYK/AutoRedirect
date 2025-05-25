# AutoRedirect - Chrome Web Store 介绍文案


**AutoRedirect** 能够方便的自定义重定向URL，实现不同环境间的无缝切换，自动跳过中间页面等。

### ✨ 主要特性

**🎯 多种匹配模式**
- **精确匹配**：完全匹配指定URL
- **开头匹配**：匹配以指定字符串开头的URL
- **结尾匹配**：匹配以指定字符串结尾的URL
- **包含匹配**：包含指定字符串的URL（默认模式）

**🔧 方便的URL模板替换**
- 支持通配符匹配（*）
- 占位符引用（{1}, {2}, {3}等）
- 灵活的URL重组和重写
- 支持复杂的路径转换

**⚡ 智能重定向逻辑**
- 单一匹配：自动跳转
- 多重匹配：提供选择界面
- 实时处理：无需刷新页面


### 📖 快速上手

1. 安装扩展并启用功能
2. 配置重定向规则（格式：`原始URL####目标URL`）
3. 访问匹配的URL，自动跳转到目标地址

### 🛠️ 使用场景

**开发环境切换**
```
localhost:3000####https://dev.example.com
```

**域名迁移**
```
https://old-site.com/*####https://new-site.com/{1}
```

**复杂路径重写**
```
old.com/*/category/*/item/*####new.com/{1}/cat/{2}/product/{3}
```

**URL参数重排**
```
site.com/*/page/*/section/*####newsite.com/{3}/{1}/{2}
```

### 📋 配置示例

```
# 本地开发环境切换
=localhost:3000####https://dev.example.com
^dev####https://development.example.com

# API环境重定向
api*####https://api.example.com
*test$####https://test.example.com

# 复杂URL模板替换
https://old-domain.com/*####https://new-domain.com/{1}
old.com/user/*####new.com/{1}/profile/{1}/settings

# 自动跳过中间页面
link.zhihu.com/?target=####
```

### 🎯 简单易用

- 一键开关控制，直观的配置界面
- 本地存储，隐私安全，代码开源
- 适合开发者、网站管理员和测试工程师使用

### 🔗 相关链接

- **GitHub仓库**：https://github.com/ikamal/autoRedirect
- **详细文档**：https://extcreator.com/autoredirect/autoredirect_test.html
- **问题反馈**：通过GitHub Issues提交
