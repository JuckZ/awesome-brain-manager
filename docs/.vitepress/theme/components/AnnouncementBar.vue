<template>

  <div v-if="show" class="announcement" @click="close">
    <div class="card">
      <slot>{{ translations[site.lang] }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { onMount } from 'svelte'

const { site } = useData()
const translations = {
  'en-US': 'Too many features have been introduced to update the document (15% progress). If you find that the document does not match the reality, please contact the author',
  'zh-CN': '引入了太多功能，来不及更新文档(进度15%)，如发现文档与实际不相符，请联系作者',
}

const show = ref(false)
defineProps<{ title: string }>()
function close() {
  show.value = false
}
setTimeout(() => {
  show.value = true
}, 1500);
</script>

<style scoped>

.announcement {
  position: fixed;
  top: 5em;
  width: 60%;
  left: 50%;
  transform: translateX(-50%)
}
/* https://codepen.io/gayane-gasparyan/details/jOmaBQK */
@property --rotate {
  syntax: "<angle>";
  initial-value: 132deg;
  inherits: false;
}

.card {
  background: #191c29;
  position: relative;
  border-radius: 6px;
  font-size: 1.5em;
  color: rgb(88 199 250 / 0%);
  cursor: pointer;
  font-family: cursive;
}

.card:hover {
  color: rgb(88 199 250 / 100%);
  transition: color 1s;
}

.card::before {
  content: "";
  width: calc(100% + 10px);
  height: calc(100% + 10px);
  border-radius: 8px;
  background-image: linear-gradient(
    var(--rotate)
    , #5ddcff, #3c67e3 43%, #4e00c2);
    position: absolute;
    z-index: -1;
    top: -5px;
    left: -5px;
    animation: spin 2.5s linear infinite;
}

@keyframes spin {
  0% {
    --rotate: 0deg;
  }
  100% {
    --rotate: 360deg;
  }
}
</style>
