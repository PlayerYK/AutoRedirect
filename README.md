# autoRedirect
============

## What is this repository for?

Chrome extension to replace current url
使用场景：本地环境与dev环境自动切换。

* 在浏览器中打开的文件或者网址，自动重新定位到新的网址。
* 如果匹配到多个结果，会提示你选择你想要打开的网址。

## 🚀 Manifest V3 升级

本扩展已升级到 **Manifest V3**，支持最新的Chrome扩展标准！

### 新特性
- ✅ 兼容 Chrome 88+ 版本
- ✅ 使用 Service Worker 后台脚本
- ✅ 改进的存储API (chrome.storage)
- ✅ 更好的性能和安全性
- ✅ 保持所有原有功能

### 升级说明
如果您从旧版本升级，请查看 [MANIFEST_V3_UPGRADE.md](MANIFEST_V3_UPGRADE.md) 了解详细变化。

## How do I get set up?

### 从Chrome Web Store安装
https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf

### 开发者模式安装
1. 下载或克隆此仓库
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

### 测试指南
详细的测试步骤请参考 [TESTING_GUIDE.md](TESTING_GUIDE.md)

## 使用方法

1. **启用扩展**：点击扩展图标，切换开关到开启状态
2. **配置规则**：右键扩展图标选择"选项"，添加重定向规则
3. **规则格式**：`原始URL模式####目标URL模式`

### 匹配模式

支持多种匹配模式，提供更精确的URL匹配控制：

- **精确匹配**：`=pattern####target` - 完全匹配指定URL
- **开头匹配**：`^pattern####target` 或 `pattern*####target` - 匹配以指定字符串开头的URL
- **结尾匹配**：`*pattern####target` 或 `pattern$####target` - 匹配以指定字符串结尾的URL  
- **包含匹配**：`pattern####target` - 包含指定字符串的URL（默认模式，向后兼容）

### 示例规则

```
# 精确匹配
=localhost:3000####https://dev.example.com

# 开头匹配
^dev####https://development.example.com
api*####https://api.example.com

# 结尾匹配
*test$####https://test.example.com
*.local####https://production.example.com

# URL模板替换功能
# 基础域名替换
https://old-domain.com/*####https://new-domain.com/{1}
# 复杂路径重写
http://example.com/*/page/*####https://newsite.com/{1}/newpage/{2}
# 多段路径重组
old.com/*/category/*/item/*####new.com/{1}/cat/{2}/product/{3}
# 参数重新排列
site.com/*/page/*/section/*####newsite.com/{3}/{1}/{2}
# 重复使用占位符
old.com/user/*####new.com/{1}/profile/{1}/settings

# 包含匹配（默认）
demo####https://demo.example.com

# 通用URL提取
link.zhihu.com/?target=####
```

### URL模板替换功能

新增强大的URL模板替换功能，支持使用通配符和占位符进行复杂的URL重写：

- **通配符匹配**：使用 `*` 匹配任意字符
- **占位符引用**：使用 `{1}`, `{2}`, `{3}` 等引用匹配的内容
- **灵活重组**：支持占位符重复使用、重新排列、选择性使用

#### 模板替换示例

```
# 域名迁移：将旧域名的所有路径迁移到新域名
https://old-site.com/*####https://new-site.com/{1}
输入：https://old-site.com/docs/guide
输出：https://new-site.com/docs/guide

# 路径重写：重新组织URL结构
old.com/*/category/*/item/*####new.com/{1}/cat/{2}/product/{3}
输入：old.com/books/category/fiction/item/123
输出：new.com/books/cat/fiction/product/123

# 参数重排：改变URL段的顺序
site.com/*/page/*/section/*####newsite.com/{3}/{1}/{2}
输入：site.com/user/page/profile/section/settings
输出：newsite.com/settings/user/profile
```

## 技术栈

- **Manifest Version**: 3
- **后台脚本**: Service Worker
- **存储**: chrome.storage API
- **UI框架**: 原生JavaScript + HTML/CSS
- **权限**: tabs, webRequest, storage

## Who do I talk to?

* https://github.com/ikamal/autoRedirect
* kamal.yu@gmail.com

## Update log

**2024年 ver 0.3.0** - 🎯 URL模板替换功能
- 新增URL模板替换功能，支持 `{1}`, `{2}`, `{3}` 等占位符
- 支持通配符 `*` 匹配任意字符并捕获内容
- 支持占位符重复使用、重新排列、选择性使用
- 智能匹配策略：单个通配符使用贪婪匹配，多个通配符优化匹配
- 完全向后兼容现有规则
- 示例：`old.com/*/page/*####new.com/{1}/newpage/{2}`

**2024年 ver 0.2.0** - 🎯 增强匹配模式
- 新增精确匹配模式（=pattern）
- 新增开头匹配模式（^pattern 或 pattern*）
- 新增结尾匹配模式（*pattern 或 pattern$）
- 保持向后兼容的包含匹配模式
- 选择页面显示匹配类型信息
- 改进URL匹配精确度，减少误触发

**2024年 ver 0.1.1** - 🚀 移除jQuery依赖
- 完全移除jQuery依赖，解决Service Worker兼容性问题
- 使用原生JavaScript重写所有DOM操作和事件处理
- 减小扩展包大小，提升性能
- 修复"window is not defined"错误

**2024年 ver 0.1.0** - 🎉 升级到 Manifest V3
- 升级到 Manifest V3 标准
- 使用 Service Worker 替代后台脚本
- 使用 chrome.storage 替代 localStorage
- 改进错误处理和用户体验
- 添加详细的升级和测试文档

**2014年8月30日 ver 0.0.2** - 首次运行加载默认pattern

## todo:
- [ ] 手工检查 test_rules.js 中的规则
- [ ] 各种规则用例补充 本地文件 测试