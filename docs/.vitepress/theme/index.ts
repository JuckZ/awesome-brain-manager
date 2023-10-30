// https://vitepress.dev/guide/custom-theme
import { h, watchEffect } from 'vue'
import Theme from 'vitepress/theme'
import Documate from '@documate/vue'
import '@documate/vue/dist/style.css'
import './style.css'
import { type EnhanceAppContext, inBrowser, useData } from 'vitepress'
import { i18nextConst, useI18n } from '../config/i18n'
import MainFooter from './components/MainFooter.vue'
import AnnouncementBar from './components/AnnouncementBar.vue'
import LanguageChange from './components/LanguageChange.vue'

export default {
  extends: Theme,
  setup() {
    const { lang } = useData()
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`
        i18nextConst.changeLanguage(lang.value)
      }
    })
  },
  Layout: () => {
    const askAISlot = 'nav-bar-content-before'
    const languageChangeSlot = 'nav-bar-content-after'
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      [askAISlot]: () => h(Documate, {
        endpoint: 'https://f965a6vcks.us.aircode.run/ask',
        predefinedQuestions: [
          'What is Awesome Brain Manager?',
          'How to use Awesome Brain Manager?',
          "What features Awesome Brain Manager have?"
        ]
      }),
      [languageChangeSlot]: () => h(LanguageChange, {}),
    })
  },
  enhanceApp({ app, router, siteData }: EnhanceAppContext) {
    app = useI18n(app)
    app.component('MainFooter', MainFooter)
    app.component('AnnouncementBar', AnnouncementBar)
    app.component('LanguageChange', LanguageChange)
  }
}
