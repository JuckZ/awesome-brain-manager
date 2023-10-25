import { defineConfig, HeadConfig } from 'vitepress'

export const META_IMAGE = 'https://pinia.vuejs.org/social.png'
export const isProduction =
  process.env.NETLIFY && process.env.CONTEXT === 'production'

if (process.env.NETLIFY) {
  console.log('Netlify build', process.env.CONTEXT)
}

const productionHead: HeadConfig[] = []

const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1')

export const sharedConfig = defineConfig({
  title: 'Pinia',
  appearance: 'dark',

  markdown: {
    theme: {
      dark: 'dracula-soft',
      light: 'vitesse-light',
    },

    attrs: {
      leftDelimiter: '%{',
      rightDelimiter: '}%',
    },

    anchor: {
      slugify,
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'icon', type: 'image/jpg', href: '/logo.jpg' }],

    [
      'meta',
      { name: 'wwads-cn-verify', content: '5878a7ab84fb43402106c575658472fa' },
    ],

    [
      'meta',
      {
        property: 'og:type',
        content: 'website',
      },
    ],

    [
      'meta',
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:image',
        content: META_IMAGE,
      },
    ],

    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'KFPPRRIS',
        'data-spa': 'auto',
        defer: '',
      },
    ],

    // Vue School Top banner
    [
      'script',
      {
        src: 'https://vueschool.io/banner.js?affiliate=vuerouter&type=top',
        // @ts-expect-error: vitepress bug
        async: true,
        type: 'text/javascript',
      },
    ],

    ...(isProduction ? productionHead : []),
  ],

  themeConfig: {
    logo: '/logo.png',
    outline: [2, 3],

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      {
        icon: {
          svg: 'rss'
        },
        link: '/feed.rss',
      },
      // { icon: 'twitter', link: 'https://twitter.com/posva' },
      {
        icon: 'github',
        link: 'https://github.com/JuckZ/awesome-brain-manager',
      },
      // {
      //   icon: 'discord',
      //   link: 'https://chat.vuejs.org',
      // },
    ],

    footer: {
      copyright: 'Copyright © 2022-present Juck',
      message: 'Released under the MIT License.',
    },

    editLink: {
      pattern: 'https://github.com/JuckZ/awesome-brain-manager/edit/develop/docs/:path',
      text: 'Suggest changes',
    },

    search: {
      provider: 'local',
      options: {
        appId: 'HYIBMMMO9G',
        apiKey: 'ee773b050cfbc3f969462b2f3960e348',
        // apiKey: 'ea6dc42a4a4be2c403dbb950e1d2f7b7',
        indexName: 'abm-timesavior',
        insights: false,
        locales: {
          zh: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                }
              }
            }
          }
        },
      }
    },

    // carbonAds: {
    //   code: 'CEBICK3I',
    //   // custom: 'CEBICK3M',
    //   placement: 'routervuejsorg',
    // },
  },
})
