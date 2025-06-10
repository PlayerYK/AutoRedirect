# 配置参考

本页面提供 AutoRedirect 配置规则的详细信息，包括语法、匹配模式、最佳实践和安全注意事项。

## 规则格式

重定向规则的基本格式为：
```
原始URL模式####目标URL模式
```

- 使用 `####` 作为原始URL模式和目标URL之间的分隔符
- 空目标URL（`####` 后面为空）用于通用URL提取功能
- 以 `#` 开头的行为注释行，会被忽略
- 空行也会被忽略

## 匹配模式说明

### 1. 精确匹配（推荐，最安全）
使用 `=` 前缀进行完全匹配，避免意外触发。

**语法**：`=pattern####目标URL`

**示例**：
```
=localhost:3000####https://www.example.com
=file:///Downloads/full/test_local.html####https://www.example.com/full/
```

### 2. 开头匹配（推荐格式）
使用 `^` 前缀或 `*` 后缀匹配以指定字符串开头的URL。

**语法**：`^pattern####目标URL` 或 `pattern*####目标URL`

**示例**：
```
^dev.localhost####https://development.example.com
^api.localhost####https://api.example.com
localhost:8*####https://development.example.com
```

### 3. 结尾匹配
使用 `*` 前缀或 `$` 后缀匹配以指定字符串结尾的URL。

**语法**：`*pattern####目标URL` 或 `pattern$####目标URL`

**示例**：
```
*.localprod####https://production.example.com
*config.json$####https://config.example.com
```

### 4. 包含匹配（谨慎使用）
默认模式，只要URL包含指定字符串就会匹配。

**语法**：`pattern####目标URL`

**⚠️ 警告**：此模式可能产生意外匹配，仅在受控环境中使用。

## URL模板替换功能

使用 `*` 通配符和 `{1}`、`{2}`、`{3}` 等占位符进行URL重写。

**示例**：
```
# 基础域名替换
old-domain.com/*####new-domain.com/{1}

# 复杂路径重写
example.com/*/page/*####https://newsite.com/{1}/newpage/{2}

# 重复使用占位符
user.com/profile/*####newuser.com/{1}/dashboard/{1}
```

## 智能URL提取功能

目标URL为空时，启用自动URL参数提取和解码功能。

**示例**：
```
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## 本地文件重定向说明

AutoRedirect 支持 `file://` 协议的本地文件重定向，支持以下匹配模式：

1. **精确文件路径匹配**
2. **跨用户通用路径匹配**
3. **特定项目匹配**
4. **通用匹配**

**示例**：
```
# 精确匹配
=file:///Downloads/full/test_local.html####https://www.example.com/full/

# 跨用户匹配
=file:///Users/*/dev/*/pickone/*.html####https://production.example.com/{3}

# 特定项目匹配
*ChromeStore/localfile/*.html$####https://www.example.com/{2}/

# 通用匹配
*demo_local.html$####https://www.example.com/demo/
```

## 最佳实践建议

### 安全建议

1. **优先使用精确匹配**（`=` 前缀），避免意外重定向
2. **开头匹配使用标准域名格式**（如 `.localhost`、`.local`）
3. **避免简单字符串匹配**，除非在受控环境中
4. **将更具体的规则放在前面**

### 不同场景的安全模式

**✅ 推荐（安全）**：
```
# 精确匹配
=localhost:3000####https://www.example.com

# 标准域名格式
^dev.localhost####https://development.example.com

# 企业内网（受控环境）
corp-hr####https://hr.company.com
internal-*####https://gateway.company.com/redirect?to={1}

# 自定义协议（协议隔离）
myapp://####https://web.myapp.com/
```

**⚠️ 谨慎使用**：
```
# 简单字符串匹配 - 可能造成意外匹配
search####https://www.google.com  # 可能匹配 "research.com/search-results"
api####https://api.example.com     # 可能匹配 "example.com/rapid-api/docs"
```

### 地址栏输入限制

- 简单字符串（如 `dev`、`api`）在地址栏直接输入会被当作搜索词
- 推荐使用完整域名格式或通过书签、程序调用访问

## 多结果选择

当一个URL匹配多个规则时，AutoRedirect 会显示选择页面：

**示例**：
```
=search.local####https://www.google.com
=search.local####https://www.bing.com
=search.local####https://www.yahoo.com
```

## 规则匹配顺序

规则按以下顺序进行匹配：
1. **按配置文件中从上到下的顺序**依次测试每个规则
2. **收集所有匹配的规则**
3. **如果只有一个匹配**，直接跳转
4. **如果有多个匹配**，显示选择页面让用户选择

## 常见使用场景

### 开发环境
```
# 本地开发到生产环境的映射
^dev.localhost####https://development.example.com
^staging.localhost####https://staging.example.com
=localhost:3000####https://www.example.com
```

### 企业内网
```
# 内部服务（在受控环境中使用）
corp-hr####https://hr.company.com
corp-finance####https://finance.company.com
internal-*####https://gateway.company.com/redirect?to={1}
```

### URL清理
```
# 跳过中间跳转页面
link.zhihu.com/?target=####
weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=####
```

## 故障排除

### 常见问题

1. **规则未触发**：检查模式是否与URL完全匹配
2. **意外匹配**：使用更具体的模式或精确匹配
3. **多重匹配**：检查规则顺序和特异性

### 测试技巧

1. 对关键规则优先使用精确匹配
2. 在添加到主配置之前单独测试规则
3. 使用浏览器开发者工具检查实际URL
4. 检查扩展弹窗中的规则状态和匹配情况

### 避免简单字符串匹配的误触发风险

**❌ 错误示例**：
- `search####` 会匹配 `research.com/search-results`
- `api####` 会匹配 `example.com/rapid-api/docs`

**✅ 正确示例**：
- `corp-hr####` 或 `internal-hr####`（企业内网环境）
- `myapp://####`（自定义协议）

---

如需实际示例和交互式测试，请参阅我们的[测试用例](/zh/test-cases/01-exact-match)部分。