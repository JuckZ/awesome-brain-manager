<template>
    <div id="doughnutChartContainer" style="position: relative">
        <canvas id="doughnutChart" ref="doughnutChart"></canvas>
    </div>
</template>

<script setup lang="tsx">
import { Ref, onMounted, onUpdated, ref, toRefs, nextTick } from 'vue';
import Chart, { ChartItem } from 'chart.js/auto';
import { getTheDay } from '../utils/constants';

import type { Pomodoro } from '../schemas/spaces';

const props = defineProps<{
    allPomodoro: Pomodoro[];
}>();
const { allPomodoro } = toRefs(props);
const doughnutChart = ref(null);

let labels: string[] = [];
let dateSet: number[] = [];
const setDataSet = (raw: Pomodoro[]) => {
    // const theDay = getTheDay();
    // const data = raw.filter(pomodoro => pomodoro.start.startsWith(theDay));
    const res = { 'No Tags': 0 };
    raw.forEach(pomodoro => {
        if (!pomodoro.tags) {
            res['No Tags']++;
        } else {
            pomodoro.tags?.split(',').forEach(tag => {
                if (res[tag] == undefined) {
                    res[tag] = 1;
                } else {
                    res[tag]++;
                }
            });
        }
    });
    labels = Object.keys(res);
    dateSet = Object.keys(res).map(key => res[key]);
};

let chart;

onMounted(async () => {
    setDataSet(allPomodoro.value);
    var data = {
        labels,
        datasets: [
            {
                label: '专注类型',
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(244, 67, 54)',
                    'rgb(103, 58, 183)',
                    'rgb(3, 169, 244)',
                    'rgb(0, 188, 212)',
                    'rgb(139, 195, 74)',
                    'rgb(233, 30, 99)',
                    'rgb(156, 39, 176)',
                    'rgb(0, 150, 136)',
                    'rgb(255, 152, 0)',
                    'rgb(76, 175, 80)',
                ],
                hoverBorderColor: 'rgba(255,99,132,1)',
                hoverOffset: 4,
                data: dateSet,
            },
        ],
    };

    var options = {
        // resizeDelay: 100,
        // transitions: {
        //     resize: {
        //         animation: {
        //             duration: 200,
        //         },
        //     },
        // },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                stacked: true,
                grid: {
                    display: true,
                    color: 'rgba(255,99,132,0.2)',
                },
            },
            x: {
                grid: {
                    display: true,
                },
            },
        },
    };

    chart = new Chart(doughnutChart.value as unknown as ChartItem, {
        type: 'doughnut',
        options: options,
        data: data,
    });
});

onUpdated(() => {
    setDataSet(allPomodoro.value);
    chart.data.labels = labels;
    chart.data.datasets[0].data = dateSet;
    chart.update();
});
</script>

<style scoped lang="scss"></style>
