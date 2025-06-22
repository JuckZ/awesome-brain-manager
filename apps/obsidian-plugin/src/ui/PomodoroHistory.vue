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
    CalendarProps,
    CardProps,
    type GlobalThemeOverrides,
    NConfigProvider,
    NGrid,
    NGridItem,
    NMessageProvider,
    NSpace,
    ResultProps,
    darkTheme,
    dateEnUS,
    dateZhCN,
    enUS,
    lightTheme,
    zhCN,
} from 'naive-ui';
import { storeToRefs } from 'pinia';
import t, { i18nextPromise, useI18n } from '@/i18n';
import OverView from '@/ui/OverView.vue';
import TaskSelector from '@/ui/TaskSelector.vue';
import ClockView from '@/ui/ClockView.vue';
import TimeLine from '@/ui/TimeLine.vue';
import TestTitle from '@/ui/TestTitle';
import DoughnutChart from '@/ui/DoughnutChart.vue';
import LineChart from '@/ui/LineChart.vue';
import CalendarView from '@/ui/CalendarView.vue';
import { usePomodoroStore, useSystemStore } from '@/stores';

let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);

type CardThemeOverrides = NonNullable<CardProps['themeOverrides']>;
type ResultThemeOverrides = NonNullable<ResultProps['themeOverrides']>;
type CalendarThemeOverrides = NonNullable<CalendarProps['themeOverrides']>;
const cardThemeOverrides: CardThemeOverrides = {
    paddingSmall: '0.5rem',
    fontSizeSmall: '0.8rem',
    titleFontSizeSmall: '1rem',
    titleFontWeight: '700',
};

const resultThemeOverrides: ResultThemeOverrides = {
    titleFontWeight: '700',
    titleFontSizeSmall: '1.2rem',
    fontSizeSmall: '0.8rem',
};
const calendarThemeOverrides: CalendarThemeOverrides = {
    lineHeight: 1.2,
    fontSize: '0.8rem',
    titleFontSize: '1.2rem',
    titleFontWeight: '700',
};

const lightThemeOverrides: GlobalThemeOverrides = {
    Card: cardThemeOverrides,
    Result: resultThemeOverrides,
    Calendar: calendarThemeOverrides,
};

const darkThemeOverrides: GlobalThemeOverrides = {
    Card: cardThemeOverrides,
    Result: resultThemeOverrides,
    Calendar: calendarThemeOverrides,
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
// await i18nextPromise;
</script>
