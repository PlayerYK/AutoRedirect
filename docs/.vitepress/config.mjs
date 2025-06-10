import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/AutoRedirect/',

  head: [
    ['link', { rel: 'icon', href: '/AutoRedirect/favicon.ico' }]
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'AutoRedirect',
      description: 'A URL redirect extension - making URL jumps simpler and more efficient',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Test Cases', link: '/test-cases/01-exact-match' }
        ],

        sidebar: {
          '/test-cases/': [
            {
              text: 'Test Cases',
              items: [
                { text: '🎯 Exact Match', link: '/test-cases/01-exact-match' },
                { text: '🚀 Prefix Match', link: '/test-cases/02-prefix-match' },
                { text: '⚠️ Simple String Match', link: '/test-cases/03-simple-string-match' },
                { text: '🔧 URL Template Replace', link: '/test-cases/04-template-replace' },
                { text: '🔗 Automatic URL Extraction', link: '/test-cases/05-smart-url-extraction' },
                { text: '📁 Local File', link: '/test-cases/06-local-file' },
                { text: '🔀 Multiple Results', link: '/test-cases/07-multiple-results' },
                { text: '🎯 Suffix Match', link: '/test-cases/08-suffix-match' },
              ]
            }
          ]
        },

        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present PlayerYK'
        },
        
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },
        
        outlineTitle: 'On this page',
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'AutoRedirect',
      description: 'URL重定向扩展 - 让URL跳转更简单高效',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '使用指南', link: '/zh/guide' },
          { text: '配置参考', link: '/zh/configuration' },
          { text: '测试用例', link: '/zh/test-cases/01-exact-match' }
        ],

        sidebar: {
          '/zh/test-cases/': [
            {
              text: '测试用例',
              items: [
                { text: '🎯 精确匹配', link: '/zh/test-cases/01-exact-match' },
                { text: '🚀 开头匹配', link: '/zh/test-cases/02-prefix-match' },
                { text: '⚠️ 简单字符串匹配', link: '/zh/test-cases/03-simple-string-match' },
                { text: '🔧 URL模板替换', link: '/zh/test-cases/04-template-replace' },
                { text: '🔗 URL提取', link: '/zh/test-cases/05-smart-url-extraction' },
                { text: '📁 本地文件', link: '/zh/test-cases/06-local-file' },
                { text: '🔀 多结果选择', link: '/zh/test-cases/07-multiple-results' },
                { text: '🎯 结尾匹配', link: '/zh/test-cases/08-suffix-match' },
              ]
            }
          ]
        },

        footer: {
          message: '基于 MIT 许可证发布',
          copyright: 'Copyright © 2024-present PlayerYK'
        },
        
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },

        outlineTitle: '在此页面上',
      }
    }
  },

  themeConfig: {
    logo: '/images/logo.png',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/PlayerYK/AutoRedirect' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: 'Search', buttonAriaLabel: 'Search' },
              modal: {
                noResultsText: 'No results for',
                resetButtonTitle: 'Reset search',
                footer: { selectText: 'to select', navigateText: 'to navigate' }
              }
            }
          },
          zh: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换' }
              }
            }
          }
        }
      }
    }
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    // build: {
    //   minify: 'terser',
    //   terserOptions: {
    //     compress: {
    //       drop_console: true,
    //       drop_debugger: true
    //     }
    //   }
    // }
  }
}) 