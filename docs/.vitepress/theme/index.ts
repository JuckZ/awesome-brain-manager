// https://vitepress.dev/guide/custom-theme
import { h, watchEffect } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'
import { type EnhanceAppContext, inBrowser, useData } from 'vitepress'
import MainFooter from './components/MainFooter.vue'
import AnnouncementBar from './components/AnnouncementBar.vue'

export default {
  extends: Theme,
  setup() {
    const { lang } = useData()
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`
      }
    })
  },
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }: EnhanceAppContext) {
    app.component('MainFooter', MainFooter)
    app.component('AnnouncementBar', AnnouncementBar)
  }
}
