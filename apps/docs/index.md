---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Awesome Brain Manager"
  text: "All in one"
  tagline: A plugin that tries to solve all the trivial problems most people usually encountered in obsidian.
  image:
    src: /logo.png
    alt: Awesome Brain Manager
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: Online demo
      link: https://playground.abm.ihave.cool

features:
  - title: 🍅 Pomodoro
    details: manage your own time using pomodoro
  - title: ⏰ Notification<sup>comming soon</sup>
    details: it can prompt anniversaries, task expirations, punch in, and support cross-platform
  - title: 🔀 Flow Chart
    details: 
  - title: 📊 Data chart
    details: 
  - title: 🤖 AI support<sup>comming soon</sup>
    details: 
  - title: 🏗 Custom Card<sup>comming soon</sup>
    details: 
  - title: 🪄 Special Effects
    details: Mouse track and keyboard key effects
  - title: ➕ Many more
    linkText: More features
    details: Go to the guide for more information
---

<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<style module>
sup {
  background: linear-gradient(to right, #FF0000, #FFD700);
  font-size: 12px;
  border-radius: 2px;
}
</style>