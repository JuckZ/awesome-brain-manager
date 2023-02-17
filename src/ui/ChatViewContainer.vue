<template>
    <div>
        <NNotificationProvider :max="3"> <ChatView :keyword="'xxxx'" /> </NNotificationProvider>
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { NNotificationProvider, NSpace, useNotification } from 'naive-ui';
import t from '../i18n';
import ChatView from '../ui/ChatView.vue';

onMounted(async () => {
    console.log('onMounted');
});

onUnmounted(() => {
    console.log('onUnmounted');
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
