<template>
    <div>
        <div @click="clickHandle('openAI')">问问openAI</div>
        <div @click="clickHandle('chatGpt')">问问chatGPT</div>
        <div @click="clickHandle('genImageWithChatGPT')">chatGPT生成图</div>
        <div>百度一下</div>
        <div>Google</div>
        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon size="40" @click="clickHandle('bing')">
                    <game-controller-outline />
                </n-icon>
            </template>
            <span> 问问bing chat </span>
        </n-tooltip>

        <n-icon size="40" color="#0e7a0d">
            <game-controller />
        </n-icon>
        <n-icon size="40" :component="GameController" />
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { NNotificationProvider, NTooltip, NIcon, NSpace, useNotification } from 'naive-ui';
import t from '../i18n';
import { chatWithBing, /**chatWithChatGPT,**/ chatWithOpenAI, genImageWithChatGPT } from '../utils/ThirdPartyService';
import { GameControllerOutline, GameController } from '@vicons/ionicons5';
import Title from './Title';

const props = defineProps<{
    keyword: string;
}>();

const index = ref(0);
const notification = useNotification();

const clickHandle = async (type: string) => {
    console.log(notification);

    switch (type) {
        case 'bing':
            conversation('chatGpt', 'jahajhjahas');
            break;
        case 'openAI':
            conversation('openAI', await chatWithOpenAI());
            break;
        case 'chatGpt':
            // conversation('chatGpt', await chatWithChatGPT());
            break;
        case 'genImageWithChatGpt':
            console.log(await genImageWithChatGPT());
            break;
        default:
            return;
    }
};

const conversation = (owner: string, content: string) => {
    index.value++;
    notification.info({
        // TODO，使用tsx
        // avatar: () => '',
        title: `${owner}: 这是第 ${index.value}个对话`,
        content,
    });
};
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
