# AutoRedirect - Chrome Web Store 介绍文案

**AutoRedirect** 是一个功能强大的智能URL重定向Chrome扩展，基于Manifest V3架构，支持多种匹配模式和URL模板替换，特别适用于开发环境切换、域名迁移和链接优化等场景。

## ✨ 核心特性

### 🎯 智能匹配系统
- **精确匹配**：使用`=`前缀，完全匹配指定URL，最安全可靠
- **开头匹配**：使用`^`前缀或`*`后缀，匹配以指定字符串开头的URL
- **结尾匹配**：使用`*`前缀或`$`后缀，匹配以指定字符串结尾的URL
- **包含匹配**：包含指定字符串的URL（默认模式）
- **智能URL提取**：自动解码跳转链接中的目标URL

### 🔧 强大的URL模板替换
- **通配符匹配**：使用`*`匹配任意字符段
- **占位符引用**：支持`{1}`, `{2}`, `{3}`等占位符引用匹配内容
- **灵活重组**：支持占位符重复使用、重新排列、选择性使用
- **复杂路径转换**：实现复杂的URL结构重写和路径映射

### ⚡ 高级功能
- **本地文件重定向**：支持本地HTML文件到远程URL的映射
- **多结果选择**：当匹配多个规则时提供选择界面
- **即时生效**：配置保存后立即生效，无需重启浏览器
- **安全可靠**：基于Manifest V3，性能优化，安全性更高

## 📖 快速上手

### 基础配置
1. 安装扩展并启用功能
2. 右键扩展图标选择"选项"
3. 配置重定向规则（格式：`原始URL模式####目标URL模式`）
4. 访问匹配的URL，自动跳转到目标地址

### 规则格式说明
```
# 基础格式
原始URL模式####目标URL模式

# 精确匹配（推荐）
=localhost:3000####https://dev.example.com

# 开头匹配
^dev.localhost####https://development.example.com

# URL模板替换
old-domain.com/*####new-domain.com/{1}

# 智能URL提取
link.zhihu.com/?target=####
```

## 🛠️ 典型使用场景

### 开发环境切换
```
=localhost:3000####https://dev.example.com
^api.localhost####https://api.example.com
^localhost:8####https://development.example.com
```

### 域名迁移和路径重写
```
# 保持路径结构的域名迁移
old-domain.com/*####new-domain.com/{1}

# 复杂路径重组
old.com/*/category/*/item/*####new.com/{1}/cat/{2}/product/{3}

# URL参数重排
site.com/*/page/*/section/*####newsite.com/{3}/{1}/{2}
```

### 本地文件映射
```
# 特定项目文件重定向
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/

# 通用demo文件重定向
*demo_local.html$####https://www.example.com/demo/

# 跨用户开发环境映射
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}/
```

### 智能链接跳转
```
# 自动跳过中间页面
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## 📋 高级配置示例

### 复杂模板替换
```
# 多段路径重组
example.com/*/page/*/section/*####https://newsite.com/{1}/newpage/{2}/newsection/{3}

# 占位符重复使用
old.com/user/*####new.com/{1}/profile/{1}/settings

# 选择性占位符使用
complex.com/*/middle/*/end/*####simple.com/{1}/{3}
```

### 特殊场景配置
```
# 多结果选择测试
multi####https://www.google.com
multi####https://www.bing.com
multi####https://www.yahoo.com

# 条件匹配
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

### 安全配置建议
```
# 使用精确匹配避免误触发
=localhost:3000####https://dev.example.com

# 使用标准域名格式
^dev.localhost####https://development.example.com

# 特殊场景使用安全前缀
^danger_dev####https://development.example.com
```

## 🎯 适用用户群体

- **前端开发者**：本地开发环境与线上环境快速切换
- **全栈工程师**：API端点和服务环境自动切换
- **测试工程师**：测试环境和生产环境无缝对接
- **网站管理员**：域名迁移和URL结构重组
- **产品经理**：快速访问不同环境的产品页面

## 🔗 相关资源

### 项目链接
- **GitHub仓库**：https://github.com/PlayerYK/AutoRedirect
- **Chrome Web Store**：https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf
- **在线测试页面**：https://extcreator.com/autoredirect/autoredirect_test.html

AutoRedirect致力于为开发者和网站管理员提供最便捷、安全、强大的URL重定向解决方案。
