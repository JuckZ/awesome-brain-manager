<template>
    <div style="position: relative">
        <span
            v-show="planButNotStart.length !== 0"
            style="position: absolute; transform: translateY(-100%); right: 0"
            >{{ '📥' + activeTime.date }}</span
        >
        <n-list
            :class="{
                pomodoroList: true,
                active: activeTime.date === time.date,
                notActive: activeTime.date !== time.date,
            }"
            :show-divider="false"
        >
            <n-list-item v-for="pomodoro in pomodoroList" :key="pomodoro.timestamp" :style="getRandomStyle()" bordered>
                <n-ellipsis v-show="activeTime.date !== time.date">
                    {{ pomodoro.task }}
                </n-ellipsis>
            </n-list-item>
        </n-list>
    </div>
</template>

<script setup lang="ts">
import { NEllipsis, NList, NListItem } from 'naive-ui';
import { moment } from 'obsidian';
import { storeToRefs } from 'pinia';
import { ref, toRefs, watchEffect } from 'vue';
import type { Pomodoro } from '../schemas/spaces';
import { usePomodoroStore } from '../stores';
import { colorSchema } from '../utils/constants';

const { pomodoroHistory } = storeToRefs(usePomodoroStore());
const pomodoroList = ref([] as Pomodoro[]);
const planButNotStart = ref([] as Pomodoro[]);

const props = withDefaults(
    defineProps<{
        activeTime: { year: number; month: number; date: number };
        time: { year: number; month: number; date: number };
    }>(),
    {
        time: () => {
            const timeStr = moment().format('YYYY-MM-DD').split('-');
            return {
                year: parseInt(timeStr[0]),
                month: parseInt(timeStr[1]),
                date: parseInt(timeStr[2]),
            };
        },
    },
);
const { activeTime, time } = toRefs(props);
watchEffect(() => {
    planButNotStart.value = pomodoroHistory.value.filter(
        item =>
            item.status === 'todo' &&
            item.createTime.startsWith(
                `${time.value.year}-${time.value.month.toString().padStart(2, '0')}-${time.value.date
                    .toString()
                    .padStart(2, '0')}`,
            ),
    );
    pomodoroList.value = pomodoroHistory.value.filter(
        item =>
            item.start &&
            item.start.startsWith(
                `${time.value.year}-${time.value.month.toString().padStart(2, '0')}-${time.value.date
                    .toString()
                    .padStart(2, '0')}`,
            ),
    );
});

const getRandomStyle = () => {
    const color = colorSchema[Math.floor(Math.random() * colorSchema.length)];
    return `background-color: ${color.bg};color: ${color.fg};`;
};
</script>

<style lang="scss">
.pomodoroList {
    background-color: transparent !important;

    .n-list-item {
        padding: 0;
        margin-top: 2px;
        margin-bottom: 2px;
        font-size: 80%;
        opacity: 0.5;
    }

    &.active {
        .n-list-item {
            opacity: 1;
            width: max-content;
        }
    }

    &.notActive {
        .n-list-item {
            // 解决子元素超出父元素宽度的问题 https://juejin.cn/post/6974356682574921765
            .n-list-item__main {
                width: 0;
                flex: 1;
            }
        }
    }
}
</style>
