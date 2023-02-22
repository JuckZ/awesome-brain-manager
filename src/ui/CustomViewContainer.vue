<template>
    <div id="customViewContainer">
        <NNotificationProvider :max="3">
            <Toolbar :current-state="currentState" :plugin="plugin" />
        </NNotificationProvider>
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, watchEffect, ref, toRef, onBeforeUpdate, onUpdated } from 'vue';
import { NNotificationProvider, NSpace, useNotification } from 'naive-ui';
import t from '../i18n';
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
