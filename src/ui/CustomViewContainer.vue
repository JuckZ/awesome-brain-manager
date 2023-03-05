<template>
    <div id="customViewContainer">
        <NNotificationProvider :max="3">
            <Toolbar />
        </NNotificationProvider>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from 'vue';
import { NNotificationProvider } from 'naive-ui';
import Toolbar from './Toolbar.vue';
import Logger from '../utils/logger';

onMounted(async () => {});

onUpdated(() => {
    Logger.log('container updated');
});
onUnmounted(() => {});
</script>

<style scoped lang="scss"></style>
