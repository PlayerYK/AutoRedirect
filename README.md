# AutoRedirect - 智能重定向扩展

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/edgiaaakbcjloebnmehbnfiajbhcpbcf.svg)](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/edgiaaakbcjloebnmehbnfiajbhcpbcf.svg)](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)

## 🚀 功能介绍

AutoRedirect 是一个强大的 Chrome 扩展，用于自动重定向 URL，特别适用于开发环境与生产环境之间的自动切换。

### ✨ 主要特性

- 🎯 **智能匹配**：支持精确匹配、开头匹配、结尾匹配等多种模式
- 🔧 **URL模板替换**：使用通配符和占位符进行复杂的URL重写
- 📁 **本地文件重定向**：支持本地文件到远程URL的映射
- 🔗 **智能URL提取**：自动解码跳转链接中的目标URL
- 🔀 **多结果选择**：当匹配多个规则时提供选择页面
- ⚡ **即时生效**：配置保存后立即生效，无需重启浏览器
- 🛡️ **安全可靠**：基于 Manifest V3，性能优化，安全性更高

### 🎯 使用场景

- **开发环境切换**：本地开发环境与测试/生产环境自动切换
- **域名迁移**：批量重定向旧域名到新域名
- **链接简化**：跳过中间跳转页面，直达目标网站
- **本地文件映射**：将本地HTML文件重定向到在线版本
- **API端点切换**：开发、测试、生产API端点自动切换

## 📦 安装使用

### 从 Chrome Web Store 安装（推荐）
[🛒 立即安装](https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf)

### 开发者模式安装
1. 下载或克隆此仓库
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

## 🧪 测试指南

我们提供了完整的测试系统来验证扩展功能：

- **📋 完整测试指南**：[TESTING_GUIDE.md](test/TESTING_GUIDE.md)
- **🎮 交互式测试页面**：[autoredirect_test.html](test/autoredirect_test.html)
- **🌐 在线测试页面**：[https://extcreator.com/autoredirect/autoredirect_test.html](https://extcreator.com/autoredirect/autoredirect_test.html)
- **📝 配置示例**：[example_config.txt](test/example_config.txt)

### 快速测试
1. 打开 `test/autoredirect_test.html`
2. 按照页面指引选择测试功能
3. 一键复制配置到扩展选项页面
4. 验证重定向效果

## 📖 使用方法

### 基础配置

1. **启用扩展**：点击扩展图标，切换开关到开启状态
2. **配置规则**：右键扩展图标选择"选项"，添加重定向规则
3. **规则格式**：`原始URL模式####目标URL模式`

### 🎯 匹配模式

支持多种匹配模式，提供精确的URL匹配控制：

#### 精确匹配（推荐，最安全）
```
=localhost:3000####https://dev.example.com
=github.com####https://www.github.com
```
- 使用 `=` 前缀
- 只匹配完全相同的URL
- 避免误触发，适用于生产环境

#### 开头匹配（推荐格式）
```
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
^localhost:8####https://development.example.com
staging.internal*####https://staging.example.com
```
- 使用 `^` 前缀或 `*` 后缀
- 推荐使用标准域名格式（.localhost、.local）
- 适用于开发环境和内网域名

#### 结尾匹配
```
*.local####https://production.example.com
*config.json$####https://config.example.com
```
- 使用 `*` 前缀或 `$` 后缀
- 适用于特定文件类型或后缀匹配

#### 简单字符串匹配（特殊场景，谨慎使用）
```
^danger_dev####https://development.example.com
danger_api*####https://api.example.com
```
- 使用 `danger_` 前缀标识风险
- 在地址栏直接输入可能被当作搜索词
- 适用于书签、程序调用等场景

### 🔧 URL模板替换功能

强大的URL模板替换功能，支持复杂的URL重写：

#### 基础语法
- **通配符匹配**：使用 `*` 匹配任意字符
- **占位符引用**：使用 `{1}`, `{2}`, `{3}` 等引用匹配的内容
- **灵活重组**：支持占位符重复使用、重新排列、选择性使用

#### 实用示例

```
# 域名迁移：保持路径结构
old-domain.com/*####new-domain.com/{1}
输入：old-domain.com/docs/guide
输出：new-domain.com/docs/guide

# 复杂路径重写：重新组织URL结构
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}
输入：example.com/user123/page/settings
输出：https://newsite.com/user123/newpage/settings

# 多段路径重组
old.com/*/category/*/item/*####new.com/{1}/cat/{2}/product/{3}
输入：old.com/books/category/fiction/item/123
输出：new.com/books/cat/fiction/product/123

# 参数重新排列
site.com/*/page/*/section/*####newsite.com/{3}/{1}/{2}
输入：site.com/user/page/profile/section/settings
输出：newsite.com/settings/user/profile

# 重复使用占位符
old.com/user/*####new.com/{1}/profile/{1}/settings
输入：old.com/user/john
输出：new.com/john/profile/john/settings
```

### 🔗 智能URL提取功能

自动提取和解码跳转链接中的目标URL：

```
# 知乎链接自动解码
link.zhihu.com/?target=####

# 微信安全链接自动解码
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

目标URL留空（`####`后面为空），扩展会自动提取URL参数中的真实目标地址。

### 📁 本地文件重定向功能

支持本地文件到远程URL的映射，适用于开发环境：

```
# 特定项目文件重定向
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/

# 通用demo文件重定向
*demo_local.html$####https://www.example.com/demo/

# 跨用户开发环境映射
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}/
```

### 🔀 多结果选择功能

当一个URL匹配多个规则时，显示选择页面：

```
multi####https://www.google.com
multi####https://www.bing.com
multi####https://www.yahoo.com
```

## 📁 项目结构

```
AutoRedirect/
├── src/                          # 源代码目录
│   ├── images/                   # 图标资源
│   └── script/                   # 脚本文件
│       └── redirect-engine.js    # 重定向引擎核心
├── test/                         # 测试系统
│   ├── autoredirect_test.html    # 交互式测试页面
│   ├── example_config.txt        # 配置示例
│   └── TESTING_GUIDE.md         # 测试指南
├── store/                        # 应用商店资源
├── manifest.json                 # 扩展清单文件 (Manifest V3)
├── background.js                 # 后台脚本
├── chose.html                    # 多结果选择页面
├── options.html                  # 选项页面
├── popup.html                    # 弹出窗口
├── build.js                      # 构建脚本
└── README.md                     # 项目说明
```

## 🛠️ 开发指南

### 环境要求
- Chrome 88+ 浏览器
- Node.js（用于构建脚本）

### 开发流程
1. **克隆项目**：`git clone https://github.com/PlayerYK/AutoRedirect.git`
2. **加载扩展**：在Chrome扩展管理页面加载项目目录
3. **修改代码**：编辑源文件
4. **测试功能**：使用 `test/autoredirect_test.html` 进行测试
5. **构建打包**：运行 `node build.js` 生成发布包

### 核心文件说明

- **`background.js`**：后台脚本，处理URL重定向逻辑
- **`src/script/redirect-engine.js`**：重定向引擎，核心匹配算法
- **`options.html/js`**：选项页面，规则配置界面
- **`chose.html/js`**：多结果选择页面
- **`popup.html/js`**：扩展开关控制

### 测试系统

项目包含完整的测试系统：

- **交互式测试**：`test/autoredirect_test.html` - 用户友好的测试界面
- **配置示例**：`test/example_config.txt` - 完整的规则示例
- **测试指南**：`test/TESTING_GUIDE.md` - 详细的测试说明

## 🔧 构建打包

使用内置的构建脚本进行打包：

```bash
# 运行构建脚本
node build.js

# 输出文件
dist/AutoRedirect-v[版本号].zip
```

构建脚本会自动：
- 读取 manifest.json 中的版本号
- 创建 dist 目录
- 打包所有必要文件
- 生成带版本号的zip文件

## 📊 版本历史

### 🎉 v0.1.0 (2025年6月) - Manifest V3 重大升级
- ✅ 升级到 Manifest V3 标准
- ✅ 全新的重定向引擎
- ✅ 支持8种匹配模式
- ✅ URL模板替换功能
- ✅ 本地文件重定向支持
- ✅ 智能URL提取功能
- ✅ 多结果选择功能
- ✅ 完整的测试系统
- ✅ 交互式配置界面
- ✅ 详细的文档和示例

### v0.0.2 (2014年8月30日)
- 第一版上线

## 🔗 相关链接

- **Chrome Web Store**：https://chrome.google.com/webstore/detail/autoredirect/edgiaaakbcjloebnmehbnfiajbhcpbcf
- **GitHub 仓库**：https://github.com/PlayerYK/AutoRedirect
- **在线演示**：https://extcreator.com/autoredirect/autoredirect_test.html
- **问题反馈**：[GitHub Issues](https://github.com/PlayerYK/AutoRedirect/issues)

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

**注意**：推荐使用 `test/autoredirect_test.html` 进行完整的功能测试，该文件包含了与配置示例完全统一的规则和详细的使用说明。