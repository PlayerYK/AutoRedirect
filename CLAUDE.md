# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AutoRedirect 是一个Chrome浏览器扩展，实现智能URL重定向功能。支持多种匹配模式和重定向规则，包括精确匹配、开头匹配、结尾匹配、URL模板替换等。

## 开发命令

### 核心构建命令
```bash
# 构建扩展包（主要命令）
npm run build
# 或
npm run package
# 或
npm run pack
# 或
node build.js
```

### 文档开发命令
```bash
# 本地开发文档
npm run docs:dev

# 构建文档
npm run docs:build

# 预览构建后的文档
npm run docs:preview
```

### 测试命令
```bash
# 测试中文配置规则
node test/test_config_rules.zh-CN.js

# 测试英文配置规则
node test/test_config_rules.en.js
```

## 代码架构

### 核心模块
- **src/script/background.js**: Service Worker主文件，处理重定向逻辑和扩展生命周期
- **src/script/redirect-engine.js**: 重定向引擎，包含所有核心匹配和重定向逻辑
- **src/script/config-manager.js**: 配置管理器，处理规则的获取、缓存和存储
- **src/script/options.js**: 选项页面脚本，提供配置界面
- **src/script/chose.js**: 多结果选择页面脚本
- **src/script/i18n.js**: 国际化工具

### 重定向引擎核心功能
- 支持精确匹配（=前缀）、开头匹配（^前缀或*后缀）、结尾匹配（*前缀或$后缀）
- URL模板替换（使用{1}, {2}, {3}占位符）
- 智能URL提取（空目标URL时）
- 自动协议处理（http/https/file://）
- 日志系统（Logger）用于调试

### 配置管理器功能
- 多级配置获取：内存缓存 → 本地存储 → 远程获取
- 多语言支持（中英文配置）
- 配置缓存和状态管理

## 重要文件位置

### 扩展核心文件
- **src/manifest.json**: 扩展清单文件
- **src/options.html**: 选项页面
- **src/chose.html**: 多结果选择页面
- **src/_locales/**: 国际化文件（中英文）

### 测试和示例
- **test/example_config.zh-CN.txt**: 详细的中文配置示例（规则参考）
- **test/example_config.en.txt**: 英文配置示例
- **test/TESTING_GUIDE.zh-CN.md**: 详细的测试指南

### 文档
- **docs/**: VitePress文档源码
- **README.md**: 项目说明（英文）
- **README.zh-CN.md**: 项目说明（中文）

## 开发规范

### 添加新功能时的更新流程
1. 修改 **src/** 目录下的核心代码
2. 更新 **test/example_config.zh-CN.txt** 和 **test/example_config.en.txt** 添加规则示例
3. 同步更新 **test/test_config_rules.zh-CN.js** 和 **test/test_config_rules.en.js** 测试脚本
4. 更新 **docs/** 目录下的相关文档页面

### 测试要求
- 修改重定向规则相关代码后，必须运行测试脚本确保所有测试通过
- 新功能需要添加到测试用例中
- 手动测试使用Chrome开发者模式加载扩展

## 构建和部署

### 构建流程
- 使用 `build.js` 脚本将 `src/` 目录打包为 `dist/AutoRedirect-{version}.zip`
- 版本号从 `src/manifest.json` 中自动读取
- 支持macOS和Linux系统（需要zip命令）

### 版本管理
- 版本号在 `src/manifest.json` 中定义
- 构建时自动生成对应版本的zip文件

## 调试和日志

### 日志系统
- 重定向引擎包含完整的日志系统（Logger）
- 支持不同日志级别：DEBUG, INFO, WARN, ERROR
- 可通过选项页面查看详细日志

### 调试方法
- 使用Chrome开发者工具查看Service Worker控制台
- 通过Logger系统查看重定向匹配过程
- 使用测试脚本验证规则逻辑

## 多语言支持

项目支持中英文双语：
- 扩展界面：通过 `src/_locales/` 实现
- 文档网站：通过VitePress多语言配置
- 配置示例：提供详细的中文说明

## 注意事项

- 修改重定向逻辑时需要特别注意URL标准化处理
- 模板替换功能需要正确处理捕获组
- 配置管理器的缓存机制需要在修改时清除缓存
- 测试时确保所有匹配模式都能正确工作