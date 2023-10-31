// https://vitepress.dev/guide/custom-theme
import { h, watchEffect, onMounted } from 'vue'
import Theme from 'vitepress/theme'
import posthog from 'posthog-js'
import Documate from '@documate/vue'
import '@documate/vue/dist/style.css'
import "meilisearch-docsearch/css";
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import './style.css'
import { type EnhanceAppContext, inBrowser, useData, useRoute } from 'vitepress'
import MainFooter from './components/MainFooter.vue'
import AnnouncementBar from './components/AnnouncementBar.vue'

export default {
  extends: Theme,
  setup() {
    const { lang, frontmatter } = useData()
    const route = useRoute();
    watchEffect(() => {
      if (inBrowser) {
        document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`
      }
    })
    onMounted(() => {
      giscusTalk({
        host: 'https://giscus.ihave.cool',
        repo: 'juckz/awesome-brain-manager',
        repoId: 'R_kgDOI8R5Gg',
        category: 'Announcements', // default: `General`
        categoryId: 'DIC_kwDOI8R5Gs4CV20G',
        mapping: 'pathname', // default: `pathname`
        inputPosition: 'top', // default: `top`
        lang: 'en', // default: `zh-CN`
        // ...
      }, {
        frontmatter, route
      },
        true
      );
      posthog.init('phc_NytZg6FNhRogFvdoQmuPhRLlf5WE9NjbkFvat7YcLS0', { api_host: 'https://app.posthog.com' })
      // For SSR Compatibility https://vitepress.dev/guide/ssr-compat#ssr-compatibility
      import('meilisearch-docsearch').then((docsearch) => {
        docsearch.default({
          container: "#docsearch",
          host: "https://meilisearch.ihave.cool",
          apiKey: "fa7139c0f2dbef713103a0a447332930fba5ecb939f81e86b17b07235506f25d",
          indexUid: "abm",
          // translations: {
          //   button: {},
          //   modal: {}
          // }
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
    return;
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
