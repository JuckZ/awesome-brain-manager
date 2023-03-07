<template>
    <div id="calendarContainerInSelf">
        <NCalendar
            v-model:value="timestampNow"
            :is-date-disabled="isDateDisabled"
            @update:value="handleUpdateValue"
            @panel-change="handlePanelChange"
        >
            <template #header="{ year, month }">
                {{ `${year}-${month}` }}
            </template>
            <template #default="{ year, month, date }"> <PomodoroListView :time="{ year, month, date }" /></template>
        </NCalendar>
    </div>
</template>

<script setup lang="ts">
import { NCalendar } from 'naive-ui';
import { ref } from 'vue';
import { moment } from 'obsidian';
import PomodoroListView from './PomodoroListView.vue';

const emit = defineEmits(['focus-change']);

const now = moment();
const timestampNow = ref(now.valueOf());

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
