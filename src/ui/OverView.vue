<template>
    <n-grid cols="1 320:2 640:4" responsive="self">
        <n-grid-item>
            <n-card title="今日番茄" content-style="font-size: 16px;">{{
                countPomodoro(allPomodoro, 'todayNum')
            }}</n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card title="今日专注时长" content-style="font-size: 16px;">{{
                countPomodoro(allPomodoro, 'todayTime')
            }}</n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card title="总番茄" content-style="font-size: 16px;">{{
                countPomodoro(allPomodoro, 'totalNum')
            }}</n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card title="总专注时长" content-style="font-size: 16px;">{{
                countPomodoro(allPomodoro, 'totalTime')
            }}</n-card>
        </n-grid-item>
    </n-grid>
</template>

<script setup lang="ts">
import { NCard, NGrid, NGridItem } from 'naive-ui';
import { toRefs } from 'vue';
import moment from 'moment';
import { getTheDay } from '../utils/constants';
import type { Pomodoro } from '../schemas/spaces';

const props = defineProps<{
    allPomodoro: Pomodoro[];
}>();
const { allPomodoro } = toRefs(props);

const countPomodoro = (pomodoroList: Pomodoro[], dimension: 'todayNum' | 'todayTime' | 'totalNum' | 'totalTime') => {
    const theDay = getTheDay();
    const pomodoroTheDay = pomodoroList.filter(pomodoro => pomodoro.start.startsWith(theDay));
    const pomodoroTimeTotal = pomodoroList.reduce((a, b) => a + parseFloat(b.spend), 0);
    const pomodoroTimeTheDay = pomodoroTheDay.reduce((a, b) => a + parseFloat(b.spend), 0);
    const todayDuration = moment.duration(pomodoroTimeTheDay, 'milliseconds');
    const totayDuration = moment.duration(pomodoroTimeTotal, 'milliseconds');
    switch (dimension) {
        case 'todayNum':
            return pomodoroTheDay.length;
        case 'todayTime':
            return moment.utc(todayDuration.asMilliseconds()).format('HH:mm:ss');
        case 'totalNum':
            return pomodoroList.length;
        case 'totalTime':
            return moment.utc(totayDuration.asMilliseconds()).format('HH:mm:ss');
        default:
            return '';
    }
};
</script>

<style scoped lang="scss"></style>
