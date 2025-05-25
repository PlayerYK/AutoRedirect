# AutoRedirect 打包工具使用说明

## 功能说明

这个打包工具可以将 AutoRedirect Chrome 扩展项目打包成应用商店需要的 zip 文件。

## 使用方法

### 方法一：直接运行脚本
```bash
node build.js
```

### 方法二：使用 npm 脚本（推荐）
```bash
npm run build
# 或者
npm run package
# 或者
npm run pack
```

## 打包规则

### 包含的文件和文件夹：
- `images/` - 图标文件
- `script/` - JavaScript 脚本文件
- `manifest.json` - 扩展清单文件
- `popup.html` - 弹窗页面
- `options.html` - 选项页面
- `chose.html` - 选择页面

### 排除的文件和文件夹：
- `store/` - 商店相关文件
- `test/` - 测试文件
- `.cursor/` - Cursor 编辑器配置
- `.idea/` - IntelliJ IDEA 配置
- `.vscode/` - VS Code 配置
- `.git/` - Git 版本控制文件
- `README.md` - 项目说明文档
- `.editorconfig` - 编辑器配置
- `.prettierrc` - 代码格式化配置
- `.gitignore` - Git 忽略文件配置
- `.DS_Store` - macOS 系统文件
- `build.js` - 打包脚本本身
- `package.json` - Node.js 包配置
- `node_modules/` - Node.js 依赖包
- `*.zip` - 已存在的 zip 文件

## 输出文件

打包后会生成 `AutoRedirect-{version}.zip` 文件，其中 `{version}` 从 `manifest.json` 中的 `version` 字段获取。

例如：`AutoRedirect-0.1.0.zip`

## 系统要求

- Node.js 12.0.0 或更高版本
- 系统需要安装 `zip` 命令（macOS 通常已预装）

## 注意事项

1. 每次打包前会自动删除同名的旧 zip 文件
2. 打包完成后会显示文件大小和包含的文件列表
3. 如果系统没有 `zip` 命令，脚本会提示安装方法 