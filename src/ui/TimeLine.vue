<template>
    <div style="padding: 10px 5px; max-height: 200px; overflow: auto">
        <!-- horizontal -->
        <n-timeline v-if="pomodoroList.length != 0">
            <n-timeline-item
                v-for="pomodoro in pomodoroList.filter(item =>
                    item.createTime.startsWith(moment().format('YYYY-MM-DD')),
                )"
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
                            ⏳ {{ pomodoro.spend }}
                        </n-tag>
                        <n-tag v-if="parseInt(pomodoro.breaknum) != 0" size="small" :bordered="false" type="error">
                            ⏸️ {{ pomodoro.breaknum }}
                        </n-tag>
                    </n-space>
                </template>
            </n-timeline-item>
        </n-timeline>
        <n-empty v-else :description="'暂无时间线内容'">
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
import { onUpdated, ref, toRefs } from 'vue';
import moment from 'moment';
import { deleteFromDB, saveDBAndKeepAlive, updateDBConditionally } from '../utils/db/db';
import type ObsidianManagerPlugin from '../main';
import { Pomodoro, pomodoroSchema } from '../schemas/spaces';
import { eventTypes } from '../types/types';
import { PomodoroStatus } from '../utils/promotodo';
import { pomodoroDB } from '../utils/constants';
const props = defineProps<{
    pomodoroList: Pomodoro[];
    plugin: ObsidianManagerPlugin;
}>();

const { pomodoroList, plugin } = toRefs(props);
const message = useMessage();

// ⏳❗⛔⭕✅▶️⏸️⏺️⏹️⏯️🔄️🔚🔴🟠🟡🟢🔵🟣🟤⚫
const getOptions = currentStatus => {
    return [
        {
            label: '▶️开始专注',
            key: 'ing',
            show: !['done', 'cancelled', 'ing'].contains(currentStatus),
        },
        {
            label: '⏸️暂停任务',
            key: 'break',
            show: !['done', 'cancelled', 'todo', 'break'].contains(currentStatus),
        },
        {
            label: '✅完成任务',
            key: 'done',
            show: !['done', 'cancelled', 'todo', 'break'].contains(currentStatus),
        },
        {
            label: '🔴放弃任务',
            key: 'cancelled',
            show: !['done', 'cancelled'].contains(currentStatus),
        },

        {
            label: '❗删除记录',
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
                message.error(`请先处理任务：${ingPomodoro.task}`);
                return;
            }
        }
        const changed = ps.changeState(targetStatus);
        if (changed) {
            plugin.value.updatePomodoro(pomodoro);
        }
    } else {
        plugin.value.deletePomodoro(pomodoro);
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
    // Logger.log(plugin.value);
});
</script>

<style lang="scss" scoped></style>
