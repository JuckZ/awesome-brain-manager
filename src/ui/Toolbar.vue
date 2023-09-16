<template>
    <div v-show="isShow" id="abmToolbar" :style="getComputedStyle()">
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
import { onMounted, onUnmounted, onUpdated, ref, watchEffect } from 'vue';
import { NIcon, NTooltip, useNotification } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ServiceNames, chatWith } from '@/api';
import { useEditorStore } from '@/stores';
import { eventTypes } from '@/types/types';
import { LoggerUtil } from '@/utils/logger';
import { getNumberFromStr } from '@/utils/common';
import OpenAI from '@/ui/components/icon/OpenAI.vue';
import Baidu from '@/ui/components/icon/Baidu.vue';
import Bing from '@/ui/components/icon/Bing.vue';
import ChatGPT from '@/ui/components/icon/ChatGPT.vue';
import Google from '@/ui/components/icon/Google.vue';
import ScanImage from '@/ui/components/icon/ScanImage.vue';

import { customAvatar, customContent, customDescription, customTitle } from '@/ui/CustomContent';

const { editorState: currentState } = storeToRefs(useEditorStore());
const isShow = ref(false);
const notification = useNotification();

// TODO 优化性能，还有实现方式
// watch(
//     () => selection,
//     (selection, preSelection) => {
//         LoggerUtil.log(selection, preSelection);
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
    if (currentState.value.selection) {
        isShow.value = true;
    } else {
        isShow.value = false;
    }
});

function getElementViewLeft(element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;

    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }

    let elementScrollLeft;
    if (document.compatMode == 'BackCompat') {
        elementScrollLeft = document.body.scrollLeft;
    } else {
        elementScrollLeft = document.documentElement.scrollLeft;
    }

    return actualLeft - elementScrollLeft;
}

function getElementViewTop(element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;

    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }

    let elementScrollTop;
    if (document.compatMode == 'BackCompat') {
        elementScrollTop = document.body.scrollTop;
    } else {
        elementScrollTop = document.documentElement.scrollTop;
    }

    return actualTop - elementScrollTop;
}

const getComputedStyle = () => {
    if (!isShow.value) {
        return;
    }
    const activeLine = activeDocument.querySelector('.cm-focused .cm-active.cm-line') as Element;
    const getTop = () => {
        let topOffset = 20;
        let lineHeight = activeLine?.getCssPropertyValue('line-height') || activeLine?.getCssPropertyValue('height');
        if (lineHeight && lineHeight !== '0') {
            topOffset = getNumberFromStr(lineHeight)[0] || 20;
        }
        return currentState.value.position.top + topOffset;
    };
    const getLeft = () => {
        const activeDoc = activeDocument.querySelector('.workspace-leaf.mod-active .cm-content');

        if (activeDoc.innerWidth < 250) {
            return getElementViewLeft(activeLine);
        } else {
            // FIXME hack value
            const contentWidth = activeLine.clientWidth || 0;
            const limit = getElementViewLeft(activeLine) + contentWidth - 200;
            const expect = currentState.value.position.left + 4;
            return expect > limit ? limit : expect;
        }
    };

    return {
        top: `${getTop()}px`,
        left: `${getLeft()}px`,
        width: 'max-content',
        'max-width': '240px',
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
        case ServiceNames.Baidu: {
            const baiduSearchEvent = new CustomEvent(eventTypes.openBrowser, {
                detail: {
                    url: `https://baidu.com/s?wd=${keyword}`,
                },
            });
            window.dispatchEvent(baiduSearchEvent);
            break;
        }

        case ServiceNames.Google: {
            const googleSearchEvent = new CustomEvent(eventTypes.openBrowser, {
                detail: {
                    url: `https://www.google.com/search?q=${keyword}`,
                },
            });
            window.dispatchEvent(googleSearchEvent);
            break;
        }

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
    window.addEventListener(eventTypes.calledFunction, calledFunctionHandler);
});

// TODO  重启插件不会触发
onUnmounted(() => {
    LoggerUtil.log('onUnmounted');
    window.removeEventListener(eventTypes.calledFunction, calledFunctionHandler);
});

onUpdated(() => {
    // LoggerUtil.log('Toolbar updated');
});
</script>

<style scoped lang="scss">
#abmToolbar {
    padding: 6px;
    border: 1px solid #d4d4d4;
    border-radius: 7px;
    position: absolute;
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
