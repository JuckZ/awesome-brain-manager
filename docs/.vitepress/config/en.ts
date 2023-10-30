import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://abm.timesavior.io'
export const META_TITLE = 'Awesome Brain Manager'
export const META_DESCRIPTION =
  'A plugin that tries to solve all the trivial problems most people usually encountered in obsidian.'

export const enLangPack = {
  META_URL: 'https://abm.timesavior.io',
  META_TITLE: 'Awesome Brain Manager',
  META_DESCRIPTION: 'A plugin that tries to solve all the trivial problems most people usually encountered in obsidian.'
}

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
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
      text: 'Suggest changes to this page',
    },

    nav: [
      // { text: 'Config', link: '/config/' },
      // { text: 'Plugins', link: '/plugins/' },
      {
        text: 'Guide',
        link: '/guide/',
        activeMatch: '^/guide/',
      },
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
      {
        text: 'Links',
        items: [
          {
            text: 'Discussions',
            link: 'https://github.com/JuckZ/awesome-brain-manager/discussions',
          },
          {
            text: 'Changelog',
            link: 'https://github.com/JuckZ/awesome-brain-manager/blob/master/CHANGELOG.md',
          },
          {
            text: 'Roadmap',
            link: 'https://github.com/users/JuckZ/projects/2',
          },
        ],
      },
    ],

    sidebar: {
      '/api/': [
        {
          text: 'packages',
          items: [
            { text: 'core', link: '/api/modules/core.html' },
            { text: 'pomodoro', link: '/api/modules/pomodoro.html' },
            {
              text: 'ai',
              link: '/api/modules/ai.html',
            },
            {
              text: 'obsidian',
              link: '/api/modules/obsidian.html',
            },
            {
              text: 'utils',
              link: '/api/modules/utils.html',
            },
            {
              text: 'ntfy',
              link: '/api/modules/ntfy.html',
            },
            {
              text: 'browser',
              link: '/api/modules/browser.html',
            },
          ],
        },
      ],
      // catch-all fallback
      '/': [
        {
          text: 'Introduction',
          items: [
            {
              text: 'What is Awesome Brain Manager?',
              link: '/introduction.html',
            },
            {
              text: 'Getting Started',
              link: '/getting-started.html',
            },
          ],
        },
        {
          text: 'Core Feature',
          items: [
            { text: 'Feature preview', link: '/guide/' },
            { text: 'Pomodoro', link: '/guide/pomodoro.html' },
            { text: 'Special Effects', link: '/guide/special-effects.html' },
            { text: 'Utils', link: '/guide/utils.html' },
          ],
        },
        {
          text: 'Cookbook',
          collapsed: false,
          items: [
            {
              text: 'Index',
              link: '/cookbook/',
            },
            {
              text: 'Hot Module Replacement',
              link: '/cookbook/hot-module-replacement.html',
            },
            {
              text: 'Testing',
              link: '/cookbook/testing.html',
            },
            {
              text: 'Advanced',
              link: '/cookbook/advanced.html',
            },
          ],
        },
      ],
    },
  },
}
