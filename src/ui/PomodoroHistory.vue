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
                <div class="pa5px">
                    <H1Title></H1Title>
                    <!-- <Title></Title> -->
                    <OverView :all-pomodoro="pomodoroHistory" />
                    <TaskSelector></TaskSelector>
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
    CardProps,
    CalendarProps,
    ResultProps,
    type GlobalThemeOverrides,
} from 'naive-ui';
import CalendarView from './CalendarView.vue';
import OverView from './OverView.vue';
import TaskSelector from './TaskSelector.vue';
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

type CardThemeOverrides = NonNullable<CardProps['themeOverrides']>
type ResultThemeOverrides = NonNullable<ResultProps['themeOverrides']>
type CalendarThemeOverrides = NonNullable<CalendarProps['themeOverrides']>
const cardThemeOverrides: CardThemeOverrides = {
    paddingSmall: '0.5rem',
    fontSizeSmall: '0.8rem',
    titleFontSizeSmall: '1rem',
    titleFontWeight: '700'
}

const resultThemeOverrides: ResultThemeOverrides = {
    titleFontWeight: '700',
    titleFontSizeSmall: '1.2rem',
    fontSizeSmall: '0.8rem'
}
const calendarThemeOverrides: CalendarThemeOverrides = {
    lineHeight: 1.2,
    fontSize: '0.8rem',
    titleFontSize: '1.2rem',
    titleFontWeight: '700'
}

const lightThemeOverrides: GlobalThemeOverrides = {
    Card: cardThemeOverrides,
    Result: resultThemeOverrides,
    Calendar: calendarThemeOverrides
};

const darkThemeOverrides: GlobalThemeOverrides = {
    Card: cardThemeOverrides,
    Result: resultThemeOverrides,
    Calendar: calendarThemeOverrides
};

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