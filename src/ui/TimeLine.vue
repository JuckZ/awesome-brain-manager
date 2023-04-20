<template>
    <div style="padding: 10px 5px">
        <!-- horizontal -->
        <n-timeline v-if="pomodoroList.length != 0">
            <n-timeline-item
                v-for="pomodoro in pomodoroList"
                :key="pomodoro.timestamp"
                :type="getType(pomodoro.status)"
            >
                <template #icon>
                    <n-popover
                        trigger="hover"
                        style="width: max-content; padding: 2px 4px"
                        placement="bottom-start"
                        :to="targetNode"
                    >
                        <template #trigger>
                            <n-icon size="20" @mouseenter="enterHandler">
                                <radio-button-off-outline />
                            </n-icon>
                        </template>
                        <div style="cursor: pointer">
                            <div
                                v-for="option in getOptions(pomodoro.status)"
                                v-show="option.show"
                                :key="option.key"
                                class="option"
                                @click="handleSelect(option.key as any, pomodoro)"
                            >
                                {{ option.label }}
                            </div>
                        </div>
                    </n-popover>
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
import { NEmpty, NIcon, NPopover, NSpace, NTag, NTimeline, NTimelineItem, useMessage } from 'naive-ui';
import { Airplane, RadioButtonOffOutline } from '@vicons/ionicons5';
import { Ref, onUpdated, ref, toRefs, watchEffect } from 'vue';
import { moment } from 'obsidian';
import { storeToRefs } from 'pinia';
import type { Pomodoro } from '../schemas/spaces';
import { PomodoroStatus } from '../utils/pomotodo';
import t from '../i18n';
import { usePomodoroStore } from '../stores';
const { pomodoroHistory } = storeToRefs(usePomodoroStore());

const pomodoroList = ref([] as Pomodoro[]);
const targetNode: Ref<string | HTMLElement | false> = ref(false);

const props = withDefaults(
    defineProps<{
        time: { year: number; month: number; date: number };
    }>(),
    {
        time: () => {
            const timeStr = moment().format('YYYY-MM-DD').split('-');
            return {
                year: parseInt(timeStr[0]),
                month: parseInt(timeStr[1]),
                date: parseInt(timeStr[2]),
            };
        },
    },
);

const { time } = toRefs(props);
const message = useMessage();
const enterHandler = (e: MouseEvent) => {
    targetNode.value = e.composedPath()[3] as HTMLElement;
};
watchEffect(() => {
    pomodoroList.value = pomodoroHistory.value.filter(item =>
        item.createTime.startsWith(
            `${time.value.year}-${time.value.month.toString().padStart(2, '0')}-${time.value.date
                .toString()
                .padStart(2, '0')}`,
        ),
    );
});

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
            label: t.info.repeatTask,
            key: 'repeat',
            show: ['done', 'cancelled'].contains(currentStatus),
        },
        {
            label: t.info.deleteTask,
            key: 'deleted',
            show: true,
        },
    ];
};
const handleSelect = (
    targetStatus: 'ing' | 'done' | 'todo' | 'cancelled' | 'break' | 'repeat' | 'deleted',
    pomodoro: Pomodoro,
) => {
    if (targetStatus != 'deleted') {
        const ps = new PomodoroStatus(pomodoro);
        if (targetStatus === 'ing') {
            const ingPomodoro = pomodoroList.value.find(item => item.status === 'ing');
            if (ingPomodoro) {
                message.error(`${t.info.handleThisFirst + ingPomodoro.task}`);
                return;
            }
        }
        if (targetStatus === 'repeat') {
            console.log('TODO, add a quick add pomodoro method');
            // usePomodoroStore().addPomodoro();
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

<style lang="scss" scoped>
div.option {
    padding: 5px;
    // border-collapse: collapse;
    border-top: 1.4px solid rgb(243, 243, 245);
    &:hover {
        background: rgb(243, 243, 245);
    }
    &:first-of-type {
        border-top: none;
    }
}
</style>
