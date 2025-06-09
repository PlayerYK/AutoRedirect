import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "AutoRedirect",
  description: "智能重定向扩展 - 让URL跳转更简单高效",

  base: '/AutoRedirect/',

  head: [
    ['link', { rel: 'icon', href: '/AutoRedirect/favicon.ico' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/logo.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide' },
      { text: '测试用例', link: '/test-cases/01-exact-match' }
    ],

    sidebar: {
      '/test-cases/': [
        {
          text: '测试用例',
          items: [
            { text: '🎯 精确匹配', link: '/test-cases/01-exact-match' },
            { text: '🚀 开头匹配', link: '/test-cases/02-prefix-match' },
            { text: '⚠️ 简单字符串匹配', link: '/test-cases/03-simple-string-match' },
            { text: '🔧 URL模板替换', link: '/test-cases/04-template-replace' },
            { text: '🔗 智能URL提取', link: '/test-cases/05-smart-url-extraction' },
            { text: '📁 本地文件', link: '/test-cases/06-local-file' },
            { text: '🔀 多结果选择', link: '/test-cases/07-multiple-results' },
            { text: '🎯 结尾匹配', link: '/test-cases/08-suffix-match' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/PlayerYK/AutoRedirect' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024-present PlayerYK'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outlineTitle: '在此页面上',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
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
  },
}) 