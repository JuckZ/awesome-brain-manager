<template>
  <div class="vueschool">
      <button @click="changeLang('en')" style="margin-right: 1em;">English</button>
      <button @click="changeLang('zh')">简体中文</button>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
const test = useData()

import { i18nextConst } from '../../config/i18n'

function changeLang(lang) {
  i18nextConst.changeLanguage(lang)
  // TODO 修改vitepress的语言
  test.site.value.lang = lang
}
</script>

<style scoped>
.vueschool {
  margin-top: 20px;
  background-color: var(--vp-code-block-bg);
  padding: 1em 1.25em;
  border-radius: 2px;
  position: relative;
  display: flex;
}
.vueschool a {
  color: var(--c-text);
  position: relative;
  padding-left: 36px;
}
.vueschool a:before {
  content: '';
  position: absolute;
  display: block;
  width: 30px;
  height: 30px;
  top: calc(50% - 15px);
  left: -4px;
  border-radius: 50%;
  background-color: #73abfe;
}
.vueschool a:after {
  content: '';
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  top: calc(50% - 5px);
  left: 8px;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid #fff;
}
</style>
