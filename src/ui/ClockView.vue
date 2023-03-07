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
            <n-result v-else status="418" :title="t.info.noDoingTask" :description="t.info.haveABreak"> </n-result>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import RadialProgress from 'vue3-radial-progress';
import { onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';
import { NResult, NSpace } from 'naive-ui';
import { moment } from 'obsidian';
import { storeToRefs } from 'pinia';
import { usePomodoroStore } from '../stores';
import t from '../i18n';

const time: Ref<string> = ref('');
const currentSpend: Ref<number> = ref(0);
const expectedTime: Ref<number> = ref(0);
let timerID;

const { currentPomodoro } = storeToRefs(usePomodoroStore());

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
