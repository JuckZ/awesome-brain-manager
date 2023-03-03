<template>
    <div id="abmToolbar" v-show="isShow" :style="getComputedStyle()">
        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon size="24" :component="OpenAI" @click="clickHandle(ServiceNames.OpenAI, currentState.selection)">
                </n-icon>
            </template>
            <span> 问问openAI </span>
        </n-tooltip>

        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon size="24" :component="Bing" @click="clickHandle(ServiceNames.Bing, currentState.selection)">
                </n-icon>
            </template>
            <span> 问问bing chat </span>
        </n-tooltip>

        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon
                    size="24"
                    :component="ChatGPT"
                    @click="clickHandle(ServiceNames.ChatGPT, currentState.selection)"
                >
                </n-icon>
            </template>
            <span> 问问chatGPT </span>
        </n-tooltip>

        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon
                    size="24"
                    :component="ScanImage"
                    @click="clickHandle(ServiceNames.GenImageWithChatGPT, currentState.selection)"
                >
                </n-icon>
            </template>
            <span> chatGPT生成图 </span>
        </n-tooltip>

        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon size="24" :component="Baidu" @click="clickHandle(ServiceNames.Baidu, currentState.selection)">
                </n-icon>
            </template>
            <span> 百度一下 </span>
        </n-tooltip>

        <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
                <n-icon size="24" :component="Google" @click="clickHandle(ServiceNames.Google, currentState.selection)">
                </n-icon>
            </template>
            <span> Google </span>
        </n-tooltip>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, onUpdated, toRefs, watchEffect } from 'vue';
import { NTooltip, NIcon, useNotification } from 'naive-ui';
import { ServiceNames, chatWith } from '../api';
import OpenAI from './components/icon/OpenAI.vue';
import Baidu from './components/icon/Baidu.vue';
import Bing from './components/icon/Bing.vue';
import ChatGPT from './components/icon/ChatGPT.vue';
import Google from './components/icon/Google.vue';
import ScanImage from './components/icon/ScanImage.vue';
import { useEditorStore } from '../stores';
import { storeToRefs } from 'pinia';

import { customTitle, customContent, customAvatar, customDescription } from './CustomContent';
import type AwesomeBrainManagerPlugin from '../main';
import { eventTypes } from '../types/types';
import Logger from '../utils/logger';

const props = defineProps<{
    plugin: AwesomeBrainManagerPlugin;
}>();

const store = useEditorStore();
const { editorState: currentState } = storeToRefs(store);
const { plugin } = toRefs(props);
const isShow = ref(false);
const notification = useNotification();
let oldSelection = '';

// TODO 优化性能，还有实现方式
// watch(
//     () => selection,
//     (selection, preSelection) => {
//         Logger.log(selection, preSelection);
//         if (selection && selection !== preSelection) {
//             isShow.value = true;
//         } else {
//             isShow.value = false;
//         }
//     },
//     {
//         deep: true
//     },
// );

watchEffect(() => {
    const currentVal = currentState.value.selection;
    if (currentVal && currentVal != oldSelection) {
        isShow.value = true;
    } else {
        isShow.value = false;
    }
    oldSelection = currentVal;
});

const getComputedStyle = () => {
    return {
        top: `${currentState.value.position.top + 20}px`,
        left: `${currentState.value.position.left + 5}px`,
    };
};

const clickHandle = async (type: string, keyword: string) => {
    isShow.value = false;
    switch (type) {
        case ServiceNames.Bing:
        case ServiceNames.OpenAI:
        case ServiceNames.ChatGPT:
        case ServiceNames.GenImageWithChatGPT:
            conversation(type, await chatWith(type, keyword));
            break;
        case ServiceNames.Baidu:
            plugin.value.openBrowser(`https://baidu.com/s?wd=${keyword}`);
            break;
        case ServiceNames.Google:
            plugin.value.openBrowser(`https://www.google.com/search?q=${keyword}`);
            break;
        default:
            return;
    }
};

const conversation = (owner: string, content: string) => {
    notification.info({
        avatar: () => customAvatar(owner),
        description: () => customDescription('ing'),
        title: () => customTitle(owner),
        content: () => customContent(content),
    });
};

const calledFunctionHandler = e => {
    clickHandle(e.detail.type, e.detail.keyword);
};
onMounted(async () => {
    window.removeEventListener(eventTypes.calledFunction, calledFunctionHandler);
    Logger.log('toolbar onMounted');
    window.addEventListener(eventTypes.calledFunction, calledFunctionHandler);
});

// TODO  重启插件不会触发
onUnmounted(() => {
    Logger.log('onUnmounted');
    window.removeEventListener(eventTypes.calledFunction, calledFunctionHandler);
});

onUpdated(() => {
    Logger.log('Toolbar updated');
});
</script>

<style scoped lang="scss">
#abmToolbar {
    padding: 6px;
    border: 1px solid #d4d4d4;
    border-radius: 7px;
    position: fixed;
    background-color: rgb(250, 250, 250);
}
#abmToolbar :deep(.n-icon) {
    cursor: pointer;
    margin: 5px;
    opacity: 0.6;
    &:hover {
        opacity: 1;
    }
}
</style>
