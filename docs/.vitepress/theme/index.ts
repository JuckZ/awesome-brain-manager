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
    router.onBeforePageLoad = (to) => {
      if (import.meta.env.DEV) return
      fetch('https://api.gumengya.com/Api/UserInfo', {
        method: "post",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'json',
        })
      }).then(
        response => response.json()
      ).then(
        res => {
          if (res.data.code == 200) {
            if (res.data.data.location.startsWith('中国') && !router.route.path.startsWith('/zh')) {
              router.go(`/zh${router.route.path}`)
              // zh-CN en-US
              // siteData.value.lang = 'zh-CN'
            }
          } else {
            console.log(res.data)
          }
        }
      ).catch(
        console.error
      )
    }
  }
}
