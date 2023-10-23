<template>
  <div v-if="show" class="announcement">
    <a href="">
      <slot>{{ translations[site.lang] }}</slot>
      <span @click="close" class="cursor-pointer"> x </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const { site } = useData()
const translations = {
  'en-US': 'The document is constantly being updated, due to the many functions, if you find the document does not match the actual, please contact the author',
  'zh-CN': '文档正在持续更新中，由于功能繁多，如发现文档与实际不相符，请联系作者',
}
let show = true
defineProps<{ title: string }>()
function close() {
  show = false
}
</script>

<style scoped>
.announcement {
  margin-top: 20px;
  background-color: var(--vp-code-block-bg);
  padding: 1em 1.25em;
  border-radius: 2px;
  position: relative;
  display: flex;
}
.announcement a {
  color: var(--c-text);
  position: relative;
  padding-left: 36px;
}
.announcement a:before {
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
.announcement a:after {
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

.cursor-pointer {
  cursor: pointer;
}
</style>
