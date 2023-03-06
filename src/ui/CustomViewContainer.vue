<template>
    <div id="customViewContainer">
        <NNotificationProvider :max="3">
            <Teleport to="body" disable="false">
                <Toolbar />
            </Teleport>
        </NNotificationProvider>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from 'vue';
import { NNotificationProvider } from 'naive-ui';
import Toolbar from './Toolbar.vue';
import LoggerUtil from '../utils/logger';

onMounted(async () => {});

onUpdated(() => {
    LoggerUtil.log('container updated');
});
onUnmounted(() => {});
</script>

<style scoped lang="scss"></style>
