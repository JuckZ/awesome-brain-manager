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
                        <ToolBar />
                    </Teleport>
                    <Teleport to="body" disable="false">
                        <NModal
                            v-model:show="showModal"
                            preset="dialog"
                            title="确认"
                            content="你确认?"
                            positive-text="确认"
                            negative-text="算了"
                            @positive-click="submitCallback"
                            @negative-click="cancelCallback"
                        />
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
    NModal,
    NNotificationProvider,
    NSpace,
    darkTheme,
    dateEnUS,
    dateZhCN,
    enUS,
    lightTheme,
    zhCN,
} from 'naive-ui';
import { onUpdated, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import ToolBar from '@/ui/Toolbar.vue';
import { useSystemStore } from '@/stores';
import { LoggerUtil } from '@/utils/logger';

let theme = ref(darkTheme);
let locale = ref(zhCN);
let dateLocale = ref(dateZhCN);
const showModal = ref(false);

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

const submitCallback = () => {
    console.log('submitCallback');
};

const cancelCallback = () => {
    console.log('cancelCallback');
};

onUpdated(() => {
    LoggerUtil.log('app updated');
});
</script>

<style scoped lang="scss"></style>
