<template>
    <n-list id="pomodoroList" :show-divider="false">
        <n-list-item v-for="pomodoro in pomodoroList" :key="pomodoro.timestamp" :style="getRandomStyle()" bordered>
            <n-ellipsis>
                {{ pomodoro.task }}
            </n-ellipsis>
        </n-list-item>
    </n-list>
</template>

<script setup lang="ts">
import { NEllipsis, NList, NListItem, NTooltip } from 'naive-ui';
import type { Pomodoro } from '../schemas/spaces';
import { colorSchema } from '../utils/constants';

const getRandomStyle = () => {
    const color = colorSchema[Math.floor(Math.random() * colorSchema.length)];
    return `background-color: ${color.bg};color: ${color.fg};`;
};
const props = defineProps<{
    pomodoroList: Pomodoro[];
}>();
</script>

<style lang="scss">
#pomodoroList {
    background-color: none !important;
    .n-list-item {
        padding: 0;
        margin-top: 2px;
        margin-bottom: 2px;
        opacity: 0.5;
        // 解决子元素超出父元素宽度的问题 https://juejin.cn/post/6974356682574921765
        .n-list-item__main {
            width: 0;
            flex: 1;
        }
    }
}
</style>
