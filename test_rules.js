#!/usr/bin/env node

/**
 * AutoRedirect 规则测试脚本
 * 用于验证 example_config.txt 中的所有重定向规则
 */

const fs = require('fs');
const path = require('path');

// 导入重定向引擎
const RedirectEngine = require('./script/redirect-engine.js');

// 测试用例定义
const testCases = [
    // ===== 本地文件重定向测试 =====
    {
        category: "本地文件重定向",
        description: "测试本地文件到远程URL的重定向功能",
        tests: [
            {
                name: "结尾匹配 - autoredirect_test.html",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/autoredirect_test.html",
                expected: "https://www.example.com/autoRedirect/",
                rule: "*autoredirect_test.html$####https://www.example.com/autoRedirect/"
            },
            {
                name: "完整file://协议路径匹配",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/autoredirect_test.html",
                expected: "https://www.example.com/autoRedirect/",
                rule: "=file:///Users/yukun/dev/ChromeStore/autoRedirect/autoredirect_test.html####https://www.example.com/autoRedirect/"
            },
            {
                name: "路径通配符匹配 - 提取文件名",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/options.html",
                expected: "https://www.example.com/options/",
                rule: "*ChromeStore/autoRedirect/*.html####https://www.example.com/{2}/"
            },
            {
                name: "file://协议通配符匹配",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/popup.html",
                expected: "https://www.example.com/popup/",
                rule: "=file:///Users/yukun/dev/ChromeStore/autoRedirect/*.html####https://www.example.com/{1}/"
            },
            {
                name: "多通配符匹配 - 子目录支持",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/subfolder/test.html",
                expected: "https://www.example.com/subfolder/test/",
                rule: "*ChromeStore/autoRedirect/*/*.html####https://www.example.com/{2}/{3}/"
            },
            {
                name: "文件扩展名转换",
                input: "file:///Users/yukun/dev/ChromeStore/autoRedirect/test.html",
                expected: "https://www.example.com/test.php",
                rule: "*ChromeStore/autoRedirect/*.html####https://www.example.com/{2}.php"
            },
            {
                name: "跨用户开发环境映射",
                input: "file:///Users/alice/dev/myproject/autoRedirect/index.html",
                expected: "https://production.example.com/index/",
                rule: "=file:///Users/*/dev/*/autoRedirect/*.html####https://production.example.com/{3}/"
            }
        ]
    },
    
    // ===== 精确匹配模式测试 =====
    {
        category: "精确匹配模式",
        description: "使用 = 前缀，只匹配完全相同的URL",
        tests: [
            {
                name: "精确匹配 localhost:3000",
                input: "http://localhost:3000",
                expected: "https://dev.example.com",
                rule: "=localhost:3000####https://dev.example.com"
            },
            {
                name: "精确匹配 localhost:3000 (带末尾斜杠)",
                input: "http://localhost:3000/",
                expected: "https://dev.example.com",
                rule: "=localhost:3000####https://dev.example.com"
            },
            {
                name: "精确匹配 test.html",
                input: "file:///test.html",
                expected: "https://test.example.com",
                rule: "=test.html####https://test.example.com"
            },
            {
                name: "精确匹配失败 - localhost:3001",
                input: "http://localhost:3001",
                expected: null,
                rule: "=localhost:3000####https://dev.example.com"
            },
            {
                name: "精确匹配失败 - mylocalhost:3000",
                input: "http://mylocalhost:3000",
                expected: null,
                rule: "=localhost:3000####https://dev.example.com"
            }
        ]
    },
    
    // ===== 开头匹配模式测试 =====
    {
        category: "开头匹配模式",
        description: "使用 ^ 前缀或 * 后缀，匹配以指定字符串开头的URL",
        tests: [
            {
                name: "开头匹配 ^dev",
                input: "https://dev.example.com",
                expected: "https://development.example.com",
                rule: "^dev####https://development.example.com"
            },
            {
                name: "开头匹配 ^dev (带末尾斜杠)",
                input: "https://dev.example.com/",
                expected: "https://development.example.com",
                rule: "^dev####https://development.example.com"
            },
            {
                name: "开头匹配 ^dev - development.com",
                input: "https://development.com",
                expected: "https://development.example.com",
                rule: "^dev####https://development.example.com"
            },
            {
                name: "开头匹配 ^dev - development.com (带路径)",
                input: "https://development.com/path/to/page",
                expected: "https://development.example.com",
                rule: "^dev####https://development.example.com"
            },
            {
                name: "开头匹配 api*",
                input: "https://api.test.com",
                expected: "https://api.example.com",
                rule: "api*####https://api.example.com"
            },
            {
                name: "开头匹配 api* - api-v2.com",
                input: "https://api-v2.com/v1/users",
                expected: "https://api.example.com",
                rule: "api*####https://api.example.com"
            }
        ]
    },
    
    // ===== 结尾匹配模式测试 =====
    {
        category: "结尾匹配模式",
        description: "使用 * 前缀或 $ 后缀，匹配以指定字符串结尾的URL",
        tests: [
            {
                name: "结尾匹配 *.local",
                input: "http://test.local",
                expected: "https://production.example.com",
                rule: "*.local####https://production.example.com"
            },
            {
                name: "结尾匹配 *.local (带末尾斜杠)",
                input: "http://test.local/",
                expected: "https://production.example.com",
                rule: "*.local####https://production.example.com"
            },
            {
                name: "结尾匹配 *.local - dev.local",
                input: "https://dev.local/dashboard",
                expected: "https://production.example.com",
                rule: "*.local*####https://production.example.com"
            },
            {
                name: "结尾匹配 *config.json$",
                input: "https://cdn.example.com/app-config.json",
                expected: "https://config.example.com",
                rule: "*config.json$####https://config.example.com"
            },
            {
                name: "结尾匹配 *config.json$ - user-config.json",
                input: "https://assets.site.com/user-config.json",
                expected: "https://config.example.com",
                rule: "*config.json$####https://config.example.com"
            }
        ]
    },
    
    // ===== URL模板替换功能测试 =====
    {
        category: "URL模板替换功能",
        description: "使用 * 通配符和 {1}, {2}, {3} 等占位符进行URL重写",
        tests: [
            {
                name: "基础域名替换",
                input: "https://old-domain.com/path/to/page",
                expected: "https://new-domain.com/path/to/page",
                rule: "old-domain.com/*####https://new-domain.com/{1}"
            },
            {
                name: "复杂路径重写",
                input: "http://example.com/user123/page/settings",
                expected: "https://newsite.com/user123/newpage/settings",
                rule: "example.com/*/page/*####https://newsite.com/{1}/newpage/{2}"
            },
            {
                name: "多段路径重组",
                input: "https://old.com/electronics/category/phones/item/iphone",
                expected: "https://new.com/electronics/cat/phones/product/iphone",
                rule: "old.com/*/category/*/item/*####https://new.com/{1}/cat/{2}/product/{3}"
            },
            {
                name: "参数重新排列",
                input: "https://site.com/user123/page/profile/section/settings",
                expected: "https://newsite.com/settings/user123/profile",
                rule: "site.com/*/page/*/section/*####https://newsite.com/{3}/{1}/{2}"
            },
            {
                name: "重复使用占位符",
                input: "https://old.com/user/john",
                expected: "https://new.com/john/profile/john/settings",
                rule: "old.com/user/*####https://new.com/{1}/profile/{1}/settings"
            },
            {
                name: "部分占位符使用",
                input: "https://old.com/section1/category/section2/item/section3",
                expected: "https://new.com/section1/products/section3",
                rule: "old.com/*/category/*/item/*####https://new.com/{1}/products/{3}"
            }
        ]
    },
    
    // ===== 包含匹配模式测试 =====
    {
        category: "包含匹配模式（默认）",
        description: "不使用任何前缀，URL中包含指定字符串即匹配",
        tests: [
            {
                name: "包含匹配 localhost",
                input: "http://localhost:3000",
                expected: "https://production.example.com",
                rule: "localhost####https://production.example.com"
            },
            {
                name: "包含匹配 localhost (带路径)",
                input: "http://localhost:8080/app/dashboard",
                expected: "https://production.example.com",
                rule: "localhost####https://production.example.com"
            },
            {
                name: "包含匹配 localhost - mylocalhost.com",
                input: "https://mylocalhost.com/test",
                expected: "https://production.example.com",
                rule: "localhost####https://production.example.com"
            },
            {
                name: "包含匹配 demo",
                input: "https://demo.test.com",
                expected: "https://www.example.com",
                rule: "demo####https://www.example.com"
            },
            {
                name: "包含匹配 demo (带路径)",
                input: "https://my-demo.test.com/page/1",
                expected: "https://www.example.com",
                rule: "demo####https://www.example.com"
            }
        ]
    },
    
    // ===== 通用URL提取功能测试 =====
    {
        category: "通用URL提取功能",
        description: "目标URL为空，用于自动提取和解码URL参数",
        tests: [
            {
                name: "URL参数提取 - target参数",
                input: "https://link.zhihu.com/?target=https%3A//example.com",
                expected: "https://example.com",
                rule: "link.zhihu.com/?target=####"
            },
            {
                name: "URL参数提取 - 复杂URL",
                input: "https://link.zhihu.com/?target=https%3A//www.google.com/search%3Fq%3Dtest",
                expected: "https://www.google.com/search?q=test",
                rule: "link.zhihu.com/?target=####"
            }
        ]
    },
    
    // ===== 多结果选择测试 =====
    {
        category: "多结果选择测试",
        description: "当一个URL匹配多个规则时，会显示选择页面",
        tests: [
            {
                name: "多规则匹配",
                input: "https://multi-test.com",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"],
                rule: "multi####https://www.google.com\nmulti####https://www.bing.com\nmulti####https://www.yahoo.com"
            },
            {
                name: "多规则匹配 (带路径)",
                input: "https://multi-test.com/search?q=test",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"],
                rule: "multi####https://www.google.com\nmulti####https://www.bing.com\nmulti####https://www.yahoo.com"
            }
        ]
    }
];

// 颜色输出函数
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
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
function runSingleTest(testCase, rule) {
    try {
        // 使用重定向引擎测试
        const redirectChain = RedirectEngine.testRedirectChain(testCase.input, rule, 1);
        
        if (redirectChain.length === 0) {
            return {
                success: false,
                result: null,
                message: "没有重定向结果"
            };
        }
        
        const firstStep = redirectChain[0];
        
        if (firstStep.type === 'final') {
            // 没有匹配的规则
            return {
                success: testCase.expected === null,
                result: null,
                message: firstStep.message
            };
        } else if (firstStep.type === 'single') {
            // 单个匹配
            const actualResult = firstStep.targetUrl;
            return {
                success: actualResult === testCase.expected,
                result: actualResult,
                message: `匹配规则: ${firstStep.pattern}`
            };
        } else if (firstStep.type === 'multiple') {
            // 多个匹配
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
    const isErrorsOnly = global.ERRORS_ONLY_MODE;
    
    if (!isErrorsOnly) {
        console.log(colorize('\n🔄 AutoRedirect 规则测试', 'cyan'));
        console.log(colorize('=' .repeat(50), 'cyan'));
    }
    
    let totalTests = 0;
    let passedTests = 0;
    const allResults = [];
    
    // 加载配置文件
    let configContent = '';
    try {
        configContent = fs.readFileSync(path.join(__dirname, 'example_config.txt'), 'utf8');
        if (!isErrorsOnly) {
            console.log(colorize('✅ 配置文件加载成功', 'green'));
        }
    } catch (error) {
        console.log(colorize('❌ 无法加载配置文件 example_config.txt', 'red'));
        console.log(colorize(`错误: ${error.message}`, 'red'));
        return;
    }
    
    if (!isErrorsOnly) {
        console.log('');
    }
    
    for (const category of testCases) {
        if (!isErrorsOnly) {
            console.log(colorize(`\n📂 ${category.category}`, 'blue'));
            console.log(colorize(`   ${category.description}`, 'white'));
            console.log(colorize('-'.repeat(50), 'blue'));
        }
        
        for (const testCase of category.tests) {
            totalTests++;
            
            // 运行测试
            const result = runSingleTest(testCase, testCase.rule);
            
            // 在错误模式下，只显示失败的测试
            if (isErrorsOnly && result.success) {
                if (result.success) {
                    passedTests++;
                }
                // 保存结果但不显示
                allResults.push({
                    category: category.category,
                    name: testCase.name,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: result.result,
                    success: result.success,
                    message: result.message
                });
                continue;
            }
            
            // 显示结果
            const status = result.success ? 
                colorize('✅ 通过', 'green') : 
                colorize('❌ 失败', 'red');
            
            if (!isErrorsOnly || !result.success) {
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
                
                console.log(`   说明: ${result.message}`);
            }
            
            if (result.success) {
                passedTests++;
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
    if (!isErrorsOnly) {
        console.log(colorize('\n📊 测试总结', 'cyan'));
        console.log(colorize('=' .repeat(50), 'cyan'));
        console.log(`总测试数: ${colorize(totalTests, 'white')}`);
        console.log(`通过测试: ${colorize(passedTests, 'green')}`);
        console.log(`失败测试: ${colorize(totalTests - passedTests, 'red')}`);
        console.log(`成功率: ${colorize(Math.round((passedTests / totalTests) * 100) + '%', 'yellow')}`);
    } else {
        // 错误模式下的简化总结
        const failedCount = totalTests - passedTests;
        if (failedCount > 0) {
            console.log(colorize(`\n❌ 发现 ${failedCount} 个失败测试 (总共 ${totalTests} 个测试)`, 'red'));
        } else {
            console.log(colorize(`\n✅ 所有 ${totalTests} 个测试都通过了`, 'green'));
        }
    }
    
    // 显示失败的测试
    const failedTests = allResults.filter(r => !r.success);
    if (failedTests.length > 0 && !isErrorsOnly) {
        console.log(colorize('\n❌ 失败的测试:', 'red'));
        failedTests.forEach(test => {
            console.log(`   • ${test.category} - ${test.name}`);
            console.log(`     ${test.message}`);
        });
    }
    
    // 显示详细日志（如果有）
    if (RedirectEngine.Logger && !isErrorsOnly) {
        const logs = RedirectEngine.Logger.getLogs();
        if (logs.length > 0) {
            console.log(colorize('\n🔍 详细日志:', 'cyan'));
            console.log(colorize('-'.repeat(50), 'cyan'));
            
            logs.forEach(log => {
                const levelColor = {
                    'DEBUG': 'white',
                    'INFO': 'blue',
                    'WARN': 'yellow',
                    'ERROR': 'red'
                }[log.level] || 'white';
                
                const time = log.timestamp.split('T')[1].split('.')[0];
                console.log(`${colorize(time, 'white')} ${colorize(`[${log.level}]`, levelColor)} ${log.message}`);
                
                if (log.data) {
                    console.log(`   数据: ${JSON.stringify(log.data)}`);
                }
            });
        }
    }
    
    if (!isErrorsOnly) {
        console.log('');
    }
    
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
AutoRedirect 规则测试脚本

用法:
  node test_rules.js [选项]

选项:
  --help, -h        显示帮助信息
  --verbose, -v     显示详细日志
  --quiet, -q       静默模式，只显示总结
  --errors-only, -e 只显示错误和失败的测试

示例:
  node test_rules.js              # 运行所有测试
  node test_rules.js --verbose    # 运行测试并显示详细日志
  node test_rules.js --quiet      # 静默运行测试
  node test_rules.js --errors-only # 只显示错误信息
        `);
        return;
    }
    
    // 设置日志级别
    if (args.includes('--verbose') || args.includes('-v')) {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.DEBUG);
    } else if (args.includes('--quiet') || args.includes('-q')) {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.ERROR);
    } else if (args.includes('--errors-only') || args.includes('-e')) {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.ERROR);
        // 设置特殊标志，只显示错误
        global.ERRORS_ONLY_MODE = true;
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
    testCases
}; 