// https://vitepress.dev/guide/custom-theme
import { h, watchEffect, onMounted } from 'vue'
import Theme from 'vitepress/theme'
import Documate from '@documate/vue'
import '@documate/vue/dist/style.css'
import "meilisearch-docsearch/css";
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
    onMounted(() => {
      // For SSR Compatibility https://vitepress.dev/guide/ssr-compat#ssr-compatibility
      import('meilisearch-docsearch').then((docsearch) => {
        docsearch.default({
          container: "#docsearch",
          host: "https://meilisearch-chaovee.koyeb.app",
          apiKey: "d34c065c81456f05748bd58bd9b1719209c231d1cfe201777bd55f8c21da32d0",
          indexUid: "abm",
          translations: {
            button: {},
            modal: {}
          }
        });
      })
     
    })
  },
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'nav-bar-content-before': () => h(
        'span',
        { id: 'content-before' },
        [
          h(Documate, {
            endpoint: 'https://f965a6vcks.us.aircode.run/ask',
            predefinedQuestions: [
              'What is Awesome Brain Manager?',
              'How to use Awesome Brain Manager?',
              "What features Awesome Brain Manager have?"
            ]
          }),
          h('span', {
            id: 'docsearch'
          }),
        ]
      ),
    })
  },
  enhanceApp({ app, router, siteData }: EnhanceAppContext) {
    app.component('MainFooter', MainFooter)
    app.component('AnnouncementBar', AnnouncementBar)
    router.onBeforePageLoad = (to) => {
      if (import.meta.env.DEV) return
      const url = 'https://api.gumengya.com/Api/UserInfo'
      // FIXME 每次构建都会执行，而不是进入路由时执行？
      fetch(url, {
        method: "get",
        mode: 'cors',
      }).then(
        response => response.json()
      ).then(
        res => {
          if (res.code == 200) {
            if (res.data.location.startsWith('中国') && !router.route.path.startsWith('/zh')) {
              router.go(`/zh${router.route.path}`)
              // zh-CN en-US
              // siteData.value.lang = 'zh-CN'
            }
          } else {
            console.log(res)
          }
        }
      ).catch(
        console.error
      )
    }
  }
}
