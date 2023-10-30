<template>

  <div v-if="show" class="announcement" @click="close">
    <div class="card">
      <slot>{{ title }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
