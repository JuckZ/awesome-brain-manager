<template>
    <div style="padding: 10px 5px; max-height: 200px; overflow: auto">
        <!-- horizontal -->
        <n-timeline v-if="pomodoroList.length != 0">
            <n-timeline-item
                v-for="pomodoro in pomodoroList"
                :key="pomodoro.timestamp"
                :type="getType(pomodoro.status)"
            >
                <template #icon>
                    <n-dropdown
                        trigger="hover"
                        placement="bottom-start"
                        :options="getOptions(pomodoro.status)"
                        @select="handleSelect($event, pomodoro)"
                    >
                        <n-icon size="20">
                            <radio-button-off-outline />
                        </n-icon>
                    </n-dropdown>
                </template>
                <template #header>
                    <span v-if="pomodoro.start"> {{ moment(pomodoro.start).format('HH:mm') }}</span>
                    <span v-if="pomodoro.start && pomodoro.end"> ~ </span>
                    <span v-if="pomodoro.end">{{ moment(pomodoro.end).format('HH:mm') }}</span>
                    <span>
                        {{ ' ' + pomodoro.task }}
                    </span>
                </template>
                <template #footer>
                    <n-space>
                        <n-tag :bordered="false" size="small" :type="getType(pomodoro.status)">
                            {{ pomodoro.status.toUpperCase() }}
                        </n-tag>
                        <n-tag v-if="parseInt(pomodoro.spend) != 0" size="small" :bordered="false" type="info">
                            ⏳ {{ formatDuration(parseInt(pomodoro.spend)) }}
                        </n-tag>
                        <n-tag v-if="parseInt(pomodoro.breaknum) != 0" size="small" :bordered="false" type="error">
                            ⏸️ {{ pomodoro.breaknum }}
                        </n-tag>
                    </n-space>
                </template>
            </n-timeline-item>
        </n-timeline>
        <n-empty v-else :description="t.info.noTimeLine">
            <template #icon>
                <n-icon>
                    <airplane />
                </n-icon>
            </template>
        </n-empty>
    </div>
</template>

<script setup lang="ts">
import { NDropdown, NEmpty, NIcon, NSpace, NTag, NTimeline, NTimelineItem, useMessage } from 'naive-ui';
import { Airplane, RadioButtonOffOutline } from '@vicons/ionicons5';
import { onUpdated, toRefs } from 'vue';
import { moment } from 'obsidian';
import type { Pomodoro } from '../schemas/spaces';
import { PomodoroStatus } from '../utils/pomotodo';
import t from '../i18n';
import { usePomodoroStore } from '../stores';

const props = defineProps<{
    pomodoroList: Pomodoro[];
}>();

const { pomodoroList } = toRefs(props);
const message = useMessage();

const formatDuration = (duration: number) => {
    return moment.utc(moment.duration(duration, 'milliseconds').asMilliseconds()).format('HH:mm:ss');
};

// ⏳❗⛔⭕✅▶️⏸️⏺️⏹️⏯️🔄️🔚🔴🟠🟡🟢🔵🟣🟤⚫
const getOptions = currentStatus => {
    return [
        {
            label: t.info.startTask,
            key: 'ing',
            show: !['done', 'cancelled', 'ing'].contains(currentStatus),
        },
        {
            label: t.info.stopTask,
            key: 'break',
            show: !['done', 'cancelled', 'todo', 'break'].contains(currentStatus),
        },
        {
            label: t.info.finishTask,
            key: 'done',
            show: !['done', 'cancelled', 'todo', 'break'].contains(currentStatus),
        },
        {
            label: t.info.cancelTask,
            key: 'cancelled',
            show: !['done', 'cancelled'].contains(currentStatus),
        },

        {
            label: t.info.deleteTask,
            key: 'deleted',
        },
    ];
};
const handleSelect = (
    targetStatus: 'ing' | 'done' | 'todo' | 'cancelled' | 'break' | 'deleted',
    pomodoro: Pomodoro,
) => {
    if (targetStatus != 'deleted') {
        const ps = new PomodoroStatus(pomodoro);
        if (targetStatus == 'ing') {
            const ingPomodoro = pomodoroList.value.find(item => item.status === 'ing');
            if (ingPomodoro) {
                message.error(`${t.info.handleThisFirst + ingPomodoro.task}`);
                return;
            }
        }
        const changed = ps.changeState(targetStatus);
        if (changed) {
            usePomodoroStore().updatePomodoro(pomodoro);
        }
    } else {
        usePomodoroStore().deletePomodoro(pomodoro);
    }
};

const statusTypeMap = {
    ing: 'info',
    done: 'success',
    todo: 'default',
    cancelled: 'error',
    break: 'warning',
};
const getType = (status): 'default' | 'error' | 'info' | 'success' | 'warning' | undefined => {
    return statusTypeMap[status] || 'info';
};

onUpdated(() => {
    // LoggerUtil.log(plugin.value);
});
</script>

<style lang="scss" scoped></style>
