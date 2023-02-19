<template>
    <webview class="abm-webview" allowpopups :src="url" autosize="on"></webview>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, toRefs, onUpdated } from 'vue';
import t from '../i18n';
import Title from './Title';

const props = defineProps<{
    url: string;
}>();

const { url } = toRefs(props);

onMounted(async () => {
    console.log('browser onMounted');
});

onUnmounted(() => {
    console.log('browser onUnmounted');
});

onUpdated(() => {
    console.log(url.value);
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
