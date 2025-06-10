#!/usr/bin/env node

/**
 * AutoRedirect Configuration File Rules Test Script
 * Specifically used to validate actual rules in example_config.en.txt
 */

const fs = require('fs');
const path = require('path');

// Import redirect engine
const RedirectEngine = require('../src/script/redirect-engine.js');

// Test cases based on the updated example_config.en.txt
const configTestCases = [
    // ===== Exact Match Mode Tests (Recommended, Safest) =====
    {
        category: "Exact Match Mode (Recommended, Safest)",
        tests: [
            {
                name: "Exact match localhost:3000",
                input: "http://localhost:3000",
                expected: "https://www.example.com"
            },
            {
                name: "Exact match failure - localhost:3001 (should not match)",
                input: "http://localhost:3001",
                expected: null
            },
            {
                name: "Exact match failure - mylocalhost:3000 (should not match)",
                input: "http://mylocalhost:3000",
                expected: null
            }
        ]
    },
    
    // ===== Prefix Match Mode Tests (Recommended Format) =====
    {
        category: "Prefix Match Mode (Recommended Format)",
        tests: [
            {
                name: "Prefix match ^dev.localhost",
                input: "https://dev.localhost",
                expected: "https://development.example.com"
            },
            {
                name: "Prefix match ^dev.localhost with path",
                input: "https://dev.localhost/path/to/page",
                expected: "https://development.example.com"
            },
            {
                name: "Prefix match ^api.localhost",
                input: "https://api.localhost",
                expected: "https://api.example.com"
            },
            {
                name: "Prefix match ^localhost:8",
                input: "http://localhost:8080",
                expected: "https://development.example.com"
            },
            {
                name: "Prefix match ^localhost:8 - port 8001",
                input: "http://localhost:8001",
                expected: "https://development.example.com"
            },
            {
                name: "Prefix match staging.internal*",
                input: "https://staging.internal.example.com",
                expected: "https://staging.example.com"
            },
            {
                name: "Prefix match staging.internal* with subdomain",
                input: "https://staging.internal.test.com",
                expected: "https://staging.example.com"
            }
        ]
    },
    
    // ===== URL Template Replacement Feature Tests =====
    {
        category: "URL Template Replacement Feature",
        tests: [
            {
                name: "Basic domain replacement - old-domain.com",
                input: "https://old-domain.com/path/to/page",
                expected: "https://new-domain.com/path/to/page"
            },
            {
                name: "Basic domain replacement - old-domain.com root path",
                input: "https://old-domain.com/aaa",
                expected: "https://new-domain.com/aaa"
            },
            {
                name: "Complex path rewriting - example.com",
                input: "http://example.com/user123/page/settings",
                expected: "https://newsite.com/user123/newpage/settings"
            },
            {
                name: "Complex path rewriting - example.com multi-level path",
                input: "http://example.com/admin/page/config",
                expected: "https://newsite.com/admin/newpage/config"
            },
            {
                name: "Reuse placeholders - user.com",
                input: "https://user.com/profile/john",
                expected: "https://newuser.com/john/dashboard/john"
            },
            {
                name: "Reuse placeholders - user.com different user",
                input: "https://user.com/profile/alice",
                expected: "https://newuser.com/alice/dashboard/alice"
            }
        ]
    },
    
    // ===== Automatic URL Extraction Feature Tests =====
    {
        category: "Automatic URL Extraction Feature",
        tests: [
            {
                name: "Zhihu link URL extraction",
                input: "https://link.zhihu.com/?target=https%3A//www.github.com",
                expected: "https://www.github.com"
            },
            {
                name: "Zhihu link URL extraction - complex URL",
                input: "https://link.zhihu.com/?target=https%3A//stackoverflow.com/questions/123",
                expected: "https://stackoverflow.com/questions/123"
            },
            {
                name: "WeChat link URL extraction",
                input: "https://weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=https%3A//www.example.com",
                expected: "https://www.example.com"
            },
            {
                name: "WeChat link URL extraction - with parameters",
                input: "https://weixin110.qq.com/cgi-bin/readtemplate?t=safety/index&url=https%3A//www.example.com/page%3Fid%3D123",
                expected: "https://www.example.com/page?id=123"
            }
        ]
    },
    
    // ===== Exact Local File Redirection Tests =====
    {
        category: "Exact Local File Redirection",
        tests: [
            {
                name: "Complete file:// protocol path matching (most precise)",
                input: "file:///Downloads/full/test_local.html",
                expected: "https://www.example.com/full/"
            }
        ]
    },
    
    // ===== Cross-User Local File Redirection Tests =====
    {
        category: "Cross-User Local File Redirection",
        tests: [
            {
                name: "Cross-user universal mapping - user John",
                input: "file:///Users/John/dev/myproject/pickone/test.html",
                expected: "https://production.example.com/test"
            },
            {
                name: "Cross-user universal mapping - user alice",
                input: "file:///Users/alice/dev/webapp/pickone/index.html",
                expected: "https://production.example.com/index"
            },
            {
                name: "Cross-user universal mapping - placeholder {3} test",
                input: "file:///Users/bob/dev/testproject/pickone/main.html",
                expected: "https://production.example.com/main"
            }
        ]
    },
    
    // ===== Specific Project Local File Redirection Tests =====
    {
        category: "Specific Project Local File Redirection",
        tests: [
            {
                name: "ChromeStore project file redirection - options",
                input: "file:///Users/ExtTeam/dev/ChromeStore/localfile/options.html",
                expected: "https://www.example.com/options/"
            },
            {
                name: "ChromeStore project file redirection - popup",
                input: "file:///Users/ExtTeam/dev/ChromeStore/localfile/popup.html",
                expected: "https://www.example.com/popup/"
            },
            {
                name: "ChromeStore project file redirection - placeholder {2} test",
                input: "file:///Users/test/dev/ChromeStore/localfile/settings.html",
                expected: "https://www.example.com/settings/"
            }
        ]
    },
    
    // ===== Universal Local File Redirection Tests =====
    {
        category: "Universal Local File Redirection",
        tests: [
            {
                name: "Universal demo_local.html redirection",
                input: "file:///Users/other/dev/project/demo_local.html",
                expected: "https://www.example.com/demo/"
            },
            {
                name: "Universal demo_local.html redirection - different path",
                input: "file:///var/www/html/demo_local.html",
                expected: "https://www.example.com/demo/"
            }
        ]
    },
    
    // ===== Special Scenario Configuration Tests (Use with Caution) =====
    {
        category: "Special Scenario Configuration (Use with Caution)",
        tests: [
            {
                name: "Enterprise intranet - internal-* template matching",
                input: "https://internal-hr.company.com",
                expected: "https://gateway.company.com/redirect?to=hr.company.com"
            },
            {
                name: "Enterprise intranet - corp-hr exact matching",
                input: "https://corp-hr.internal.com",
                expected: "https://hr.company.com"
            },
            {
                name: "Enterprise intranet - corp-finance exact matching",
                input: "https://corp-finance.internal.com",
                expected: "https://finance.company.com"
            },
            {
                name: "Custom protocol - myapp://",
                input: "myapp://dashboard",
                expected: "https://web.myapp.com/"
            },
            {
                name: "Custom protocol - electron-app://",
                input: "electron-app://settings",
                expected: "https://app.example.com/"
            }
        ]
    },
    
    // ===== Multiple Result Selection Tests =====
    {
        category: "Multiple Result Selection Tests",
        tests: [
            {
                name: "Multiple rule matching - =search.local (exact match)",
                input: "http://search.local",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "Multiple rule matching - ^search.localhost (prefix match)",
                input: "http://search.localhost",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "Multiple rule matching - ^search.localhost with path",
                input: "http://search.localhost/query",
                expected: ["https://www.google.com", "https://www.bing.com", "https://www.yahoo.com"]
            },
            {
                name: "Avoid accidental trigger - research.com (should not match)",
                input: "https://research.com/search-results",
                expected: null
            },
            {
                name: "Avoid accidental trigger - searchengine (should not match)",
                input: "https://example.com/searchengine/docs",
                expected: null
            }
        ]
    },
    
    // ===== Suffix Match Mode Tests =====
    {
        category: "Suffix Match Mode",
        tests: [
            {
                name: "Suffix match *.localprod",
                input: "http://test.localprod",
                expected: "https://production.example.com"
            },
            {
                name: "Suffix match *.localprod - staging environment",
                input: "http://staging.localprod",
                expected: "https://production.example.com"
            },
            {
                name: "Suffix match *config.json$",
                input: "https://cdn.example.com/app-config.json",
                expected: "https://config.example.com"
            },
            {
                name: "Suffix match *config.json$ - user config",
                input: "https://static.test.com/user-config.json",
                expected: "https://config.example.com"
            },
            {
                name: "Suffix match failure - config.json not at end",
                input: "https://static.test.com/config.json.backup",
                expected: null
            }
        ]
    },
    
    // ===== Edge Cases and Negative Tests =====
    {
        category: "Edge Cases and Negative Tests",
        tests: [
            {
                name: "URL that matches no rules",
                input: "https://nomatch.example.com",
                expected: null
            },
            {
                name: "Exact match failure - extra characters",
                input: "http://localhost:3000/extra",
                expected: null
            },
            {
                name: "Prefix match failure - not at beginning",
                input: "https://production.example.com",
                expected: null
            },
            {
                name: "Suffix match failure - not at end",
                input: "https://config.json.example.com",
                expected: null
            }
        ]
    }
];

// Color output functions
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

// Run single test
function runSingleTest(testCase, configContent) {
    try {
        const redirectChain = RedirectEngine.testRedirectChain(testCase.input, configContent, 1);
        
        if (redirectChain.length === 0) {
            return {
                success: testCase.expected === null,
                result: null,
                message: "No redirect result"
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
                message: `Matched rule: ${firstStep.pattern}`
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
                    message: `Found ${actualResults.length} matching rules`,
                    isMultiple: true
                };
            } else {
                return {
                    success: false,
                    result: actualResults,
                    message: `Expected single result, but found ${actualResults.length} matching rules`,
                    isMultiple: true
                };
            }
        }
        
        return {
            success: false,
            result: null,
            message: "Unknown redirect type"
        };
        
    } catch (error) {
        return {
            success: false,
            result: null,
            message: `Test execution error: ${error.message}`
        };
    }
}

// Run all tests
function runAllTests() {
    console.log(colorize('\n🔄 AutoRedirect Configuration File Rules Test', 'cyan'));
    console.log(colorize('=' .repeat(50), 'cyan'));
    
    // Load configuration file
    let configContent = '';
    try {
        configContent = fs.readFileSync(path.join(__dirname, 'example_config.en.txt'), 'utf8');
        console.log(colorize('✅ Configuration file loaded successfully', 'green'));
        
        // Display configuration file statistics
        const lines = configContent.split('\n');
        const totalLines = lines.length;
        const commentLines = lines.filter(line => line.trim().startsWith('#') || line.trim() === '').length;
        const ruleLines = totalLines - commentLines;
        
        console.log(colorize(`📄 Configuration file info:`, 'blue'));
        console.log(`   Total lines: ${totalLines}`);
        console.log(`   Comment/empty lines: ${commentLines}`);
        console.log(`   Rule lines: ${ruleLines}`);
        
    } catch (error) {
        console.log(colorize('❌ Unable to load configuration file example_config.en.txt', 'red'));
        console.log(colorize(`Error: ${error.message}`, 'red'));
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
            
            // Run test
            const result = runSingleTest(testCase, configContent);
            
            // Display result
            const status = result.success ? 
                colorize('✅ PASS', 'green') : 
                colorize('❌ FAIL', 'red');
            
            console.log(`\n${status} ${testCase.name}`);
            console.log(`   Input: ${colorize(testCase.input, 'yellow')}`);
            
            if (Array.isArray(testCase.expected)) {
                console.log(`   Expected: ${colorize(`[${testCase.expected.join(', ')}]`, 'cyan')}`);
            } else {
                console.log(`   Expected: ${colorize(testCase.expected || 'No match', 'cyan')}`);
            }
            
            if (result.isMultiple) {
                console.log(`   Actual: ${colorize(`[${result.result.join(', ')}]`, 'magenta')}`);
            } else {
                console.log(`   Actual: ${colorize(result.result || 'No match', 'magenta')}`);
            }
            
            if (result.success) {
                passedTests++;
            } else {
                console.log(`   ${colorize('Reason:', 'red')} ${result.message}`);
            }
            
            // Save result
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
    
    // Display summary
    console.log(colorize('\n📊 Test Summary', 'cyan'));
    console.log(colorize('=' .repeat(50), 'cyan'));
    console.log(`Total tests: ${colorize(totalTests, 'white')}`);
    console.log(`Passed tests: ${colorize(passedTests, 'green')}`);
    console.log(`Failed tests: ${colorize(totalTests - passedTests, 'red')}`);
    console.log(`Success rate: ${colorize(Math.round((passedTests / totalTests) * 100) + '%', 'yellow')}`);
    
    // Display failed tests
    const failedTests = allResults.filter(r => !r.success);
    if (failedTests.length > 0) {
        console.log(colorize('\n❌ Failed test details:', 'red'));
        failedTests.forEach(test => {
            console.log(`   • ${test.category} - ${test.name}`);
            console.log(`     Input: ${test.input}`);
            console.log(`     Expected: ${Array.isArray(test.expected) ? test.expected.join(', ') : test.expected || 'No match'}`);
            console.log(`     Actual: ${Array.isArray(test.actual) ? test.actual.join(', ') : test.actual || 'No match'}`);
            console.log(`     Reason: ${test.message}`);
            console.log('');
        });
    } else {
        console.log(colorize('\n🎉 All tests passed! Configuration file rules are working correctly.', 'green'));
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

// Main function
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
AutoRedirect Configuration File Rules Test Script

Usage:
  node test_config_rules.en.js [options]

Options:
  --help, -h     Show help information
  --quiet, -q    Quiet mode, only show summary

Examples:
  node test_config_rules.en.js        # Run configuration file tests
  node test_config_rules.en.js --quiet # Run tests quietly
        `);
        return;
    }
    
    // Set log level
    if (args.includes('--quiet') || args.includes('-q')) {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.ERROR);
    } else {
        RedirectEngine.Logger.setLevel(RedirectEngine.Logger.LEVELS.WARN);
    }
    
    const results = runAllTests();
    
    // Set exit code
    if (results && results.failed > 0) {
        process.exit(1);
    }
}

// If running this script directly
if (require.main === module) {
    main();
}

module.exports = {
    runAllTests,
    runSingleTest,
    configTestCases
}; 