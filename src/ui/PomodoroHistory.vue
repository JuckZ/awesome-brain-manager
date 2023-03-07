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
                    <ClockView></ClockView>
                    <TimeLine :pomodoro-list="pomodoroTimeLine" />
                    <!-- #BUG https://www.naiveui.com/zh-CN/os-theme/components/grid#layout-shift-disabled.vue -->
                    <n-grid cols="1 1024:2" responsive="self">
                        <n-grid-item>
                            <DoughnutChart :all-pomodoro="pomodoroHistory" />
                        </n-grid-item>
                        <n-grid-item>
                            <line-chart :all-pomodoro="pomodoroHistory" />
                        </n-grid-item>
                    </n-grid>
                    <n-grid cols="1" :layout-shift-disabled="true">
                        <n-grid-item span="1">
                            <CalendarView :all-pomodoro="pomodoroHistory" @focus-change="focusChangeHandle" />
                        </n-grid-item>
                    </n-grid>
                </div>
            </n-space>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="tsx">
import { ref, watchEffect, type Ref } from 'vue';
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
import ClockView from './ClockView.vue';
import TimeLine from './TimeLine.vue';
import Title from './Title';
import DoughnutChart from './DoughnutChart.vue';
import LineChart from './LineChart.vue';
import { useSystemStore, usePomodoroStore } from '../stores';
import { storeToRefs } from 'pinia';
import { moment } from 'obsidian';

let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);

const lightThemeOverrides: GlobalThemeOverrides = {};

const darkThemeOverrides: GlobalThemeOverrides = {};

const { systemState } = storeToRefs(useSystemStore());
const { pomodoroHistory } = storeToRefs(usePomodoroStore());
const pomodoroTimeLine = ref(
    pomodoroHistory.value.filter(item => item.createTime.startsWith(moment().format('YYYY-MM-DD'))),
);

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

const focusChangeHandle = ({ year, month, date }: { year: number; month: number; date: number }) => {
    pomodoroTimeLine.value = pomodoroHistory.value.filter(item =>
        item.createTime.startsWith(`${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`),
    );
};
</script>

<style scoped lang="scss">
#historyViewContainer {
    padding: 5px 10px;
}
</style>
