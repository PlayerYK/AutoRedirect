#!/usr/bin/env node

/**
 * AutoRedirect 配置文件规则测试脚本
 * 专门用于验证 example_config.txt 中的实际规则
 */

const fs = require('fs');
const path = require('path');

// 导入重定向引擎
const RedirectEngine = require('./script/redirect-engine.js');

// 基于 example_config.txt 的实际测试用例
const configTestCases = [
    // ===== 本地文件重定向测试 =====
    {
        category: "本地文件重定向",
        tests: [
            {
                name: "结尾匹配 - autoredirect_test.html",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/autoredirect_test.html",
                expected: "https://www.example.com/autoRedirect/"
            },
            {
                name: "完整file://协议路径匹配",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/autoredirect_test.html",
                expected: "https://www.example.com/autoRedirect/"
            },
            {
                name: "路径通配符匹配 - 提取文件名",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/options.html",
                expected: "https://www.example.com/options/"
            },
            {
                name: "file://协议通配符匹配",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/popup.html",
                expected: "https://www.example.com/popup/"
            },
            {
                name: "多通配符匹配 - 子目录支持",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/subfolder/test.html",
                expected: "https://www.example.com/subfolder/test/"
            },
            {
                name: "文件扩展名转换",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/test.html",
                expected: "https://www.example.com/test.php"
            }
        ]
    },
    
    // ===== 精确匹配模式测试 =====
    {
        category: "精确匹配模式",
        tests: [
            {
                name: "精确匹配 localhost:3000",
                input: "http://localhost:3000",
                expected: "https://dev.example.com"
            },
            {
                name: "精确匹配 test.html",
                input: "file:///test.html",
                expected: "https://test.example.com"
            },
            {
                name: "精确匹配失败 - localhost:3001",
                input: "http://localhost:3001",
                expected: null // 现在不会匹配任何规则
            }
        ]
    },
    
    // ===== 开头匹配模式测试 =====
    {
        category: "开头匹配模式",
        tests: [
            {
                name: "开头匹配 ^dev",
                input: "https://dev.example.com",
                expected: "https://development.example.com"
            },
            {
                name: "开头匹配 api*",
                input: "https://api.test.com",
                expected: "https://api.example.com"
            }
        ]
    },
    
    // ===== 结尾匹配模式测试 =====
    {
        category: "结尾匹配模式",
        tests: [
            {
                name: "结尾匹配 *.local",
                input: "http://test.local",
                expected: "https://production.example.com"
            },
            {
                name: "结尾匹配 *config.json$",
                input: "https://cdn.example.com/app-config.json",
                expected: "https://config.example.com"
            }
        ]
    },
    
    // ===== URL模板替换功能测试 =====
    {
        category: "URL模板替换功能",
        tests: [
            {
                name: "基础域名替换",
                input: "https://old-domain.com/path/to/page",
                expected: "https://new-domain.com/path/to/page"
            },
            {
                name: "复杂路径重写",
                input: "http://example.com/user123/page/settings",
                expected: "https://newsite.com/user123/newpage/settings"
            },
            {
                name: "精确路径重组",
                input: "https://old.com/electronics/category/phones/item/iphone",
                expected: "new.com/electronics/cat/phones/product/iphone"
            }
        ]
    },
    
    // ===== 包含匹配模式测试 =====
    {
        category: "包含匹配模式",
        tests: [
            {
                name: "开头匹配 localhost:8",
                input: "http://localhost:8080",
                expected: "https://production.example.com"
            },
            {
                name: "包含匹配 demo",
                input: "https://demo.test.com",
                expected: "https://www.example.com"
            }
        ]
    },
    
    // ===== 通用URL提取功能测试 =====
    {
        category: "通用URL提取功能",
        tests: [
            {
                name: "URL参数提取 - target参数",
                input: "https://link.zhihu.com/?target=https%3A//example.com",
                expected: "https://example.com"
            }
        ]
    },
    
    // ===== 多结果选择测试 =====
    {
        category: "多结果选择测试",
        tests: [
            {
                name: "多规则匹配",
                input: "https://multi-test.com",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
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
        configContent = fs.readFileSync(path.join(__dirname, 'example_config.txt'), 'utf8');
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
        console.log(colorize('❌ 无法加载配置文件 example_config.txt', 'red'));
        console.log(colorize(`错误: ${error.message}`, 'red'));
        return;
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
  node test_config_rules.js [选项]

选项:
  --help, -h     显示帮助信息
  --quiet, -q    静默模式，只显示总结

示例:
  node test_config_rules.js        # 运行配置文件测试
  node test_config_rules.js --quiet # 静默运行测试
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