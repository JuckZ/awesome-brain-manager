import { defineConfig } from 'vitepress'
import { enConfig } from './en'
import { sharedConfig } from './shared'
import { zhConfig } from './zh'
import { genFeed } from '../genFeed'
// import { genSitemap } from '../genSitemap'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...sharedConfig,
  title: "Awesome Brain Manager",
  description: "A plugin that tries to solve all the trivial problems most people usually encountered in obsidian. 旨在解决大多数人在Obsidian中遇到的所有琐碎问题",
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      link: '/',
      description: "A plugin that tries to solve all the trivial problems most people usually encountered in obsidian.",
      ...enConfig
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: '旨在解决大多数人在Obsidian中遇到的所有琐碎问题',
      ...zhConfig
    },
    // zhTW: {
    //   label: '繁體中文', 
    //   lang: 'zh-TW', 
    //   link: 'https://abm-zh-tw.netlify.app',
    // }
  },
  markdown: {},
  sitemap: {
    hostname: 'https://abm.timesavior.io'
  },
  lastUpdated: true,
  buildEnd(siteConfig) {
    genFeed(siteConfig)
    // genSitemap(siteConfig)
  },
})
