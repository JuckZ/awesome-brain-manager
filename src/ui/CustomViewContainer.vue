<template>
    <div id="customViewContainer">
        <NNotificationProvider :max="3">
            <Toolbar :current-state="currentState" :plugin="plugin" />
        </NNotificationProvider>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from 'vue';
import { NNotificationProvider } from 'naive-ui';
import Toolbar from './Toolbar.vue';
import type AwesomeBrainManagerPlugin from '../main';
import type { EditorState } from '../utils/editor';
import Logger from '../utils/logger';

defineProps<{
    plugin: AwesomeBrainManagerPlugin;
    currentState: EditorState;
}>();

onMounted(async () => {});

onUpdated(() => {
    Logger.log('container updated');
});
onUnmounted(() => {});
</script>

<style scoped lang="scss"></style>
