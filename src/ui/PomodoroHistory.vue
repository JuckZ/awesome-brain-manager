<template>
    <n-config-provider
        :theme="darkTheme"
        :locale="zhCN"
        :date-locale="dateZhCN"
        :breakpoints="{ xs: 0, s: 640, m: 1024, l: 1280, xl: 1536, xxl: 1920 }"
    >
        <n-message-provider>
            <n-space vertical>
                <div id="historyViewContainer">
                    <H1Title></H1Title>
                    <!-- <Title></Title> -->
                    <OverView :all-pomodoro="history" />
                    <clock-view :current-pomodoro="currentPomodoro"></clock-view>
                    <TimeLine :plugin="plugin" :pomodoro-list="history" />
                    <!-- #BUG https://www.naiveui.com/zh-CN/os-theme/components/grid#layout-shift-disabled.vue -->
                    <n-grid cols="1 1024:2" responsive="self">
                        <n-grid-item>
                            <DoughnutChart :all-pomodoro="history" />
                        </n-grid-item>
                        <n-grid-item>
                            <line-chart :all-pomodoro="history" />
                        </n-grid-item>
                    </n-grid>
                    <n-grid cols="1" :layout-shift-disabled="true">
                        <n-grid-item span="1">
                            <CalendarView :all-pomodoro="history" />
                        </n-grid-item>
                    </n-grid>
                </div>
            </n-space>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="tsx">
import { Ref, nextTick, onMounted, onUpdated, ref, toRefs } from 'vue';
import { NConfigProvider, NMessageProvider, NSpace, NGrid, NGridItem } from 'naive-ui';
// theme
import { createTheme, datePickerDark, inputDark } from 'naive-ui';
// locale & dateLocale
import { dateZhCN, zhCN } from 'naive-ui';
import type { Pomodoro } from '../schemas/spaces';
import type { DBRows } from '../types/mdb';
import CalendarView from './CalendarView.vue';
import OverView from './OverView.vue';
import ClockView from './ClockView.vue';
import TimeLine from './TimeLine.vue';
import Title from './Title';
import DoughnutChart from './DoughnutChart.vue';
import LineChart from './LineChart.vue';
import { pomodoroDB } from '../utils/constants';
import { selectDB } from '../utils/db/db';
import type ObsidianManagerPlugin from '../main';
import { eventTypes } from '../types/types';

const darkTheme = createTheme([inputDark, datePickerDark]);

const props = defineProps<{
    plugin: ObsidianManagerPlugin;
}>();

let H1Title = () => (
    <h1>
        <Title></Title>
    </h1>
);
const { plugin } = toRefs(props);
const history: Ref<Pomodoro[]> = ref([]);
const currentPomodoro: Ref<Pomodoro | null> = ref(null);

const updateData = async (): Promise<void> => {
    history.value = (await selectDB(plugin.value.spaceDBInstance(), pomodoroDB)?.rows) || [];
    currentPomodoro.value = history.value.filter(pomodoro => pomodoro.status === 'ing')[0] || null;
    
};

onMounted(async () => {
    updateData();
});
addEventListener(eventTypes.pomodoroChange, updateData);
</script>

<style scoped lang="scss">
#historyViewContainer {
    padding: 5px 10px;
}
</style>
