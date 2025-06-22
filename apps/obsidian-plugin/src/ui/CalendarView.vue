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
            <template #default="{ year, month, date }">
                <PomodoroListView :active-time="activeTime" :time="{ year, month, date }"
            /></template>
        </NCalendar>
    </div>
</template>

<script setup lang="ts">
import { NCalendar } from 'naive-ui';
import { Ref, ref } from 'vue';
import { moment } from 'obsidian';
import PomodoroListView from '@/ui/PomodoroListView.vue';

const emit = defineEmits(['focus-change']);

const now = moment();
const timestampNow = ref(now.valueOf());
const activeTime: Ref<{ year: number; month: number; date: number }> = ref({
    year: now.year(),
    month: now.month(),
    date: now.date(),
});

const handleUpdateValue = (_: number, { year, month, date }: { year: number; month: number; date: number }) => {
    activeTime.value = { year, month, date };
    emit('focus-change', activeTime.value);
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
#calendarContainerInSelf :deep(.n-calendar) {
    height: 500px;
    .n-calendar-header__extra .n-button-group .n-button {
        max-width: max-content;
    }
    .n-calendar-dates {
        grid-template-rows: repeat(5, minmax(4rem, auto));
        .n-calendar-cell {
            padding: 0px;
        }
    }
}
</style>
