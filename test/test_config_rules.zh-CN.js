#!/usr/bin/env node

/**
 * AutoRedirect 配置文件规则测试脚本
 * 专门用于验证 example_config.zh-CN.txt 中的实际规则
 */

const fs = require('fs');
const path = require('path');

// Node.js 环境下 mock chrome.i18n API
if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = { i18n: { getMessage: () => '' } };
}

// 导入重定向引擎
const RedirectEngine = require('../src/script/redirect-engine.js');

// 基于更新后的 example_config.zh-CN.txt 的实际测试用例
const configTestCases = [
    // ===== 精确匹配模式测试（推荐，最安全） =====
    {
        category: "精确匹配模式（推荐，最安全）",
        tests: [
            {
                name: "精确匹配 localhost:3000",
                input: "http://localhost:3000",
                expected: "https://www.example.com"
            },
            {
                name: "精确匹配失败 - localhost:3001（不应匹配）",
                input: "http://localhost:3001",
                expected: null
            },
            {
                name: "精确匹配失败 - mylocalhost:3000（不应匹配）",
                input: "http://mylocalhost:3000",
                expected: null
            }
        ]
    },
    
    // ===== 开头匹配模式测试（推荐格式） =====
    {
        category: "开头匹配模式（推荐格式）",
        tests: [
            {
                name: "开头匹配 ^dev.localhost",
                input: "https://dev.localhost",
                expected: "https://development.example.com"
            },
            {
                name: "开头匹配 ^dev.localhost 带路径",
                input: "https://dev.localhost/path/to/page",
                expected: "https://development.example.com"
            },
            {
                name: "开头匹配 ^api.localhost",
                input: "https://api.localhost/",
                expected: "https://api.example.com/"
            },
            {
                name: "开头匹配 ^localhost:8",
                input: "http://localhost:8080",
                expected: "https://development.example.com"
            },
            {
                name: "开头匹配 ^localhost:8 - 端口8001",
                input: "http://localhost:8001",
                expected: "https://development.example.com"
            },
            {
                name: "开头匹配 staging.internal*",
                input: "https://staging.internal.example.com",
                expected: "https://staging.example.com"
            },
            {
                name: "开头匹配 staging.internal* 带子域名",
                input: "https://staging.internal.test.com",
                expected: "https://staging.example.com"
            }
        ]
    },
    
    // ===== URL模板替换功能测试 =====
    {
        category: "URL模板替换功能",
        tests: [
            {
                name: "基础域名替换 - old-domain.com",
                input: "https://old-domain.com/path/to/page",
                expected: "https://new-domain.com/path/to/page"
            },
            {
                name: "基础域名替换 - old-domain.com 根路径",
                input: "https://old-domain.com/aaa",
                expected: "https://new-domain.com/aaa"
            },
            {
                name: "复杂路径重写 - example.com",
                input: "http://example.com/user123/page/settings",
                expected: "https://newsite.com/user123/newpage/settings"
            },
            {
                name: "复杂路径重写 - example.com 多级路径",
                input: "http://example.com/admin/page/config",
                expected: "https://newsite.com/admin/newpage/config"
            },
            {
                name: "重复使用占位符 - user.com",
                input: "https://user.com/profile/john",
                expected: "https://newuser.com/john/dashboard/john"
            },
            {
                name: "重复使用占位符 - user.com 不同用户",
                input: "https://user.com/profile/alice",
                expected: "https://newuser.com/alice/dashboard/alice"
            }
        ]
    },
    
    // ===== 自动URL提取功能测试 =====
    {
        category: "自动URL提取功能",
        tests: [
            {
                name: "知乎链接URL提取",
                input: "https://link.zhihu.com/?target=https%3A//www.github.com",
                expected: "https://www.github.com"
            },
            {
                name: "知乎链接URL提取 - 复杂URL",
                input: "https://link.zhihu.com/?target=https%3A//stackoverflow.com/questions/123",
                expected: "https://stackoverflow.com/questions/123"
            },
            {
                name: "微信链接URL提取",
                input: "https://weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=https%3A//www.example.com",
                expected: "https://www.example.com"
            },
            {
                name: "微信链接URL提取 - 带参数",
                input: "https://weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=https%3A//www.example.com/page%3Fid%3D123",
                expected: "https://www.example.com/page?id=123"
            }
        ]
    },
    
    // ===== 精确本地文件重定向测试 =====
    {
        category: "精确本地文件重定向",
        tests: [
            {
                name: "完整file://协议路径匹配（最精确）",
                input: "file:///Downloads/full/test_local.html",
                expected: "https://www.example.com/full/"
            }
        ]
    },
    
    // ===== 跨用户本地文件重定向测试 =====
    {
        category: "跨用户本地文件重定向",
        tests: [
            {
                name: "跨用户通用映射 - 用户 John",
                input: "file:///Users/John/dev/myproject/pickone/test.html",
                expected: "https://production.example.com/test"
            },
            {
                name: "跨用户通用映射 - 用户alice",
                input: "file:///Users/alice/dev/webapp/pickone/index.html",
                expected: "https://production.example.com/index"
            },
            {
                name: "跨用户通用映射 - 占位符{3}测试",
                input: "file:///Users/bob/dev/testproject/pickone/main.html",
                expected: "https://production.example.com/main"
            }
        ]
    },
    
    // ===== 特定项目本地文件重定向测试 =====
    {
        category: "特定项目本地文件重定向",
        tests: [
            {
                name: "ChromeStore项目文件重定向 - options",
                input: "file:///Users/ExtTeam/dev/ChromeStore/localfile/options.html",
                expected: "https://www.example.com/options/"
            },
            {
                name: "ChromeStore项目文件重定向 - popup",
                input: "file:///Users/ExtTeam/dev/ChromeStore/localfile/popup.html",
                expected: "https://www.example.com/popup/"
            },
            {
                name: "ChromeStore项目文件重定向 - 占位符{2}测试",
                input: "file:///Users/test/dev/ChromeStore/localfile/settings.html",
                expected: "https://www.example.com/settings/"
            }
        ]
    },
    
    // ===== 通用本地文件重定向测试 =====
    {
        category: "通用本地文件重定向",
        tests: [
            {
                name: "通用demo_local.html重定向",
                input: "file:///Users/other/dev/project/demo_local.html",
                expected: "https://www.example.com/demo/"
            },
            {
                name: "通用demo_local.html重定向 - 不同路径",
                input: "file:///var/www/html/demo_local.html",
                expected: "https://www.example.com/demo/"
            }
        ]
    },
    
    // ===== 特殊场景配置测试（谨慎使用） =====
    {
        category: "特殊场景配置（谨慎使用）",
        tests: [
            {
                name: "企业内网环境 - internal-* 模板匹配",
                input: "https://internal-hr.company.com",
                expected: "https://gateway.company.com/redirect?to=hr.company.com"
            },
            {
                name: "企业内网环境 - corp-hr 精确匹配",
                input: "https://corp-hr.internal.com",
                expected: "https://hr.company.com"
            },
            {
                name: "企业内网环境 - corp-finance 精确匹配",
                input: "https://corp-finance.internal.com",
                expected: "https://finance.company.com"
            },
            {
                name: "自定义协议 - myapp://",
                input: "myapp://dashboard",
                expected: "https://web.myapp.com/"
            },
            {
                name: "自定义协议 - electron-app://",
                input: "electron-app://settings",
                expected: "https://app.example.com/"
            }
        ]
    },
    
    // ===== 多结果选择测试 =====
    {
        category: "多结果选择测试",
        tests: [
            {
                name: "多规则匹配 - =search.local（精确匹配）",
                input: "http://search.local",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "多规则匹配 - ^search.localhost（开头匹配）",
                input: "http://search.localhost",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "多规则匹配 - ^search.localhost 带路径",
                input: "http://search.localhost/query",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "避免意外触发 - research.com（不应匹配）",
                input: "https://research.com/search-results",
                expected: null
            },
            {
                name: "避免意外触发 - searchengine（不应匹配）",
                input: "https://example.com/searchengine/docs",
                expected: null
            }
        ]
    },
    
    // ===== 结尾匹配模式测试 =====
    {
        category: "结尾匹配模式",
        tests: [
            {
                name: "结尾匹配 *.localprod",
                input: "http://test.localprod",
                expected: "https://production.example.com"
            },
            {
                name: "结尾匹配 *.localprod - staging环境",
                input: "http://staging.localprod",
                expected: "https://production.example.com"
            },
            {
                name: "结尾匹配 *config.json$",
                input: "https://cdn.example.com/app-config.json",
                expected: "https://config.example.com"
            },
            {
                name: "结尾匹配 *config.json$ - 用户配置",
                input: "https://static.test.com/user-config.json",
                expected: "https://config.example.com"
            },
            {
                name: "结尾匹配失败 - config.json不在结尾",
                input: "https://static.test.com/config.json.backup",
                expected: null
            }
        ]
    },
    
    // ===== 边界情况和负面测试 =====
    {
        category: "边界情况和负面测试",
        tests: [
            {
                name: "不匹配任何规则的URL",
                input: "https://nomatch.example.com",
                expected: null
            },
            {
                name: "精确匹配失败 - 额外字符",
                input: "http://localhost:3000/extra",
                expected: null
            },
            {
                name: "开头匹配失败 - 不是开头",
                input: "https://production.example.com",
                expected: null
            },
            {
                name: "结尾匹配失败 - 不是结尾",
                input: "https://config.json.example.com",
                expected: null
            }
        ]
    }
];

// 颜色输出函数
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// 运行单个测试
function runSingleTest(testCase, configContent) {
    try {
        const redirectChain = RedirectEngine.testRedirectChain(testCase.input, configContent, 1);
        
        if (redirectChain.length === 0) {
            return {
                success: testCase.expected === null,
                result: null,
                message: "没有重定向结果"
            };
        }
        
        const firstStep = redirectChain[0];
        
        if (firstStep.type === 'final') {
            return {
                success: testCase.expected === null,
                result: null,
                message: firstStep.message
            };
        } else if (firstStep.type === 'single') {
            const actualResult = firstStep.targetUrl;
            return {
                success: actualResult === testCase.expected,
                result: actualResult,
                message: `匹配规则: ${firstStep.pattern}`
            };
        } else if (firstStep.type === 'multiple') {
            const actualResults = firstStep.matches.map(m => m.url);
            const isExpectedArray = Array.isArray(testCase.expected);
            
            if (isExpectedArray) {
                const success = testCase.expected.every(url => actualResults.includes(url)) &&
                               actualResults.every(url => testCase.expected.includes(url));
                return {
                    success: success,
                    result: actualResults,
                    message: `找到 ${actualResults.length} 个匹配规则`,
                    isMultiple: true
                };
            } else {
                return {
                    success: false,
                    result: actualResults,
                    message: `期望单个结果，但找到 ${actualResults.length} 个匹配规则`,
                    isMultiple: true
                };
            }
        }
        
        return {
            success: false,
            result: null,
            message: "未知的重定向类型"
        };
        
    } catch (error) {
        return {
            success: false,
            result: null,
            message: `测试执行错误: ${error.message}`
        };
    }
}

// 运行所有测试
function runAllTests() {
    console.log(colorize('\n🔄 AutoRedirect 配置文件规则测试', 'cyan'));
    console.log(colorize('=' .repeat(50), 'cyan'));
    
    // 加载配置文件
    let configContent = '';
    try {
        configContent = fs.readFileSync(path.join(__dirname, 'example_config.zh-CN.txt'), 'utf8');
        console.log(colorize('✅ 配置文件加载成功', 'green'));
        
        // 显示配置文件统计信息
        const lines = configContent.split('\n');
        const totalLines = lines.length;
        const commentLines = lines.filter(line => line.trim().startsWith('#') || line.trim() === '').length;
        const ruleLines = totalLines - commentLines;
        
        console.log(colorize(`📄 配置文件信息:`, 'blue'));
        console.log(`   总行数: ${totalLines}`);
        console.log(`   注释/空行: ${commentLines}`);
        console.log(`   规则行数: ${ruleLines}`);
        
    } catch (error) {
        console.log(colorize('❌ 无法加载配置文件 example_config.zh-CN.txt', 'red'));
        console.log(colorize(`错误: ${error.message}`, 'red'));
        return { passed: 0, failed: 1, total: 0, error: error.message };
    }
    
    let totalTests = 0;
    let passedTests = 0;
    const allResults = [];
    
    console.log('');
    
    for (const category of configTestCases) {
        console.log(colorize(`\n📂 ${category.category}`, 'blue'));
        console.log(colorize('-'.repeat(40), 'blue'));
        
        for (const testCase of category.tests) {
            totalTests++;
            
            // 运行测试
            const result = runSingleTest(testCase, configContent);
            
            // 显示结果
            const status = result.success ? 
                colorize('✅ 通过', 'green') : 
                colorize('❌ 失败', 'red');
            
            console.log(`\n${status} ${testCase.name}`);
            console.log(`   输入: ${colorize(testCase.input, 'yellow')}`);
            
            if (Array.isArray(testCase.expected)) {
                console.log(`   期望: ${colorize(`[${testCase.expected.join(', ')}]`, 'cyan')}`);
            } else {
                console.log(`   期望: ${colorize(testCase.expected || '无匹配', 'cyan')}`);
            }
            
            if (result.isMultiple) {
                console.log(`   实际: ${colorize(`[${result.result.join(', ')}]`, 'magenta')}`);
            } else {
                console.log(`   实际: ${colorize(result.result || '无匹配', 'magenta')}`);
            }
            
            if (result.success) {
                passedTests++;
            } else {
                console.log(`   ${colorize('原因:', 'red')} ${result.message}`);
            }
            
            // 保存结果
            allResults.push({
                category: category.category,
                name: testCase.name,
                input: testCase.input,
                expected: testCase.expected,
                actual: result.result,
                success: result.success,
                message: result.message
            });
        }
    }
    
    // 显示总结
    console.log(colorize('\n📊 测试总结', 'cyan'));
    console.log(colorize('=' .repeat(50), 'cyan'));
    console.log(`总测试数: ${colorize(totalTests, 'white')}`);
    console.log(`通过测试: ${colorize(passedTests, 'green')}`);
    console.log(`失败测试: ${colorize(totalTests - passedTests, 'red')}`);
    console.log(`成功率: ${colorize(Math.round((passedTests / totalTests) * 100) + '%', 'yellow')}`);
    
    // 显示失败的测试
    const failedTests = allResults.filter(r => !r.success);
    if (failedTests.length > 0) {
        console.log(colorize('\n❌ 失败的测试详情:', 'red'));
        failedTests.forEach(test => {
            console.log(`   • ${test.category} - ${test.name}`);
            console.log(`     输入: ${test.input}`);
            console.log(`     期望: ${Array.isArray(test.expected) ? test.expected.join(', ') : test.expected || '无匹配'}`);
            console.log(`     实际: ${Array.isArray(test.actual) ? test.actual.join(', ') : test.actual || '无匹配'}`);
            console.log(`     原因: ${test.message}`);
            console.log('');
        });
    } else {
        console.log(colorize('\n🎉 所有测试都通过了！配置文件规则工作正常。', 'green'));
    }
    
    console.log('');
    
    return {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: Math.round((passedTests / totalTests) * 100),
        results: allResults
    };
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
AutoRedirect 配置文件规则测试脚本

用法:
  node test_config_rules.zh-CN.js [选项]

选项:
  --help, -h     显示帮助信息
  --quiet, -q    静默模式，只显示总结

示例:
  node test_config_rules.zh-CN.js        # 运行配置文件测试
  node test_config_rules.zh-CN.js --quiet # 静默运行测试
        `);
        return;
    }
    
    // 设置日志级别
    if (args.includes('--quiet') || args.includes('-q')) {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.ERROR);
    } else {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.WARN);
    }
    
    const results = runAllTests();
    
    // 设置退出码
    if (results && results.failed > 0) {
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    runAllTests,
    runSingleTest,
    configTestCases
}; 