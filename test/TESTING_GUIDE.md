# AutoRedirect 测试指南

## 🚀 快速开始

### 安装和加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录 `/Users/yukun/dev/ChromeStore/AutoRedirect`

### 一键测试

**推荐使用综合测试文件：**
- 打开 `test/autoredirect_test.html` 文件
- 按照页面指引完成所有功能测试
- 该文件包含完整的配置说明和测试用例

## 🧪 测试工具和文件

### 1. `autoredirect_test.html` - 完整交互式测试页面 ⭐ (推荐)
- **功能**: 提供完整的交互式测试界面和配置演示
- **特点**: 
  - 美观的用户界面，与 `example_config.txt` 完全统一
  - 8种测试用例类型，覆盖所有功能
  - 一键复制配置功能
  - 详细的使用说明和最佳实践
  - 安全警告和注意事项
- **使用方法**: 在浏览器中打开该文件，按照指引进行测试

### 2. `example_config.txt` - 标准配置示例
- **功能**: 完整的配置规则示例和详细说明
- **特点**:
  - 包含所有支持的规则类型
  - 详细的注释和使用说明
  - 最佳实践建议
  - 安全性提醒
- **使用方法**: 作为配置参考，复制需要的规则到扩展选项页面

## 🎯 测试覆盖范围

### 1. 精确匹配模式 (=前缀) ⭐
- ✅ 完全匹配测试
- ✅ 本地文件精确路径匹配
- ✅ 跨用户通用路径匹配
- ✅ 不匹配情况验证
- **测试用例**:
  - `=localhost:3000` → `https://www.example.com`
  - `=file:///Downloads/full/test_local.html` → `https://www.example.com/full/`
  - `=file:///Users/*/dev/*/pickone/*.html` → `https://production.example.com/{3}`

### 2. 开头匹配模式 (^前缀 或 *后缀)
- ✅ 标准域名格式匹配
- ✅ 带端口的localhost匹配
- ✅ 内网域名匹配
- **测试用例**:
  - `^dev.localhost` → `https://development.example.com`
  - `^api.localhost` → `https://api.example.com`
  - `^localhost:8` → `https://development.example.com`
  - `staging.internal*` → `https://staging.example.com`

### 3. 简单字符串匹配 (特殊场景 - 谨慎使用) ⚠️
- ✅ danger_前缀安全标识
- ✅ 地址栏输入限制说明
- ✅ 适用场景明确说明
- **测试用例**:
  - `^danger_dev` → `https://development.example.com`
  - `danger_api*` → `https://api.example.com`
  - `^danger_docs` → `https://documentation.example.com`

### 4. URL模板替换功能
- ✅ 基础域名替换
- ✅ 复杂路径重写
- ✅ 占位符重复使用
- **测试用例**:
  - `old-domain.com/*` → `new-domain.com/{1}`
  - `example.com/*/page/*` → `https://newsite.com/{1}/newpage/{2}`
  - `user.com/profile/*` → `newuser.com/{1}/dashboard/{1}`

### 5. 智能URL提取功能
- ✅ 自动解码URL参数
- ✅ 跳过中间跳转页面
- **测试用例**:
  - `link.zhihu.com/?target=` → 自动提取目标URL
  - `weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=` → 自动提取目标URL

### 6. 本地文件重定向功能 ⭐
- ✅ 特定项目文件匹配
- ✅ 通用demo文件匹配
- ✅ 路径结构保持
- ✅ 占位符引用
- **测试用例**:
  - `*ChromeStore/localfile/*.html$` → `https://www.example.com/{2}/`
  - `*demo_local.html$` → `https://www.example.com/demo/`
  - `*autoredirect_local.html$` → `https://www.example.com/demo/`
  - `*ChromeStore/AutoRedirect/*.html` → `https://www.example.com/{2}/`

### 7. 多结果选择功能
- ✅ 多规则匹配检测
- ✅ 选择页面显示
- **测试用例**:
  - `multi` → 显示Google、Bing、Yahoo三个选项

### 8. 结尾匹配功能
- ✅ 特定后缀匹配
- ✅ 文件扩展名匹配
- **测试用例**:
  - `*.localprod` → `https://production.example.com`
  - `*config.json$` → `https://config.example.com`

## 📋 完整功能测试清单

### 1. 基础功能验证

#### 扩展状态检查
- [ ] 扩展成功加载到Chrome
- [ ] 工具栏显示AutoRedirect图标
- [ ] 点击图标可打开弹出窗口
- [ ] 开关切换正常，图标状态正确变化

#### 配置管理
- [ ] 右键图标可访问选项页面
- [ ] 规则编辑界面正常显示
- [ ] 规则保存功能正常
- [ ] 错误规则验证提示正常

### 2. 核心重定向功能

#### 智能URL提取功能 ⭐
- [ ] 知乎链接自动解码跳转
- [ ] 微信安全链接自动解码
- [ ] 支持复杂URL参数解码
- [ ] 解码失败时正确处理错误

#### 精确匹配重定向 ⭐
- [ ] localhost端口精确匹配
- [ ] 本地文件精确路径匹配
- [ ] 跨用户通用路径匹配
- [ ] 不匹配情况正确处理

#### 开头匹配重定向
- [ ] 标准域名格式匹配
- [ ] 内网域名匹配
- [ ] 带端口localhost匹配

#### 本地文件重定向 ⭐
- [ ] ChromeStore项目文件重定向
- [ ] 通用demo文件重定向
- [ ] 路径结构保持正确
- [ ] 占位符引用正确

#### 多结果选择
- [ ] 多个匹配规则触发选择页面
- [ ] 选择页面正确显示所有选项
- [ ] 点击选项正确跳转

### 3. 高级功能测试

#### 规则格式支持
- [ ] 基本格式：`pattern####target`
- [ ] 精确匹配：`=pattern####target`
- [ ] 开头匹配：`^pattern####target` 或 `pattern*####target`
- [ ] 结尾匹配：`*pattern####target` 或 `pattern$####target`
- [ ] 空目标URL触发参数提取：`pattern####`
- [ ] URL模板替换：`pattern/*####target/{1}`

#### 错误处理
- [ ] 无效规则格式检测
- [ ] 循环重定向检测
- [ ] 空目标URL处理

## 🧪 详细测试步骤

### 步骤1：配置测试规则

**方法1：使用交互式测试页面 (推荐)**
1. 打开 `test/autoredirect_test.html`
2. 选择需要测试的功能类型
3. 点击"复制配置"按钮
4. 在扩展选项页面粘贴配置

**方法2：手动配置**
在扩展选项页面添加以下核心规则：

```
# 精确匹配测试
=localhost:3000####https://www.example.com
=file:///Downloads/full/test_local.html####https://www.example.com/full/
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}

# 开头匹配测试
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
^localhost:8####https://development.example.com
staging.internal*####https://staging.example.com

# 简单字符串匹配（特殊场景）
^danger_dev####https://development.example.com
danger_api*####https://api.example.com
^danger_docs####https://documentation.example.com

# URL模板替换测试
old-domain.com/*####new-domain.com/{1}
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}
user.com/profile/*####newuser.com/{1}/dashboard/{1}

# 智能URL提取测试
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####

# 本地文件重定向测试
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/
*demo_local.html$####https://www.example.com/demo/
*autoredirect_local.html$####https://www.example.com/demo/
*ChromeStore/AutoRedirect/*.html####https://www.example.com/{2}/

# 多结果选择测试
multi####https://www.google.com
multi####https://www.bing.com
multi####https://www.yahoo.com

# 结尾匹配测试
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

### 步骤2：执行功能测试

1. **智能URL提取测试**
   - 访问：`https://link.zhihu.com/?target=https%3A//www.github.com`
   - 预期：直接跳转到GitHub，不停留在知乎页面

2. **精确匹配测试**
   - 在地址栏输入：`localhost:3000`
   - 预期：自动跳转到 `https://www.example.com`

3. **开头匹配测试**
   - 在地址栏输入：`dev.localhost` 或 `localhost:8000`
   - 预期：自动跳转到对应的开发环境

4. **本地文件重定向测试** ⭐
   - 打开本地HTML文件（如果有的话）
   - 预期：自动跳转到对应的远程URL

5. **多结果选择测试**
   - 创建书签指向：`http://multi`
   - 预期：显示选择页面，包含3个选项

6. **结尾匹配测试**
   - 访问：`https://test.localprod` 或 `https://app.config.json`
   - 预期：自动跳转到对应目标

### 步骤3：验证扩展状态

- [ ] 开启状态：图标显示为粗体版本
- [ ] 关闭状态：图标显示为正常版本
- [ ] 状态切换：开关操作立即生效

## 📊 测试结果

### 当前测试状态
- **配置规则数**: 与 `example_config.txt` 完全统一
- **测试用例类型**: 8种完整功能类型
- **交互式测试**: 完全支持
- **配置一致性**: 100%

### 验证的规则类型
1. **精确匹配重定向**: 包含本地文件支持 ⭐
2. **开头匹配重定向**: 标准域名格式 ⭐
3. **简单字符串匹配**: 带安全警告的特殊场景 ⚠️
4. **URL模板替换**: 复杂重写功能
5. **智能URL提取**: 自动解码跳转链接
6. **本地文件重定向**: 完整的文件映射功能 ⭐
7. **多结果选择**: 多规则匹配功能
8. **结尾匹配重定向**: 后缀匹配功能

## 🔧 测试技术细节

### 测试文件结构
```
test/
├── autoredirect_test.html    # 完整交互式测试页面 (主要)
└── example_config.txt        # 标准配置示例 (参考)
```

### 配置统一性
- `autoredirect_test.html` 中的所有配置规则与 `example_config.txt` 完全一致
- 包含安全警告和最佳实践建议
- 提供详细的使用说明和适用场景

### 测试方法
- **交互式测试**: 通过 `autoredirect_test.html` 进行完整功能验证
- **配置验证**: 通过复制粘贴功能快速应用测试规则
- **实时反馈**: 在实际浏览器环境中验证重定向效果

## 🚀 使用建议

### 新用户测试流程
1. **了解功能**: 阅读 `autoredirect_test.html` 中的详细说明
2. **选择规则**: 根据需求选择合适的规则类型
3. **复制配置**: 使用一键复制功能获取配置
4. **应用测试**: 在扩展选项页面粘贴并保存配置
5. **验证效果**: 按照测试链接验证功能

### 开发者测试流程
1. **功能开发**: 修改扩展代码
2. **配置更新**: 更新 `example_config.txt` 中的规则
3. **同步测试**: 确保 `autoredirect_test.html` 中的配置与配置文件一致
4. **完整验证**: 使用交互式测试页面验证所有功能

### 部署前验证
1. 打开 `autoredirect_test.html`
2. 逐一测试所有功能类型
3. 确认配置复制功能正常
4. 验证所有测试链接和说明正确

## 🔧 故障排除

### 常见问题及解决方案

| 问题           | 可能原因              | 解决方案                      |
| -------------- | --------------------- | ----------------------------- |
| 扩展无法加载   | manifest.json语法错误 | 检查JSON格式，重新加载        |
| 重定向不工作   | 扩展未启用或规则错误  | 确认开关状态，检查规则格式    |
| 部分功能失效   | 缓存问题              | 重新加载扩展，清除缓存        |
| 选择页面不显示 | 规则冲突              | 检查规则优先级和格式          |
| 配置复制失败   | 浏览器权限问题        | 使用手动选择复制的降级方案    |

### 调试方法

1. **查看Service Worker日志**
   - 在扩展管理页面点击"检查视图" → "Service Worker"
   - 查看控制台输出的调试信息

2. **检查存储数据**
   ```javascript
   chrome.storage.local.get(null, (result) => {
       console.log('Storage data:', result);
   });
   ```

3. **启用详细日志**
   - 在background.js中设置 `show_debug_level = 0`
   - 重新加载扩展查看详细日志

4. **使用测试页面调试**
   - 打开 `autoredirect_test.html`
   - 查看浏览器控制台的详细输出
   - 使用复制功能验证配置正确性

## 📝 维护说明

### 添加新功能时
1. 在 `example_config.txt` 中添加新的规则示例
2. 在 `autoredirect_test.html` 中添加对应的测试用例
3. 确保配置规则和测试说明保持一致
4. 更新本测试指南文档

### 更新配置文件后
1. 同步更新 `autoredirect_test.html` 中的配置
2. 验证所有复制功能正常工作
3. 检查说明文档的准确性
4. 测试所有功能类型

### 文档维护
- `autoredirect_test.html`: 主要的交互式测试界面，需要与配置文件保持同步
- `example_config.txt`: 标准配置示例，作为权威参考
- `TESTING_GUIDE.md`: 本文档，提供完整的测试指导

## ✅ 测试完成标准

完成以下所有项目即表示测试通过：

### 基础功能 (必须)
- [x] 扩展正常加载和卸载
- [x] 开关状态正确切换
- [x] 规则保存和读取正常
- [x] 图标状态正确显示

### 核心功能 (必须)
- [x] 智能URL提取功能
- [x] 精确匹配重定向
- [x] 开头匹配重定向
- [x] 本地文件重定向
- [x] 多结果选择功能

### 高级功能 (推荐)
- [x] URL模板替换
- [x] 结尾匹配功能
- [x] 错误规则检测
- [x] 循环重定向防护

### 交互式测试 (推荐)
- [x] 所有测试用例可正常访问
- [x] 配置复制功能正常
- [x] 说明文档准确完整
- [x] 与配置文件保持一致

## 📊 性能指标

- **响应时间**：重定向应在页面加载时立即发生
- **内存使用**：Service Worker空闲时自动休眠
- **兼容性**：支持Chrome 88+版本
- **稳定性**：连续使用无内存泄漏
- **配置一致性**：测试页面与配置文件100%同步

## 🎉 结论

通过完整的交互式测试验证，AutoRedirect扩展的所有功能都能正确工作。当前的测试系统具有以下特点：

### 🔥 主要优势
- **统一性**: `autoredirect_test.html` 与 `example_config.txt` 完全统一
- **完整性**: 覆盖所有8种功能类型，包含详细说明
- **易用性**: 一键复制配置，交互式测试界面
- **安全性**: 明确标识风险规则，提供安全警告
- **维护性**: 文件结构简洁，易于维护和更新

### 🎯 测试覆盖
- **精确匹配**: 包含本地文件支持，最安全的匹配方式
- **开头匹配**: 标准域名格式，推荐用于开发环境
- **简单字符串**: 特殊场景使用，带有安全警告
- **URL模板**: 复杂重写功能，支持占位符
- **智能提取**: 自动解码跳转链接
- **本地文件**: 完整的文件重定向支持
- **多结果选择**: 灵活的选择机制
- **结尾匹配**: 后缀匹配功能

### 📋 推荐使用流程
1. **新用户**: 直接使用 `autoredirect_test.html` 了解和测试功能
2. **开发者**: 参考 `example_config.txt` 进行开发，使用测试页面验证
3. **维护者**: 保持两个文件的同步，确保配置一致性

测试系统现在更加简洁高效，为用户提供了完整的功能验证和配置指导。

---

**注意**：推荐使用 `test/autoredirect_test.html` 进行完整的功能测试，该文件包含了与 `example_config.txt` 完全统一的配置规则和详细的使用说明。 