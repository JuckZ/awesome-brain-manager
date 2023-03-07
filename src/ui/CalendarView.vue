<template>
    <div id="calendarContainerInSelf">
        <n-calendar
            v-model:value="timestampNow"
            #="{ year, month, date }"
            :is-date-disabled="isDateDisabled"
            @update:value="handleUpdateValue"
            @panel-change="handlePanelChange"
        >
            {{ year }}
            <PomodoroListView :pomodoro-list="getPomodoro(year, month, date)" />
        </n-calendar>
    </div>
</template>

<script setup lang="ts">
import { NCalendar } from 'naive-ui';
import { ref, toRefs } from 'vue';
import { useMessage } from 'naive-ui';
import { moment } from 'obsidian';
import type { Pomodoro } from '../schemas/spaces';
import PomodoroListView from './PomodoroListView.vue';

const props = defineProps<{
    allPomodoro: Pomodoro[];
}>();

const emit = defineEmits(['focus-change']);

const { allPomodoro } = toRefs(props);

const message = useMessage();
const now = moment();
const timestampNow = ref(now.valueOf());
const getPomodoro = (year: number, month: number, date: number) => {
    const theDay = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    return allPomodoro.value.filter(pomodoro => {
        return pomodoro.start && pomodoro.start.startsWith(theDay);
    });
};

const handleUpdateValue = (_: number, { year, month, date }: { year: number; month: number; date: number }) => {
    emit('focus-change', { year, month, date });
    // message.success(`${year}-${month}-${date}`);
};

const handlePanelChange = ({ year, month }: { year: number; month: number }) => {
    // message.success(`${year}-${month}`);
};

const isDateDisabled = (timestamp: number) => {
    // if (isYesterday(timestamp)) {
    //     return true;
    // }
    return false;
};
</script>

<style scoped lang="scss">
#calendarContainerInSelf :deep(.n-calendar-header__extra .n-button-group .n-button) {
    max-width: max-content;
}
</style>
