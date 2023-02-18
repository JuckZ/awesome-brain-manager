<template>
    <div>
        <webview
            id="foo"
            src="https://openai.com/api/login/"
            style="display: inline-flex; width: 100%; height: 100%"
        ></webview>
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref, toRefs } from 'vue';
import t from '../i18n';
import Title from './Title';

const props = defineProps<{
    keyword: string;
}>();

onMounted(async () => {
    console.log('browser onMounted');
});

onUnmounted(() => {
    console.log('browser onUnmounted');
});
</script>

<style scoped lang="scss">
#chatHistory {
    position: fixed;
    top: 50px;
    right: 20px;
    color: yellow;
}
</style>
