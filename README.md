# autoRedirect
============

## 功能介绍

Chrome extension to replace current url
使用场景：本地环境与dev环境自动切换。

* 在浏览器中打开的文件或者网址，自动重新定位到新的网址。
* 如果匹配到多个结果，会提示你选择你想要打开的网址。

## 安装使用

### 从 Chrome Web Store 安装
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

## 开源项目地址
* https://github.com/ikamal/autoRedirect

## Update log

**2025年5月25日 ver 0.1.0** - 🎉 升级到 Manifest V3
- 升级到 Manifest V3 标准
- 支持更多规则
- 设置页新增测试工具
- 添加详细的说明文档 https://extcreator.com/autoredirect/autoredirect_test.html

**2014年8月30日 ver 0.0.2** 
- 第一版上线

## todo:
- [ ] 手工检查 test_rules.js 中的规则
- [ ] 异步加载(中间页自动跳过)规则