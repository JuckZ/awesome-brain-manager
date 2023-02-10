<template>
    <div style="margin: 15px auto">
        <n-space justify="space-around">
            <RadialProgress
                v-if="currentPomodoro"
                :start-color="'#4772fa'"
                :stop-color="'#4772fa'"
                :inner-stroke-color="'#ebebeb'"
                :stroke-width="5"
                :inner-stroke-width="5"
                :diameter="200"
                :completed-steps="currentSpend"
                :total-steps="expectedTime"
            >
                <div class="radialTimeText">{{ time }}</div>
            </RadialProgress>
            <n-result v-else status="418" title="无正在专注的任务" description="休息一下吧"> </n-result>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import RadialProgress from 'vue3-radial-progress';
import { Ref, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { NResult, NSpace } from 'naive-ui';
import moment from 'moment';
import type { Pomodoro } from '../schemas/spaces';

const props = defineProps<{
    currentPomodoro: Pomodoro | null;
}>();
const { currentPomodoro } = toRefs(props);
const time: Ref<string> = ref('');
const currentSpend: Ref<number> = ref(0);
const expectedTime: Ref<number> = ref(0);
let timerID;

function updateTime() {
    const pomodoro = currentPomodoro.value;
    if (!pomodoro) {
        return;
    }
    currentSpend.value = moment().valueOf() - parseInt(pomodoro.lastactive) + parseInt(pomodoro.spend);
    // 转换成毫秒
    expectedTime.value = parseInt(pomodoro.expectedTime);
    const leftTime = moment.duration(expectedTime.value - currentSpend.value, 'milliseconds');
    time.value = moment.utc(leftTime.asMilliseconds()).format('HH:mm:ss');
}

onMounted(async () => {
    timerID = window.setInterval(updateTime, 1000);
    updateTime();
});

onUnmounted(() => {
    clearInterval(timerID);
});
</script>

<style scoped lang="scss">
.radialTimeText {
    font-size: 32px;
    font-weight: 600;
}
</style>
