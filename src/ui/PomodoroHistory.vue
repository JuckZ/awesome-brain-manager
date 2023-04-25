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
                    <OverView :all-pomodoro="pomodoroHistory" />
                    <DataViewTimeLine />
                    <ClockView></ClockView>
                    <TimeLine :time="focusTime" />
                    <n-grid cols="1" :layout-shift-disabled="true">
                        <n-grid-item span="1">
                            <CalendarView @focus-change="focusChangeHandle" />
                        </n-grid-item>
                    </n-grid>
                    <!-- #BUG https://www.naiveui.com/zh-CN/os-theme/components/grid#layout-shift-disabled.vue -->
                    <n-grid cols="1 1024:2" responsive="self">
                        <n-grid-item>
                            <DoughnutChart :all-pomodoro="pomodoroHistory" />
                        </n-grid-item>
                        <n-grid-item>
                            <line-chart :all-pomodoro="pomodoroHistory" />
                        </n-grid-item>
                    </n-grid>
                </div>
            </n-space>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="tsx">
import { ref, watchEffect } from 'vue';
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
import CalendarView from './CalendarView.vue';
import OverView from './OverView.vue';
import DataViewTimeLine from './DataViewTimeLine.vue';
import ClockView from './ClockView.vue';
import TimeLine from './TimeLine.vue';
import TestTitle from './TestTitle';
import DoughnutChart from './DoughnutChart.vue';
import LineChart from './LineChart.vue';
import { useSystemStore, usePomodoroStore } from '../stores';
import { storeToRefs } from 'pinia';

let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);

const lightThemeOverrides: GlobalThemeOverrides = {};

const darkThemeOverrides: GlobalThemeOverrides = {};

const { systemState } = storeToRefs(useSystemStore());
const { pomodoroHistory } = storeToRefs(usePomodoroStore());
const focusTime = ref();

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
        <TestTitle></TestTitle>
    </h1>
);

const focusChangeHandle = ({ year, month, date }: { year: number; month: number; date: number }) => {
    focusTime.value = {
        year,
        month,
        date,
    };
};
</script>

<style scoped lang="scss">
#historyViewContainer {
    padding: 5px 10px;
}
</style>
