<template>
    <div id="lineChartContainer" style="position: relative">
        <canvas id="lineChart" ref="lineChart"></canvas>
    </div>
</template>

<script setup lang="tsx">
import { Ref, onMounted, onUpdated, ref, toRefs } from 'vue';
import Chart, { ChartItem } from 'chart.js/auto';
import type { Pomodoro } from '../schemas/spaces';
import t from '../i18n';

const props = defineProps<{
    allPomodoro: Pomodoro[];
}>();
const { allPomodoro } = toRefs(props);
const lineChart = ref(null);
const todayStart: Ref<number[]> = ref([]);
const todayDone: Ref<number[]> = ref([]);

const labels = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
];
const setDataSet = (raw: Pomodoro[]) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const theDay = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const data = raw.filter(pomodoro => pomodoro.start.startsWith(theDay));
    const todayStartVal: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const todayDoneVal: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    data.map(pomodoro => {
        labels.forEach((timeStart, index) => {
            const hour = timeStart.split(':')[0];
            if (pomodoro.start.split(' ')[1].startsWith(hour)) {
                todayStartVal[index]++;
                if (pomodoro.status === 'done') {
                    todayDoneVal[index]++;
                }
                return;
            }
        });
    });
    todayStart.value = todayStartVal;
    todayDone.value = todayDoneVal;
};

let chart;

onMounted(async () => {
    setDataSet(allPomodoro.value);
    var data = {
        labels,
        datasets: [
            {
                label: t.info.planNum,
                fill: false,
                backgroundColor: 'rgb(54, 162, 235)',
                borderColor: 'rgba(54, 162, 235, 0.6)',
                data: todayStart.value,
            },
            {
                label: t.info.finishNum,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.6)',
                data: todayDone.value,
                fill: true,
            },
        ],
    };

    var options = {
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
            intersect: false,
        },
    };
    // TODO Bug 通过document.getElementById无法获取元素
    // Logger.log(document.getElementById('awesome-brain-manager-pomodoro-history-view'));
    chart = new Chart(lineChart.value as unknown as ChartItem, {
        type: 'line',
        options: options,
        data: data,
    });
});

onUpdated(() => {
    setDataSet(allPomodoro.value);
    chart.data.datasets[0].data = todayStart.value;
    chart.data.datasets[1].data = todayDone.value;
    chart.update();
});
</script>

<style scoped lang="scss"></style>
