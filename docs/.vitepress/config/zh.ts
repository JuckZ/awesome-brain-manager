import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://abm.timesavior.io'
export const META_TITLE = 'Awesome Brain Manager'
export const META_DESCRIPTION = '旨在解决大多数人在Obsidian中遇到的所有琐碎问题'

export const zhLangPack = {
  META_URL: 'https://abm.timesavior.io',
  META_TITLE: 'Awesome Brain Manager',
  META_DESCRIPTION: '旨在解决大多数人在Obsidian中遇到的所有琐碎问题'
}

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: META_DESCRIPTION,
  head: [
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
  ],

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/JuckZ/awesome-brain-manager/edit/develop/docs/:path',
      text: '对本页提出修改建议',
    },

    outline: {
      label: '本页内容',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    nav: [
      // { text: 'Config', link: '/config/' },
      // { text: 'Plugins', link: '/plugins/' },
      {
        text: '指南',
        link: '/zh/guide/',
        activeMatch: '^/zh/guide/',
      },
      { text: 'API', link: '/zh/api/', activeMatch: '^/zh/api/' },
      {
        text: '相关链接',
        items: [
          {
            text: '论坛',
            link: 'https://github.com/JuckZ/awesome-brain-manager/discussions',
          },
          {
            text: '更新日志',
            link: 'https://github.com/JuckZ/awesome-brain-manager/blob/master/CHANGELOG.md',
          },
          {
            text: '路线图',
            link: 'https://github.com/users/JuckZ/projects/2',
          },
        ],
      },
    ],
    sidebar: {
      '/zh/api/': [
        {
          text: 'packages',
          items: [
            { text: 'core', link: '/zh/api/modules/core.html' },
            { text: 'pomodoro', link: '/zh/api/modules/pomodoro.html' },
            {
              text: 'ai',
              link: '/zh/api/modules/ai.html',
            },
            {
              text: 'obsidian',
              link: '/zh/api/modules/obsidian.html',
            },
            {
              text: 'utils',
              link: '/zh/api/modules/utils.html',
            },
            {
              text: 'ntfy',
              link: '/zh/api/modules/ntfy.html',
            },
            {
              text: 'browser',
              link: '/zh/api/modules/browser.html',
            },
          ],
        },
      ],
      '/zh/': [
        {
          text: '介绍',
          items: [
            {
              text: 'Awesome Brain Manager 是什么？',
              link: '/zh/introduction.html',
            },
            {
              text: '开始',
              link: '/zh/getting-started.html',
            },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '功能预览', link: '/zh/guide/' },
            { text: '番茄钟', link: '/zh/guide/pomodoro.html' },
            { text: '特效', link: '/zh/guide/special-effects.html' },
            { text: '小工具', link: '/zh/guide/utils.html' },
          ],
        },
        {
          text: '手册',
          collapsed: false,
          items: [
            {
              text: '目录',
              link: '/zh/cookbook/',
            },
            {
              text: '热更新',
              link: '/zh/cookbook/hot-module-replacement.html',
            },
            {
              text: '测试',
              link: '/zh/cookbook/testing.html',
            },
            {
              text: '高级',
              link: '/zh/cookbook/advanced.html',
            },
          ],
        },
      ],
    },
  },
}
