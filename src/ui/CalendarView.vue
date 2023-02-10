<template>
    <div id="calendarContainerInSelf">
        <n-calendar
            v-model:value="value"
            #="{ year, month, date }"
            :is-date-disabled="isDateDisabled"
            @update:value="handleUpdateValue"
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
import { addDays, isYesterday } from 'date-fns/esm';
import type { Pomodoro } from '../schemas/spaces';
import PomodoroListView from './PomodoroListView.vue';

const props = defineProps<{
    allPomodoro: Pomodoro[];
}>();

const { allPomodoro } = toRefs(props);

const message = useMessage();
const value = ref(addDays(Date.now(), 0).valueOf());

const handleUpdateValue = (_: number, { year, month, date }: { year: number; month: number; date: number }) => {
    message.success(`${year}-${month}-${date}`);
};

const isDateDisabled = (timestamp: number) => {
    // if (isYesterday(timestamp)) {
    //     return true;
    // }
    return false;
};

const getPomodoro = (year: number, month: number, date: number) => {
    const theDay = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    return allPomodoro.value.filter(pomodoro => {
        return pomodoro.start.startsWith(theDay);
    });
};
</script>

<style scoped lang="scss">
#calendarContainerInSelf :deep(.n-calendar-header__extra .n-button-group .n-button) {
    max-width: max-content;
}
</style>
