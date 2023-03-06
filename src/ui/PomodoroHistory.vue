<template>
    <n-config-provider
        :theme="theme"
        :theme-overrides="theme.name === 'light' ? lightThemeOverrides : darkThemeOverrides"
        :locale="locale"
        :date-locale="dateLocale"
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
import { onMounted, ref, toRefs, onUnmounted, watchEffect, type Ref } from 'vue';
import {
    darkTheme,
    lightTheme,
    zhCN,
    dateZhCN,
    enUS,
    dateEnUS,
    NConfigProvider,
    NMessageProvider,
    NSpace,
    NGrid,
    NGridItem,
    type GlobalThemeOverrides,
} from 'naive-ui';
import type { Pomodoro } from '../schemas/spaces';
import CalendarView from './CalendarView.vue';
import OverView from './OverView.vue';
import ClockView from './ClockView.vue';
import TimeLine from './TimeLine.vue';
import Title from './Title';
import DoughnutChart from './DoughnutChart.vue';
import LineChart from './LineChart.vue';
import { pomodoroDB } from '../utils/constants';
import { selectDB } from '../utils/db/db';
import type AwesomeBrainManagerPlugin from '../main';
import { eventTypes } from '../types/types';
import { useSystemStore } from '../stores';
import { storeToRefs } from 'pinia';

// const darkTheme = createTheme([inputDark, datePickerDark]);
let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);

const lightThemeOverrides: GlobalThemeOverrides = {};

const darkThemeOverrides: GlobalThemeOverrides = {};

const props = defineProps<{
    plugin: AwesomeBrainManagerPlugin;
}>();

const { systemState } = storeToRefs(useSystemStore());

watchEffect(() => {
    if (systemState.value.theme === 'dark') {
        theme.value = darkTheme;
    } else {
        theme.value = lightTheme;
    }
    if (systemState.value.language === 'zh') {
        locale.value = zhCN;
        dateLocale.value = dateZhCN;
    } else {
        locale.value = enUS;
        dateLocale.value = dateEnUS;
    }
});
let H1Title = () => (
    <h1>
        <Title></Title>
    </h1>
);
const { plugin } = toRefs(props);
const history: Ref<Pomodoro[]> = ref([]);
const currentPomodoro: Ref<Pomodoro | null> = ref(null);

const updateData = async (): Promise<void> => {
    history.value = ((await selectDB(plugin.value.spaceDBInstance(), pomodoroDB)?.rows) as Pomodoro[]) || [];
    currentPomodoro.value = history.value.filter(pomodoro => pomodoro.status === 'ing')[0] || null;
};

onMounted(async () => {
    window.removeEventListener(eventTypes.pomodoroChange, updateData, false);
    updateData();
    window.addEventListener(eventTypes.pomodoroChange, updateData);
});

onUnmounted(() => {
    window.removeEventListener(eventTypes.pomodoroChange, updateData, false);
});
</script>

<style scoped lang="scss">
#historyViewContainer {
    padding: 5px 10px;
}
</style>
