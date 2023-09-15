<template>
    <webview class="abm-webview" allowpopups :src="url" autosize="on"></webview>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated, toRefs } from 'vue';
import { LoggerUtil } from '@/utils/logger';

const props = defineProps<{
    url: string;
}>();

const { url } = toRefs(props);

onMounted(async () => {
    LoggerUtil.log('browser onMounted');
});

onUnmounted(() => {
    LoggerUtil.log('browser onUnmounted');
});

onUpdated(() => {
    LoggerUtil.log(url.value);
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
