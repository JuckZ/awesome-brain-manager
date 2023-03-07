<template>
    <NConfigProvider
        :theme="theme"
        :theme-overrides="theme.name === 'light' ? lightThemeOverrides : darkThemeOverrides"
        :locale="locale"
        :date-locale="dateLocale"
        :breakpoints="{ xs: 0, s: 640, m: 1024, l: 1280, xl: 1536, xxl: 1920 }"
    >
        <NMessageProvider>
            <NSpace vertical>
                <NNotificationProvider :max="3">
                    <Teleport to="body" disable="false">
                        <Toolbar />
                    </Teleport>
                    <!-- <Teleport to="#awesome-brain-manager-pomodoro-history-view" disable="false">
                        <Toolbar />
                    </Teleport> -->
                </NNotificationProvider>
            </NSpace>
        </NMessageProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import {
    type GlobalThemeOverrides,
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NSpace,
    darkTheme,
    dateEnUS,
    dateZhCN,
    enUS,
    lightTheme,
    zhCN,
} from 'naive-ui';
import { onMounted, onUnmounted, onUpdated, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import LoggerUtil from '../utils/logger';
import { useSystemStore } from '../stores';
import Toolbar from './Toolbar.vue';

let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);

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

const lightThemeOverrides: GlobalThemeOverrides = {};

const darkThemeOverrides: GlobalThemeOverrides = {};

onUpdated(() => {
    LoggerUtil.log('app updated');
});
</script>

<style scoped lang="scss"></style>
