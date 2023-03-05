<template>
    <webview class="abm-webview" allowpopups :src="url" autosize="on"></webview>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, toRefs, onUpdated } from 'vue';
import Logger from '../utils/logger';

const props = defineProps<{
    url: string;
}>();

const { url } = toRefs(props);

onMounted(async () => {
    Logger.log('browser onMounted');
});

onUnmounted(() => {
    Logger.log('browser onUnmounted');
});

onUpdated(() => {
    Logger.log(url.value);
});
</script>

<style scoped lang="scss">
.abm-webview {
    width: 100%;
    // height: 100%;
    border: none;
    background-color: white;
    background-clip: content-box;
}
</style>

<style>
.view-content .abm-webview {
    height: calc(100% - 32px);
}
</style>
